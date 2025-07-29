
# import os
# import numpy as np
# import librosa
# import webrtcvad
# import struct
# from scipy.ndimage import gaussian_filter1d
# from resemblyzer import VoiceEncoder, preprocess_wav
# from sklearn.cluster import AgglomerativeClustering


# def wav_to_pcm16(wav: np.ndarray) -> bytes:
#     """Convert waveform to 16-bit PCM byte format."""
#     wav_int16 = np.clip(wav * 32768, -32768, 32767).astype(np.int16)
#     return wav_int16.tobytes()


# def frame_generator(signal, sr, frame_duration_ms=30):
#     """Yields audio frames of fixed duration."""
#     frame_size = int(sr * frame_duration_ms / 1000)
#     offset = 0
#     while offset + frame_size < len(signal):
#         yield signal[offset:offset + frame_size]
#         offset += frame_size


# def get_speech_frames(wav, sr, aggressiveness=3):
#     """Returns frames where speech is detected using VAD."""
#     vad = webrtcvad.Vad(aggressiveness)
#     pcm16 = wav_to_pcm16(wav)
#     frame_bytes = 960  # 30ms at 16kHz
#     frames = [
#         pcm16[i:i + frame_bytes]
#         for i in range(0, len(pcm16) - frame_bytes, frame_bytes)
#     ]
#     is_speech = [vad.is_speech(f, sample_rate=16000) for f in frames]
#     voiced = np.zeros(len(wav), dtype=bool)
#     for i, speech in enumerate(is_speech):
#         if speech:
#             start = int(i * 0.03 * sr)
#             end = int((i + 1) * 0.03 * sr)
#             voiced[start:end] = True
#     return voiced


# def diarize_audio(audio_path: str):
#     """
#     Returns segmented speaker-labeled transcript regions.
#     Each item in result is like:
#     {
#         "speaker": "Speaker 1",
#         "start": 2.13,
#         "end": 5.23
#     }
#     """
#     wav = preprocess_wav(audio_path)
#     sr = 16000

#     print("[INFO] Performing voice activity detection...")
#     voiced_mask = get_speech_frames(wav, sr)
#     voiced_signal = wav[voiced_mask]

#     print("[INFO] Embedding voiced segments...")
#     encoder = VoiceEncoder()
#     window_size = sr * 1  # 1 second chunks
#     step = sr // 2  # 50% overlap
#     embeddings = []
#     timestamps = []

#     for i in range(0, len(voiced_signal) - window_size, step):
#         chunk = voiced_signal[i:i + window_size]
#         if len(chunk) < window_size:
#             break
#         emb = encoder.embed_utterance(chunk)
#         embeddings.append(emb)
#         timestamps.append((i / sr, (i + window_size) / sr))

#     embeddings = np.array(embeddings)

#     print("[INFO] Clustering embeddings into speakers...")
#     clustering = AgglomerativeClustering(n_clusters=None, distance_threshold=0.7)
#     labels = clustering.fit_predict(embeddings)

#     # Smooth the labels to reduce noise
#     smoothed_labels = gaussian_filter1d(labels.astype(float), sigma=1).round().astype(int)

#     segments = []
#     for i, (start, end) in enumerate(timestamps):
#         segments.append({
#             "speaker": f"Speaker {smoothed_labels[i] + 1}",
#             "start": round(start, 2),
#             "end": round(end, 2)
#         })

#     print(f"[INFO] Diarization completed. Found {len(set(smoothed_labels))} speakers.")
#     return segments

def diarize_with_hybrid_clustering(file_path, num_speakers=None):
    import torch
    import librosa
    import numpy as np
    from resemblyzer import VoiceEncoder, preprocess_wav
    from sklearn.cluster import KMeans, AgglomerativeClustering
    from sklearn.metrics import silhouette_score
    from scipy.spatial.distance import cdist
    import logging

    logging.info("Starting hybrid diarization...")

    wav = preprocess_wav(file_path)
    sr = 16000
    encoder = VoiceEncoder()
    embed, partial_lens, partial_slices = encoder.embed_utterance(
        wav, return_partials=True
    )

    # Fix shape if embed is 1D (only one slice returned)
    if embed.ndim == 1:
        embed = embed.reshape(1, -1)

    # If only one embedding, skip clustering
    if len(embed) <= 1:
        duration = librosa.get_duration(y=wav, sr=sr)
        return [{
            "speaker": "Speaker 1",
            "start": 0.0,
            "end": duration
        }]

    ts = [s.start / sr for s in partial_slices]

    # Determine number of speakers if not provided
    if not num_speakers:
        sil_scores = []
        max_speakers = min(5, len(embed))  # Avoid too many clusters if few slices

        for k in range(2, max_speakers + 1):
            try:
                labels = KMeans(n_clusters=k, random_state=0).fit_predict(embed)
                score = silhouette_score(embed, labels)
                sil_scores.append((k, score))
            except Exception as e:
                logging.warning(f"Silhouette error at k={k}: {e}")
                continue

        if sil_scores:
            num_speakers = max(sil_scores, key=lambda x: x[1])[0]
        else:
            num_speakers = 2  # fallback

    logging.info(f"Using num_speakers={num_speakers}")

    # Hybrid Clustering
    initial_labels = AgglomerativeClustering(n_clusters=num_speakers).fit_predict(embed)

    # Optional: refine labels using distance to centroids (pseudo-soft re-assignment)
    centroids = np.array([
        embed[initial_labels == i].mean(axis=0) for i in range(num_speakers)
    ])
    distances = cdist(embed, centroids)
    final_labels = np.argmin(distances, axis=1)

    def assign_speaker_segments(labels, times):
        segments = []
        current_label = labels[0]
        start_time = times[0]
        for i in range(1, len(labels)):
            if labels[i] != current_label:
                segments.append({
                    "speaker": f"Speaker {current_label + 1}",
                    "start": float(start_time),
                    "end": float(times[i]),
                })
                current_label = labels[i]
                start_time = times[i]
        # Last segment
        segments.append({
            "speaker": f"Speaker {current_label + 1}",
            "start": float(start_time),
            "end": float(times[-1]),
        })
        return segments

    segments = assign_speaker_segments(final_labels, ts)
    return segments
