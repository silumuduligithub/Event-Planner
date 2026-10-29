import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackParams } from "../navigation/RootNavigator";
import { vendorApi } from "../api/endpoints";
import { apiError } from "../api/client";
import { Message, Skeleton, formatMoney } from "../components/UI";
import { colors } from "../theme";
import type { Vendor } from "../types";

export function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const [query, setQuery] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [matchedOccasion, setMatchedOccasion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => vendorApi.list({ search: query.trim() || undefined })
      .then(({ data }) => { if (active) { setVendors(data.data.vendors); setMatchedOccasion(data.data.matchedOccasion); setError(""); } })
      .catch((cause) => { if (active) setError(apiError(cause)); })
      .finally(() => { if (active) setLoading(false); }), 280);
    return () => { active = false; clearTimeout(timer); };
  }, [query, refresh]);
  return <SafeAreaView style={styles.page} edges={["top"]}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Text style={styles.header}>Search Vendors</Text><View style={styles.search}><Ionicons name="search-outline" size={19} color={colors.muted} /><TextInput value={query} onChangeText={(value) => { setQuery(value); setLoading(true); }} placeholder="Search events, planners, caterers..." placeholderTextColor="#9AA5B9" style={styles.input} /></View>{matchedOccasion && !loading ? <Text style={styles.match}>Showing vendors for {matchedOccasion}</Text> : null}{loading ? <><Skeleton height={110} /><Skeleton height={110} /></> : error ? <Message text={error} retry={() => { setLoading(true); setRefresh((value) => value + 1); }} /> : vendors.length === 0 ? <Message text="No vendors found. Try a different search." /> : vendors.map((vendor) => <Pressable key={vendor._id} style={styles.card} onPress={() => navigation.navigate("VendorDetail", { vendorId: vendor._id, occasion: matchedOccasion || undefined, intent: matchedOccasion ? "full_event_package" : "single_service" })}>{vendor.portfolioImages?.[0] ? <Image source={{ uri: vendor.portfolioImages[0] }} style={styles.photo} /> : <View style={[styles.photo, styles.fallback]}><Ionicons name="sparkles" color={colors.gold} size={25} /></View>}<View style={{ flex: 1 }}><Text style={styles.name}>{vendor.businessName}</Text><Text style={styles.type}>{vendor.vendorType} · {vendor.address.city}</Text><Text style={styles.price}>From {formatMoney(vendor.startingPrice)}</Text></View><Ionicons name="chevron-forward" color={colors.muted} size={18} /></Pressable>)}</ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ match: { color: colors.indigo, fontWeight: "700", marginBottom: 12 }, page: { flex: 1, backgroundColor: "#FCFBFA" }, content: { padding: 20 }, header: { color: colors.slate, fontSize: 17, fontWeight: "800", marginBottom: 20 }, search: { flexDirection: "row", alignItems: "center", gap: 9, height: 48, borderRadius: 12, borderColor: "#E5E8F0", borderWidth: 1, backgroundColor: "white", paddingHorizontal: 12, marginBottom: 20 }, input: { flex: 1, color: colors.slate, fontSize: 13 }, card: { backgroundColor: "white", borderRadius: 15, padding: 9, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 }, photo: { width: 78, height: 78, borderRadius: 11 }, fallback: { backgroundColor: "#14132B", justifyContent: "center", alignItems: "center" }, name: { color: colors.slate, fontWeight: "800", fontSize: 13 }, type: { color: colors.muted, fontSize: 11, marginTop: 5 }, price: { color: colors.indigo, fontWeight: "700", fontSize: 11, marginTop: 6 } });
