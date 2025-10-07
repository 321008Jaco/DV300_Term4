import React from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import TextField from '../Component/TextField';
import PrimaryButton from '../Component/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { Text } from 'react-native-paper';


const schema = yup.object({
email: yup.string().email().required(),
password: yup.string().min(6).required(),
});


export default function LoginScreen({ navigation }: any) {
const { control, handleSubmit } = useForm({ resolver: yupResolver(schema) });
const { login } = useAuth();


const onSubmit = async (data: any) => {
await login(data.email, data.password);
};


return (
<View style={{ flex: 1, padding: 16, gap: 8, justifyContent: 'center' }}>
<Text variant="headlineMedium" style={{ marginBottom: 8 }}>Welcome back</Text>
<TextField control={control} name="email" label="Email" />
<TextField control={control} name="password" label="Password" secureTextEntry />
<PrimaryButton label="Log In" onPress={handleSubmit(onSubmit)}>{'Log In'}</PrimaryButton>
<PrimaryButton label="Create Account" mode="text" onPress={() => navigation.navigate('Signup')}>{'Create Account'}</PrimaryButton>
</View>
);
}