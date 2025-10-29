import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text, Switch, Divider, TextInput } from 'react-native-paper';
import PrimaryButton from '../Component/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { getAuth } from 'firebase/auth';
import { getUserProfile, setUsername } from '../services/userService';

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
      const uname = doc?.username && String(doc.username).trim() ? String(doc.username) : prof?.displayName || '';
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
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text variant="headlineMedium">Settings</Text>
      <Divider />

      <View style={{ gap: 8 }}>
        <Text>Username</Text>
        <TextInput
          mode="flat"
          value={username}
          onChangeText={setUsernameField}
          autoCapitalize="none"
          style={{ backgroundColor: '#E5E5E5' }}
        />
        <PrimaryButton label={saving ? 'Saving…' : 'Save username'} onPress={onSaveUsername} />
      </View>

      <Divider />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text>Data privacy consent</Text>
        <Switch value={consent} onValueChange={setConsent} />
      </View>

      <PrimaryButton label="Log out" onPress={logout} />
    </View>
  );
}
