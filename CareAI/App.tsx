import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import theme from './src/theme/theme';
import { auth } from './src/services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  useEffect(() => {
    (async () => {
      const KEY = 'didForceSignoutOnce';
      const already = await AsyncStorage.getItem(KEY);
      if (!already) {
        try { await auth.signOut(); } catch {}
        await AsyncStorage.setItem(KEY, '1');
      }
    })();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}