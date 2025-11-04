import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, IconButton, ActivityIndicator, Divider, Chip } from 'react-native-paper';
import { subscribeHistory, deleteHistory, type HistoryItem } from '../services/historyService';

const COLORS = {
  bg: '#FAFAFA',
  text: '#0B0B12',
  subtext: '#5b5b73',
  white: '#FFFFFF',
  purple: '#8B5CF6',
  purpleShadow: '#7C3AED',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  border: '#ECECEC',
};

function prettyDate(ms: number) {
  try {
    const d = new Date(ms);
    return d.toLocaleString();
  } catch {
    return '';
  }
}

function levelPill(level: string | undefined) {
  const L = (level || '').toLowerCase();
  if (L.includes('urgent')) return { label: 'URGENT', bg: '#FEE2E2', fg: COLORS.red };
  if (L.includes('see'))   return { label: 'SEE DOCTOR', bg: '#FEF3C7', fg: COLORS.amber };
  return { label: 'SELF-CARE', bg: '#DCFCE7', fg: COLORS.green };
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const off = subscribeHistory(rows => {
      setItems(rows);
      setLoading(false);
    });
    return off;
  }, []);

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const pill = levelPill(item.level);
    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content style={{ paddingBottom: 12 }}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.title} numberOfLines={2}>
                {item.condition || 'Unknown'}
              </Text>
              <View style={styles.metaRow}>
                <Chip
                style={[styles.pill, { backgroundColor: pill.bg }]}
                textStyle={[styles.pillText, { color: pill.fg }]}>
                {pill.label}
              </Chip>
                <Text style={styles.metaDate}>{prettyDate(item.createdAt)}</Text>
              </View>
            </View>
            <IconButton
              icon="delete"
              onPress={() => deleteHistory(item.id)}
              containerColor="transparent"
              iconColor={COLORS.purple}
            />
          </View>

          <Divider style={{ marginTop: 8, marginBottom: 10, backgroundColor: COLORS.border }} />

          {Array.isArray(item.advice) && item.advice.length > 0 ? (
            <View style={{ gap: 6 }}>
              {item.advice.map((a, i) => (
                <Text key={i} style={styles.bullet}>
                  • {a}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={[styles.bullet, { fontStyle: 'italic', opacity: 0.8 }]}>
              No recommendations recorded.
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.sa, { paddingTop: insets.top }]} edges={['top']}>
      <View style={[styles.container, { paddingBottom: 16 + insets.bottom }]}>
        <Text style={styles.screenTitle}>History</Text>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} />
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptyText}>Your AI assessments will appear here.</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ paddingBottom: 8 }}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sa: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 16 },
  screenTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 8, marginBottom: 12 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    elevation: 6,
    shadowColor: COLORS.purpleShadow,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },

  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  title: { color: COLORS.text, fontSize: 16, fontWeight: '700' },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  pill: {
    borderRadius: 14,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  metaDate: { color: COLORS.subtext, fontSize: 12 },

  bullet: { color: COLORS.text, lineHeight: 20 },

  empty: { alignItems: 'center', marginTop: 48, gap: 6 },
  emptyTitle: { color: COLORS.text, fontWeight: '700' },
  emptyText: { color: COLORS.subtext },
});
