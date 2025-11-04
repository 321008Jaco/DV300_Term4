// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Chip, Card, TextInput, IconButton, Avatar, Button, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  red: '#EF4444',
  redLight: '#FEE2E2',
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

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const [message, setMessage] = useState('');
  const [reply, setReply] = useState<TriageAnswer | null>(null);
  const [sending, setSending] = useState(false);
  const [welcomeName, setWelcomeName] = useState('there');

  // voice
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  useEffect(() => {
    getWelcomeName().then(setWelcomeName).catch(() => setWelcomeName('there'));
  }, []);

  async function sendPrompt(prompt: string) {
    if (!prompt.trim()) return;
    setSending(true);
    try {
      const res = await triageText(prompt.trim());
      setReply(res);
      await saveHistory({
        prompt: prompt.trim(),
        condition: res.condition,
        level: res.level,
        dangerous: !!res.dangerous,
        advice: Array.isArray(res.advice) ? res.advice : [String(res.advice ?? '')],
      });
    } catch (e: any) {
      setReply({
        condition: 'Error',
        level: 'moderate',
        dangerous: false,
        advice: [e?.message ?? 'Network error. Check connection and try again.'],
      });
    } finally {
      setSending(false);
    }
  }

  const onSend = async () => {
    if (sending || recording || transcribing) return;
    const prompt = message.trim();
    setMessage('');
    await sendPrompt(prompt);
  };

  const onMicPress = async () => {
    if (!recording) {
      try {
        await startRecording();
        setRecording(true);
      } catch (e: any) {
        console.log('voice error', e?.message || e);
      }
    } else {
      try {
        setTranscribing(true);
        const text = await stopAndTranscribe();
        await sendPrompt(text);
      } catch (e: any) {
        console.log('voice error', e?.message || e);
      } finally {
        setRecording(false);
        setTranscribing(false);
      }
    }
  };

  const onCancelPress = async () => {
    try { await stopAndTranscribe(); } catch {}
    setRecording(false);
    setTranscribing(false);
  };

  const isBusy = sending || transcribing;
  const showListeningUI = recording || transcribing;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
      <LinearGradient
        colors={['#ffffff', '#f5f3ff']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGrad}
      />
      <View style={styles.headerGlow} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 140 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Welcome, {welcomeName}!</Text>
        <Text style={styles.subtitle}>How can we help you today?</Text>

        {reply ? <AiReply data={reply} /> : null}
      </ScrollView>

      <View
        style={[
          styles.inputBar,
          {
            bottom: 16 + insets.bottom,
          },
          showListeningUI && { backgroundColor: COLORS.redLight, borderColor: COLORS.red, borderWidth: 1 },
        ]}
      >
        <View style={{ flex: 1 }}>
          {showListeningUI ? (
            <View style={styles.listeningRow}>
              <View style={styles.dot} />
              <Text style={styles.listeningText}>
                {transcribing ? 'Transcribing…' : 'Listening…'}
              </Text>
              {transcribing ? <ActivityIndicator style={{ marginLeft: 8 }} color={COLORS.red} /> : null}
            </View>
          ) : (
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your symptoms…"
              mode="flat"
              style={styles.input}
              underlineStyle={{ display: 'none' }}
              placeholderTextColor={COLORS.grayPlaceholder}
              textColor={COLORS.purple}
              selectionColor={COLORS.purple}
              theme={inputTheme}
              onSubmitEditing={onSend}
              returnKeyType="send"
              editable={!isBusy}
            />
          )}
        </View>

        {recording && !transcribing ? (
          <IconButton
            icon="close"
            size={22}
            onPress={onCancelPress}
            style={styles.icon}
            containerColor="transparent"
            iconColor={COLORS.red}
          />
        ) : null}

        <IconButton
          icon={recording ? 'stop' : 'microphone'}
          size={22}
          onPress={onMicPress}
          disabled={isBusy}
          style={[styles.icon, recording && { backgroundColor: COLORS.red }]}
          containerColor={recording ? COLORS.red : 'transparent'}
          iconColor={recording ? COLORS.white : COLORS.purple}
        />

        <IconButton
          icon={isBusy ? 'loading' : 'send'}
          size={22}
          onPress={onSend}
          disabled={isBusy || recording || !message.trim()}
          style={styles.sendBtn}
          containerColor={COLORS.purple}
          iconColor={COLORS.white}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 48, paddingHorizontal: 20 },
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
  backgroundColor: COLORS.grayField,
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
  icon: { margin: 0, borderRadius: 24 },
  sendBtn: { margin: 0, borderRadius: 24 },

  listeningRow: {
    height: 48,
    borderRadius: 20,
    backgroundColor: COLORS.redLight,
    borderColor: COLORS.red,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    alignItems: 'center',
    flexDirection: 'row',
  },
  listeningText: { color: COLORS.red, fontWeight: '600' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.red, marginRight: 10 },
});
