import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { AuthStackParams } from "../navigation/RootNavigator";
import { useAuth } from "../state/AuthContext";
import { authError, isValidEmail } from "../api/authErrors";
import {
  AuthBackdrop,
  AuthButton,
  AuthField,
  AuthNotice,
  authColors,
  displayFont,
} from "../components/AuthUI";

export function RegisterScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParams, "Register">) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) { setError("Enter your full name."); return; }
    if (!isValidEmail(email)) { setError("Enter a valid email address."); return; }
    if (password.length < 8) { setError("Create a password with at least 8 characters."); return; }
    setBusy(true);
    setError("");
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      });
    } catch (cause) {
      setError(authError(cause, "register"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.page}>
      <AuthBackdrop />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topRow}>
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Back to login"
              style={styles.back}
            >
              <Ionicons name="arrow-back" size={23} color={authColors.ink} />
            </Pressable>
          </View>
          <View style={styles.heading}>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>
              Let’s start planning your amazing{`\n`}events with Evently.
            </Text>
          </View>
          <View style={styles.form}>
            <AuthField
              label="Full Name"
              icon="person-outline"
              value={name}
              onChangeText={(value) => { setName(value); setError(""); }}
              autoComplete="name"
              placeholder="Enter your full name"
            />
            <AuthField
              label="Email Address"
              icon="mail-outline"
              value={email}
              onChangeText={(value) => { setEmail(value); setError(""); }}
              keyboardType="email-address"
              autoComplete="email"
              placeholder="Enter your email address"
            />
            <AuthField
              label="Phone Number (optional)"
              icon="call-outline"
              value={phone}
              onChangeText={(value) => { setPhone(value); setError(""); }}
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder="Enter your phone number"
            />
            <AuthField
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={(value) => { setPassword(value); setError(""); }}
              secure
              autoComplete="new-password"
              placeholder="Create a password"
            />
            {error ? <AuthNotice message={error} /> : null}
            <AuthButton
              label="Create Account"
              onPress={submit}
              loading={busy}
            />
          </View>
          <Pressable
            onPress={() => navigation.navigate("Login")}
            style={styles.footer}
          >
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.footerLink}>Login</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FCFCFF" },
  content: { flexGrow: 1, paddingHorizontal: 26, paddingBottom: 18 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  back: { width: 44, height: 44, justifyContent: "center", marginTop: 9 },
  heading: { marginTop: 27 },
  title: {
    ...displayFont,
    color: authColors.ink,
    fontSize: 28,
    letterSpacing: -1.2,
  },
  subtitle: {
    color: authColors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
  },
  form: { marginTop: 29 },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 12,
  },
  footerText: { color: authColors.muted, fontSize: 13 },
  footerLink: { color: authColors.indigo, fontWeight: "800" },
});
