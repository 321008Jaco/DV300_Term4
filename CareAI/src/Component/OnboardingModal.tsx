import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Portal, Modal, Card, Text, Button, IconButton, Divider } from 'react-native-paper';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const COLORS = {
  bg: '#FAFAFA',
  text: '#0B0B12',
  subtext: '#5b5b73',
  card: '#FFFFFF',
  purple: '#8B5CF6',
  indigo: '#4F46E5',
  grayField: '#E5E5E5',
};

const PAGES = ['disclaimer', 'howto'] as const;
type PageKey = typeof PAGES[number];

export default function OnboardingModal({ visible, onClose }: Props) {
  const [page, setPage] = useState<PageKey>('disclaimer');

  const index = useMemo(() => PAGES.indexOf(page), [page]);
  const isFirst = index === 0;
  const isLast = index === PAGES.length - 1;

  const next = () => setPage(isLast ? 'howto' : PAGES[index + 1]);
  const back = () => setPage(isFirst ? 'disclaimer' : PAGES[index - 1]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <Card mode="elevated" style={styles.card}>
          <Card.Content style={{ paddingBottom: 0 }}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Welcome to CareAI</Text>
              <IconButton
                icon="close"
                onPress={onClose}
                size={22}
                style={styles.closeBtn}
                iconColor={COLORS.purple}
              />
            </View>

            <Text style={styles.caption}>
              A quick heads-up before you start
            </Text>

            <Divider style={styles.divider} />

            {page === 'disclaimer' ? (
              <View style={styles.body}>
                <Text style={styles.h2}>Disclaimer</Text>
                <Text style={styles.p}>
                  <Text style={styles.b}>REMEMBER!</Text> This is an{' '}
                  <Text style={styles.hl}>AI assistant</Text> and can be wrong.
                  Always consider getting a{' '}
                  <Text style={styles.hl}>second opinion</Text> from a qualified
                  professional. Never take responses as{' '}
                  <Text style={styles.hl}>medical advice</Text>—they’re for
                  guidance only.
                </Text>

                <View style={styles.bullets}>
                  <Text style={styles.bullet}>
                    • Watch for <Text style={styles.hl}>red-flag symptoms</Text>{' '}
                    (severe chest pain, trouble breathing, fainting, heavy
                    bleeding) and seek urgent care.
                  </Text>
                  <Text style={styles.bullet}>
                    • We’ll suggest <Text style={styles.hl}>next steps</Text>{' '}
                    and <Text style={styles.hl}>self-care</Text>, but when in
                    doubt consult a clinician.
                  </Text>
                  <Text style={styles.bullet}>
                    • Your inputs help tailor guidance, but{' '}
                    <Text style={styles.hl}>we don’t diagnose</Text>.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.body}>
                <Text style={styles.h2}>How to use CareAI</Text>
                <Text style={styles.p}>
                  You can <Text style={styles.hl}>type</Text> your symptoms in
                  the input or tap the <Text style={styles.hl}>microphone</Text>{' '}
                  to <Text style={styles.hl}>speak</Text>. When recording:
                </Text>

                <View style={styles.bullets}>
                  <Text style={styles.bullet}>
                    • Tap the mic to start <Text style={styles.hl}>listening</Text>.
                  </Text>
                  <Text style={styles.bullet}>
                    • Tap <Text style={styles.hl}>Stop</Text> to transcribe and
                    send automatically.
                  </Text>
                  <Text style={styles.bullet}>
                    • Tap <Text style={styles.hl}>Cancel</Text> to discard.
                  </Text>
                </View>

                <Text style={[styles.p, { marginTop: 8 }]}>
                  For better results, include{' '}
                  <Text style={styles.hl}>age</Text>,{' '}
                  <Text style={styles.hl}>duration</Text>,{' '}
                  <Text style={styles.hl}>severity</Text>, any{' '}
                  <Text style={styles.hl}>fever</Text>,{' '}
                  <Text style={styles.hl}>medications</Text>, relevant{' '}
                  <Text style={styles.hl}>history</Text>, and{' '}
                  <Text style={styles.hl}>pregnancy status</Text> (if
                  applicable).
                </Text>
              </View>
            )}

            {/* Dots */}
            <View style={styles.dotsRow}>
              {PAGES.map((k, i) => (
                <View
                  key={k}
                  style={[
                    styles.dot,
                    i === index && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </Card.Content>

          <Card.Actions style={styles.actions}>
            {!isFirst ? (
              <Button
                mode="text"
                textColor={COLORS.purple}
                onPress={back}
                style={styles.actionBtn}
                compact
              >
                Back
              </Button>
            ) : (
              <View style={{ width: 8 }} />
            )}

            {!isLast ? (
              <Button
                mode="contained-tonal"
                buttonColor="#EFEAFE"
                textColor={COLORS.purple}
                onPress={next}
                style={styles.midBtn}
                compact
              >
                Next
              </Button>
            ) : (
              <Button
                mode="contained"
                buttonColor={COLORS.purple}
                textColor="#fff"
                onPress={onClose}
                style={styles.midBtn}
                compact
              >
                Got it
              </Button>
            )}
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: 20,
    ...(Platform.OS === 'ios' ? { marginTop: 80, marginBottom: 40 } : { marginVertical: 30 }),
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    elevation: 8,
    shadowColor: COLORS.indigo,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: { margin: 0 },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  caption: {
    marginTop: 2,
    color: COLORS.subtext,
  },
  divider: {
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#EAEAEA',
  },
  body: {
    gap: 10,
  },
  h2: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  p: {
    color: COLORS.subtext,
    lineHeight: 20,
  },
  b: {
    color: COLORS.text,
    fontWeight: '800',
  },
  hl: {
    color: COLORS.purple,
    fontWeight: '800',
  },
  bullets: {
    marginTop: 4,
    gap: 6,
  },
  bullet: {
    color: COLORS.subtext,
    lineHeight: 20,
  },
  dotsRow: {
    marginTop: 14,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5E5',
  },
  dotActive: {
    backgroundColor: COLORS.purple,
    transform: [{ scale: 1.15 }],
  },
  actions: {
    paddingHorizontal: 12,
    paddingBottom: 14,
    justifyContent: 'space-between',
  },
  actionBtn: {
    borderRadius: 12,
  },
  midBtn: {
    borderRadius: 14,
  },
});