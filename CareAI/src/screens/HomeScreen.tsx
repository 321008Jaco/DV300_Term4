import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import PrimaryButton from '../Component/PrimaryButton';


export default function HomeScreen({ navigation }: any) {
return (
<View style={{ flex: 1, padding: 16, gap: 12 }}>
<Text variant="headlineMedium">CareAI</Text>
<Text>Safe symptom checking and triage guidance. Not a diagnostic tool.</Text>
<PrimaryButton label="Start Symptom Check" onPress={() => navigation.navigate('Intake')}>
  Start Symptom Check
</PrimaryButton>
</View>
);
}