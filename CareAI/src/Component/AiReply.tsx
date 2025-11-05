import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import TriageBadge from './TriageBadge';
import type { TriageAnswer } from '../services/triageService';

type Props = { data: TriageAnswer };

type BadgeLevel = "self-care" | "gp" | "emergency";
function toBadgeLevel(level: string | undefined, dangerous?: boolean): BadgeLevel {
  if (dangerous) return "emergency";
  const l = (level || "").toLowerCase().trim();

  if (["self-care", "selfcare", "mild"].includes(l)) return "self-care";
  if (["gp", "see-doctor", "see_doctor", "doctor", "moderate"].includes(l)) return "gp";
  if (["urgent", "er", "a&e", "emergency", "ed"].includes(l)) return "emergency";

  return "gp";
}

export default function AiReply({ data }: Props) {
  const adviceArr = Array.isArray(data.advice) ? data.advice : [String(data.advice ?? '')].filter(Boolean);

  return (
    <View style={styles.wrap}>
      <View style={styles.glow} />
      <Card style={styles.card}>
        <Card.Title
          title="AI Assessment"
          right={() => <TriageBadge level={toBadgeLevel(data.level as any, data.dangerous)} />}
        />
        <Card.Content>
          <Text style={styles.label}>Possible issue</Text>
          <Text style={styles.value}>{data.condition}</Text>

          <Text style={styles.label}>Risk</Text>
          <Text style={[styles.value, data.dangerous ? styles.danger : styles.safe]}>
            {data.dangerous ? 'Potentially serious' : 'Likely minor'}
          </Text>

          <Text style={styles.label}>Recommendation</Text>
          {adviceArr.length > 0 ? (
            <View style={{ marginTop: 2 }}>
              {adviceArr.map((line, idx) => (
                <Text key={idx} style={styles.value}>• {line}</Text>
              ))}
            </View>
          ) : (
            <Text style={styles.value}>No advice available.</Text>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16, position: 'relative' },
  glow: {
    position: 'absolute',
    left: -6,
    right: -6,
    top: -6,
    bottom: -6,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    opacity: 0.18,
    shadowColor: '#7C3AED',
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  card: { backgroundColor: '#0F1224', borderRadius: 16 },
  label: { color: '#C9CCFF', marginTop: 10 },
  value: { color: '#E8EAFF', marginTop: 2 },
  danger: { color: '#FF6B6B' },
  safe: { color: '#72F3B6' },
});
