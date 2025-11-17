import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Card, Text, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HistoryItem, fetchHistory, subscribeHistory, deleteHistory } from '../services/historyService';

const COLORS = {
  bg: '#FAFAFA',
  text: '#0B0B12',
  subtext: '#5b5b73',
  gray: '#6B6B6B',
  card: '#FFFFFF',
  purple: '#8B5CF6',
  indigo: '#4F46E5',
  dangerBg: '#FEE2E2',
  dangerText: '#B91C1C',
  chipBg: '#EFEAFE',
  levelBg: '#E9ECFF',
};

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete entry',
      'Are you sure you want to remove this history item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(id);
              await deleteHistory(id);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const isDeleting = deletingId === item.id;

    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.cardActions}>
            {isDeleting ? (
              <ActivityIndicator color={COLORS.purple} />
            ) : (
              <IconButton
                icon="delete-outline"
                size={20}
                onPress={() => confirmDelete(item.id)}
                iconColor={COLORS.subtext}
                style={styles.deleteBtn}
              />
            )}
          </View>

          <Text style={styles.prompt} numberOfLines={3}>
            {item.prompt}
          </Text>

          {/* TAGS ROW */}
          <View style={styles.row}>
            <Chip
              style={[styles.chip, styles.primaryChip]}
              textStyle={styles.primaryChipText}
            >
              {item.condition || 'Unclear cause'}
            </Chip>

            <Chip
              style={[styles.chip, styles.levelChip]}
              textStyle={styles.levelText}
            >
              {item.level}
            </Chip>

            {item.dangerous ? (
              <Chip
                style={[styles.chip, styles.danger]}
                textStyle={styles.dangerText}
              >
                urgent
              </Chip>
            ) : null}
          </View>

          {item.advice ? (
            <Text style={styles.advice}>
              {Array.isArray(item.advice) ? item.advice.join(' ') : item.advice}
            </Text>
          ) : null}

          <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <ActivityIndicator color={COLORS.purple} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={items.length ? styles.list : styles.empty}
        ListEmptyComponent={<Text style={styles.emptyText}>No history yet</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  list: { padding: 16, paddingBottom: 24 },
  empty: { flexGrow: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: COLORS.subtext, fontSize: 16, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },

  card: {
    backgroundColor: COLORS.card,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 6,
    shadowColor: COLORS.indigo,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },

  cardActions: {
    position: 'absolute',
    right: 4,
    top: 4,
    zIndex: 2,
  },
  deleteBtn: {
    margin: 0,
  },

  prompt: { color: COLORS.text, fontSize: 15, fontWeight: '700', paddingRight: 28 },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },

  chip: {
    borderRadius: 18,
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 14,
    flexShrink: 0,
  },
  primaryChip: { backgroundColor: COLORS.chipBg },
  primaryChipText: { color: COLORS.purple, fontWeight: '700' },

  levelChip: { backgroundColor: COLORS.levelBg },
  levelText: { color: COLORS.indigo, fontWeight: '700' },

  danger: { backgroundColor: COLORS.dangerBg },
  dangerText: { color: COLORS.dangerText, fontWeight: '700' },

  advice: { color: COLORS.text, marginTop: 10, lineHeight: 20 },
  time: { color: COLORS.subtext, marginTop: 8, fontSize: 12 },
});
