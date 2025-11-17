import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import TriageBadge from './TriageBadge';
import type { TriageAnswer } from '../services/triageService';

type Props = {
  data: TriageAnswer;
  prompt?: string | null;
};

type BadgeLevel = 'self-care' | 'gp' | 'emergency';

function toBadgeLevel(level: string | undefined, dangerous?: boolean): BadgeLevel {
  if (dangerous) return 'emergency';
  const l = (level || '').toLowerCase().trim();
  if (['self-care', 'selfcare', 'mild'].includes(l)) return 'self-care';
  if (['gp', 'see-doctor', 'see_doctor', 'doctor', 'moderate'].includes(l)) return 'gp';
  return 'emergency';
}

const AiReply: React.FC<Props> = ({ data, prompt }) => {
  const { condition, level, dangerous, advice } = data;
  const badgeLevel = toBadgeLevel(level, dangerous);

  return (
    <View style={styles.container}>
      <View style={styles.glow} />
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Possible concern</Text>
              <Text style={styles.condition}>{condition || 'No clear concern detected'}</Text>
            </View>
            <TriageBadge level={badgeLevel} />
          </View>

          {prompt ? (
            <View style={styles.promptBlock}>
              <Text style={styles.promptLabel}>You described</Text>
              <Text style={styles.promptText}>{prompt}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What you should do next</Text>
            {(advice && advice.length ? advice : ['Try again with more detail.']).map((line, idx) => (
              <Text key={idx} style={styles.adviceLine}>
                • {line}
              </Text>
            ))}
          </View>

          <Text style={dangerous ? styles.danger : styles.safe}>
            {dangerous
              ? '⚠ This could be serious. If symptoms are severe or worsening, seek emergency help immediately.'
              : 'This guidance is not a diagnosis. If you are unsure or feel worse, speak to a healthcare professional.'}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
  },
  glow: {
    position: 'absolute',
    top: -40,
    left: -10,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: '#7C3AED',
    opacity: 0.25,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.9,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 0 },
  },
  card: {
    backgroundColor: '#0F1224',
    borderRadius: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  label: {
    color: '#C9CCFF',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  condition: {
    color: '#E8EAFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  promptBlock: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  promptLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  promptText: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    color: '#C9CCFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  adviceLine: {
    color: '#E8EAFF',
    fontSize: 14,
    marginTop: 2,
  },
  danger: {
    marginTop: 14,
    color: '#FCA5A5',
    fontSize: 13,
  },
  safe: {
    marginTop: 14,
    color: '#72F3B6',
    fontSize: 13,
  },
});

export default AiReply;
