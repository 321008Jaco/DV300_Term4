import React, { useState } from 'react';
import { View } from 'react-native';
import { Text, Switch, Divider } from 'react-native-paper';
import PrimaryButton from '../Component/PrimaryButton';
import { useAuth } from '../context/AuthContext';


export default function SettingsScreen() {
const { logout } = useAuth();
const [consent, setConsent] = useState(true);


return (
<View style={{ flex: 1, padding: 16, gap: 12 }}>
<Text variant="headlineMedium">Settings</Text>
<Divider />
<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
<Text>Data privacy consent</Text>
<Switch value={consent} onValueChange={setConsent} />
</View>
<PrimaryButton label="Log out" onPress={logout}>Log out</PrimaryButton>
</View>
);
}