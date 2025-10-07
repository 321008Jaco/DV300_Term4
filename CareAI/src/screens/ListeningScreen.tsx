import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

export default function ListeningScreen({ navigation }: any) {
  const s1 = useRef(new Animated.Value(0)).current;
  const s2 = useRef(new Animated.Value(0)).current;
  const s3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();

    loop(s1, 0);
    loop(s2, 400);
    loop(s3, 800);
  }, [s1, s2, s3]);

  const ringStyle = (v: Animated.Value) => ({
    transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B12' }}>
      <LinearGradient colors={['#140A2A', '#101322', '#0B0B12']} start={{ x: 0.2, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <IconButton icon="chevron-left" size={26} onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Listening</Text>
        <IconButton icon="close" size={22} onPress={() => navigation.goBack()} />
      </View>

      <View style={styles.centerWrap}>
        <View style={styles.glow} />
        <Animated.View style={[styles.ring, ringStyle(s1)]} />
        <Animated.View style={[styles.ring, ringStyle(s2)]} />
        <Animated.View style={[styles.ring, ringStyle(s3)]} />

        <View style={styles.micWrap}>
          <LinearGradient colors={['#7C3AED', '#4F46E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.micFill} />
          <IconButton icon="microphone" size={38} iconColor="#FFFFFF" onPress={() => navigation.goBack()} />
        </View>

        <Text style={styles.prompt}>Speak now…</Text>
        <Text style={styles.subtitle}>We’re capturing your request</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 12, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#E8EAFF', fontSize: 16, fontWeight: '700' },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#7C3AED',
    opacity: 0.18,
    shadowColor: '#7C3AED',
    shadowOpacity: 1,
    shadowRadius: 120,
    shadowOffset: { width: 0, height: 0 },
  },
  ring: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  micWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#1A1538',
    shadowColor: '#7C3AED',
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  micFill: { ...StyleSheet.absoluteFillObject },
  prompt: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 28,
    textShadowColor: '#9EA7FF',
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: { color: '#C9CCFF', marginTop: 6 },
});
