import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParams } from '../navigation/RootNavigator';
import { authApi } from '../api/endpoints';
import { apiError } from '../api/client';
import { AuthBackdrop, AuthButton, AuthField, AuthNotice, authColors, displayFont } from '../components/AuthUI';

export function ResetPasswordScreen({ navigation, route }: NativeStackScreenProps<AuthStackParams, 'ResetPassword'>) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (password.length < 8) { setError('Use at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!route.params?.token) { setError('This reset link is invalid. Request a new one.'); return; }
    setBusy(true); setError('');
    try { await authApi.resetPassword(route.params.token, password); setDone(true); }
    catch (cause) { setError(apiError(cause)); }
    finally { setBusy(false); }
  }
  return <SafeAreaView style={styles.page}><AuthBackdrop /><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Pressable onPress={() => navigation.navigate('Login')} style={styles.back} accessibilityLabel="Back to login"><Ionicons name="arrow-back" size={23} color={authColors.ink} /></Pressable>
    <View style={styles.main}><Text style={styles.title}>Create New Password</Text><Text style={styles.subtitle}>Choose a strong password for your Evently account.</Text>
      {done ? <View style={styles.success}><Text style={styles.successText}>Your password is updated. You can sign in now.</Text><AuthButton label="Go to Login" onPress={() => navigation.navigate('Login')} /></View> : <><AuthField label="New Password" icon="lock-closed-outline" value={password} onChangeText={(value) => { setPassword(value); setError(''); }} secure autoComplete="new-password" placeholder="Enter a new password" /><AuthField label="Confirm Password" icon="lock-closed-outline" value={confirm} onChangeText={(value) => { setConfirm(value); setError(''); }} secure autoComplete="new-password" placeholder="Enter it again" />{error ? <AuthNotice message={error} /> : null}<AuthButton label="Update Password" onPress={submit} loading={busy} /></>}
    </View>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: '#FCFCFF' }, content: { flexGrow: 1, paddingHorizontal: 26 }, back: { width: 44, height: 44, marginTop: 10, justifyContent: 'center' }, main: { marginTop: 105 }, title: { ...displayFont, color: authColors.ink, fontSize: 30 }, subtitle: { color: authColors.muted, fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 40 }, success: { backgroundColor: '#ECFDF5', padding: 20, borderRadius: 18 }, successText: { color: '#065F46', marginBottom: 18 } });
