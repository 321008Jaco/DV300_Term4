import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Switch, Divider, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../Component/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { getAuth } from 'firebase/auth';
import { getUserProfile, setUsername } from '../services/userService';

const COLORS = {
  bg: '#FAFAFA',
  text: '#0B0B12',
  subtext: '#5b5b73',
  field: '#E5E5E5',
  purple: '#8B5CF6',
};

export default function SettingsScreen() {
  const { logout } = useAuth();
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
        doc?.username && String(doc.username).trim()
          ? String(doc.username)
          : prof?.displayName || '';
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.heading}>Settings</Text>
        <Divider style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            mode="flat"
            value={username}
            onChangeText={setUsernameField}
            autoCapitalize="none"
            style={styles.input}
            underlineStyle={{ display: 'none' }}
          />
          <PrimaryButton
            label={saving ? 'Saving…' : 'Save username'}
            onPress={onSaveUsername}
          />
        </View>

        <Divider style={styles.divider} />

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
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, padding: 16, gap: 12 },
  heading: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  divider: { marginVertical: 6, opacity: 0.5 },
  section: { gap: 8 },
  label: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  input: { backgroundColor: COLORS.field, borderRadius: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
});
