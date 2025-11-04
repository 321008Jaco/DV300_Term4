import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import LottieView from 'lottie-react-native';

export default function AnimatedSplash({ onDone }: { onDone: () => void }) {
  const ref = useRef<LottieView>(null);
  const [didLayout, setDidLayout] = useState(false);

  const animationSrc = require('../../assets/animations/careai-logo.json');
  const fallbackImg = require('../../assets/images/splash-static.png');

  const safeFinish = useCallback(() => {
    setTimeout(onDone, 120);
  }, [onDone]);

  useEffect(() => {
    const timeout = setTimeout(safeFinish, 6500);
    return () => clearTimeout(timeout);
  }, [safeFinish]);

  useEffect(() => {
    if (didLayout) {
      const t = setTimeout(() => {
        try { ref.current?.play?.(); } catch {}
      }, 60);
      return () => clearTimeout(t);
    }
  }, [didLayout]);

  return (
    <View style={styles.wrap} onLayout={() => setDidLayout(true)}>
      <LottieView
        ref={ref}
        source={animationSrc}
        autoPlay
        loop={false}
        style={{ width: 260, height: 260, backgroundColor: 'transparent' }}
        onAnimationFinish={safeFinish}
        progress={0}

      />
      <Image
        source={fallbackImg}
        style={styles.fallback}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 9999,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    position: 'absolute',
    width: 220,
    height: 220,
    opacity: 0.02,
  },
});
