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

export default function SignupScreen({ navigation }: any) {
  const { control, handleSubmit } = useForm({ resolver: yupResolver(schema) });
  const { signup } = useAuth();

  const onSubmit = async (data: any) => {
    await signup(data.email, data.password);
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 8, justifyContent: 'center' }}>
      <Text variant="headlineMedium" style={{ marginBottom: 8 }}>Create your account</Text>
      <TextField control={control} name="email" label="Email" />
      <TextField control={control} name="password" label="Password" secureTextEntry />
      <PrimaryButton label="Sign Up" onPress={handleSubmit(onSubmit)} />
      <PrimaryButton label="Back to Login" mode="text" onPress={() => navigation.goBack()} />
    </View>
  );
}