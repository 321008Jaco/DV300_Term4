import React, { useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import TextField from '../Component/TextField';
import PrimaryButton from '../Component/PrimaryButton';
import LanguageSwitcher from '../Component/LanguageSwitcher';
import { triage } from '../services/infermedica';
import { Text } from 'react-native-paper';


const schema = yup.object({
age: yup.number().typeError('Enter a valid age').min(1).max(120).required(),
sex: yup.string().oneOf(['male', 'female', 'other']).required(),
complaint: yup.string().min(3).required(),
});


export default function IntakeScreen({ navigation }: any) {
const { control, handleSubmit } = useForm({ resolver: yupResolver(schema) });
const [lang, setLang] = useState('en');


const onSubmit = async (data: any) => {
const result = await triage({ age: Number(data.age), sex: data.sex, complaint: data.complaint });
navigation.navigate('Results', { result, input: data });
};


return (
<View style={{ flex: 1, padding: 16 }}>
<Text variant="headlineMedium" style={{ marginBottom: 8 }}>Symptom Intake</Text>
<LanguageSwitcher value={lang} onChange={setLang} />
<TextField control={control} name="age" label="Age" />
<TextField control={control} name="sex" label="Sex (male/female/other)" />
<TextField control={control} name="complaint" label="Main complaint" />
<PrimaryButton label="Check" onPress={handleSubmit(onSubmit)} />
<Text style={{ marginTop: 8, opacity: 0.7 }}>
Disclaimer: This app provides information only and is not a medical diagnosis.
</Text>
</View>
);
}