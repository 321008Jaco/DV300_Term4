import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { createUserWithEmailAndPassword, updateProfile, getAuth } from 'firebase/auth';
import { createUserProfile } from '../services/userService';

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!email || !username || !password || password !== confirm) return;
    setLoading(true);
    try {
      const auth = getAuth();
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: username.trim() });
      }
      await createUserProfile(cred.user.uid, cred.user.email || '', username.trim(), cred.user.photoURL || null, username.trim());
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.wrap}>
      <View style={styles.card}>
        <TextInput mode="flat" placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} />
        <TextInput mode="flat" placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" style={styles.input} />
        <TextInput mode="flat" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <TextInput mode="flat" placeholder="Confirm Password" value={confirm} onChangeText={setConfirm} secureTextEntry style={styles.input} />
        <Button mode="contained" onPress={onSignup} loading={loading} style={styles.btn}>Sign Up</Button>
        <Button onPress={() => navigation.replace('Login')}>Back to Log In</Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: 16 },
  card: { borderRadius: 16, padding: 16, gap: 12, backgroundColor: '#ffffff' },
  input: { backgroundColor: '#E5E5E5' },
  btn: { marginTop: 8 },
});
