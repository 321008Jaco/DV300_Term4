import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import LottieView from "lottie-react-native";
import { Text } from "react-native-paper";

const BG = "#FAFAFA";
const PURPLE = "#8B5CF6";

type Props = {
  onDone: () => void;
  maxMs?: number;
  autoplay?: boolean;
};

export default function AnimatedSplash({ onDone, maxMs = 4500, autoplay = true }: Props) {
  const animRef = useRef<LottieView>(null);
  const [skippable, setSkippable] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSkippable(true), 800);
    const t2 = setTimeout(() => onDone(), maxMs); 
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [maxMs, onDone]);

  return (
    <View style={styles.wrap}>
      <LottieView
        ref={animRef}
        source={require("../../assets/animations/careai-logo.json")}
        autoPlay={autoplay}
        loop={false}
        onAnimationFinish={onDone}
        style={styles.lottie}
      />
      {skippable && (
        <Pressable style={styles.skip} onPress={onDone} android_ripple={{ color: "#00000010" }}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}
      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          Remember: CareAI can be wrong. Always seek professional advice.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  lottie: { width: "70%", height: "70%" },
  skip: {
    position: "absolute",
    top: Platform.select({ ios: 58, android: 28 }),
    right: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  skipText: { color: PURPLE, fontWeight: "700" },
  noteBox: {
    position: "absolute",
    bottom: 28,
    left: 18,
    right: 18,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  noteText: { textAlign: "center", color: "#4B5563", fontSize: 12 },
});
