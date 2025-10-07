import React from 'react';
import { Button } from 'react-native-paper';


type Props = React.ComponentProps<typeof Button> & { label: string };


export default function PrimaryButton({ label, ...rest }: Props) {
return (
<Button mode="contained" style={{ borderRadius: 14 }} {...rest}>
{label}
</Button>
);
}