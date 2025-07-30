import os
import uuid
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import whisper
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from rake_nltk import Rake
from transformers import pipeline
from diarization import diarize_with_hybrid_clustering

# ========== SETUP ==========
nltk.download("vader_lexicon")
nltk.download("punkt_tab")  # Kept as you requested
#nltk.download("punkt")
nltk.download("stopwords")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI()
logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== DATABASE ==========

DATABASE_URL = os.getenv("DATABASE_API_KEY")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Transcript(Base):
    __tablename__ = "transcripts"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True)
    user_id = Column(String)
    language = Column(String)
    text = Column(Text)
    sentiment = Column(Text)
    keywords = Column(Text)
    summary = Column(Text)
    topics = Column(Text)
    emotion = Column(Text)
    diarization = Column(JSONB)

Base.metadata.create_all(bind=engine)

# ========== GLOBAL MODELS ==========
whisper_model = whisper.load_model("base")
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
emotion_classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base")
topic_classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# ========== UTILITIES ==========
def transcribe_audio(filepath: str) -> str:
    logging.info(f"Transcribing file: {filepath}")
    result = whisper_model.transcribe(filepath)
    return result["text"]

def analyze_sentiment(text: str) -> str:
    logging.info("Performing sentiment analysis")
    sid = SentimentIntensityAnalyzer()
    scores = sid.polarity_scores(text)
    return str(scores)

def extract_keywords(text: str) -> str:
    logging.info("Extracting keywords")
    rake = Rake()
    rake.extract_keywords_from_text(text)
    return ", ".join(rake.get_ranked_phrases()[:10])

def summarize_text(text: str) -> str:
    logging.info("Summarizing text")
    summary = summarizer(text[:1024])[0]["summary_text"]
    return summary

def detect_topics(text: str) -> str:
    logging.info("Classifying topics")
    if not text or not text.strip():
        logging.warning("No text provided for topic classification.")
        return ""
    labels = ["health", "education", "economy", "security", "infrastructure", "governance", "culture", "environment"]
    result = topic_classifier(text[:512], candidate_labels=labels)
    return ", ".join([label for label, score in zip(result["labels"], result["scores"]) if score > 0.5])

def detect_emotion(text: str) -> str:
    logging.info("Detecting emotion")
    result = emotion_classifier(text[:512])
    top_emotion = result[0]
    return f"{top_emotion['label']} ({top_emotion['score']:.2f})"

# ========== ROUTES ==========

@app.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...), user_id: str = Form(...), language: str = Form(...)):
    try:
        file_ext = os.path.splitext(file.filename)[-1]
        file_id = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_id)

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        logging.info(f"Saved audio file to {file_path}")

        transcript_text = transcribe_audio(file_path)
        sentiment = analyze_sentiment(transcript_text)
        keywords = extract_keywords(transcript_text)
        summary = summarize_text(transcript_text)
        topics = detect_topics(transcript_text)
        emotion = detect_emotion(transcript_text)
        segments = diarize_with_hybrid_clustering(file_path)
        

        db = SessionLocal()
        transcript = Transcript(
            filename=file_id,
            user_id=user_id,
            language=language,
            text=transcript_text,
            sentiment=sentiment,
            keywords=keywords,
            summary=summary,
            topics=topics,
            emotion=emotion,
            diarization=segments
        )
        db.add(transcript)
        db.commit()
        db.refresh(transcript)
        logging.info(f"Stored analysis for {file_id} in DB")

        return {"message": "File processed", "transcript_id": transcript.id}
    except Exception as e:
        logging.error(f"Error in upload-audio: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download-transcript/{transcript_id}")
def download_transcript(transcript_id: int):
    db = SessionLocal()
    transcript = db.query(Transcript).filter(Transcript.id == transcript_id).first()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    output_path = os.path.join(UPLOAD_DIR, f"{transcript.filename}.txt")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(transcript.text)
    logging.info(f"Transcript {transcript_id} written to {output_path}")

    return FileResponse(path=output_path, filename=os.path.basename(output_path), media_type="text/plain")

@app.get("/analysis-report/{transcript_id}")
def get_analysis_report(transcript_id: int):
    db = SessionLocal()
    transcript = db.query(Transcript).filter(Transcript.id == transcript_id).first()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    report = {
        "text": transcript.text,
        "summary": transcript.summary,
        "sentiment": transcript.sentiment,
        "keywords": transcript.keywords,
        "topics": transcript.topics,
        "emotion": transcript.emotion,
        "diarization": transcript.diarization
    }
    logging.info(f"Fetched analysis report for transcript {transcript_id}")
    return JSONResponse(content=report)

@app.get("/transcripts")
def list_transcripts():
    try:
        db = SessionLocal()
        transcripts = db.query(Transcript.id, Transcript.user_id).order_by(Transcript.id.desc()).all()
        return [{"transcript_id": t.id, "user_id": t.user_id} for t in transcripts]
    except Exception as e:
        logging.error(f"Error fetching transcript list: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error fetching transcript list")

@app.get("/transcript/{id}/analysis")
def get_transcript_analysis(id: int):
    db = SessionLocal()
    transcript = db.query(Transcript).filter(Transcript.id == id).first()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return {
        "transcription": transcript.text,
        "summary": transcript.summary,
        "sentiment": transcript.sentiment,
        "keywords": transcript.keywords.split(","),
        "topics": transcript.topics.split(","),
        "emotion": transcript.emotion,
        "diarization": transcript.diarization
    }

@app.get("/diarization/{file_name}")
def get_diarization(file_name: str):
    file_path = os.path.join("uploads", file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    #segments = diarize_audio(file_path)
    segments = diarize_with_hybrid_clustering(file_path)
    return {"segments": segments}

@app.get("/")
def root():
    return {"message": "Participatory Audio Recorder API running"}
