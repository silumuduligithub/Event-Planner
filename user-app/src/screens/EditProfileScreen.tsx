import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthField, authColors } from "../components/AuthUI";
import { Button } from "../components/UI";
import { MainStackParams } from "../navigation/RootNavigator";
import { useAuth } from "../state/AuthContext";
import { apiError } from "../api/client";

export function EditProfileScreen({ navigation }: NativeStackScreenProps<MainStackParams, "EditProfile">) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [city, setCity] = useState(user?.city || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    if (!name.trim()) return setError("Enter your full name.");
    setBusy(true); setError("");
    try { await updateProfile({ name: name.trim(), city: city.trim(), phone: phone.trim() }); navigation.goBack(); } catch (cause) { setError(apiError(cause)); } finally { setBusy(false); }
  }
  return <SafeAreaView style={styles.page} edges={["bottom"]}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Text style={styles.heading}>Your details</Text><Text style={styles.subtitle}>Keep your contact details up to date for event bookings.</Text><AuthField label="Full Name" icon="person-outline" value={name} onChangeText={setName} placeholder="Your name" /><AuthField label="City" icon="location-outline" value={city} onChangeText={setCity} placeholder="Your city" /><AuthField label="Phone Number" icon="call-outline" value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" /><View style={styles.emailBox}><Text style={styles.emailLabel}>Email Address</Text><Text style={styles.email}>{user?.email}</Text></View>{error ? <Text style={styles.error}>{error}</Text> : null}<Button label="Save changes" onPress={save} loading={busy} /></ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#FCFBFA" }, content: { padding: 22, paddingBottom: 35 }, heading: { color: authColors.ink, fontSize: 21, fontWeight: "800" }, subtitle: { color: authColors.muted, fontSize: 12, marginTop: 6, marginBottom: 28 }, emailBox: { padding: 14, borderRadius: 12, backgroundColor: "#F2F3F8", marginBottom: 18 }, emailLabel: { color: authColors.muted, fontSize: 11 }, email: { color: authColors.ink, fontSize: 13, marginTop: 5 }, error: { color: "#B42318", fontSize: 12, marginBottom: 12 } });
