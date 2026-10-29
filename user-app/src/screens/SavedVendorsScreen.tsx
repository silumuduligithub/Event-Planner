import React, { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { userApi } from "../api/endpoints";
import { apiError } from "../api/client";
import { Message, Skeleton, formatMoney } from "../components/UI";
import { MainStackParams } from "../navigation/RootNavigator";
import { colors } from "../theme";
import type { Vendor } from "../types";

export function SavedVendorsScreen({ navigation }: NativeStackScreenProps<MainStackParams, "SavedVendors">) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useFocusEffect(useCallback(() => { void refresh; let active = true; userApi.saved().then(({ data }) => { if (active) { setVendors(data.data); setError(""); } }).catch((cause) => { if (active) setError(apiError(cause)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [refresh]));
  async function remove(id: string) { try { const response = await userApi.unsave(id); setVendors(response.data.data); } catch (cause) { setError(apiError(cause)); } }
  return <SafeAreaView style={styles.page} edges={["bottom"]}><ScrollView contentContainerStyle={styles.content}>{loading ? <><Skeleton height={96} /><Skeleton height={96} /></> : error ? <Message text={error} retry={() => { setLoading(true); setRefresh((value) => value + 1); }} /> : vendors.length === 0 ? <Message text="Your saved vendors will appear here. Explore vendors and tap the heart to save them." /> : vendors.map((vendor) => <View key={vendor._id} style={styles.card}><Pressable onPress={() => navigation.navigate("VendorDetail", { vendorId: vendor._id })} style={styles.vendor}>{vendor.portfolioImages?.[0] ? <Image source={{ uri: vendor.portfolioImages[0] }} style={styles.photo} /> : <View style={[styles.photo, styles.fallback]}><Ionicons name="sparkles" size={24} color={colors.gold} /></View>}<View style={{ flex: 1 }}><Text style={styles.name}>{vendor.businessName}</Text><Text style={styles.meta}>{vendor.vendorType} · {vendor.address.city}</Text><Text style={styles.price}>From {formatMoney(vendor.startingPrice)}</Text></View></Pressable><Pressable onPress={() => remove(vendor._id)} accessibilityLabel={`Remove ${vendor.businessName} from saved vendors`}><Ionicons name="heart" size={20} color={colors.indigo} /></Pressable></View>)}</ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#FCFBFA" }, content: { padding: 18 }, card: { padding: 9, borderRadius: 14, backgroundColor: "white", flexDirection: "row", alignItems: "flex-start", marginBottom: 10 }, vendor: { flex: 1, flexDirection: "row", gap: 10 }, photo: { width: 72, height: 72, borderRadius: 9 }, fallback: { backgroundColor: colors.indigoDark, alignItems: "center", justifyContent: "center" }, name: { color: colors.slate, fontSize: 13, fontWeight: "800" }, meta: { color: colors.muted, fontSize: 11, marginTop: 4 }, price: { color: colors.indigo, fontSize: 11, fontWeight: "700", marginTop: 7 } });
