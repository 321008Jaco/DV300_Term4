import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';


export default function HistoryScreen() {
// For MVP, you can add Firestore reads of user triage history.
return (
<View style={{ flex: 1, padding: 16 }}>
<Text variant="headlineMedium">History</Text>
<Text>Previous symptom checks will appear here.</Text>
</View>
);
}