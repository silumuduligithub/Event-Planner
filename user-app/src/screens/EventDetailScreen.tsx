import React, { useCallback, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { bookingApi, eventApi } from "../api/endpoints";
import { apiError } from "../api/client";
import { Message, Skeleton, formatDate, formatMoney } from "../components/UI";
import { MainStackParams } from "../navigation/RootNavigator";
import { colors } from "../theme";
import type { Booking, Event } from "../types";

export function EventDetailScreen({ route, navigation }: NativeStackScreenProps<MainStackParams, "EventDetail">) {
  const [event, setEvent] = useState<Event | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useFocusEffect(useCallback(() => {
    void refresh;
    let active = true;
    Promise.all([eventApi.detail(route.params.eventId), bookingApi.list()])
      .then(([eventResponse, bookingsResponse]) => { if (active) { setEvent(eventResponse.data.data); setBookings(bookingsResponse.data.data.filter((booking) => booking.eventId === route.params.eventId)); setError(""); } })
      .catch((cause) => { if (active) setError(apiError(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [route.params.eventId, refresh]));
  async function addItem() {
    if (!title.trim() || !event || busy) return;
    setBusy(true);
    try { const response = await eventApi.addChecklistItem(event._id, title.trim()); setEvent(response.data.data); setTitle(""); } catch (cause) { Alert.alert("Could not add task", apiError(cause)); } finally { setBusy(false); }
  }
  async function toggleItem(itemId: string, completed: boolean) {
    if (!event || busy) return;
    setBusy(true);
    try { const response = await eventApi.updateChecklistItem(event._id, itemId, { completed: !completed }); setEvent(response.data.data); } catch (cause) { Alert.alert("Could not update task", apiError(cause)); } finally { setBusy(false); }
  }
  function confirmRemove(itemId: string) {
    Alert.alert("Remove task?", "This task will be removed from your event checklist.", [{ text: "Keep", style: "cancel" }, { text: "Remove", style: "destructive", onPress: async () => { if (!event) return; try { const response = await eventApi.removeChecklistItem(event._id, itemId); setEvent(response.data.data); } catch (cause) { Alert.alert("Could not remove task", apiError(cause)); } } }]);
  }
  const committed = bookings.filter((booking) => !["cancelled", "rejected"].includes(booking.status));
  const spent = committed.reduce((total, booking) => total + booking.totalAmount, 0);
  const progress = event?.totalBudget ? Math.min(spent / event.totalBudget, 1) : 0;
  return <SafeAreaView style={styles.page} edges={["bottom"]}><ScrollView contentContainerStyle={styles.content}>
    {loading ? <><Skeleton height={205} /><Skeleton height={140} /></> : error || !event ? <Message text={error || "Event unavailable"} retry={() => { setLoading(true); setRefresh((value) => value + 1); }} /> : <>
      <View style={styles.hero}><Image source={require("../../assets/onboarding/wedding-hero-v2.png")} style={styles.heroImage} resizeMode="cover" /><View style={styles.heroShade} /><View style={styles.heroText}><Text style={styles.heroTitle}>{event.title}</Text><Text style={styles.heroMeta}>{formatDate(event.eventDate)} · {event.location.city}</Text></View></View>
      <View style={styles.budget}><View style={styles.budgetTop}><Text style={styles.section}>Requested estimates</Text><Text style={styles.percent}>{event.totalBudget ? `${Math.round(progress * 100)}% of budget` : ""}</Text></View><Text style={styles.budgetAmount}>{formatMoney(spent)} <Text style={styles.budgetLimit}>{event.totalBudget ? `/ ${formatMoney(event.totalBudget)}` : ""}</Text></Text><View style={styles.track}><View style={[styles.fill, { width: `${progress * 100}%` }]} /></View><Text style={styles.note}>Sum of active booking requests. Vendors may not have accepted yet; no payment is collected here.</Text></View>
      <View style={styles.sectionRow}><Text style={styles.section}>Event Checklist</Text><Text style={styles.count}>{event.checklist?.filter((item) => item.completed).length || 0}/{event.checklist?.length || 0} done</Text></View>
      <View style={styles.addRow}><TextInput value={title} onChangeText={setTitle} placeholder="Add a task" placeholderTextColor="#94A3B8" style={styles.addInput} onSubmitEditing={addItem} returnKeyType="done" /><Pressable onPress={addItem} disabled={busy || !title.trim()} style={styles.addButton}><Ionicons name="add" size={22} color="white" /></Pressable></View>
      {(event.checklist || []).length ? event.checklist.map((item) => <View key={item._id} style={styles.task}><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: item.completed }} onPress={() => toggleItem(item._id, item.completed)}><Ionicons name={item.completed ? "checkmark-circle" : "ellipse-outline"} size={21} color={item.completed ? "#17A66C" : colors.gold} /></Pressable><Text style={[styles.taskText, item.completed && styles.done]}>{item.title}</Text><Pressable onPress={() => confirmRemove(item._id)} accessibilityLabel={`Remove ${item.title}`}><Ionicons name="close" size={18} color={colors.muted} /></Pressable></View>) : <Text style={styles.empty}>No tasks yet. Add the first step for this event.</Text>}
      <Text style={[styles.section, { marginTop: 22, marginBottom: 12 }]}>Bookings for this event</Text>
      <Pressable onPress={() => navigation.navigate("VendorListing", { occasion: event.eventType, eventId: event._id, city: event.location.city, intent: "full_event_package" })} style={styles.addVendor}><Text style={styles.addVendorText}>Add a vendor or service</Text></Pressable>
      {bookings.length ? bookings.map((booking) => <Pressable key={booking._id} onPress={() => navigation.navigate("BookingDetail", { bookingId: booking._id })} style={styles.booking}><Ionicons name="receipt-outline" size={19} color={colors.indigo} /><View style={{ flex: 1 }}><Text style={styles.bookingName}>{typeof booking.vendorId === "string" ? "Vendor" : booking.vendorId.businessName}</Text><Text style={styles.bookingMeta}>{booking.status.replace(/_/g, " ")}</Text></View><Text style={styles.bookingPrice}>{formatMoney(booking.totalAmount)}</Text></Pressable>) : <Text style={styles.empty}>No bookings are linked to this event yet.</Text>}
    </>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#FCFBFA" }, content: { padding: 17, paddingBottom: 35 }, hero: { height: 200, borderRadius: 15, overflow: "hidden", justifyContent: "flex-end", marginBottom: 15 }, heroImage: { position: "absolute", width: "100%", height: "100%" }, heroShade: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(10,7,20,.34)" }, heroText: { padding: 17 }, heroTitle: { color: "white", fontWeight: "800", fontSize: 24 }, heroMeta: { color: "white", fontSize: 12, marginTop: 6 }, budget: { backgroundColor: "white", borderRadius: 14, padding: 16, marginBottom: 20 }, budgetTop: { flexDirection: "row", justifyContent: "space-between" }, section: { color: colors.slate, fontWeight: "800", fontSize: 14 }, percent: { color: colors.indigo, fontWeight: "800", fontSize: 13 }, budgetAmount: { color: colors.slate, fontWeight: "800", fontSize: 14, marginTop: 8 }, budgetLimit: { color: colors.muted, fontWeight: "400" }, track: { height: 6, borderRadius: 3, backgroundColor: "#E8EAF0", marginTop: 10, overflow: "hidden" }, fill: { height: "100%", backgroundColor: "#F2AD3E" }, note: { color: colors.muted, fontSize: 10, marginTop: 8 }, sectionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }, count: { color: colors.muted, fontSize: 11 }, addRow: { flexDirection: "row", gap: 8, marginBottom: 12 }, addInput: { flex: 1, backgroundColor: "white", borderWidth: 1, borderColor: "#E3E7EF", borderRadius: 10, paddingHorizontal: 12, height: 42, color: colors.slate }, addButton: { width: 42, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.indigo }, addVendor: { backgroundColor: colors.indigo, padding: 13, borderRadius: 11, alignItems: "center", marginBottom: 12 }, addVendorText: { color: "white", fontWeight: "800" }, task: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "white", paddingHorizontal: 12, minHeight: 44, borderRadius: 10, marginBottom: 6 }, taskText: { flex: 1, color: colors.slate, fontSize: 12 }, done: { textDecorationLine: "line-through", color: colors.muted }, empty: { color: colors.muted, fontSize: 12, marginVertical: 12 }, booking: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "white", padding: 12, borderRadius: 11, marginBottom: 7 }, bookingName: { color: colors.slate, fontWeight: "700", fontSize: 12 }, bookingMeta: { color: colors.muted, fontSize: 10, marginTop: 3, textTransform: "capitalize" }, bookingPrice: { color: colors.slate, fontWeight: "800", fontSize: 12 } });
