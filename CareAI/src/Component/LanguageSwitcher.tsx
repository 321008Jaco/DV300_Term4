import React from 'react';
import { View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';


export default function LanguageSwitcher({ value, onChange }: { value: string; onChange: (v: string) => void }) {
return (
<View style={{ marginVertical: 8 }}>
<SegmentedButtons
value={value}
onValueChange={onChange}
buttons={[
{ value: 'en', label: 'EN' },
{ value: 'af', label: 'AF' },
{ value: 'zu', label: 'ZU' },
]}
/>
</View>
);
}