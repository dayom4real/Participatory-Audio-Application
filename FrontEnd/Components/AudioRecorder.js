//Initial code for a React Native audio recording and uploading component using Expo Audio and DocumentPicker


// import React, { useState, useRef } from 'react';
// import { View, Button, Text, StyleSheet } from 'react-native';
// import { Audio } from 'expo-av';

// export default function AudioRecorder() {
//   const [recording, setRecording] = useState(null);
//   const [sound, setSound] = useState(null);
//   const [recordingUri, setRecordingUri] = useState(null);
//   const soundRef = useRef(null);

//   const startRecording = async () => {
//     try {
//       await Audio.requestPermissionsAsync();
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );
//       setRecording(recording);
//     } catch (err) {
//       console.error('Failed to start recording', err);
//     }
//   };

//   const stopRecording = async () => {
//     if (!recording) return;

//     try {
//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
//       setRecordingUri(uri);
//       setRecording(null);
//     } catch (err) {
//       console.error('Failed to stop recording', err);
//     }
//   };

//   const playRecording = async () => {
//     if (!recordingUri) return;

//     if (soundRef.current) {
//       await soundRef.current.unloadAsync();
//     }

//     const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
//     soundRef.current = sound;
//     await sound.playAsync();
//   };

//   return (
//     <View style={styles.container}>
//       <Button
//         title={recording ? 'Stop Recording' : 'Start Recording'}
//         onPress={recording ? stopRecording : startRecording}
//       />
//       {recordingUri && (
//         <>
//           <Text style={styles.uriText}>🎧 Recording saved</Text>
//           <Button title="Play Recording" onPress={playRecording} />
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { marginTop: 20, alignItems: 'center' },
//   uriText: { marginVertical: 10, fontStyle: 'italic', color: 'green' },
// });


// // components/AudioRecorder.js
// import React, { useState, useRef } from 'react';
// import { View, Button, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// import { Audio } from 'expo-av';
// import * as FileSystem from 'expo-file-system';
// import * as DocumentPicker from 'expo-document-picker';

// export default function AudioRecorder() {
//   const [recording, setRecording] = useState(null);
//   const [recordedURI, setRecordedURI] = useState(null);
//   const [selectedURI, setSelectedURI] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const recordingRef = useRef(null);

//   const startRecording = async () => {
//     try {
//       await Audio.requestPermissionsAsync();
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );

//       recordingRef.current = recording;
//       setRecording(recording);
//     } catch (err) {
//       console.error('Start recording error:', err);
//       Alert.alert('Error', 'Microphone permission denied or failed.');
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       await recordingRef.current.stopAndUnloadAsync();
//       const uri = recordingRef.current.getURI();
//       setRecordedURI(uri);
//       setRecording(null);
//     } catch (err) {
//       console.error('Stop recording error:', err);
//     }
//   };

//   const pickAudioFile = async () => {
//     const result = await DocumentPicker.getDocumentAsync({
//       type: 'audio/*',
//     });

//     if (result.type === 'success') {
//       setSelectedURI(result.uri);
//       setRecordedURI(null); // Clear any recorded one
//     }
//   };

//   const uploadAudio = async () => {
//     const uri = recordedURI || selectedURI;
//     if (!uri) {
//       Alert.alert('No audio selected', 'Please record or select an audio file.');
//       return;
//     }

//     try {
//       setUploading(true);
//       const fileInfo = await FileSystem.getInfoAsync(uri);
//       const formData = new FormData();

//       formData.append('file', {
//         uri: uri,
//         name: 'audio.wav',
//         type: 'audio/wav',
//       });

//       const response = await fetch('http://127.0.0.1:8000/upload-audio', {
//         method: 'POST',
//         body: formData,
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       const json = await response.json();
//       if (response.ok) {
//         Alert.alert('Transcription', json.transcription);
//       } else {
//         Alert.alert('Upload failed', json.error || 'Unknown error.');
//       }
//     } catch (err) {
//       console.error('Upload failed:', err);
//       Alert.alert('Upload error', err.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Button title={recording ? 'Stop Recording' : 'Start Recording'} onPress={recording ? stopRecording : startRecording} />
//       <View style={styles.spacer} />
//       <Button title="Pick Audio File" onPress={pickAudioFile} />
//       <View style={styles.spacer} />
//       {(recordedURI || selectedURI) && (
//         <Button title="Upload Audio" onPress={uploadAudio} />
//       )}
//       {uploading && <ActivityIndicator style={{ marginTop: 20 }} />}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     marginTop: 30,
//     alignItems: 'center',
//     padding: 16,
//   },
//   spacer: {
//     height: 20,
//   },
// });



// import React, { useState } from 'react';
// import { View, Text, Button, StyleSheet, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
// import * as DocumentPicker from 'expo-document-picker';
// import { Audio } from 'expo-av';
// import { Picker } from '@react-native-picker/picker';

// const SERVER_URL = 'http://127.0.0.1:8000/upload-audio'; // Change if needed

// export default function AudioRecorder() {
//   const [mode, setMode] = useState(null); // 'record' or 'upload'
//   const [recording, setRecording] = useState(null);
//   const [sound, setSound] = useState(null);
//   const [audioFile, setAudioFile] = useState(null);
//   const [language, setLanguage] = useState('en');
//   const [user, setUser] = useState('');
//   const [filename, setFilename] = useState('');
//   const [transcription, setTranscription] = useState('');
//   const [uploading, setUploading] = useState(false);

//   // Ask user to choose recording or upload
//   if (!mode) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.question}>Do you want to record a session now?</Text>
//         <View style={styles.buttonRow}>
//           <Button title="Yes, Record" onPress={() => setMode('record')} />
//           <Button title="No, Upload" onPress={() => setMode('upload')} />
//         </View>
//       </View>
//     );
//   }

//   // RECORDING HANDLERS
//   const startRecording = async () => {
//     try {
//       await Audio.requestPermissionsAsync();
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );

//       setRecording(recording);
//     } catch (err) {
//       console.error('Failed to start recording', err);
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
//       setAudioFile({ uri, name: 'recording.wav', type: 'audio/wav' });
//       setRecording(null);
//     } catch (err) {
//       console.error('Failed to stop recording', err);
//     }
//   };

//   const playRecording = async () => {
//     if (audioFile) {
//       const { sound } = await Audio.Sound.createAsync({ uri: audioFile.uri });
//       setSound(sound);
//       await sound.playAsync();
//     }
//   };

//   // UPLOAD EXISTING AUDIO
//   const pickAudio = async () => {
//     const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
//     if (!result.canceled) {
//       const file = result.assets[0];
//       setAudioFile({
//         uri: file.uri,
//         name: file.name || 'uploaded_audio.wav',
//         type: file.mimeType || 'audio/wav',
//       });
//     }
//   };

//   // UPLOAD TO SERVER
//   const uploadAudio = async () => {
//     if (!audioFile) return Alert.alert('No file selected or recorded');

//     setUploading(true);
//     const formData = new FormData();
//     formData.append('file', {
//       uri: audioFile.uri,
//       name: audioFile.name,
//       type: audioFile.type,
//     });
//     formData.append('user', user);
//     formData.append('language', language);

//     try {
//       const response = await fetch(SERVER_URL, {
//         method: 'POST',
//         body: formData,
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setTranscription(data.transcription || 'No transcript found.');
//       } else {
//         Alert.alert('Error', data.error || 'Upload failed.');
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error uploading audio');
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TextInput
//         placeholder="User ID or Name"
//         style={styles.input}
//         value={user}
//         onChangeText={setUser}
//       />

//       <Picker
//         selectedValue={language}
//         style={styles.picker}
//         onValueChange={(itemValue) => setLanguage(itemValue)}
//       >
//         <Picker.Item label="English" value="en" />
//         <Picker.Item label="French" value="fr" />
//         <Picker.Item label="Yoruba" value="yo" />
//         <Picker.Item label="Hausa" value="ha" />
//         {/* Add more as needed */}
//       </Picker>

//       {mode === 'record' && (
//         <>
//           <Button
//             title={recording ? 'Stop Recording' : 'Start Recording'}
//             onPress={recording ? stopRecording : startRecording}
//           />
//         </>
//       )}

//       {mode === 'upload' && (
//         <>
//           <Button title="Select Audio File" onPress={pickAudio} />
//         </>
//       )}

//       {audioFile && (
//         <>
//           <Text style={styles.info}>📄 Selected: {audioFile.name}</Text>
//           <Button title="▶️ Play" onPress={playRecording} />
//           <Button title="Upload & Transcribe" onPress={uploadAudio} />
//         </>
//       )}

//       {uploading && <ActivityIndicator size="large" color="#0000ff" />}

//       {transcription ? (
//         <View style={styles.transcriptionBox}>
//           <Text style={styles.transcriptionLabel}>📝 Transcription:</Text>
//           <Text style={styles.transcriptionText}>{transcription}</Text>
//         </View>
//       ) : null}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, justifyContent: 'center' },
//   question: { fontSize: 18, textAlign: 'center', marginBottom: 20 },
//   buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 },
//   input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 6 },
//   picker: { marginVertical: 10 },
//   info: { marginVertical: 10, fontSize: 14 },
//   transcriptionBox: { marginTop: 20, padding: 10, backgroundColor: '#f2f2f2', borderRadius: 6 },
//   transcriptionLabel: { fontWeight: 'bold', marginBottom: 5 },
//   transcriptionText: { fontSize: 14 },
// });


// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
// import { Audio } from 'expo-av';
// import * as DocumentPicker from 'expo-document-picker';
// import { Picker } from '@react-native-picker/picker';
// import * as FileSystem from 'expo-file-system';
// import { BackHandler } from 'react-native';


// const AudioRecorder = () => {
//   const [mode, setMode] = useState(null); // 'record' or 'upload'
//   const [recording, setRecording] = useState(null);
//   const [recordedURI, setRecordedURI] = useState(null);
//   const [sound, setSound] = useState(null);
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const [transcription, setTranscription] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [userTag, setUserTag] = useState('');
//   const [language, setLanguage] = useState('en');
//   const [timer, setTimer] = useState(null);
//   const [isPaused, setIsPaused] = useState(false);
//   const recordingRef = useRef(null);

//   const startTimer = () => {
//     setRecordingDuration(0);
//     const interval = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
//     setTimer(interval);
//   };

//   const stopTimer = () => {
//     clearInterval(timer);
//     setTimer(null);
//   };

//   const formatTime = (seconds) => {
//     const min = Math.floor(seconds / 60);
//     const sec = seconds % 60;
//     return `${min}:${sec < 10 ? '0' : ''}${sec}`;
//   };

//   const startRecording = async () => {
//     try {
//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== 'granted') {
//         alert('Microphone permission is required.');
//         return;
//       }

//       await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );
//       setRecording(recording);
//       recordingRef.current = recording;
//       startTimer();
//     } catch (err) {
//       console.error('Failed to start recording', err);
//     }
//   };

//   const pauseRecording = async () => {
//     if (recordingRef.current) {
//       await recordingRef.current.pauseAsync();
//       setIsPaused(true);
//       stopTimer();
//     }
//   };

//   const resumeRecording = async () => {
//     if (recordingRef.current) {
//       await recordingRef.current.startAsync();
//       setIsPaused(false);
//       startTimer();
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       stopTimer();
//       await recordingRef.current.stopAndUnloadAsync();
//       const uri = recordingRef.current.getURI();
//       setRecordedURI(uri);
//       setRecording(null);
//     } catch (err) {
//       console.error('Error stopping recording:', err);
//     }
//   };

//   const pickAudioFile = async () => {
//     const file = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
//     if (!file.canceled) {
//       setSelectedFile(file.assets[0]);
//     }
//   };

//   const playSound = async () => {
//     const uri = recordedURI || selectedFile?.uri;
//     if (!uri) return;

//     const { sound } = await Audio.Sound.createAsync({ uri });
//     setSound(sound);
//     await sound.playAsync();
//   };

//   const stopPlayback = async () => {
//     if (sound) {
//       await sound.stopAsync();
//       await sound.unloadAsync();
//       setSound(null);
//     }
//   };

//   const uploadAudio = async () => {
//     setLoading(true);
//     const fileUri = recordedURI || selectedFile?.uri;
//     if (!fileUri) return;

//     const formData = new FormData();
//     formData.append('file', {
//       uri: fileUri,
//       name: fileUri.split('/').pop(),
//       type: 'audio/m4a',
//     });
//     formData.append('user_id', userTag);
//     formData.append('language', language);

//     try {
//       const response = await fetch('http://127.0.0.1:8000/upload-audio', {
//         method: 'POST',
//         body: formData,
//       });
//       const data = await response.json();
//       setTranscription(data.transcription || data.text || JSON.stringify(data));
//     } catch (err) {
//       setTranscription('Upload failed: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetSession = () => {
//     stopTimer();
//     setRecording(null);
//     setRecordedURI(null);
//     setSelectedFile(null);
//     setTranscription('');
//     setRecordingDuration(0);
//     setMode(null);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>INICIO IMPACT AND EVALUATION HUB PARTICIPATORY TOOL</Text>

//       {!mode ? (
//         <View style={styles.modeBox}>
//           <Text style={styles.subtitle}>
//             Do you want to record a new session or upload an existing audio file?
//           </Text>
//           <TouchableOpacity onPress={() => setMode('record')} style={styles.modeButton}>
//             <Text>🎙️ Record</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => setMode('upload')} style={styles.modeButton}>
//             <Text>📁 Upload</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <>
//           <Text style={styles.label}>Tag This Session</Text>
//           <TextInput
//             style={styles.input}
//             value={userTag}
//             onChangeText={setUserTag}
//             placeholder="Enter your name or ID"
//             placeholderTextColor="#aaa"
//           />

//           <Text style={styles.label}>Select Language</Text>
//           <Picker
//             selectedValue={language}
//             style={styles.picker}
//             onValueChange={(itemValue) => setLanguage(itemValue)}
//           >
//             <Picker.Item label="English" value="en" />
//             <Picker.Item label="French" value="fr" />
//             <Picker.Item label="Spanish" value="es" />
//           </Picker>

//           {mode === 'record' && (
//             <View>
//               <Text style={styles.duration}>⏱️ {formatTime(recordingDuration)}</Text>
//               {recording ? (
//                 <>
//                   {isPaused ? (
//                     <TouchableOpacity onPress={resumeRecording} style={styles.actionButton}>
//                       <Text>▶️ Resume</Text>
//                     </TouchableOpacity>
//                   ) : (
//                     <TouchableOpacity onPress={pauseRecording} style={styles.actionButton}>
//                       <Text>⏸️ Pause</Text>
//                     </TouchableOpacity>
//                   )}
//                   <TouchableOpacity onPress={stopRecording} style={styles.actionButton}>
//                     <Text>⏹️ Stop</Text>
//                   </TouchableOpacity>
//                 </>
//               ) : (
//                 <TouchableOpacity onPress={startRecording} style={styles.actionButton}>
//                   <Text>🎙️ Start Recording</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}

//           {mode === 'upload' && (
//             <View>
//               <TouchableOpacity onPress={pickAudioFile} style={styles.actionButton}>
//                 <Text>📁 Choose File</Text>
//               </TouchableOpacity>
//               {selectedFile && (
//                 <Text style={styles.filename}>Selected: {selectedFile.name}</Text>
//               )}
//             </View>
//           )}

//           {(recordedURI || selectedFile) && (
//             <View>
//               <TouchableOpacity onPress={playSound} style={styles.playButton}>
//                 <Text>▶️ Play</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={stopPlayback} style={styles.playButton}>
//                 <Text>⏹️ Stop</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={uploadAudio} style={styles.uploadButton}>
//                 <Text>⬆️ Upload</Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           {loading && (
//             <ActivityIndicator size="large" color="#fff" style={{ margin: 10 }} />
//           )}

//           {transcription !== '' && (
//             <View style={styles.transcriptionBox}>
//               <Text style={styles.label}>📄 Transcription:</Text>
//               <Text style={styles.transcription}>{transcription}</Text>
//             </View>
//           )}

//           <TouchableOpacity onPress={resetSession} style={styles.closeButton}>
//             <Text>🔁 New Session</Text>
//           </TouchableOpacity>
//         </>
//       )}
//     </View>
    
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#121212',
//     padding: 20,
//     alignItems: 'center',
//   },
//   title: {
//     color: '#fff',
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginTop: 40,
//     textAlign: 'center',
//   },
//   modeBox: {
//     marginTop: 30,
//     alignItems: 'center',
//   },
//   subtitle: {
//     color: '#fff',
//     marginBottom: 20,
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   modeButton: {
//     padding: 10,
//     backgroundColor: '#303030',
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   label: {
//     color: '#ddd',
//     marginTop: 10,
//     fontWeight: 'bold',
//   },
//   input: {
//     backgroundColor: '#222',
//     color: '#fff',
//     padding: 8,
//     borderRadius: 6,
//     width: '100%',
//     marginBottom: 10,
//   },
//   picker: {
//     backgroundColor: '#222',
//     color: '#fff',
//     width: '100%',
//     marginBottom: 10,
//   },
//   filename: {
//     color: '#ccc',
//     marginTop: 5,
//   },
//   actionButton: {
//     padding: 10,
//     backgroundColor: '#444',
//     borderRadius: 10,
//     marginVertical: 8,
//     alignItems: 'center',
//   },
//   playButton: {
//     padding: 10,
//     backgroundColor: '#666',
//     borderRadius: 10,
//     marginTop: 10,
//   },
//   uploadButton: {
//     padding: 10,
//     backgroundColor: '#007bff',
//     borderRadius: 10,
//     marginTop: 10,
//     alignItems: 'center',
//   },
//   transcriptionBox: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: '#1e1e1e',
//     borderRadius: 8,
//     width: '100%',
//   },
//   transcription: {
//     color: '#fff',
//     marginTop: 5,
//   },
//   duration: {
//     color: '#bbb',
//     marginVertical: 5,
//   },
//   closeButton: {
//     marginTop: 20,
//     padding: 10,
//     backgroundColor: '#8e44ad',
//     borderRadius: 10,
//   },

  
// });

// export default AudioRecorder;



// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, BackHandler, Alert, Platform } from 'react-native';
// import { Audio } from 'expo-av';
// import { Picker } from '@react-native-picker/picker';


// const AudioRecorder = () => {
//   const [mode, setMode] = useState(null); // 'record' or 'upload'
//   const [recording, setRecording] = useState(null);
//   const [recordedURI, setRecordedURI] = useState(null);
//   const [sound, setSound] = useState(null);
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const [transcription, setTranscription] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [userTag, setUserTag] = useState('');
//   const [language, setLanguage] = useState('en');
//   const [timer, setTimer] = useState(null);
//   const [isPaused, setIsPaused] = useState(false);
//   const recordingRef = useRef(null);

//   useEffect(() => {
//     setMode(null); // Reset mode on first render
//   }, []);

//   const startTimer = () => {
//     setRecordingDuration(0);
//     const interval = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
//     setTimer(interval);
//   };

//   const stopTimer = () => {
//     clearInterval(timer);
//     setTimer(null);
//   };

//   const formatTime = (seconds) => {
//     const min = Math.floor(seconds / 60);
//     const sec = seconds % 60;
//     return `${min}:${sec < 10 ? '0' : ''}${sec}`;
//   };

//   const startRecording = async () => {
//     try {
//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== 'granted') {
//         alert('Microphone permission is required.');
//         return;
//       }

//       if (recordingRef.current) {
//         try {
//           await recordingRef.current.stopAndUnloadAsync();
//         } catch (e) {}
//         recordingRef.current = null;
//       }

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
//       setRecording(recording);
//       recordingRef.current = recording;
//       startTimer();
//     } catch (err) {
//       console.error('Failed to start recording', err);
//       alert('Recording error: ' + err.message);
//     }
//   };

//   const pauseRecording = async () => {
//     if (recordingRef.current) {
//       await recordingRef.current.pauseAsync();
//       setIsPaused(true);
//       stopTimer();
//     }
//   };

//   const resumeRecording = async () => {
//     if (recordingRef.current) {
//       await recordingRef.current.startAsync();
//       setIsPaused(false);
//       startTimer();
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       stopTimer();
//       await recordingRef.current.stopAndUnloadAsync();
//       const uri = recordingRef.current.getURI();
//       setRecordedURI(uri);
//       setRecording(null);
//     } catch (err) {
//       console.error('Error stopping recording:', err);
//     }
//   };

//   const pickAudioFile = async () => {
//     const file = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
//     if (!file.canceled) {
//       setSelectedFile(file.assets[0]);
//     }
//   };

//   const playSound = async () => {
//     const uri = recordedURI || selectedFile?.uri;
//     if (!uri) return;

//     const { sound } = await Audio.Sound.createAsync({ uri });
//     setSound(sound);
//     await sound.playAsync();
//   };

//   const stopPlayback = async () => {
//     if (sound) {
//       await sound.stopAsync();
//       await sound.unloadAsync();
//       setSound(null);
//     }
//   };

//   const uploadAudio = async () => {
//     setLoading(true);
//     const fileUri = recordedURI || selectedFile?.uri;
//     if (!fileUri) return;

//     const formData = new FormData();
//     formData.append('file', {
//       uri: fileUri,
//       name: fileUri.split('/').pop(),
//       type: 'audio/m4a',
//     });
//     formData.append('user_id', userTag);
//     formData.append('language', language);

//     try {
//       const response = await fetch('http://127.0.0.1:8000/upload-audio', {
//         method: 'POST',
//         body: formData,
//       });
//       const data = await response.json();
//       setTranscription(data.transcription || data.text || JSON.stringify(data));
//     } catch (err) {
//       setTranscription('Upload failed: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetSession = async () => {
//     if (recordingRef.current) {
//       try {
//         await recordingRef.current.stopAndUnloadAsync();
//       } catch (e) {}
//       recordingRef.current = null;
//     }

//     stopTimer();
//     setRecording(null);
//     setRecordedURI(null);
//     setSelectedFile(null);
//     setTranscription('');
//     setRecordingDuration(0);
//     setMode(null);
//   };

//   const handleExit = () => {
//     Alert.alert(
//       'Exit App',
//       'Are you sure you want to exit?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Yes', onPress: () => BackHandler.exitApp() },
//       ],
//       { cancelable: true }
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
//         <Text style={{ color: '#000', fontSize: 18 }}>✖</Text>
//       </TouchableOpacity>

//       <Text style={styles.title}>INICIO IMPACT AND EVALUATION HUB PARTICIPATORY TOOL</Text>

//       {!mode ? (
//         <View style={styles.modeBox}>
//           <Text style={styles.subtitle}>Do you want to record a new session or upload an existing audio file?</Text>
//           <TouchableOpacity onPress={() => setMode('record')} style={styles.modeButton}>
//             <Text>🎙️ Record</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => setMode('upload')} style={styles.modeButton}>
//             <Text>📁 Upload</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <>
//           <Text style={styles.label}>Tag This Session</Text>
//           <TextInput
//             style={styles.input}
//             value={userTag}
//             onChangeText={setUserTag}
//             placeholder="Enter your name or ID"
//             placeholderTextColor="#888"
//           />

//           <Text style={styles.label}>Select Language</Text>
//           <View style={styles.pickerContainer}>
//             <Picker
//               selectedValue={language}
//               onValueChange={(itemValue) => setLanguage(itemValue)}
//               mode="dropdown"
//               style={Platform.OS === 'android' ? styles.picker : undefined}
//               itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
//             >
//               <Picker.Item label="English" value="en" />
//               <Picker.Item label="French" value="fr" />
//               <Picker.Item label="Hausa" value="ha" />
//               <Picker.Item label="Yoruba" value="yo" />
//               <Picker.Item label="Igbo" value="ig" />
//             </Picker>
//           </View>

//           {mode === 'record' && (
//             <View>
//               <Text style={styles.duration}>⏱️ {formatTime(recordingDuration)}</Text>
//               {recording ? (
//                 <>
//                   {isPaused ? (
//                     <TouchableOpacity onPress={resumeRecording} style={styles.actionButton}>
//                       <Text>▶️ Resume</Text>
//                     </TouchableOpacity>
//                   ) : (
//                     <TouchableOpacity onPress={pauseRecording} style={styles.actionButton}>
//                       <Text>⏸️ Pause</Text>
//                     </TouchableOpacity>
//                   )}
//                   <TouchableOpacity onPress={stopRecording} style={styles.actionButton}>
//                     <Text>⏹️ Stop</Text>
//                   </TouchableOpacity>
//                 </>
//               ) : (
//                 <TouchableOpacity onPress={startRecording} style={styles.actionButton}>
//                   <Text>🎙️ Start Recording</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}

//           {mode === 'upload' && (
//             <View>
//               <TouchableOpacity onPress={pickAudioFile} style={styles.actionButton}>
//                 <Text>📁 Choose File</Text>
//               </TouchableOpacity>
//               {selectedFile && <Text style={styles.filename}>Selected: {selectedFile.name}</Text>}
//             </View>
//           )}

//           {(recordedURI || selectedFile) && (
//             <View>
//               <TouchableOpacity onPress={playSound} style={styles.playButton}>
//                 <Text>▶️ Play</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={stopPlayback} style={styles.playButton}>
//                 <Text>⏹️ Stop</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={uploadAudio} style={styles.uploadButton}>
//                 <Text>⬆️ Upload</Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           {loading && <ActivityIndicator size="large" color="#000" style={{ margin: 10 }} />}

//           {transcription !== '' && (
//             <View style={styles.transcriptionBox}>
//               <Text style={styles.label}>📄 Transcription:</Text>
//               <Text style={styles.transcription}>{transcription}</Text>
//             </View>
//           )}

//           <TouchableOpacity onPress={resetSession} style={styles.closeButton}>
//             <Text>🔁 New Session</Text>
//           </TouchableOpacity>
//         </>
//       )}
//     </View>
//   );
// };

// // const styles = StyleSheet.create({
// //   // container: {
// //   //   flex: 1,
// //   //   //backgroundColor: '#fff',

// //   //   padding: 20,
// //   //   alignItems: 'center',

// //     container: {
// //     flex: 1,
// //     backgroundColor: '#121212',
// //     padding: 20,
// //     alignItems: 'center',
// //   },

// //   exitButton: {
// //     position: 'absolute',
// //     top: 40,
// //     right: 20,
// //     zIndex: 10,
// //     padding: 5,
// //   },
// //   title: {
// //     color: '#fff',
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //     marginTop: 40,
// //     textAlign: 'center',
// //   },
// //   modeBox: {
// //     marginTop: 30,
// //     alignItems: 'center',
// //   },
// //   subtitle: {
// //     color: '#444',
// //     marginBottom: 20,
// //     fontSize: 16,
// //     textAlign: 'center',
// //   },
// //   modeButton: {
// //     padding: 10,
// //     backgroundColor: '#eee',
// //     borderRadius: 10,
// //     marginBottom: 10,
// //   },
// //   label: {
// //     color: '#222',
// //     marginTop: 10,
// //     fontWeight: 'bold',
// //   },
// //   input: {
// //     backgroundColor: '#f0f0f0',
// //     color: '#000',
// //     padding: 8,
// //     borderRadius: 6,
// //     width: '100%',
// //     marginBottom: 10,
// //   },
// //   pickerContainer: {
// //     backgroundColor: '#f0f0f0',
// //     borderRadius: 6,
// //     marginBottom: 10,
// //     width: '100%',
// //   },
// //   picker: {
// //     color: '#000',
// //     width: '100%',
// //   },
// //   pickerItem: {
// //     fontSize: 16,
// //     color: '#000',
// //   },
// //   filename: {
// //     color: '#444',
// //     marginTop: 5,
// //   },
// //   actionButton: {
// //     padding: 10,
// //     backgroundColor: '#ddd',
// //     borderRadius: 10,
// //     marginVertical: 8,
// //     alignItems: 'center',
// //   },
// //   playButton: {
// //     padding: 10,
// //     backgroundColor: '#ccc',
// //     borderRadius: 10,
// //     marginTop: 10,
// //   },
// //   uploadButton: {
// //     padding: 10,
// //     backgroundColor: '#4caf50',
// //     borderRadius: 10,
// //     marginTop: 10,
// //     alignItems: 'center',
// //   },
// //   transcriptionBox: {
// //     marginTop: 20,
// //     padding: 15,
// //     backgroundColor: '#eee',
// //     borderRadius: 8,
// //     width: '100%',
// //   },
// //   transcription: {
// //     color: '#333',
// //     marginTop: 5,
// //   },
// //   duration: {
// //     color: '#555',
// //     marginVertical: 5,
// //   },
// //   closeButton: {
// //     marginTop: 20,
// //     padding: 10,
// //     backgroundColor: '#2196f3',
// //     borderRadius: 10,
// //   },
// // });



// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#121212',
//     padding: 20,
//     alignItems: 'center',
//   },
//   title: {
//     color: '#fff',
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginTop: 40,
//     textAlign: 'center',
//   },
//   modeBox: {
//     marginTop: 30,
//     alignItems: 'center',
//   },
//   subtitle: {
//     color: '#fff',
//     marginBottom: 20,
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   modeButton: {
//     padding: 10,
//     backgroundColor: '#303030',
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   label: {
//     color: '#ddd',
//     marginTop: 10,
//     fontWeight: 'bold',
//   },
//   input: {
//     backgroundColor: '#222',
//     color: '#fff',
//     padding: 8,
//     borderRadius: 6,
//     width: '100%',
//     marginBottom: 10,
//   },
//   picker: {
//     backgroundColor: '#222',
//     color: '#fff',
//     width: '100%',
//     marginBottom: 10,
//   },
//   filename: {
//     color: '#ccc',
//     marginTop: 5,
//   },
//   actionButton: {
//     padding: 10,
//     backgroundColor: '#444',
//     borderRadius: 10,
//     marginVertical: 8,
//     alignItems: 'center',
//   },
//   playButton: {
//     padding: 10,
//     backgroundColor: '#666',
//     borderRadius: 10,
//     marginTop: 10,
//   },
//   uploadButton: {
//     padding: 10,
//     backgroundColor: '#007bff',
//     borderRadius: 10,
//     marginTop: 10,
//     alignItems: 'center',
//   },
//   transcriptionBox: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: '#1e1e1e',
//     borderRadius: 8,
//     width: '100%',
//   },
//   transcription: {
//     color: '#fff',
//     marginTop: 5,
//   },
//   duration: {
//     color: '#bbb',
//     marginVertical: 5,
//   },
//   closeButton: {
//     marginTop: 20,
//     padding: 10,
//     backgroundColor: '#8e44ad',
//     borderRadius: 10,
//   },

  
// });

// export default AudioRecorder;



// // AudioRecorder.js with dark theme, animated timer, resume from pause, and download option
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   ActivityIndicator,
//   BackHandler,
//   Alert,
//   Platform,
//   Animated,
//   ScrollView
// } from 'react-native';
// import { Audio } from 'expo-av';
// import { Picker } from '@react-native-picker/picker';
// import * as DocumentPicker from 'expo-document-picker';
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';

// const AudioRecorder = () => {
//   const [mode, setMode] = useState(null);
//   const [recording, setRecording] = useState(null);
//   const [recordedURI, setRecordedURI] = useState(null);
//   const [sound, setSound] = useState(null);
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const [transcription, setTranscription] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [userTag, setUserTag] = useState('');
//   const [language, setLanguage] = useState('en');
//   const [isPaused, setIsPaused] = useState(false);
//   const recordingRef = useRef(null);
//   const intervalRef = useRef(null);
//   const animatedTimer = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     setMode(null);
//     return () => clearInterval(intervalRef.current);
//   }, []);

//   const startTimer = () => {
//     clearInterval(intervalRef.current);
//     intervalRef.current = setInterval(() => {
//       setRecordingDuration(prev => prev + 1);
//     }, 1000);
//     Animated.loop(
//       Animated.timing(animatedTimer, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: false,
//       })
//     ).start();
//   };

//   const stopTimer = () => {
//     clearInterval(intervalRef.current);
//     animatedTimer.stopAnimation();
//   };

//   const formatTime = (seconds) => {
//     const min = Math.floor(seconds / 60);
//     const sec = seconds % 60;
//     return `${min}:${sec < 10 ? '0' : ''}${sec}`;
//   };

//   const startRecording = async () => {
//     try {
//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== 'granted') return alert('Permission denied.');

//       await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

//       const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
//       setRecording(recording);
//       recordingRef.current = recording;
//       setIsPaused(false);
//       startTimer();
//     } catch (e) {
//       alert('Recording failed: ' + e.message);
//     }
//   };

//   const pauseRecording = async () => {
//     if (recordingRef.current) {
//       await recordingRef.current.pauseAsync();
//       setIsPaused(true);
//       stopTimer();
//     }
//   };

//   const resumeRecording = async () => {
//     if (recordingRef.current) {
//       await recordingRef.current.startAsync();
//       setIsPaused(false);
//       startTimer();
//     }
//   };

//   const stopRecording = async () => {
//     stopTimer();
//     await recordingRef.current.stopAndUnloadAsync();
//     setRecordedURI(recordingRef.current.getURI());
//     setRecording(null);
//   };

//   const pickAudioFile = async () => {
//     const file = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
//     if (!file.canceled) setSelectedFile(file.assets[0]);
//   };

//   const playSound = async () => {
//     const uri = recordedURI || selectedFile?.uri;
//     if (!uri) return;
//     const { sound } = await Audio.Sound.createAsync({ uri });
//     setSound(sound);
//     await sound.playAsync();
//   };

//   const stopPlayback = async () => {
//     if (sound) {
//       await sound.stopAsync();
//       await sound.unloadAsync();
//       setSound(null);
//     }
//   };

//   const uploadAudio = async () => {
//     setLoading(true);
//     const fileUri = recordedURI || selectedFile?.uri;
//     if (!fileUri) return;

//     const formData = new FormData();
//     formData.append('file', {
//       uri: fileUri,
//       name: fileUri.split('/').pop(),
//       type: 'audio/m4a',
//     });
//     formData.append('user_id', userTag);
//     formData.append('language', language);

//     try {
//       const res = await fetch('http://127.0.0.1:8000/upload-audio', {
//         method: 'POST',
//         body: formData,
//       });
//       const data = await res.json();
//       setTranscription(data.transcription || data.text || 'No transcription returned.');
//     } catch (e) {
//       setTranscription('Upload failed: ' + e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetSession = async () => {
//     if (recordingRef.current) {
//       try { await recordingRef.current.stopAndUnloadAsync(); } catch {}
//     }
//     stopTimer();
//     setRecording(null);
//     setRecordedURI(null);
//     setSelectedFile(null);
//     setTranscription('');
//     setRecordingDuration(0);
//     setMode(null);
//   };

//   const downloadTranscription = async () => {
//     if (!transcription) return;
//     const path = FileSystem.documentDirectory + 'transcription.txt';
//     await FileSystem.writeAsStringAsync(path, transcription);
//     Sharing.shareAsync(path);
//   };

//   const handleExit = () => {
//     Alert.alert('Exit App', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Yes', onPress: () => BackHandler.exitApp() },
//     ]);
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
//         <Text style={{ color: '#fff', fontSize: 18 }}>✖</Text>
//       </TouchableOpacity>
//       <Text style={styles.title}>INICIO IMPACT AND EVALUATION HUB PARTICIPATORY TOOL</Text>

//       {!mode ? (
//         <View style={styles.modeBox}>
//           <Text style={styles.subtitle}>Do you want to record or upload?</Text>
//           <TouchableOpacity onPress={() => setMode('record')} style={styles.modeButton}><Text>🎙️ Record</Text></TouchableOpacity>
//           <TouchableOpacity onPress={() => setMode('upload')} style={styles.modeButton}><Text>📁 Upload</Text></TouchableOpacity>
//         </View>
//       ) : (
//         <ScrollView style={{ width: '100%' }}>
//           <Text style={styles.label}>Tag This Session</Text>
//           <TextInput style={styles.input} value={userTag} onChangeText={setUserTag} placeholder="Enter your name or ID" placeholderTextColor="#aaa" />

//           <Text style={styles.label}>Language</Text>
//           <View style={styles.pickerContainer}>
//             <Picker selectedValue={language} onValueChange={setLanguage} style={styles.picker}>
//               <Picker.Item label="English" value="en" />
//               <Picker.Item label="French" value="fr" />
//               <Picker.Item label="Hausa" value="ha" />
//               <Picker.Item label="Yoruba" value="yo" />
//               <Picker.Item label="Igbo" value="ig" />
//             </Picker>
//           </View>

//           {mode === 'record' && (
//             <View>
//               <Text style={styles.duration}>⏱️ {formatTime(recordingDuration)}</Text>
//               {recording ? (
//                 isPaused ? (
//                   <TouchableOpacity onPress={resumeRecording} style={styles.actionButton}><Text>▶️ Resume</Text></TouchableOpacity>
//                 ) : (
//                   <TouchableOpacity onPress={pauseRecording} style={styles.actionButton}><Text>⏸️ Pause</Text></TouchableOpacity>
//                 )
//               ) : (
//                 <TouchableOpacity onPress={startRecording} style={styles.actionButton}><Text>🎙️ Start Recording</Text></TouchableOpacity>
//               )}
//               {recording && <TouchableOpacity onPress={stopRecording} style={styles.actionButton}><Text>⏹️ Stop</Text></TouchableOpacity>}
//             </View>
//           )}

//           {mode === 'upload' && (
//             <View>
//               <TouchableOpacity onPress={pickAudioFile} style={styles.actionButton}><Text>📁 Choose File</Text></TouchableOpacity>
//               {selectedFile && <Text style={styles.filename}>Selected: {selectedFile.name}</Text>}
//             </View>
//           )}

//           {(recordedURI || selectedFile) && (
//             <View>
//               <TouchableOpacity onPress={playSound} style={styles.playButton}><Text>▶️ Play</Text></TouchableOpacity>
//               <TouchableOpacity onPress={stopPlayback} style={styles.playButton}><Text>⏹️ Stop</Text></TouchableOpacity>
//               <TouchableOpacity onPress={uploadAudio} style={styles.uploadButton}><Text>⬆️ Upload</Text></TouchableOpacity>
//             </View>
//           )}

//           {loading && <ActivityIndicator size="large" color="#fff" style={{ margin: 10 }} />}

//           {transcription !== '' && (
//             <View style={styles.transcriptionBox}>
//               <Text style={styles.label}>📄 Transcription:</Text>
//               <Text style={styles.transcription}>{transcription}</Text>
//               <TouchableOpacity onPress={downloadTranscription} style={styles.downloadButton}><Text>⬇️ Download</Text></TouchableOpacity>
//             </View>
//           )}

//           <TouchableOpacity onPress={resetSession} style={styles.closeButton}><Text>🔁 New Session</Text></TouchableOpacity>
//         </ScrollView>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#121212', padding: 20, paddingTop: 50 },
//   title: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
//   exitButton: { position: 'absolute', top: 40, right: 20, zIndex: 10 },
//   modeBox: { alignItems: 'center' },
//   subtitle: { color: '#ccc', marginBottom: 20, textAlign: 'center' },
//   modeButton: { backgroundColor: '#333', padding: 10, marginVertical: 5, borderRadius: 8, alignItems: 'center' },
//   label: { color: '#aaa', marginTop: 10 },
//   input: { backgroundColor: '#222', color: '#fff', borderRadius: 6, padding: 8, marginVertical: 5 },
//   pickerContainer: { backgroundColor: '#222', borderRadius: 6, marginBottom: 10 },
//   picker: { color: '#fff' },
//   filename: { color: '#ccc', marginTop: 5 },
//   actionButton: { backgroundColor: '#444', padding: 10, borderRadius: 10, marginVertical: 5, alignItems: 'center' },
//   playButton: { backgroundColor: '#666', padding: 10, borderRadius: 10, marginTop: 10, alignItems: 'center' },
//   uploadButton: { backgroundColor: '#0a84ff', padding: 10, borderRadius: 10, marginTop: 10, alignItems: 'center' },
//   transcriptionBox: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 8, marginTop: 20 },
//   transcription: { color: '#eee', marginTop: 10 },
//   downloadButton: { backgroundColor: '#555', padding: 10, borderRadius: 8, marginTop: 10, alignItems: 'center' },
//   duration: { color: '#ccc', textAlign: 'center', marginVertical: 10 },
//   closeButton: { backgroundColor: '#8e44ad', padding: 10, borderRadius: 10, marginTop: 20, alignItems: 'center' },
// });

// export default AudioRecorder;




// Updated AudioRecorder.js with improved UI, dark theme, waveform, animated timer, and download option

// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   ActivityIndicator,
//   BackHandler,
//   Alert,
//   Platform,
//   ScrollView
// } from 'react-native';
// import { Audio } from 'expo-av';
// import { Picker } from '@react-native-picker/picker';
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';
// import * as DocumentPicker from 'expo-document-picker';
// import LottieView from 'lottie-react-native';
// import { Svg, Rect } from 'react-native-svg';

// const AudioRecorder = () => {
//   const [mode, setMode] = useState(null);
//   const [recording, setRecording] = useState(null);
//   const [recordedURI, setRecordedURI] = useState(null);
//   const [sound, setSound] = useState(null);
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const [transcription, setTranscription] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [userTag, setUserTag] = useState('');
//   const [language, setLanguage] = useState('en');
//   const [timer, setTimer] = useState(null);
//   const [isPaused, setIsPaused] = useState(false);
//   const recordingRef = useRef(null);

//   useEffect(() => {
//     setMode(null);
//   }, []);

//   const startTimer = () => {
//     const interval = setInterval(() => {
//       setRecordingDuration(prev => prev + 1);
//     }, 1000);
//     setTimer(interval);
//   };

//   const stopTimer = () => {
//     clearInterval(timer);
//     setTimer(null);
//   };

//   const formatTime = (seconds) => {
//     const min = Math.floor(seconds / 60);
//     const sec = seconds % 60;
//     return `${min}:${sec < 10 ? '0' : ''}${sec}`;
//   };

//   const startRecording = async () => {
//     try {
//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== 'granted') return alert('Microphone permission is required.');

//       if (recordingRef.current) {
//         try { await recordingRef.current.stopAndUnloadAsync(); } catch {}
//         recordingRef.current = null;
//       }

//       await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
//       const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
//       setRecording(recording);
//       recordingRef.current = recording;
//       setRecordingDuration(0);
//       startTimer();
//     } catch (err) {
//       alert('Recording error: ' + err.message);
//     }
//   };

//   const pauseRecording = async () => {
//     if (recordingRef.current) {
//       await recordingRef.current.pauseAsync();
//       setIsPaused(true);
//       stopTimer();
//     }
//   };

//   const resumeRecording = async () => {
//     if (recordingRef.current) {
//       await recordingRef.current.startAsync();
//       setIsPaused(false);
//       startTimer();
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       stopTimer();
//       await recordingRef.current.stopAndUnloadAsync();
//       const uri = recordingRef.current.getURI();
//       setRecordedURI(uri);
//       setRecording(null);
//     } catch {}
//   };

//   const pickAudioFile = async () => {
//     const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
//     if (!result.canceled) {
//       setSelectedFile(result.assets?.[0]);
//     }
//   };

//   const playSound = async () => {
//     const uri = recordedURI || selectedFile?.uri;
//     if (!uri) return;
//     const { sound } = await Audio.Sound.createAsync({ uri });
//     setSound(sound);
//     await sound.playAsync();
//   };

//   const stopPlayback = async () => {
//     if (sound) {
//       await sound.stopAsync();
//       await sound.unloadAsync();
//       setSound(null);
//     }
//   };

//   const uploadAudio = async () => {
//     setLoading(true);
//     const fileUri = recordedURI || selectedFile?.uri;
//     if (!fileUri) return;

//     const formData = new FormData();
//     formData.append('file', { uri: fileUri, name: fileUri.split('/').pop(), type: 'audio/m4a' });
//     formData.append('user_id', userTag);
//     formData.append('language', language);

//     try {
//       const response = await fetch('http://127.0.0.1:8000/upload-audio', { method: 'POST', body: formData });
//       const data = await response.json();
//       console.log('Upload response:', data);
//       setTranscription(data.transcription || data.text || 'No transcription returned.');
//     } catch (err) {
//       setTranscription('Upload failed: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetSession = async () => {
//     if (recordingRef.current) {
//       try { await recordingRef.current.stopAndUnloadAsync(); } catch {}
//       recordingRef.current = null;
//     }
//     stopTimer();
//     setRecording(null);
//     setRecordedURI(null);
//     setSelectedFile(null);
//     setTranscription('');
//     setRecordingDuration(0);
//     setMode(null);
//   };

//   const handleExit = () => {
//     Alert.alert('Exit App', 'Are you sure you want to exit?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Yes', onPress: () => BackHandler.exitApp() },
//     ]);
//   };

//   const downloadTranscription = async () => {
//     if (!transcription) return;
//     const fileUri = FileSystem.documentDirectory + 'transcription.txt';
//     await FileSystem.writeAsStringAsync(fileUri, transcription);
//     await Sharing.shareAsync(fileUri);
//   };

//   // const renderWaveform = () => (
//   //   <Svg height="30" width="100%" style={{ marginVertical: 10 }}>
//   //     {[...Array(30)].map((_, i) => (
//   //       <Rect
//   //         key={i}
//   //         x={i * 10}
//   //         y={Math.random() * 15}
//   //         width="5"
//   //         height={15 + Math.random() * 10}
//   //         fill="#fff"
//   //         rx="2"
//   //       />
//   //     ))}
//   //   </Svg>
//   // );

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
//         <Text style={styles.exitText}>✖</Text>
//       </TouchableOpacity>
//       <ScrollView style={{ width: '100%' }} contentContainerStyle={styles.scrollContent}>
//         <Text style={styles.title}>🎧 Participatory Audio Recorder</Text>

//         {!mode ? (
//           <View style={styles.modeBox}>
//             <Text style={styles.subtitle}>Choose how you want to begin:</Text>
//             <TouchableOpacity onPress={() => setMode('record')} style={styles.modeButton}>
//               <Text style={styles.modeText}>🎙️ Record</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => setMode('upload')} style={styles.modeButton}>
//               <Text style={styles.modeText}>📁 Upload</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <View>
//             <Text style={styles.label}>Your Tag</Text>
//             <TextInput
//               style={styles.input}
//               value={userTag}
//               onChangeText={setUserTag}
//               placeholder="e.g. JohnDoe123"
//               placeholderTextColor="#aaa"
//             />

//             <Text style={styles.label}>Select Language</Text>
//             <View style={styles.pickerContainer}>
//               <Picker selectedValue={language} onValueChange={setLanguage} style={styles.picker}>
//                 <Picker.Item label="English" value="en" />
//                 <Picker.Item label="French" value="fr" />
//                 <Picker.Item label="Hausa" value="ha" />
//                 <Picker.Item label="Yoruba" value="yo" />
//                 <Picker.Item label="Igbo" value="ig" />
//               </Picker>
//             </View>

//             {mode === 'record' && (
//               <View style={styles.recordBox}>
//                 <Text style={styles.duration}>⏱️ {formatTime(recordingDuration)}</Text>
//                 <LottieView source={require('../assets/record.json')} autoPlay loop style={{ height: 80 }} />
//                 {renderWaveform()}
//                 {recording ? (
//                   isPaused ? (
//                     <TouchableOpacity onPress={resumeRecording} style={styles.button}><Text>▶ Resume</Text></TouchableOpacity>
//                   ) : (
//                     <TouchableOpacity onPress={pauseRecording} style={styles.button}><Text>⏸ Pause</Text></TouchableOpacity>
//                   )
//                 ) : (
//                   <TouchableOpacity onPress={startRecording} style={styles.button}><Text>🎙 Start Recording</Text></TouchableOpacity>
//                 )}
//                 {recording && <TouchableOpacity onPress={stopRecording} style={styles.button}><Text>⏹ Stop</Text></TouchableOpacity>}
//               </View>
//             )}

//             {mode === 'upload' && (
//               <View style={styles.recordBox}>
//                 <TouchableOpacity onPress={pickAudioFile} style={styles.button}><Text>📁 Choose File</Text></TouchableOpacity>
//                 {selectedFile && <Text style={{ color: '#ccc' }}>Selected File: {selectedFile.name}</Text>}
//               </View>
//             )}

//             {(recordedURI || selectedFile) && (
//               <>
//                 {renderWaveform()}
//                 <TouchableOpacity onPress={playSound} style={styles.button}><Text>▶ Play</Text></TouchableOpacity>
//                 <TouchableOpacity onPress={stopPlayback} style={styles.button}><Text>⏹ Stop</Text></TouchableOpacity>
//                 <TouchableOpacity onPress={uploadAudio} style={styles.uploadButton}><Text>⬆ Upload</Text></TouchableOpacity>
//               </>
//             )}

//             {loading && <ActivityIndicator color="#fff" style={{ marginVertical: 20 }} />}

//             {transcription ? (
//               <View style={styles.transcriptionBox}>
//                 <Text style={styles.label}>📄 Transcription</Text>
//                 <Text style={styles.transcription}>{transcription}</Text>
//                 <TouchableOpacity onPress={downloadTranscription} style={styles.button}><Text>⬇ Download</Text></TouchableOpacity>
//               </View>
//             ) : null}

//             <TouchableOpacity onPress={resetSession} style={styles.resetButton}>
//               <Text>🔁 New Session</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#121212', padding: 20, position: 'relative' },
//   scrollContent: { paddingBottom: 40 },
//   exitButton: { position: 'absolute', top: 40, right: 20, zIndex: 10 },
//   exitText: { color: '#fff', fontSize: 24 },
//   title: { fontSize: 22, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginTop: 80, marginBottom: 20 },
//   subtitle: { color: '#ccc', fontSize: 16, textAlign: 'center', marginBottom: 20 },
//   modeBox: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
//   modeButton: { backgroundColor: '#444', padding: 15, borderRadius: 10, marginVertical: 10, width: '100%', alignItems: 'center' },
//   modeText: { color: '#fff', fontSize: 16 },
//   label: { color: '#fff', marginTop: 20, marginBottom: 5 },
//   input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 10, borderRadius: 6, width: '100%' },
//   pickerContainer: { backgroundColor: '#1e1e1e', borderRadius: 6, marginTop: 10 },
//   picker: { color: '#fff' },
//   recordBox: { alignItems: 'center', marginTop: 20 },
//   duration: { color: '#fff', fontSize: 18, marginVertical: 10 },
//   button: { backgroundColor: '#555', padding: 14, borderRadius: 8, marginVertical: 6, width: '100%', alignItems: 'center' },
//   uploadButton: { backgroundColor: '#007bff', padding: 14, borderRadius: 8, marginTop: 10, alignItems: 'center' },
//   transcriptionBox: { backgroundColor: '#1e1e1e', borderRadius: 8, padding: 15, marginTop: 20 },
//   transcription: { color: '#ccc', marginTop: 10 },
//   resetButton: { backgroundColor: '#8e44ad', padding: 14, borderRadius: 8, marginTop: 20, alignItems: 'center' },
// });

// export default AudioRecorder;




// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   ActivityIndicator,
//   BackHandler,
//   Alert,
//   Platform,
//   ScrollView,
// } from 'react-native';
// import { Audio } from 'expo-av';
// import { Picker } from '@react-native-picker/picker';
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';
// import * as DocumentPicker from 'expo-document-picker';
// import LottieView from 'lottie-react-native';

// const AudioRecorder = () => {
//   const [mode, setMode] = useState(null);
//   const [recording, setRecording] = useState(null);
//   const [recordedURI, setRecordedURI] = useState(null);
//   const [sound, setSound] = useState(null);
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const [transcription, setTranscription] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [userTag, setUserTag] = useState('');
//   const [language, setLanguage] = useState('en');
//   const [timer, setTimer] = useState(null);
//   const [isPaused, setIsPaused] = useState(false);
//   const recordingRef = useRef(null);

//   useEffect(() => {
//     setMode(null);
//   }, []);

//   const startTimer = () => {
//     const interval = setInterval(() => {
//       setRecordingDuration((prev) => prev + 1);
//     }, 1000);
//     setTimer(interval);
//   };

//   const stopTimer = () => {
//     clearInterval(timer);
//     setTimer(null);
//   };

//   const formatTime = (seconds) => {
//     const min = Math.floor(seconds / 60);
//     const sec = seconds % 60;
//     return `${min}:${sec < 10 ? '0' : ''}${sec}`;
//   };

//   const startRecording = async () => {
//     try {
//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== 'granted') return alert('Microphone permission is required.');

//       if (recordingRef.current) {
//         try {
//           await recordingRef.current.stopAndUnloadAsync();
//         } catch {}
//         recordingRef.current = null;
//       }

//       await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
//       const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
//       setRecording(recording);
//       recordingRef.current = recording;
//       setRecordingDuration(0);
//       startTimer();
//     } catch (err) {
//       alert('Recording error: ' + err.message);
//     }
//   };

//   const pauseRecording = async () => {
//     if (recordingRef.current) {
//       await recordingRef.current.pauseAsync();
//       setIsPaused(true);
//       stopTimer();
//     }
//   };

//   const resumeRecording = async () => {
//     if (recordingRef.current) {
//       await recordingRef.current.startAsync();
//       setIsPaused(false);
//       startTimer();
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       stopTimer();
//       await recordingRef.current.stopAndUnloadAsync();
//       const uri = recordingRef.current.getURI();
//       setRecordedURI(uri);
//       setRecording(null);
//     } catch {}
//   };

//   const pickAudioFile = async () => {
//     const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
//     if (!result.canceled && result.assets && result.assets.length > 0) {
//       setSelectedFile(result.assets[0]);
//     }
//   };

//   const playSound = async () => {
//     const uri = recordedURI || selectedFile?.uri;
//     if (!uri) return;
//     const { sound } = await Audio.Sound.createAsync({ uri });
//     setSound(sound);
//     await sound.playAsync();
//   };

//   const stopPlayback = async () => {
//     if (sound) {
//       await sound.stopAsync();
//       await sound.unloadAsync();
//       setSound(null);
//     }
//   };

//   const uploadAudio = async () => {
//     setLoading(true);
//     const fileUri = recordedURI || selectedFile?.uri;
//     if (!fileUri) return;

//     const formData = new FormData();
//     formData.append('file', {
//       uri: fileUri,
//       name: fileUri.split('/').pop(),
//       type: 'audio/m4a',
//     });
//     formData.append('user_id', userTag);
//     formData.append('language', language);

//     try {
//       const response = await fetch('http://127.0.0.1:8000/upload-audio', {
//         method: 'POST',
//         body: formData,
//       });
//       const data = await response.json();
//       setTranscription(data.transcription || data.text || '');
//     } catch (err) {
//       setTranscription('Upload failed: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetSession = async () => {
//     if (recordingRef.current) {
//       try {
//         await recordingRef.current.stopAndUnloadAsync();
//       } catch {}
//       recordingRef.current = null;
//     }
//     stopTimer();
//     setRecording(null);
//     setRecordedURI(null);
//     setSelectedFile(null);
//     setTranscription('');
//     setRecordingDuration(0);
//     setMode(null);
//   };

//   const handleExit = () => {
//     Alert.alert('Exit App', 'Are you sure you want to exit?', [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Yes', onPress: () => BackHandler.exitApp() },
//     ]);
//   };

//   const downloadTranscription = async () => {
//     if (!transcription) return;
//     const fileUri = FileSystem.documentDirectory + 'transcription.txt';
//     await FileSystem.writeAsStringAsync(fileUri, transcription);
//     await Sharing.shareAsync(fileUri);
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
//         <Text style={styles.exitText}>✖</Text>
//       </TouchableOpacity>

//       <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
//         <Text style={styles.title}>🎧 Participatory Audio Recorder</Text>

//         {!mode ? (
//           <View style={styles.modeBox}>
//             <Text style={styles.subtitle}>Choose how you want to begin:</Text>
//             <TouchableOpacity onPress={() => setMode('record')} style={styles.modeButton}>
//               <Text style={styles.modeText}>🎙️ Record</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => setMode('upload')} style={styles.modeButton}>
//               <Text style={styles.modeText}>📁 Upload</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <View>
//             <Text style={styles.label}>Your Tag</Text>
//             <TextInput
//               style={styles.input}
//               value={userTag}
//               onChangeText={setUserTag}
//               placeholder="e.g. JohnDoe123"
//               placeholderTextColor="#aaa"
//             />

//             <Text style={styles.label}>Select Language</Text>
//             <View style={styles.pickerContainer}>
//               <Picker
//                 selectedValue={language}
//                 onValueChange={(itemValue) => setLanguage(itemValue)}
//                 style={styles.picker}
//               >
//                 <Picker.Item label="English" value="en" />
//                 <Picker.Item label="French" value="fr" />
//                 <Picker.Item label="Hausa" value="ha" />
//                 <Picker.Item label="Yoruba" value="yo" />
//                 <Picker.Item label="Igbo" value="ig" />
//               </Picker>
//             </View>

//             {mode === 'record' && (
//               <View style={styles.recordBox}>
//                 <Text style={styles.duration}>⏱️ {formatTime(recordingDuration)}</Text>
//                 <LottieView source={require('../assets/record.json')} autoPlay loop style={{ height: 80 }} />
//                 {recording ? (
//                   <>
//                     {isPaused ? (
//                       <TouchableOpacity onPress={resumeRecording} style={styles.button}><Text>▶ Resume</Text></TouchableOpacity>
//                     ) : (
//                       <TouchableOpacity onPress={pauseRecording} style={styles.button}><Text>⏸ Pause</Text></TouchableOpacity>
//                     )}
//                     <TouchableOpacity onPress={stopRecording} style={styles.button}><Text>⏹ Stop</Text></TouchableOpacity>
//                   </>
//                 ) : (
//                   <TouchableOpacity onPress={startRecording} style={styles.button}><Text>🎙 Start Recording</Text></TouchableOpacity>
//                 )}
//               </View>
//             )}

//             {mode === 'upload' && (
//               <View style={styles.recordBox}>
//                 <TouchableOpacity onPress={pickAudioFile} style={styles.button}>
//                   <Text>📁 Pick Audio File</Text>
//                 </TouchableOpacity>
//                 {selectedFile && (
//                   <Text style={styles.duration}>Selected: {selectedFile.name}</Text>
//                 )}
//               </View>
//             )}

//             {(recordedURI || selectedFile) && (
//               <>
//                 <TouchableOpacity onPress={playSound} style={styles.button}><Text>▶ Play</Text></TouchableOpacity>
//                 <TouchableOpacity onPress={stopPlayback} style={styles.button}><Text>⏹ Stop</Text></TouchableOpacity>
//                 <TouchableOpacity onPress={uploadAudio} style={styles.uploadButton}><Text>⬆ Upload</Text></TouchableOpacity>
//               </>
//             )}

//             {loading && <ActivityIndicator color="#fff" style={{ marginVertical: 20 }} />}

//             {transcription ? (
//               <View style={styles.transcriptionBox}>
//                 <Text style={styles.label}>📄 Transcription</Text>
//                 <Text style={styles.transcription}>{transcription}</Text>
//                 <TouchableOpacity onPress={downloadTranscription} style={styles.button}><Text>⬇ Download</Text></TouchableOpacity>
//               </View>
//             ) : null}

//             <TouchableOpacity onPress={resetSession} style={styles.resetButton}>
//               <Text>🔁 New Session</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#121212', padding: 20, position: 'relative' },
//   exitButton: { position: 'absolute', top: 40, right: 20, zIndex: 10 },
//   exitText: { color: '#fff', fontSize: 24 },
//   title: { fontSize: 22, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
//   subtitle: { color: '#ccc', fontSize: 16, textAlign: 'center', marginBottom: 20 },
//   modeBox: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
//   modeButton: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 10, marginVertical: 10, width: '100%', alignItems: 'center' },
//   modeText: { color: '#fff', fontSize: 16 },
//   label: { color: '#fff', marginTop: 20, marginBottom: 5 },
//   input: { backgroundColor: '#1e1e1e', color: '#fff', padding: 10, borderRadius: 6, width: '100%' },
//   pickerContainer: { backgroundColor: '#1e1e1e', borderRadius: 6, marginTop: 10 },
//   picker: { color: '#fff' },
//   recordBox: { alignItems: 'center', marginTop: 20 },
//   duration: { color: '#fff', fontSize: 16, marginTop: 10 },
//   button: { backgroundColor: '#333', padding: 12, borderRadius: 8, marginVertical: 5, alignItems: 'center', width: '100%' },
//   uploadButton: { backgroundColor: '#007bff', padding: 12, borderRadius: 8, marginTop: 10, alignItems: 'center', width: '100%' },
//   transcriptionBox: { backgroundColor: '#1e1e1e', borderRadius: 8, padding: 15, marginTop: 20 },
//   transcription: { color: '#ccc', marginTop: 10 },
//   resetButton: { backgroundColor: '#8e44ad', padding: 12, borderRadius: 8, marginTop: 20, alignItems: 'center', width: '100%' },
// });



// export default AudioRecorder;



// Clean AudioRecorder.js with improved UI, dark theme, waveform, animated timer, and download option

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
  Platform
} from 'react-native';
import { Audio } from 'expo-av';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import LottieView from 'lottie-react-native';


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

  useEffect(() => {
    setMode(null);
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
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return alert('Microphone permission is required.');

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      recordingRef.current = recording;
      setRecordingDuration(0);
      startTimer();
    } catch (err) {
      alert('Recording error: ' + err.message);
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



  // const uploadAudio = async () => {
  //   setLoading(true);
  //   const fileUri = recordedURI || selectedFile?.uri;
  //   if (!fileUri) return;

  //   const formData = new FormData();
  //   formData.append('file', { uri: fileUri, name: fileUri.split('/').pop(), type: 'audio/m4a' });
  //   formData.append('user_id', userTag);
  //   formData.append('language', language);

  //   try {
  //     const response = await fetch('http://127.0.0.1:8000/upload-audio', { method: 'POST', body: formData });
  //     const data = await response.json();
  //     setTranscription(data.transcription || data.text || '');
  //   } catch (err) {
  //     setTranscription('Upload failed: ' + err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };



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
                   fileName.endsWith('.wav') ? 'audio/wav' :
                   'audio/webm'; // fallback

  console.log("Uploading file:", fileName, "of type", fileType);

  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    name: fileName,
    type: fileType,
  });
  formData.append("user_id", userTag || "Anonymous");
  formData.append("language", language || "en");

  //192.168.15.249
  //192.168.42.183
  try {
    const response = await fetch("http://192.168.42.183:8000/upload-audio", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    const result = await response.json();
    console.log("Upload result:", result);

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    if (result.transcript_id || result.transcription || result.text) {
      alert("Upload successful. Transcript ID: " + (result.transcript_id || 'N/A'));
      setTranscription(result.transcription || result.text || '');
    } else {
      alert("Upload succeeded, but no transcript ID returned.");
    }
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Upload failed: " + err.message);
  }
  finally {
      setLoading(false);
    }
};


// const uploadAudio = async () => {
//   const fileUri = recordedURI || selectedFile?.uri;
//   if (!fileUri) {
//     alert("No audio file selected or recorded.");
//     return;
//   }

//   const filename = fileUri.split("/").pop();
//   const fileType = filename.endsWith(".m4a") ? "audio/m4a" : "audio/webm"; // adjust as needed

//   console.log("Uploading file:", filename, "of type", fileType);

//   const formData = new FormData();
//   formData.append("file", {
//     uri: fileUri,
//     name: filename,
//     type: fileType,
//   });
//   formData.append("user_id", userTag || "Oludare");
//   formData.append("language", language || "en");

//   try {
//     setLoading(true);
//     const response = await fetch("http://192.168.42.183:8000/upload-audio", {
//       method: "POST",
//       body: formData,
//       headers: {
//         Accept: "application/json",
//       },
//     });

//     const result = await response.json();
//     console.log("Upload result:", result);

//     if (!response.ok) {
//       throw new Error(`Server responded with status ${response.status}`);
//     }

//     if (result.transcription) {
//       setTranscription(result.transcription);
//       alert("Upload succeeded!");
//     } else {
//       alert("Upload succeeded, but no transcription returned.");
//     }
//   } catch (err) {
//     console.error("Upload failed:", err);
//     alert("Upload failed: " + err.message);
//   } finally {
//     setLoading(false);
//   }
// };

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
        
        <Text style={styles.title}> INCIO Participatory Application</Text>


        

        {!mode ? (
          <View style={styles.modeBox}>
            <Text style={styles.subtitle}>Choose how you want to begin:</Text>
            <TouchableOpacity onPress={() => setMode('record')} style={styles.modeButton}>
              <Text style={styles.buttonText}>🎙️ Record</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMode('upload'); pickFile(); }} style={styles.modeButton}>
              <Text style={styles.buttonText}>📁 Upload</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.label}>Your Tag</Text>
            <TextInput style={styles.input} value={userTag} onChangeText={setUserTag} placeholder="e.g. JohnDoe123" placeholderTextColor="#aaa" />

            <Text style={styles.label}>Select Language</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={language} onValueChange={(itemValue) => setLanguage(itemValue)} style={styles.picker}>
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
                {recording ? (
                  <>
                    {isPaused ? (
                      <TouchableOpacity onPress={resumeRecording} style={styles.button}><Text style={styles.buttonText}>▶ Resume</Text></TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={pauseRecording} style={styles.button}><Text style={styles.buttonText}>⏸ Pause</Text></TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={stopRecording} style={styles.button}><Text style={styles.buttonText}>⏹ Stop</Text></TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity onPress={startRecording} style={styles.button}><Text style={styles.buttonText}>🎙 Start Recording</Text></TouchableOpacity>
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
  fileName: { color: '#bbb', fontSize: 14, marginBottom: 10 }
});

export default AudioRecorder;

