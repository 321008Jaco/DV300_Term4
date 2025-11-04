import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Chip, Card, TextInput, IconButton, Avatar, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AiReply from '../Component/AiReply';
import { triageText, TriageAnswer } from '../services/triageService';
import { saveHistory } from '../services/historyService';
import { getWelcomeName } from '../services/userService';
import { startRecording, stopAndTranscribe } from '../services/voiceService';

const COLORS = {
  bg: '#FAFAFA',
  text: '#0B0B12',
  grayField: '#E5E5E5',
  grayPlaceholder: '#6B6B6B',
  purple: '#8B5CF6',
  purpleDark: '#7C3AED',
  indigo: '#4F46E5',
  white: '#FFFFFF',
};

const inputTheme = {
  colors: {
    primary: COLORS.purple,
    onSurface: COLORS.purple,
    surface: COLORS.grayField,
    background: COLORS.grayField,
    outline: 'transparent',
  },
} as const;

export default function HomeScreen() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState<TriageAnswer | null>(null);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [welcomeName, setWelcomeName] = useState('there');

  useEffect(() => {
    getWelcomeName().then(setWelcomeName).catch(() => setWelcomeName('there'));
  }, []);

  const onSend = async () => {
    if (!message.trim() || sending || recording) return;
    setSending(true);
    try {
      const prompt = message.trim();

      const res = await triageText(prompt);
      setReply(res);
      setMessage('');

      await saveHistory({
        prompt,
        condition: res.condition,
        level: res.level,
        dangerous: !!res.dangerous,
        advice: Array.isArray(res.advice) ? res.advice : [String(res.advice ?? '')],
      });
    } catch (e: any) {
      console.log('[onSend] error:', e);
      setReply({
        condition: 'Error',
        level: 'moderate',
        dangerous: false,
        advice: [e?.message ?? 'Network error. Check connection and try again.'],
      });
    } finally {
      setSending(false);
    }
  };

  async function onMicPress() {
    try {
      if (!recording) {
        await startRecording();
        setRecording(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        const text = await stopAndTranscribe();
        setRecording(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setMessage(prev => (prev ? `${prev} ${text}` : text));
      }
    } catch (e: any) {
      setRecording(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.log('voice error', e?.message || e);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <LinearGradient
        colors={['#ffffff', '#f5f3ff']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGrad}
      />
      <View style={styles.headerGlow} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Welcome, {welcomeName}!</Text>
        <Text style={styles.subtitle}>How can we help you today?</Text>

        <View style={styles.pills}>
          {['Symptom Check', 'Bookmarked Symptoms', 'Emergency Info'].map((label, i) => (
            <Chip key={i} mode="outlined" style={styles.pill} textStyle={styles.pillText}>
              {label}
            </Chip>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular topics</Text>
          <Button compact onPress={() => {}} textColor={COLORS.purple}>
            See all
          </Button>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
          <Card style={styles.card} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <Avatar.Icon size={30} icon="medical-bag" style={styles.cardIcon} color={COLORS.white} />
              <Text style={styles.cardTitle}>Symptom Check</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <Avatar.Icon size={30} icon="bookmark" style={styles.cardIcon} color={COLORS.white} />
              <Text style={styles.cardTitle}>Bookmarked</Text>
            </Card.Content>
          </Card>

          <Card style={styles.card} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <Avatar.Icon size={30} icon="alert" style={styles.cardIcon} color={COLORS.white} />
              <Text style={styles.cardTitle}>Emergency Info</Text>
            </Card.Content>
          </Card>
        </ScrollView>

        {reply ? <AiReply data={reply} /> : null}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder={recording ? 'Listening… tap stop to finish' : 'Type your symptoms...'}
          mode="flat"
          style={styles.input}
          underlineStyle={{ display: 'none' }}
          placeholderTextColor={COLORS.grayPlaceholder}
          textColor={COLORS.purple}
          selectionColor={COLORS.purple}
          theme={inputTheme}
          onSubmitEditing={onSend}
          returnKeyType="send"
          editable={!recording}
        />
        <IconButton
          icon={recording ? 'stop' : 'microphone'}
          size={22}
          onPress={onMicPress}
          style={styles.icon}
          containerColor="transparent"
          iconColor={recording ? '#ef4444' : COLORS.purple}
        />
        <IconButton
          icon={sending ? 'loading' : 'send'}
          size={22}
          onPress={onSend}
          disabled={sending || recording}
          style={styles.sendBtn}
          containerColor={COLORS.purple}
          iconColor={COLORS.white}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 48, paddingHorizontal: 20, paddingBottom: 140 },
  headerGrad: { position: 'absolute', left: -60, right: -60, top: -120, height: 260, borderRadius: 260 },
  headerGlow: {
    position: 'absolute',
    top: -90,
    left: -30,
    width: 200,
    height: 200,
    borderRadius: 120,
    backgroundColor: COLORS.purple,
    opacity: 0.15,
    shadowColor: COLORS.purple,
    shadowOpacity: 0.7,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  greeting: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 16, color: '#5b5b73', marginTop: 6 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 18 },
  pill: { borderColor: COLORS.purple, borderWidth: 1, backgroundColor: COLORS.white, borderRadius: 18, marginRight: 8, marginBottom: 8 },
  pillText: { color: COLORS.purple, fontSize: 12, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26 },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  cardsRow: { paddingRight: 10, paddingTop: 10 },
  card: {
    width: 210,
    marginRight: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 6,
    shadowColor: COLORS.purple,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: { backgroundColor: COLORS.purple },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  inputBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 28,
    paddingLeft: 14,
    paddingRight: 6,
    elevation: 12,
    shadowColor: COLORS.indigo,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  input: { flex: 1, backgroundColor: COLORS.grayField, borderRadius: 20 },
  icon: { margin: 0 },
  sendBtn: { margin: 0, borderRadius: 24 },
});
