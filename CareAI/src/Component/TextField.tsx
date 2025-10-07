import React from 'react';
import { Controller } from 'react-hook-form';
import { TextInput } from 'react-native-paper';


export default function TextField({ control, name, label, secureTextEntry = false }: any) {
return (
<Controller
control={control}
name={name}
render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
<TextInput
mode="outlined"
label={label}
value={value}
onChangeText={onChange}
onBlur={onBlur}
secureTextEntry={secureTextEntry}
error={!!error}
style={{ marginBottom: 12 }}
/>
)}
/>
);
}