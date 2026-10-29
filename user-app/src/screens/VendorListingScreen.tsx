import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MainStackParams } from "../navigation/RootNavigator";
import { vendorApi } from "../api/endpoints";
import { apiError } from "../api/client";
import { Message, Skeleton, formatMoney } from "../components/UI";
import { useSavedVendors } from "../hooks/useSavedVendors";
import { colors } from "../theme";
import type { Vendor } from "../types";

const filters = [
  { title: "All", value: "" }, { title: "Event Planners", value: "Event Planner" },
  { title: "Catering", value: "Catering" }, { title: "Photography", value: "Photography" },
  { title: "Orchestra", value: "Orchestra & Melody" }, { title: "Decoration", value: "Decoration" },
];
type Sort = "top" | "priceLow" | "priceHigh";
export function VendorListingScreen({ route, navigation }: NativeStackScreenProps<MainStackParams, "VendorListing">) {
  const searchRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const [category, setCategory] = useState(route.params?.category || "");
  const [query, setQuery] = useState(route.params?.search || "");
  const [city, setCity] = useState(route.params?.city || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [draftCity, setDraftCity] = useState(route.params?.city || "");
  const [draftMin, setDraftMin] = useState("");
  const [draftMax, setDraftMax] = useState("");
  const [sort, setSort] = useState<Sort>("top");
  const [sheet, setSheet] = useState<"sort" | "filters" | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [matchedOccasion, setMatchedOccasion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const { savedIds, toggle, savedError } = useSavedVendors();
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => vendorApi.list({ category: category || undefined, occasion: route.params?.occasion, search: query.trim() || undefined, city: city.trim() || undefined, minPrice: minPrice ? Number(minPrice) : undefined, maxPrice: maxPrice ? Number(maxPrice) : undefined })
      .then(({ data }) => { if (active) { setVendors(data.data.vendors); setMatchedOccasion(data.data.matchedOccasion); setError(""); } })
      .catch((cause) => { if (active) setError(apiError(cause)); })
      .finally(() => { if (active) setLoading(false); }), 250);
    return () => { active = false; clearTimeout(timer); };
  }, [category, query, city, minPrice, maxPrice, refresh, route.params?.occasion]);
  const sorted = useMemo(() => [...vendors].sort((a, b) => sort === "priceLow" ? a.startingPrice - b.startingPrice : sort === "priceHigh" ? b.startingPrice - a.startingPrice : route.params.occasion || matchedOccasion ? 0 : b.rating - a.rating), [vendors, sort, route.params.occasion, matchedOccasion]);
  function applyFilters() {
    const min = draftMin.trim() ? Number(draftMin) : 0;
    const max = draftMax.trim() ? Number(draftMax) : 0;
    if (!Number.isFinite(min) || min < 0 || !Number.isFinite(max) || max < 0 || (draftMax.trim() && max < min)) return setFormError("Enter a valid price range.");
    setFormError(""); setLoading(true); setCity(draftCity.trim()); setMinPrice(draftMin.trim()); setMaxPrice(draftMax.trim()); setSheet(null);
  }
  return <SafeAreaView style={styles.page} edges={["top", "bottom"]}>
    <View style={styles.header}><Pressable onPress={() => navigation.goBack()} accessibilityLabel="Go back"><Ionicons name="arrow-back" size={23} color={colors.slate} /></Pressable><Text style={styles.headerTitle}>{filters.find((item) => item.value === category)?.title || "Vendors"}</Text><Pressable onPress={() => searchRef.current?.focus()} accessibilityLabel="Search vendors"><Ionicons name="search-outline" size={22} color={colors.slate} /></Pressable></View>
    <View style={styles.search}><Ionicons name="search-outline" size={17} color={colors.muted} /><TextInput ref={searchRef} value={query} onChangeText={(value) => { setLoading(true); setQuery(value); }} placeholder="Search vendors" placeholderTextColor="#9AA5B9" style={styles.input} /></View>
    {route.params?.occasion ? <Text style={styles.context}>For {route.params.occasion} · {city || "Any city"} · Choose any services you need</Text> : null}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters} style={{ height: 58, flexGrow: 0 }}>{filters.map((filter) => <Pressable key={filter.title} onPress={() => { setLoading(true); setCategory(filter.value); }} style={[styles.filter, category === filter.value && styles.filterActive]}><Text style={[styles.filterText, category === filter.value && styles.filterTextActive]}>{filter.title}</Text></Pressable>)}</ScrollView>
    <ScrollView contentContainerStyle={styles.list}>{savedError ? <Text style={styles.error}>{savedError}</Text> : null}{loading ? <><Skeleton height={114} /><Skeleton height={114} /><Skeleton height={114} /></> : error ? <Message text={error} retry={() => { setLoading(true); setRefresh((value) => value + 1); }} /> : sorted.length === 0 ? <Message text="No vendors found. Try a different city, price, or category." /> : sorted.map((vendor) => <View key={vendor._id} style={styles.card}><Pressable style={styles.vendorMain} onPress={() => navigation.navigate("VendorDetail", { vendorId: vendor._id, occasion: route.params?.occasion || matchedOccasion || undefined, eventId: route.params?.eventId, intent: route.params?.intent })}>{vendor.portfolioImages?.[0] ? <Image source={{ uri: vendor.portfolioImages[0] }} style={styles.photo} /> : <View style={[styles.photo, styles.fallback]}><Ionicons name="sparkles" size={27} color={colors.gold} /></View>}<View style={styles.details}><Text numberOfLines={1} style={styles.name}>{vendor.businessName}</Text><Text style={styles.city}>{vendor.address.city}</Text><Text style={styles.rating}>{vendor.reviewCount ? `★ ${vendor.rating.toFixed(1)} (${vendor.reviewCount})` : "New"}</Text><Text style={styles.price}>Starts at {formatMoney(vendor.startingPrice)}</Text></View></Pressable><Pressable onPress={() => toggle(vendor._id)} accessibilityLabel={savedIds.has(vendor._id) ? "Remove saved vendor" : "Save vendor"}><Ionicons name={savedIds.has(vendor._id) ? "heart" : "heart-outline"} size={20} color={colors.indigo} /></Pressable></View>)}</ScrollView>
    <View style={styles.bottom}><Pressable onPress={() => setSheet("sort")} style={styles.bottomButton}><Ionicons name="options-outline" size={16} color={colors.slate} /><Text style={styles.bottomText}>Sort</Text></Pressable><Pressable onPress={() => { setDraftCity(city); setDraftMin(minPrice); setDraftMax(maxPrice); setSheet("filters"); }} style={styles.bottomButton}><Ionicons name="filter-outline" size={16} color={colors.slate} /><Text style={styles.bottomText}>Filters</Text></Pressable></View>
    <Modal visible={sheet !== null} transparent animationType="slide" onRequestClose={() => setSheet(null)}><View style={styles.overlay}><Pressable style={{ flex: 1 }} onPress={() => setSheet(null)} /><SafeAreaView style={styles.sheet} edges={["bottom"]}><View style={styles.sheetHeader}><Text style={styles.sheetTitle}>{sheet === "sort" ? "Sort vendors" : "Filter vendors"}</Text><Pressable onPress={() => setSheet(null)}><Ionicons name="close" size={22} color={colors.slate} /></Pressable></View>{sheet === "sort" ? ([{ label: "Top rated", value: "top" }, { label: "Price: low to high", value: "priceLow" }, { label: "Price: high to low", value: "priceHigh" }] as const).map((item) => <Pressable key={item.value} onPress={() => { setSort(item.value); setSheet(null); }} style={styles.option}><Text style={styles.optionText}>{item.label}</Text><Ionicons name={sort === item.value ? "radio-button-on" : "radio-button-off"} size={19} color={colors.indigo} /></Pressable>) : <><Text style={styles.fieldLabel}>City</Text><TextInput value={draftCity} onChangeText={setDraftCity} placeholder="Any city" style={styles.field} /><Text style={styles.fieldLabel}>Minimum price (₹)</Text><TextInput value={draftMin} onChangeText={setDraftMin} keyboardType="number-pad" placeholder="0" style={styles.field} /><Text style={styles.fieldLabel}>Maximum price (₹)</Text><TextInput value={draftMax} onChangeText={setDraftMax} keyboardType="number-pad" placeholder="Any" style={styles.field} />{formError ? <Text style={styles.error}>{formError}</Text> : null}<Pressable onPress={applyFilters} style={styles.apply}><Text style={styles.applyText}>Show vendors</Text></Pressable></>}</SafeAreaView></View></Modal>
  </SafeAreaView>;
}
const styles = StyleSheet.create({ context: { color: colors.indigo, fontWeight: "700", fontSize: 12, marginHorizontal: 20, marginBottom: 12 }, page: { flex: 1, backgroundColor: "#FCFBFA" }, header: { height: 55, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, headerTitle: { color: colors.slate, fontWeight: "800", fontSize: 15 }, search: { height: 42, marginHorizontal: 20, marginBottom: 13, paddingHorizontal: 12, borderRadius: 12, backgroundColor: "white", borderWidth: 1, borderColor: "#E9EAF0", flexDirection: "row", alignItems: "center", gap: 8 }, input: { flex: 1, fontSize: 13, color: colors.slate }, filters: { paddingHorizontal: 20, gap: 7, alignItems: "center" }, filter: { height: 36, paddingHorizontal: 13, borderRadius: 18, backgroundColor: "#F2F2F5", justifyContent: "center" }, filterActive: { backgroundColor: colors.indigo }, filterText: { color: colors.slate, fontSize: 12, lineHeight: 17 }, filterTextActive: { color: "white" }, list: { paddingHorizontal: 20, paddingBottom: 30 }, card: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "white", padding: 9, marginBottom: 12, borderRadius: 16, gap: 10, shadowColor: "#0F172A", shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 }, vendorMain: { flex: 1, flexDirection: "row", gap: 10 }, photo: { width: 94, height: 94, borderRadius: 12 }, fallback: { backgroundColor: "#1A1633", alignItems: "center", justifyContent: "center" }, details: { flex: 1, paddingTop: 2 }, name: { color: colors.slate, fontSize: 13, fontWeight: "800" }, city: { color: colors.muted, fontSize: 11, marginTop: 3 }, rating: { color: "#C88513", fontSize: 11, marginTop: 5, fontWeight: "700" }, price: { color: colors.slate, fontSize: 11, fontWeight: "700", marginTop: 6 }, error: { color: "#A92F2F", fontSize: 12, marginBottom: 8 }, bottom: { flexDirection: "row", gap: 8, paddingHorizontal: 18, paddingVertical: 8, backgroundColor: "white" }, bottomButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: "#F2F2F7", padding: 11, borderRadius: 11 }, bottomText: { fontWeight: "800", color: colors.slate, fontSize: 12 }, overlay: { flex: 1, backgroundColor: "rgba(5,7,20,.35)" }, sheet: { backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }, sheetHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 }, sheetTitle: { color: colors.slate, fontSize: 17, fontWeight: "800" }, option: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 15, borderBottomWidth: 1, borderColor: "#EFF0F4" }, optionText: { color: colors.slate, fontSize: 13 }, fieldLabel: { color: colors.slate, fontSize: 12, fontWeight: "700", marginBottom: 6 }, field: { borderWidth: 1, borderColor: "#E2E6EE", borderRadius: 10, height: 42, paddingHorizontal: 10, color: colors.slate, marginBottom: 14 }, apply: { backgroundColor: colors.indigo, alignItems: "center", padding: 13, borderRadius: 12 }, applyText: { color: "white", fontWeight: "800", fontSize: 13 } });
