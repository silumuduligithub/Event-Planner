import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParams } from '../navigation/RootNavigator';
import { useAuth } from '../state/AuthContext';
import { authError, isValidEmail } from '../api/authErrors';
import { AuthBackdrop, AuthBrand, AuthButton, AuthField, AuthNotice, authColors, displayFont } from '../components/AuthUI';

WebBrowser.maybeCompleteAuthSession();

const googleClientId = Platform.select({ ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID });

function GoogleSignIn({ onToken, onError, disabled }: { onToken: (token: string) => Promise<void>; onError: (message: string) => void; disabled: boolean }) {
  const handledResponse = useRef<ReturnType<typeof Google.useIdTokenAuthRequest>[1]>(null);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    selectAccount: true,
  });
  useEffect(() => {
    if (!response || response === handledResponse.current) return;
    handledResponse.current = response;
    if (response?.type === 'success') {
      const token = response.params.id_token;
      if (token) void onToken(token);
      else onError('Google did not return a sign-in token. Please try again.');
    } else if (response?.type === 'error') onError('Google sign-in could not be completed. Please try again.');
  }, [response, onToken, onError]);
  return <Pressable style={styles.socialButton} disabled={disabled || !request} onPress={() => void promptAsync()} accessibilityRole="button" accessibilityLabel="Continue with Google">
    <Text style={styles.googleMark}>G</Text><Text style={styles.socialLabel}>Google</Text>
  </Pressable>;
}

export function LoginScreen({ navigation }: NativeStackScreenProps<AuthStackParams, 'Login'>) {
  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let active = true;
    AppleAuthentication.isAvailableAsync().then((available) => { if (active) setAppleAvailable(available); });
    return () => { active = false; };
  }, []);

  async function submit() {
    if (!email.trim()) { setError('Enter your email address.'); return; }
    if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }
    if (!password) { setError('Enter your password.'); return; }
    setBusy(true); setError('');
    try { await login(email.trim(), password); }
    catch (cause) { setError(authError(cause, 'login')); }
    finally { setBusy(false); }
  }

  async function socialLogin(provider: 'google' | 'apple', token: string, nonce?: string, name?: string) {
    setBusy(true); setError('');
    try {
      if (provider === 'google') await loginWithGoogle(token);
      else await loginWithApple(token, nonce || '', name);
    } catch (cause) {
      const message = (cause as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Sign-in could not be completed. Please try again.');
    } finally { setBusy(false); }
  }

  async function signInWithApple() {
    setBusy(true); setError('');
    try {
      const nonce = Crypto.randomUUID();
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
        nonce,
      });
      if (!credential.identityToken) throw new Error('Apple did not return a sign-in token.');
      const name = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ') || undefined;
      await socialLogin('apple', credential.identityToken, nonce, name);
    } catch (cause) {
      if ((cause as { code?: string })?.code !== 'ERR_REQUEST_CANCELED') setError((cause as Error)?.message || 'Apple sign-in could not be completed.');
    } finally { setBusy(false); }
  }

  return <SafeAreaView style={styles.page}>
    <AuthBackdrop />
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}><Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back to welcome" style={styles.back}><Ionicons name="arrow-back" size={23} color={authColors.ink} /></Pressable></View>
        <View style={styles.brand}><AuthBrand large /></View>
        <View style={styles.heading}><Text style={styles.title}>Welcome Back</Text><Text style={styles.subtitle}>Login to continue planning your{`\n`}special events.</Text></View>
        <View style={styles.form}>
          <AuthField label="Email Address" icon="mail-outline" value={email} onChangeText={(value) => { setEmail(value); setError(''); }} keyboardType="email-address" autoComplete="email" placeholder="Enter your email address" />
          <AuthField label="Password" icon="lock-closed-outline" value={password} onChangeText={(value) => { setPassword(value); setError(''); }} secure autoComplete="password" placeholder="Enter your password" />
          <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgot}><Text style={styles.forgotText}>Forgot Password?</Text></Pressable>
          {error ? <AuthNotice message={error} /> : null}
          <AuthButton label="Login" onPress={submit} loading={busy} />
          <View style={styles.divider}><View style={styles.dividerLine} /><Text style={styles.dividerLabel}>or continue with</Text><View style={styles.dividerLine} /></View>
          <View style={styles.socialRow}>
            {googleClientId ? <GoogleSignIn disabled={busy} onToken={(token) => socialLogin('google', token)} onError={setError} /> : <Pressable style={styles.socialButton} onPress={() => setError('Google sign-in needs the OAuth client ID in this app build.')}><Text style={styles.googleMark}>G</Text><Text style={styles.socialLabel}>Google</Text></Pressable>}
            {appleAvailable ? <AppleAuthentication.AppleAuthenticationButton buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN} buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE} cornerRadius={14} style={styles.appleButton} onPress={() => { if (!busy) void signInWithApple(); }} /> : null}
          </View>
        </View>
        <Pressable onPress={() => navigation.navigate('Register')} style={styles.footer}><Text style={styles.footerText}>Don’t have an account? <Text style={styles.footerLink}>Sign Up</Text></Text></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FCFCFF' }, content: { flexGrow: 1, paddingHorizontal: 26, paddingBottom: 18 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 44, height: 44, justifyContent: 'center', marginTop: 9 },
  brand: { alignItems: 'center', marginTop: 35 },
  heading: { marginTop: 25, alignItems: 'center' }, title: { ...displayFont, color: authColors.ink, fontSize: 29, letterSpacing: -1.2 },
  subtitle: { color: authColors.muted, fontSize: 13, lineHeight: 19, marginTop: 7, textAlign: 'center' },
  form: { marginTop: 37 },
  forgot: { alignSelf: 'flex-end', paddingVertical: 9, marginTop: -9, marginBottom: 14 }, forgotText: { color: authColors.indigo, fontSize: 11, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 25, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E1E5EF' }, dividerLabel: { fontSize: 11, color: authColors.muted },
  socialRow: { flexDirection: 'row', gap: 10 }, socialButton: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#E1E5EF', borderRadius: 14, backgroundColor: '#FFFFFF' },
  appleButton: { flex: 1, height: 44 },
  googleMark: { fontSize: 20, fontWeight: '800', color: '#4285F4' }, socialLabel: { color: '#050611', fontWeight: '600', fontSize: 13 },
  footer: { marginTop: 'auto', alignItems: 'center', paddingTop: 46, paddingBottom: 48 }, footerText: { color: authColors.muted, fontSize: 13 }, footerLink: { color: authColors.indigo, fontWeight: '800' },
});
