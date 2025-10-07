import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

type Props = Omit<React.ComponentProps<typeof Button>, 'children'> & { label: string };

export default function PrimaryButton({ label, style, ...rest }: Props) {
  return (
    <View style={styles.glowWrap}>
      <View style={styles.glow} />
      <Button mode="contained" style={[styles.btn, style]} {...rest}>
        {label}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  glowWrap: { position: 'relative' },
  glow: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    opacity: 0.55,
    shadowColor: '#7C3AED',
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  btn: {
    borderRadius: 20,
    backgroundColor: '#7C3AED',
  },
});
