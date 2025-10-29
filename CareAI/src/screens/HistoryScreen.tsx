import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, Chip, ActivityIndicator } from 'react-native-paper';
import { HistoryItem, fetchHistory, subscribeHistory } from '../services/historyService';

const COLORS = {
  bg: '#FAFAFA',
  text: '#0B0B12',
  gray: '#6B6B6B',
  card: '#FFFFFF',
  purple: '#8B5CF6',
  indigo: '#4F46E5',
};

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await fetchHistory();
    setItems(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const unsub = subscribeHistory(setItems);
    return () => unsub();
  }, [load]);

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text style={styles.prompt} numberOfLines={3}>
          {item.prompt}
        </Text>
        <View style={styles.row}>
          <Chip style={styles.chip} textStyle={styles.chipText}>
            {item.condition || 'Unclear cause'}
          </Chip>
          <Chip style={styles.levelChip} textStyle={styles.levelText}>
            {item.level}
          </Chip>
          {item.dangerous ? (
            <Chip style={styles.danger} textStyle={styles.dangerText}>
              urgent
            </Chip>
          ) : null}
        </View>
        {item.advice ? <Text style={styles.advice}>{item.advice}</Text> : null}
        <Text style={styles.time}>{item.createdAt.toLocaleString()}</Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.purple} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={items.length ? styles.list : styles.empty}
        ListEmptyComponent={<Text style={styles.emptyText}>No history yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  list: { padding: 16, paddingBottom: 24 },
  empty: { flexGrow: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.gray, fontSize: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  card: {
    backgroundColor: COLORS.card,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 4,
    shadowColor: COLORS.indigo,
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  prompt: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  chip: { backgroundColor: '#EFEAFE', borderColor: COLORS.purple, borderWidth: 0 },
  chipText: { color: COLORS.purple, fontWeight: '700' },
  levelChip: { backgroundColor: '#E9ECFF' },
  levelText: { color: COLORS.indigo, fontWeight: '700' },
  danger: { backgroundColor: '#FEE2E2' },
  dangerText: { color: '#B91C1C', fontWeight: '700' },
  advice: { color: COLORS.text, marginTop: 10 },
  time: { color: COLORS.gray, marginTop: 8, fontSize: 12 },
});
