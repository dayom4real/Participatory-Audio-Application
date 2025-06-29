# from fastapi import FastAPI, UploadFile, File
# from fastapi.middleware.cors import CORSMiddleware
# import whisper
# import shutil
# import os

# app = FastAPI()

# # Allow CORS for local frontend testing (adjust origins as needed)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Change to specific domain in production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Load Whisper model at startup
# model = whisper.load_model("base")  # You can change to "small", "medium", etc.

# @app.get("/")
# def read_root():
#     return {"message": "Whisper transcription API is running"}

# @app.post("/upload-audio")
# async def upload_audio(file: UploadFile = File(...)):
#     try:
#         # Save uploaded file to disk
#         temp_file = f"temp_{file.filename}"
#         with open(temp_file, "wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)

#         # Transcribe audio using Whisper
#         result = model.transcribe(temp_file)
#         transcription = result["text"]

#         # Clean up
#         os.remove(temp_file)

#         return {"transcription": transcription}
    
#     except Exception as e:
#         return {"error": str(e)}


# from fastapi import FastAPI, UploadFile, File
# from fastapi.middleware.cors import CORSMiddleware
# import whisper
# import shutil
# import uuid
# import os

# app = FastAPI()

# # Enable CORS for frontend access
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Replace with frontend URL in production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# model = whisper.load_model("base")  # or "small", "medium", "large"

# @app.post("/upload-audio")
# async def upload_audio(file: UploadFile = File(...)):
#     try:
#         # Save with a unique name
#         filename = f"temp_{uuid.uuid4().hex}.mp3"
#         filepath = os.path.join("audio", filename)
#         os.makedirs("audio", exist_ok=True)
#         with open(filepath, "wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)

#         # Transcribe
#         result = model.transcribe(filepath, task="transcribe")  # Or task="translate"
#         transcription = result["text"]

#         return {"transcription": transcription}

#     except Exception as e:
#         return {"error": str(e)}




# from fastapi import FastAPI, File, UploadFile, Form
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# import os
# import uuid
# import shutil
# import whisper

# app = FastAPI()

# # Allow frontend access
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # In production, specify allowed origins
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Directory to store uploaded files
# UPLOAD_DIR = "PCP/BackEnd/uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# # 🔁 Load the smaller Whisper model
# model = whisper.load_model("small")

# @app.post("/upload-audio")
# async def upload_audio(
#     file: UploadFile = File(...),
#     user_id: str = Form(...),
#     language: str = Form("en")
# ):
#     try:
#         # Generate a unique filename
#         file_ext = file.filename.split('.')[-1]
#         temp_filename = f"{uuid.uuid4()}.{file_ext}"
#         file_path = os.path.join(UPLOAD_DIR, temp_filename)

#         # Save uploaded audio file
#         with open(file_path, "wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)

#         # Transcribe using Whisper with language hint
#         result = model.transcribe(file_path, language=language)

#         return {
#             "user_id": user_id,
#             "filename": file.filename,
#             "transcription": result.get("text", "")
#         }

#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})





# from fastapi import FastAPI, File, UploadFile, Form
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# import os
# import uuid
# import shutil
# import whisper
# from googletrans import Translator
# import traceback

# app = FastAPI()

# # Allow frontend access
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# UPLOAD_DIR = "PCP/BackEnd/uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# # Load Whisper model
# print("Loading Whisper model...")
# model = whisper.load_model("small")
# print("Model loaded.")

# # Initialize Google Translator
# translator = Translator()

# @app.post("/upload-audio")
# async def upload_audio(
#     file: UploadFile = File(...),
#     user_id: str = Form(...),
#     language: str = Form("en")
# ):
#     try:
#         # Save uploaded file
#         file_ext = file.filename.split('.')[-1]
#         temp_filename = f"{uuid.uuid4()}.{file_ext}"
#         file_path = os.path.join(UPLOAD_DIR, temp_filename)

#         with open(file_path, "wb") as buffer:
#             shutil.copyfileobj(file.file, buffer)

#         print(f"[DEBUG] File saved to: {file_path}")
#         print(f"[DEBUG] Running Whisper transcription...")

#         # Transcribe
#         result = model.transcribe(file_path, language=language)
#         print(f"[DEBUG] Transcription result: {result}")

#         transcription = result.get("text", "").strip()
#         if not transcription:
#             transcription = "[No transcription detected]"
        
#         print(f"[DEBUG] Transcription text: {transcription}")

#         # Translate
#         print("[DEBUG] Translating...")
#         translations = {
#             "French": translator.translate(transcription, dest='fr').text,
#             "Hausa": translator.translate(transcription, dest='ha').text,
#             "Yoruba": translator.translate(transcription, dest='yo').text,
#             "Igbo": translator.translate(transcription, dest='ig').text
#         }
#         print(f"[DEBUG] Translations: {translations}")

#         return {
#             "user_id": user_id,
#             "filename": file.filename,
#             "transcription": transcription,
#             "translations": translations
#         }

#     except Exception as e:
#         print("[ERROR] Exception occurred:")
#         traceback.print_exc()
#         return JSONResponse(status_code=500, content={"error": str(e)})

import os
import uuid
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import whisper
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from rake_nltk import Rake
from transformers import pipeline

# ========== SETUP ==========
nltk.download("vader_lexicon")
nltk.download("punkt_tab")
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
DATABASE_URL = "postgresql://postgres:topology123@localhost/participatory_db"
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

Base.metadata.create_all(bind=engine)

# ========== UTILITIES ==========
def transcribe_audio(filepath: str) -> str:
    logging.info(f"Transcribing file: {filepath}")
    model = whisper.load_model("base")
    result = model.transcribe(filepath)
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
    summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
    summary = summarizer(text[:1024])[0]["summary_text"]
    return summary

def detect_topics(text: str) -> str:
    logging.info("Classifying topics")
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    labels = ["health", "education", "economy", "security", "infrastructure", "governance", "culture", "environment"]
    result = classifier(text[:512], candidate_labels=labels)
    return ", ".join([label for label, score in zip(result["labels"], result["scores"]) if score > 0.5])

def detect_emotion(text: str) -> str:
    logging.info("Detecting emotion")
    classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base")
    result = classifier(text[:512])
    top_emotion = result[0]  # result is always a list of dicts
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
    }
    logging.info(f"Fetched analysis report for transcript {transcript_id}")
    return JSONResponse(content=report)

@app.get("/")
def root():
    return {"message": "Participatory Audio Recorder API running"}
