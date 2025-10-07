import React from 'react';
import { Chip } from 'react-native-paper';


export default function TriageBadge({ level }: { level: 'self-care' | 'gp' | 'emergency' }) {
const color = level === 'emergency' ? '#ff3b30' : level === 'gp' ? '#f4a100' : '#34c759';
const label = level === 'emergency' ? 'Emergency' : level === 'gp' ? 'GP Visit' : 'Self-care';
return <Chip style={{ backgroundColor: color }} textStyle={{ color: 'white', fontWeight: '600' }}>{label}</Chip>;
}