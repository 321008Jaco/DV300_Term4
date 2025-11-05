import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import Svg, { Defs, LinearGradient as SvgLg, Stop, Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';

const COLORS = {
  bg: '#FAFAFA',
  grayField: '#E5E5E5',
  grayPlaceholder: '#6B6B6B',
  purple: '#8B5CF6',
  purpleDark: '#7C3AED',
  indigo: '#4F46E5',
  text: '#0B0B12',
};

const inputTheme = {
  colors: {
    primary: COLORS.purple,
    onSurface: COLORS.purple,
    surface: COLORS.grayField,
    background: COLORS.grayField,
    outline: 'transparent',
  },
} as const;

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Required'),
  password: yup.string().min(6, 'Min 6 chars').required('Required'),
});

const signupSchema = yup.object({
  email: yup.string().email('Invalid email').required('Required'),
  password: yup.string().min(6, 'Min 6 chars').required('Required'),
  confirm: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Required'),
  dialCode: yup.string().required(),
});

type LoginVals = { email: string; password: string };
type SignupVals = { email: string; password: string; confirm: string; dialCode: string };

export default function LoginScreen({ navigation }: any) {
  const loginForm = useForm<LoginVals>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const [loggingIn, setLoggingIn] = useState(false);

  const onLogin = async (vals: LoginVals) => {
    if (loggingIn) return;
    setLoggingIn(true);
    try {
      const email = vals.email.trim().toLowerCase();
      const password = vals.password;
      await signInWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem('onboarding:showOnce', '1');
    } catch (e: any) {
      Alert.alert('Login failed', e?.message || 'Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const onForgot = async () => {
    const email = loginForm.getValues('email')?.trim().toLowerCase();
    if (!email) {
      Alert.alert('Forgot Password', 'Enter your email first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Check your inbox', 'Password reset email sent.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not send reset email.');
    }
  };

  const SHEET_OPEN_Y = 0;
  const SHEET_CLOSED_Y = 260;

  const translateY = useRef(new Animated.Value(SHEET_CLOSED_Y)).current;
  const currentY = useRef(SHEET_CLOSED_Y);
  const isOpenRef = useRef(false);

  useEffect(() => {
    const id = translateY.addListener(({ value }) => (currentY.current = value));
    return () => translateY.removeListener(id);
  }, [translateY]);

  const clamp = (v: number) => Math.max(SHEET_OPEN_Y, Math.min(SHEET_CLOSED_Y, v));
  const openSheet = () => {
    isOpenRef.current = true;
    Animated.spring(translateY, {
      toValue: SHEET_OPEN_Y,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };
  const closeSheet = () => {
    isOpenRef.current = false;
    Animated.spring(translateY, {
      toValue: SHEET_CLOSED_Y,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
        onPanResponderMove: (_, g) => {
          const start = isOpenRef.current ? SHEET_OPEN_Y : SHEET_CLOSED_Y;
          translateY.setValue(clamp(start + g.dy));
        },
        onPanResponderRelease: (_, g) => {
          const vy = g.vy;
          const y = currentY.current;
          const shouldOpen = vy < 0 || y < SHEET_CLOSED_Y * 0.5;
          if (shouldOpen) openSheet();
          else closeSheet();
        },
      }),
    []
  );

  const signupForm = useForm<SignupVals>({
    resolver: yupResolver(signupSchema),
    defaultValues: { email: '', password: '', confirm: '', dialCode: '+27' },
  });
  const [signingUp, setSigningUp] = useState(false);

  const onSignup = async (vals: SignupVals) => {
    if (signingUp) return;
    setSigningUp(true);
    try {
      const email = vals.email.trim().toLowerCase();
      const password = vals.password;
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: cred.user.email?.split('@')[0] || 'User' });
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email,
        phoneDialCode: vals.dialCode,
        createdAt: serverTimestamp(),
      });

      await AsyncStorage.setItem('onboarding:showOnce', '1');

    } catch (e: any) {
      Alert.alert('Signup failed', e?.message || 'Please try again.');
    } finally {
      setSigningUp(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={{ flex: 1, backgroundColor: COLORS.bg }}
    >
      <View style={{ alignItems: 'center', paddingTop: 60 }}>
        <CrossEmblem />
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
        <Text variant="headlineLarge" style={{ fontWeight: '800', color: COLORS.text, marginBottom: 16 }}>
          Log In
        </Text>

        <TextInput
          mode="flat"
          keyboardType="email-address"
          autoCapitalize="none"
          value={loginForm.getValues('email')}
          onChangeText={(t) => loginForm.setValue('email', t, { shouldValidate: true })}
          placeholder="Email"
          style={styles.field}
          underlineStyle={{ display: 'none' }}
          placeholderTextColor={COLORS.grayPlaceholder}
          error={!!loginForm.formState.errors.email}
          textColor={COLORS.purple}
          selectionColor={COLORS.purple}
          theme={inputTheme}
        />
        <TextInput
          mode="flat"
          secureTextEntry
          value={loginForm.getValues('password')}
          onChangeText={(t) => loginForm.setValue('password', t, { shouldValidate: true })}
          placeholder="Password"
          style={styles.field}
          underlineStyle={{ display: 'none' }}
          placeholderTextColor={COLORS.grayPlaceholder}
          error={!!loginForm.formState.errors.password}
          textColor={COLORS.purple}
          selectionColor={COLORS.purple}
          theme={inputTheme}
        />

        <View style={{ alignItems: 'flex-end', marginTop: 6 }}>
          <TouchableOpacity onPress={onForgot}>
            <Text style={{ fontWeight: '700', color: 'rgba(0,0,0,0.6)' }}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <Button
          mode="contained"
          loading={loggingIn}
          disabled={loggingIn}
          onPress={loginForm.handleSubmit(onLogin)}
          style={styles.loginButton}
          contentStyle={{ height: 56 }}
          labelStyle={{ fontSize: 18, fontWeight: '800' }}
          buttonColor={COLORS.purple}
        >
          Log In
        </Button>
      </View>

      <TouchableOpacity activeOpacity={0.8} onPress={openSheet} style={styles.waveContainer}>
        <Wave />
        <View style={styles.waveOverlay}>
          <UpArrow />
          <Text style={{ color: 'white', fontSize: 28, fontWeight: '800', marginTop: 4 }}>Sign Up</Text>
        </View>
      </TouchableOpacity>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.sheet, styles.sheetShadow, { transform: [{ translateY }] }]}
      >
        <LinearGradient
          colors={[COLORS.indigo, COLORS.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sheetHeaderGradient}
        >
          <View style={styles.homeIndicator} />
          <Text style={styles.sheetTitle}>Sign Up</Text>
        </LinearGradient>

        <View style={{ padding: 16 }}>
          <View style={styles.card}>
            <TextInput
              mode="flat"
              keyboardType="email-address"
              autoCapitalize="none"
              value={signupForm.getValues('email')}
              onChangeText={(t) => signupForm.setValue('email', t, { shouldValidate: true })}
              placeholder="Email"
              style={styles.field}
              underlineStyle={{ display: 'none' }}
              placeholderTextColor={COLORS.grayPlaceholder}
              error={!!signupForm.formState.errors.email}
              textColor={COLORS.purple}
              selectionColor={COLORS.purple}
              theme={inputTheme}
            />
            <TextInput
              mode="flat"
              secureTextEntry
              value={signupForm.getValues('password')}
              onChangeText={(t) => signupForm.setValue('password', t, { shouldValidate: true })}
              placeholder="Password"
              style={styles.field}
              underlineStyle={{ display: 'none' }}
              placeholderTextColor={COLORS.grayPlaceholder}
              error={!!signupForm.formState.errors.password}
              textColor={COLORS.purple}
              selectionColor={COLORS.purple}
              theme={inputTheme}
            />
            <TextInput
              mode="flat"
              secureTextEntry
              value={signupForm.getValues('confirm')}
              onChangeText={(t) => signupForm.setValue('confirm', t, { shouldValidate: true })}
              placeholder="Confirm Password"
              style={styles.field}
              underlineStyle={{ display: 'none' }}
              placeholderTextColor={COLORS.grayPlaceholder}
              error={!!signupForm.formState.errors.confirm}
              textColor={COLORS.purple}
              selectionColor={COLORS.purple}
              theme={inputTheme}
            />
            <TextInput
              mode="flat"
              value={signupForm.getValues('dialCode')}
              onChangeText={(t) => signupForm.setValue('dialCode', t, { shouldValidate: true })}
              placeholder="+27"
              style={styles.field}
              underlineStyle={{ display: 'none' }}
              placeholderTextColor={COLORS.grayPlaceholder}
              right={<TextInput.Icon icon="chevron-down" />}
              textColor={COLORS.purple}
              selectionColor={COLORS.purple}
              theme={inputTheme}
            />

            <Button
              mode="contained"
              loading={signingUp}
              disabled={signingUp}
              onPress={signupForm.handleSubmit(onSignup)}
              style={styles.signupButton}
              contentStyle={{ height: 56 }}
              labelStyle={{ fontSize: 18, fontWeight: '800' }}
              buttonColor={COLORS.purple}
            >
              Sign Up
            </Button>
          </View>

          <View style={{ alignItems: 'center', marginTop: 14 }}>
            <Text style={{ color: 'white' }}>Already have an account?</Text>
            <TouchableOpacity onPress={closeSheet}>
              <Text style={{ color: 'white', fontWeight: '700', marginTop: 4 }}>
                Swipe down to Log In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

function CrossEmblem() {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 6,
        shadowColor: COLORS.purple,
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      }}
    >
      <Image
        source={require('../../assets/images/splash-static.png')}
        style={{
          width: 160,
          height: 160,
          resizeMode: 'contain',
        }}
      />
    </View>
  );
}

function Wave() {
  return (
    <View style={{ flex: 1 }}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 375 200"
        preserveAspectRatio="none"
      >
        <Defs>
          <SvgLg id="waveGrad" x1="0" y1="0" x2="375" y2="0" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#4F46E5" />
            <Stop offset="1" stopColor="#8B5CF6" />
          </SvgLg>
        </Defs>
        <Path
          d="
            M 0 90
            C 50 60, 95 120, 145 90
            C 190 65, 235 110, 275 85
            C 315 60, 345 80, 375 70
            L 375 200
            L 0 200
            Z
          "
          fill="url(#waveGrad)"
        />
      </Svg>
    </View>
  );
}

function UpArrow() {
  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderLeftWidth: 3,
        borderTopWidth: 3,
        borderColor: 'white',
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: COLORS.grayField,
    borderRadius: 10,
    marginTop: 12,
  },
  loginButton: {
    borderRadius: 16,
    marginTop: 18,
    elevation: 6,
    shadowColor: COLORS.purple,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  waveContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  waveOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 36,
    alignItems: 'center',
  },

  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#201B4E',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    minHeight: 560,
  },
  sheetShadow: {
    shadowColor: COLORS.purple,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
  },

  sheetHeaderGradient: {
    paddingTop: 18,
    paddingBottom: 22,
    paddingHorizontal: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetTitle: {
    color: 'white',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
  },
  homeIndicator: {
    alignSelf: 'center',
    width: 56,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
    opacity: 0.95,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  signupButton: {
    borderRadius: 14,
    marginTop: 16,
    elevation: 6,
    shadowColor: COLORS.purple,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
