import React, { useState, useCallback } from 'react';
import {View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';
import {Text, TextInput, IconButton, ActivityIndicator} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import AiReply from '../Component/AiReply';
import { triageText, TriageAnswer } from '../services/triageService';
import { saveHistory } from '../services/historyService';
import { getWelcomeName } from '../services/userService';
import { startRecording, stopAndTranscribe } from '../services/voiceService';
import { getAuth } from 'firebase/auth';
import { getOnboardingSeen, setOnboardingSeen } from '../services/onboarding';
import OnboardingModal from '../Component/OnboardingModal';

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
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      getWelcomeName()
        .then((name) => {
          if (isActive) setWelcomeName(name || 'there');
        })
        .catch(() => {
          if (isActive) setWelcomeName('there');
        });

      (async () => {
        const u = getAuth().currentUser;
        if (!u) return;
        const seen = await getOnboardingSeen(u.uid);
        if (isActive && !seen) setShowOnboarding(true);
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

  async function closeOnboarding() {
    const u = getAuth().currentUser;
    if (u) await setOnboardingSeen(u.uid);
    setShowOnboarding(false);
  }

  async function sendPrompt(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setLastPrompt(trimmed);
    setSending(true);
    try {
      const res = await triageText(trimmed);
      setReply(res);
      await saveHistory({
        prompt: trimmed,
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
    if (!prompt) return;
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
        const trimmed = text?.trim?.() ?? '';
        if (trimmed) {
          setLastPrompt(trimmed);
          await sendPrompt(trimmed);
        }
      } catch (e: any) {
        console.log('voice error', e?.message || e);
      } finally {
        setRecording(false);
        setTranscribing(false);
      }
    }
  };

  const onCancelPress = async () => {
    try {
      await stopAndTranscribe();
    } catch {}
    setRecording(false);
    setTranscribing(false);
  };

  const isBusy = sending || transcribing;
  const showListeningUI = recording || transcribing;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top']}>
        {isBusy && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>
              {transcribing ? 'Transcribing your voice…' : 'Analyzing your symptoms…'}
            </Text>
          </View>
        )}

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

          {reply ? <AiReply data={reply} prompt={lastPrompt ?? ''} /> : null}
        </ScrollView>

        <View
          style={[
            styles.inputBar,
            {
              bottom: 16 + insets.bottom,
            },
            showListeningUI && {
              backgroundColor: COLORS.redLight,
              borderColor: COLORS.red,
              borderWidth: 1,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            {showListeningUI ? (
              <View style={styles.listeningRow}>
                <View style={styles.dot} />
                <Text style={styles.listeningText}>
                  {transcribing ? 'Transcribing…' : 'Listening…'}
                </Text>
                {transcribing ? (
                  <ActivityIndicator style={{ marginLeft: 8 }} color={COLORS.red} />
                ) : null}
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

        <OnboardingModal visible={showOnboarding} onClose={closeOnboarding} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 48, paddingHorizontal: 20 },
  headerGrad: {
    position: 'absolute',
    left: -60,
    right: -60,
    top: -120,
    height: 260,
    borderRadius: 260,
  },
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

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 18, 36, 0.18)',
    zIndex: 20,
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.text,
    fontSize: 14,
  },
});
