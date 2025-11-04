import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Switch, Divider, TextInput } from 'react-native-paper';
import PrimaryButton from '../Component/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { getAuth } from 'firebase/auth';
import { getUserProfile, setUsername } from '../services/userService';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#FAFAFA',
  text: '#0B0B12',
  field: '#E5E5E5',
  purple: '#8B5CF6',
};

export default function SettingsScreen() {
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [consent, setConsent] = useState(true);
  const [username, setUsernameField] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      const u = getAuth().currentUser;
      if (!u) return;
      const prof = await getUserProfile(u.uid);
      const doc = prof as any;
      const uname =
        (doc?.username && String(doc.username).trim())
          ? String(doc.username)
          : (prof as any)?.displayName || '';
      setUsernameField(uname);
    };
    run();
  }, []);

  const onSaveUsername = async () => {
    const u = getAuth().currentUser;
    if (!u || !username.trim()) return;
    setSaving(true);
    try {
      await setUsername(u.uid, username.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.sa, { paddingTop: insets.top }]}
    >
      <View style={[styles.container, { paddingBottom: 16 + insets.bottom }]}>
        <Text variant="headlineMedium" style={styles.title}>Settings</Text>
        <Divider />

        <View style={{ gap: 8, marginTop: 12 }}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            mode="flat"
            value={username}
            onChangeText={setUsernameField}
            autoCapitalize="none"
            style={{ backgroundColor: COLORS.field }}
            underlineStyle={{ display: 'none' }}
            textColor={COLORS.purple}
          />
          <PrimaryButton
            label={saving ? 'Saving…' : 'Save username'}
            onPress={onSaveUsername}
          />
        </View>

        <Divider style={{ marginVertical: 12 }} />

        <View style={styles.row}>
          <Text style={styles.label}>Data privacy consent</Text>
          <Switch value={consent} onValueChange={setConsent} />
        </View>

        <PrimaryButton label="Log out" onPress={logout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sa: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 16, gap: 12 },
  title: { color: COLORS.text },
  label: { color: COLORS.text, opacity: 0.9 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});