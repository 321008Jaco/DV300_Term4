import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Chip, Card, TextInput, IconButton, Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import AiReply from '../Component/AiReply';
import { triageText, TriageAnswer } from '../services/triageService';

export default function HomeScreen({ navigation }: any) {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState<TriageAnswer | null>(null);
  const [sending, setSending] = useState(false);

  const onSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    const res = await triageText(message.trim());
    setReply(res);
    setMessage('');
    setSending(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B12' }}>
      <LinearGradient colors={['#140A2A', '#101322', '#0B0B12']} start={{ x: 0.2, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.headerGlow} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Welcome, Jaco!</Text>
        <Text style={styles.subtitle}>How can we help you today?</Text>

        <View style={styles.pills}>
          {['Symptom Check', 'Bookmarked Symptoms', 'Emergency Info'].map((label, i) => (
            <Chip key={i} mode="flat" style={styles.pill} textStyle={styles.pillText}>{label}</Chip>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular topics</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Avatar.Icon size={28} icon="medical-bag" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Symptom Check</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Avatar.Icon size={28} icon="bookmark" style={styles.cardIcon} />
              <Text style={styles.cardTitle}>Bookmarked</Text>
            </Card.Content>
          </Card>
        </ScrollView>

        {reply ? <AiReply data={reply} /> : null}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type your symptoms..."
          mode="flat"
          style={styles.input}
          placeholderTextColor="#9EA7FF"
          underlineStyle={{ display: 'none' }}
          theme={{ colors: { onSurface: '#FFFFFF', surface: '#0F1224', background: '#0F1224', primary: '#7C3AED' } }}
          onSubmitEditing={onSend}
          returnKeyType="send"
        />
        <IconButton icon="microphone" size={22} onPress={() => navigation.navigate('Listening')} style={styles.icon} />
        <IconButton icon={sending ? 'loading' : 'send'} size={24} onPress={onSend} style={styles.send} disabled={sending} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 48, paddingHorizontal: 20, paddingBottom: 140 },
  headerGlow: {
    position: 'absolute',
    top: -120, left: -60, right: -60, height: 260, borderRadius: 260,
    backgroundColor: '#7C3AED',
    opacity: 0.25,
    shadowColor: '#7C3AED',
    shadowOpacity: 1,
    shadowRadius: 90,
    shadowOffset: { width: 0, height: 0 },
  },
  greeting: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', textShadowColor: '#9EA7FF', textShadowRadius: 16, textShadowOffset: { width: 0, height: 0 } },
  subtitle: { fontSize: 16, color: '#C9CCFF', marginTop: 6 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 18 },
  pill: { backgroundColor: '#121431', borderWidth: 1, borderColor: '#4F46E5', borderRadius: 18, marginRight: 8, marginBottom: 8, shadowColor: '#4F46E5', shadowOpacity: 0.9, shadowRadius: 14, shadowOffset: { width: 0, height: 0 } },
  pillText: { color: '#DEE0FF', fontSize: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 },
  sectionTitle: { color: '#E8EAFF', fontSize: 16, fontWeight: '700' },
  seeAll: { color: '#9EA7FF', fontSize: 12 },
  cardsRow: { paddingRight: 10 },
  card: { width: 210, marginRight: 12, backgroundColor: '#0F1224', borderRadius: 16, shadowColor: '#7C3AED', shadowOpacity: 0.8, shadowRadius: 24, shadowOffset: { width: 0, height: 0 } },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: { backgroundColor: '#2A1E63' },
  cardTitle: { color: '#E8EAFF', fontSize: 14 },
  inputBar: { position: 'absolute', left: 16, right: 16, bottom: 24, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F1224', borderRadius: 28, paddingLeft: 14, paddingRight: 6, shadowColor: '#4F46E5', shadowOpacity: 0.9, shadowRadius: 24, shadowOffset: { width: 0, height: 0 } },
  input: { flex: 1, color: '#FFFFFF', backgroundColor: 'transparent' },
  icon: { margin: 0 },
  send: { margin: 0, backgroundColor: '#7C3AED', borderRadius: 24 },
});
