
import os
import numpy as np
import librosa
import webrtcvad
import struct
from scipy.ndimage import gaussian_filter1d
from resemblyzer import VoiceEncoder, preprocess_wav
from sklearn.cluster import AgglomerativeClustering


def wav_to_pcm16(wav: np.ndarray) -> bytes:
    """Convert waveform to 16-bit PCM byte format."""
    wav_int16 = np.clip(wav * 32768, -32768, 32767).astype(np.int16)
    return wav_int16.tobytes()


def frame_generator(signal, sr, frame_duration_ms=30):
    """Yields audio frames of fixed duration."""
    frame_size = int(sr * frame_duration_ms / 1000)
    offset = 0
    while offset + frame_size < len(signal):
        yield signal[offset:offset + frame_size]
        offset += frame_size


def get_speech_frames(wav, sr, aggressiveness=3):
    """Returns frames where speech is detected using VAD."""
    vad = webrtcvad.Vad(aggressiveness)
    pcm16 = wav_to_pcm16(wav)
    frame_bytes = 960  # 30ms at 16kHz
    frames = [
        pcm16[i:i + frame_bytes]
        for i in range(0, len(pcm16) - frame_bytes, frame_bytes)
    ]
    is_speech = [vad.is_speech(f, sample_rate=16000) for f in frames]
    voiced = np.zeros(len(wav), dtype=bool)
    for i, speech in enumerate(is_speech):
        if speech:
            start = int(i * 0.03 * sr)
            end = int((i + 1) * 0.03 * sr)
            voiced[start:end] = True
    return voiced


def diarize_audio(audio_path: str):
    """
    Returns segmented speaker-labeled transcript regions.
    Each item in result is like:
    {
        "speaker": "Speaker 1",
        "start": 2.13,
        "end": 5.23
    }
    """
    wav = preprocess_wav(audio_path)
    sr = 16000

    print("[INFO] Performing voice activity detection...")
    voiced_mask = get_speech_frames(wav, sr)
    voiced_signal = wav[voiced_mask]

    print("[INFO] Embedding voiced segments...")
    encoder = VoiceEncoder()
    window_size = sr * 1  # 1 second chunks
    step = sr // 2  # 50% overlap
    embeddings = []
    timestamps = []

    for i in range(0, len(voiced_signal) - window_size, step):
        chunk = voiced_signal[i:i + window_size]
        if len(chunk) < window_size:
            break
        emb = encoder.embed_utterance(chunk)
        embeddings.append(emb)
        timestamps.append((i / sr, (i + window_size) / sr))

    embeddings = np.array(embeddings)

    print("[INFO] Clustering embeddings into speakers...")
    clustering = AgglomerativeClustering(n_clusters=None, distance_threshold=0.7)
    labels = clustering.fit_predict(embeddings)

    # Smooth the labels to reduce noise
    smoothed_labels = gaussian_filter1d(labels.astype(float), sigma=1).round().astype(int)

    segments = []
    for i, (start, end) in enumerate(timestamps):
        segments.append({
            "speaker": f"Speaker {smoothed_labels[i] + 1}",
            "start": round(start, 2),
            "end": round(end, 2)
        })

    print(f"[INFO] Diarization completed. Found {len(set(smoothed_labels))} speakers.")
    return segments
