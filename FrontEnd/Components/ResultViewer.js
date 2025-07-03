import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Picker, ScrollView } from 'react-native';

const ResultViewer = () => {
  const [transcripts, setTranscripts] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch list of transcripts
  useEffect(() => {
    fetch('http://YOUR_SERVER_URL_HERE/transcripts') // Replace with actual endpoint
      .then(res => res.json())
      .then(data => setTranscripts(data))
      .catch(err => console.error('Failed to fetch transcript list:', err));
  }, []);

  // Fetch result when a transcript is selected
  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    fetch(`http://YOUR_SERVER_URL_HERE/results/${selectedId}`)
      .then(res => res.json())
      .then(data => setResult(data))
      .catch(err => console.error('Failed to fetch result:', err))
      .finally(() => setLoading(false));
  }, [selectedId]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Result Viewer</Text>

      <Text style={styles.label}>Select Transcript</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedId}
          onValueChange={(itemValue) => setSelectedId(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="-- Choose a transcript --" value="" />
          {transcripts.map(t => (
            <Picker.Item
              key={t.transcript_id}
              label={`${t.user_id} (${t.transcript_id})`}
              value={t.transcript_id}
            />
          ))}
        </Picker>
      </View>

      {loading && <ActivityIndicator color="#fff" style={{ marginVertical: 20 }} />}

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Transcription</Text>
          <Text style={styles.resultText}>{result.transcription}</Text>

          <Text style={styles.resultTitle}>Sentiment</Text>
          <Text style={styles.resultText}>{result.sentiment}</Text>

          <Text style={styles.resultTitle}>Keywords</Text>
          <Text style={styles.resultText}>{(result.keywords || []).join(', ')}</Text>

          <Text style={styles.resultTitle}>Summary</Text>
          <Text style={styles.resultText}>{result.summary}</Text>

          <Text style={styles.resultTitle}>Topics</Text>
          <Text style={styles.resultText}>{(result.topics || []).join(', ')}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  label: { color: '#ccc', marginBottom: 10 },
  pickerWrapper: { backgroundColor: '#1e1e1e', borderRadius: 6, marginBottom: 20 },
  picker: { color: '#fff' },
  resultBox: { backgroundColor: '#1e1e1e', borderRadius: 8, padding: 15 },
  resultTitle: { color: '#fff', fontWeight: 'bold', marginTop: 10 },
  resultText: { color: '#ccc', marginTop: 5 }
});

export default ResultViewer;
