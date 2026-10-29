import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParams } from '../navigation/RootNavigator';
import { authApi } from '../api/endpoints';
import { apiError } from '../api/client';
import { isValidEmail } from '../api/authErrors';
import { AuthBackdrop, AuthButton, AuthField, AuthNotice, authColors, displayFont } from '../components/AuthUI';

export function ForgotPasswordScreen({ navigation }: NativeStackScreenProps<AuthStackParams, 'ForgotPassword'>) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (!isValidEmail(email)) { setError('Enter a valid email address.'); return; }
    setBusy(true); setError('');
    try { await authApi.forgotPassword(email.trim().toLowerCase()); setSent(true); }
    catch (cause) { setError(apiError(cause)); }
    finally { setBusy(false); }
  }
  return <SafeAreaView style={styles.page}><AuthBackdrop /><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Pressable onPress={() => navigation.goBack()} style={styles.back} accessibilityLabel="Back"><Ionicons name="arrow-back" size={23} color={authColors.ink} /></Pressable>
    <View style={styles.main}><Text style={styles.title}>Reset Password</Text><Text style={styles.subtitle}>Enter your email and we’ll send a secure reset link if you have an Evently account.</Text>
      {sent ? <View style={styles.success}><Ionicons name="mail-open-outline" size={26} color="#047857" /><Text style={styles.successText}>Check your inbox for a link. It expires in 15 minutes.</Text></View> : <><AuthField label="Email Address" icon="mail-outline" value={email} onChangeText={(value) => { setEmail(value); setError(''); }} keyboardType="email-address" autoComplete="email" placeholder="Enter your email address" />{error ? <AuthNotice message={error} /> : null}<AuthButton label="Send Reset Link" onPress={submit} loading={busy} /></>}
    </View>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: '#FCFCFF' }, content: { flexGrow: 1, paddingHorizontal: 26 }, back: { width: 44, height: 44, marginTop: 10, justifyContent: 'center' }, main: { marginTop: 105 }, title: { ...displayFont, color: authColors.ink, fontSize: 30 }, subtitle: { color: authColors.muted, fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 40 }, success: { backgroundColor: '#ECFDF5', padding: 22, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }, successText: { color: '#065F46', flex: 1, lineHeight: 20 } });
