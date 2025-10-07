import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import theme from './src/theme/theme';


export default function App() {
return (
<PaperProvider theme={theme}>
<AuthProvider>
<RootNavigator />
</AuthProvider>
</PaperProvider>
);
}