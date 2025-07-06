
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  BackHandler,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';

const AudioRecorder = () => {
  const [mode, setMode] = useState(null);
  const [recording, setRecording] = useState(null);
  const [recordedURI, setRecordedURI] = useState(null);
  const [sound, setSound] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userTag, setUserTag] = useState('');
  const [language, setLanguage] = useState('en');
  const [timer, setTimer] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const recordingRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Preload audio permissions/setup
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();
  }, []);

  const startTimer = () => {
    const interval = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    setTimer(interval);
  };

  const stopTimer = () => {
    clearInterval(timer);
    setTimer(null);
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const startRecording = async () => {
    try {
      setLoading(true);
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      recordingRef.current = recording;
      setRecordingDuration(0);
      startTimer();
    } catch (err) {
      alert('Recording error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const pauseRecording = async () => {
    if (recordingRef.current) {
      await recordingRef.current.pauseAsync();
      setIsPaused(true);
      stopTimer();
    }
  };

  const resumeRecording = async () => {
    if (recordingRef.current) {
      await recordingRef.current.startAsync();
      setIsPaused(false);
      startTimer();
    }
  };

  const stopRecording = async () => {
    try {
      stopTimer();
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      setRecordedURI(uri);
      setRecording(null);
    } catch {}
  };

  const discardRecording = async () => {
    setRecordedURI(null);
    setRecording(null);
    recordingRef.current = null;
    setRecordingDuration(0);
    setIsPaused(false);
  };

  const playSound = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    const uri = recordedURI || selectedFile?.uri;
    if (!uri) return;
    const { sound: newSound } = await Audio.Sound.createAsync({ uri });
    setSound(newSound);
    await newSound.playAsync();
  };

  const stopPlayback = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (result.assets && result.assets.length > 0) {
      setSelectedFile(result.assets[0]);
    }
  };

  const uploadAudio = async () => {
    setLoading(true);
    const fileUri = recordedURI || selectedFile?.uri;
    if (!fileUri) {
      alert("No audio file selected or recorded.");
      return;
    }

    const fileName = fileUri.split('/').pop();
    const fileType = fileName.endsWith('.m4a') ? 'audio/m4a' :
                     fileName.endsWith('.mp3') ? 'audio/mp3' :
                     fileName.endsWith('.wav') ? 'audio/wav' : 'audio/webm';

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: fileName,
      type: fileType,
    });
    formData.append("user_id", userTag || "Anonymous");
    formData.append("language", language || "en");

    try {
      const response = await fetch("http://192.168.45.183:8000/upload-audio", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

      alert("Upload successful. Transcript ID: " + (result.transcript_id || 'N/A'));
      setTranscription(result.transcription || result.text || '');
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetSession = async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
    }
    stopTimer();
    setRecording(null);
    setRecordedURI(null);
    setSelectedFile(null);
    setTranscription('');
    setRecordingDuration(0);
    setMode(null);
  };

  const downloadTranscription = async () => {
    if (!transcription) return;
    const fileUri = FileSystem.documentDirectory + 'transcription.txt';
    await FileSystem.writeAsStringAsync(fileUri, transcription);
    await Sharing.shareAsync(fileUri);
  };

  const handleExit = () => {
    Alert.alert('Exit App', 'Are you sure you want to exit?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: () => BackHandler.exitApp() },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
        <Text style={styles.exitText}>✖</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>INCIO Participatory Application</Text>

        {!mode ? (
          <View style={styles.modeBox}>
            <Text style={styles.subtitle}>Choose how you want to begin:</Text>
            <TouchableOpacity onPress={() => setMode('record')} style={styles.modeButton}>
              <Text style={styles.buttonText}>🎙️ Record</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMode('upload'); pickFile(); }} style={styles.modeButton}>
              <Text style={styles.buttonText}>📁 Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ResultViewer')} style={styles.modeButton}>
              <Text style={styles.buttonText}>📊 View Results</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.label}>Your Tag</Text>
            <TextInput style={styles.input} value={userTag} onChangeText={setUserTag} placeholder="e.g. JohnDoe123" placeholderTextColor="#aaa" />

            <Text style={styles.label}>Select Language</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={language} onValueChange={setLanguage} style={styles.picker}>
                <Picker.Item label="English" value="en" />
                <Picker.Item label="French" value="fr" />
                <Picker.Item label="Hausa" value="ha" />
                <Picker.Item label="Yoruba" value="yo" />
                <Picker.Item label="Igbo" value="ig" />
              </Picker>
            </View>

            {mode === 'record' && (
              <View style={styles.recordBox}>
                <Text style={styles.label}>⏱️ {formatTime(recordingDuration)}</Text>
                <LottieView source={require('../assets/record.json')} autoPlay loop style={{ height: 80 }} />
                {loading ? (
                  <ActivityIndicator color="#fff" style={{ marginTop: 10 }} />
                ) : recording ? (
                  <>
                    {isPaused ? (
                      <TouchableOpacity onPress={resumeRecording} style={styles.button}><Text style={styles.buttonText}>▶ Resume</Text></TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={pauseRecording} style={styles.button}><Text style={styles.buttonText}>⏸ Pause</Text></TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={stopRecording} style={styles.button}><Text style={styles.buttonText}>⏹ Stop</Text></TouchableOpacity>
                  </>
                ) : !recordedURI ? (
                  <TouchableOpacity onPress={startRecording} style={styles.button}><Text style={styles.buttonText}>🎙 Start Recording</Text></TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={discardRecording} style={styles.resetButton}><Text style={styles.buttonText}>🔁 Re-record</Text></TouchableOpacity>
                )}
              </View>
            )}

            {(recordedURI || selectedFile) && (
              <>
                {selectedFile && (
                  <Text style={styles.fileName}>📎 File: {selectedFile.name || selectedFile.uri.split('/').pop()}</Text>
                )}
                <TouchableOpacity onPress={playSound} style={styles.button}><Text style={styles.buttonText}>▶ Play</Text></TouchableOpacity>
                <TouchableOpacity onPress={stopPlayback} style={styles.button}><Text style={styles.buttonText}>⏹ Stop</Text></TouchableOpacity>
                <TouchableOpacity onPress={uploadAudio} style={styles.uploadButton}><Text style={styles.buttonText}>⬆ Upload</Text></TouchableOpacity>
              </>
            )}

            {loading && <ActivityIndicator color="#fff" style={{ marginVertical: 20 }} />}

            {transcription ? (
              <View style={styles.transcriptionBox}>
                <Text style={styles.label}>📄 Transcription</Text>
                <Text style={styles.transcription}>{transcription}</Text>
                <TouchableOpacity onPress={downloadTranscription} style={styles.button}><Text style={styles.buttonText}>⬇ Download</Text></TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity onPress={resetSession} style={styles.resetButton}>
              <Text style={styles.buttonText}>🔁 New Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, position: 'relative' },
  scrollContent: { paddingBottom: 40 },
  exitButton: { position: 'absolute', top: 40, right: 20, zIndex: 100, backgroundColor: 'transparent' },
  exitText: { color: '#fff', fontSize: 24 },
  title: { fontSize: 22, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginVertical: 20, backgroundColor: '#1e1e1e', padding: 10, borderRadius: 6 },
  subtitle: { color: '#ccc', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modeBox: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  modeButton: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 10, marginVertical: 10, width: '100%', alignItems: 'center' },
  button: { backgroundColor: '#333', padding: 12, borderRadius: 8, marginVertical: 5, alignItems: 'center' },
  uploadButton: { backgroundColor: '#007bff', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  resetButton: { backgroundColor: '#8e44ad', padding: 12, borderRadius: 8, marginTop: 20, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  label: { color: '#fff', marginTop: 20, marginBottom: 5 },
  input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 10, borderRadius: 6, width: '100%' },
  pickerContainer: { backgroundColor: '#1e1e1e', borderRadius: 6, marginTop: 10 },
  picker: { color: '#fff' },
  recordBox: { alignItems: 'center', marginTop: 20 },
  transcriptionBox: { backgroundColor: '#1e1e1e', borderRadius: 8, padding: 15, marginTop: 20 },
  transcription: { color: '#ccc', marginTop: 10 },
  fileName: { color: '#bbb', fontSize: 14, marginBottom: 10 },
});

export default AudioRecorder;
