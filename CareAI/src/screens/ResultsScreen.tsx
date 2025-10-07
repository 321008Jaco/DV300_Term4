import React from 'react';
import { View } from 'react-native';
import { Text, Card, List } from 'react-native-paper';
import TriageBadge from '../Component/TriageBadge';


export default function ResultsScreen({ route }: any) {
const { result, input } = route.params;
return (
<View style={{ flex: 1, padding: 16, gap: 12 }}>
<Card>
<Card.Title title="Triage Result" right={() => <TriageBadge level={result.level} />} />
<Card.Content>
<Text style={{ marginBottom: 8 }}>{result.advice}</Text>
{result.redFlags?.length ? (
<List.Section>
<List.Subheader>Red Flags</List.Subheader>
{result.redFlags.map((rf: string, idx: number) => (
<List.Item key={idx} title={rf} left={(props) => <List.Icon {...props} icon="alert" />} />
))}
</List.Section>
) : null}
<Text style={{ marginTop: 12, opacity: 0.7 }}>
Info entered: Age {input.age}, Sex {input.sex}
</Text>
</Card.Content>
</Card>
</View>
);
}