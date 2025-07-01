import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Picker, ActivityIndicator, ScrollView
} from 'react-native';

const ResultViewer = () => {
  const [loading, setLoading] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchTranscripts();
  }, []);

  const fetchTranscripts = async () => {
    try {
      const res = await fetch('http://YOUR_SERVER_IP:8000/transcripts');
      const data = await res.json();
      const options = data.map(item => ({
        id: item.transcript_id,
        tag: item.user_id,
        label: `${item.user_id} (${item.transcript_id})`
      }));
      setTranscripts(options);
    } catch (err) {
      console.error('Error fetching transcripts:', err);
    }
  };

  const fetchResult = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://YOUR_SERVER_IP:8000/transcripts/${id}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Error fetching result:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (value) => {
    setSelectedId(value);
    if (value) fetchResult(value);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 View Transcription Results</Text>
      <Text style={styles.label}>Select Transcript</Text>
      <View style={styles.dropdown}>
        <Picker
          selectedValue={selectedId}
          onValueChange={handleSelect}
          style={styles.picker}
        >
          <Picker.Item label="Choose a transcript..." value={null} />
          {transcripts.map(item => (
            <Picker.Item key={item.id} label={item.label} value={item.id} />
          ))}
        </Picker>
      </View>

      {loading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 30 }} />}

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.section}>📝 Transcription:</Text>
          <Text style={styles.value}>{result.transcription}</Text>

          <Text style={styles.section}>😊 Sentiment:</Text>
          <Text style={styles.value}>{result.sentiment}</Text>

          <Text style={styles.section}>🔑 Keywords:</Text>
          <Text style={styles.value}>{result.keywords?.join(', ')}</Text>

          <Text style={styles.section}>📚 Summary:</Text>
          <Text style={styles.value}>{result.summary}</Text>

          <Text style={styles.section}>🏷 Topics:</Text>
          <Text style={styles.value}>{result.topics?.join(', ')}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#121212', padding: 20 },
  title: { fontSize: 22, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  label: { color: '#ccc', marginBottom: 10 },
  dropdown: { backgroundColor: '#1e1e1e', borderRadius: 8, marginBottom: 20 },
  picker: { color: '#fff' },
  resultBox: { marginTop: 20 },
  section: { fontWeight: 'bold', color: '#fff', marginTop: 15 },
  value: { color: '#ccc', marginTop: 5 }
});

export default ResultViewer;
