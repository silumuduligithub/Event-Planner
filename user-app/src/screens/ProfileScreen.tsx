import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackParams } from "../navigation/RootNavigator";
import { useAuth } from "../state/AuthContext";
import { apiError } from "../api/client";
import { colors } from "../theme";

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  async function signOut() {
    setBusy(true);
    try { await logout(); } catch (cause) { Alert.alert("Could not sign out", apiError(cause)); } finally { setBusy(false); }
  }
  return <SafeAreaView style={styles.page} edges={["top"]}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.headerRow}><Text style={styles.header}>My Profile</Text><Pressable onPress={() => navigation.navigate("EditProfile")}><Text style={styles.edit}>Edit</Text></Pressable></View>
    <View style={styles.identity}><View style={styles.avatar}><Text style={styles.avatarText}>{user?.name.charAt(0).toUpperCase() || "U"}</Text></View><View><Text style={styles.name}>{user?.name}</Text><Text style={styles.email}>{user?.email}</Text>{user?.phone ? <Text style={styles.phone}>☏  {user.phone}</Text> : null}</View></View>
    <View style={styles.menu}>
      <Pressable style={styles.row} onPress={() => navigation.navigate("Tabs", { screen: "Events" })}><Ionicons name="calendar-outline" size={19} color={colors.slate} /><Text style={styles.rowText}>My Events</Text><Ionicons name="chevron-forward" size={16} color={colors.muted} /></Pressable>
      <Pressable style={styles.row} onPress={() => navigation.navigate("Tabs", { screen: "Bookings" })}><Ionicons name="bag-outline" size={19} color={colors.slate} /><Text style={styles.rowText}>My Bookings</Text><Ionicons name="chevron-forward" size={16} color={colors.muted} /></Pressable>
      <Pressable style={styles.row} onPress={() => navigation.navigate("SavedVendors")}><Ionicons name="heart-outline" size={19} color={colors.slate} /><Text style={styles.rowText}>Saved Vendors</Text><Ionicons name="chevron-forward" size={16} color={colors.muted} /></Pressable>
      <View style={styles.row}><Ionicons name="location-outline" size={19} color={colors.slate} /><Text style={styles.rowText}>{user?.city || "City not added"}</Text></View>
      <View style={styles.row}><Ionicons name="mail-outline" size={19} color={colors.slate} /><Text style={styles.rowText}>{user?.email}</Text></View>
    </View>
    <Pressable onPress={signOut} disabled={busy} style={styles.logout}><Ionicons name="log-out-outline" size={18} color="#D93638" /><Text style={styles.logoutText}>{busy ? "Logging out..." : "Logout"}</Text></Pressable>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  edit: { color: colors.indigo, fontSize: 12, fontWeight: "800", marginBottom: 26 },
  page: { flex: 1, backgroundColor: "#FCFBFA" }, content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }, header: { color: colors.slate, fontSize: 16, fontWeight: "800", marginBottom: 26 }, identity: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 27 }, avatar: { width: 59, height: 59, borderRadius: 30, backgroundColor: colors.indigoDark, alignItems: "center", justifyContent: "center" }, avatarText: { color: "white", fontSize: 23, fontWeight: "800" }, name: { color: colors.slate, fontWeight: "800", fontSize: 17 }, email: { color: colors.muted, fontSize: 11, marginTop: 3 }, phone: { color: colors.muted, fontSize: 11, marginTop: 2 }, menu: { backgroundColor: "white", borderRadius: 17, overflow: "hidden" }, row: { minHeight: 53, flexDirection: "row", alignItems: "center", paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: "#F1F1F3", gap: 13 }, rowText: { color: colors.slate, fontSize: 13, flex: 1 }, logout: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#FDEFF0", paddingVertical: 13, borderRadius: 13, marginTop: 31 }, logoutText: { color: "#D93638", fontSize: 12, fontWeight: "800" },
});
