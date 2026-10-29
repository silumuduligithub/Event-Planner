import React, { useCallback, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { bookingApi, vendorApi } from "../api/endpoints";
import { apiError } from "../api/client";
import { Button, Message, Skeleton, formatDate, formatMoney } from "../components/UI";
import { MainStackParams } from "../navigation/RootNavigator";
import { colors } from "../theme";
import type { Booking } from "../types";
import { ServiceRequirementsView } from '../components/ServiceDetailsSheet';

export function BookingDetailScreen({ route, navigation }: NativeStackScreenProps<MainStackParams, "BookingDetail">) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewed, setReviewed] = useState(false);
  useFocusEffect(useCallback(() => {
    void refresh;
    let active = true;
    bookingApi.detail(route.params.bookingId).then(({ data }) => { if (active) { setBooking(data.data); setError(""); } }).catch((cause) => { if (active) setError(apiError(cause)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [route.params.bookingId, refresh]));
  const vendor = booking && typeof booking.vendorId !== "string" ? booking.vendorId : null;
  async function contact() {
    if (!vendor?.phone) return Alert.alert("Contact unavailable", "This vendor has not added a phone number.");
    const url = `tel:${vendor.phone.replace(/[^\d+]/g, "")}`;
    try { await Linking.openURL(url); } catch { Alert.alert("Could not open phone", "Please try again from your device."); }
  }
  function confirmCancel() {
    if (!booking) return;
    Alert.alert("Cancel booking request?", "The vendor will see this request as cancelled.", [{ text: "Keep booking", style: "cancel" }, { text: "Cancel request", style: "destructive", onPress: async () => { setBusy(true); try { await bookingApi.cancel(booking._id); setRefresh((value) => value + 1); } catch (cause) { Alert.alert("Could not cancel", apiError(cause)); } finally { setBusy(false); } } }]);
  }
  async function sendReview() {
    if (!booking || !vendor || rating < 1) return Alert.alert("Choose a rating", "Select one to five stars before submitting.");
    setBusy(true);
    try { await vendorApi.addReview(vendor._id, { bookingId: booking._id, rating, comment: comment.trim() || undefined }); setReviewed(true); Alert.alert("Review shared", "Thank you for reviewing this vendor."); } catch (cause) { Alert.alert("Could not submit review", apiError(cause)); } finally { setBusy(false); }
  }
  return <SafeAreaView style={styles.page} edges={["bottom"]}><ScrollView contentContainerStyle={styles.content}>
    {loading ? <><Skeleton height={110} /><Skeleton height={160} /></> : error || !booking ? <Message text={error || "Booking unavailable"} retry={() => { setLoading(true); setRefresh((value) => value + 1); }} /> : <>
      <View style={styles.vendor}><View style={styles.vendorIcon}><Ionicons name="sparkles" size={24} color={colors.gold} /></View><View style={{ flex: 1 }}><Text style={styles.vendorName}>{vendor?.businessName || "Vendor"}</Text><Text style={styles.vendorType}>{vendor?.vendorType || "Event service"}</Text></View><Pressable onPress={() => vendor && navigation.navigate("VendorDetail", { vendorId: vendor._id })} disabled={!vendor}><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable></View>
      <View style={styles.statusRow}><Text style={styles.label}>Booking status</Text><Text style={styles.status}>{booking.status.replace(/_/g, " ")}</Text></View>
      <View style={styles.card}><Text style={styles.section}>Event Details</Text>{booking.occasion ? <Text style={styles.value}>{booking.occasion}</Text> : null}<Text style={styles.value}><Ionicons name="calendar-outline" size={14} />  {formatDate(booking.eventDate)}</Text><Text style={styles.value}><Ionicons name="location-outline" size={14} />  {booking.eventLocation.city}{booking.eventLocation.address ? `, ${booking.eventLocation.address}` : ""}</Text><Text style={styles.value}>{booking.bookingType.replace(/_/g, " ")}</Text></View>
      <View style={styles.card}><Text style={styles.section}>Price Breakdown</Text>{booking.selectedServices.map((item) => <View key={item.serviceId} style={{ marginBottom: 12 }}><View style={styles.priceRow}><Text style={styles.priceLabel}>{item.name} × {item.quantity}</Text><Text style={styles.priceValue}>{formatMoney(item.totalPrice)}</Text></View><ServiceRequirementsView requirements={item.requirements} /></View>)}{booking.selectedCelebrities.map((item) => <View key={item.artistId} style={{ marginBottom: 12 }}><View style={styles.priceRow}><Text style={styles.priceLabel}>{item.name}</Text><Text style={styles.priceValue}>{formatMoney(item.price)}</Text></View><ServiceRequirementsView requirements={item.requirements} /></View>)}<View style={styles.rule} /><View style={styles.priceRow}><Text style={styles.priceLabel}>Subtotal</Text><Text style={styles.priceValue}>{formatMoney(booking.subtotal)}</Text></View><View style={styles.priceRow}><Text style={styles.priceLabel}>Taxes</Text><Text style={styles.priceValue}>{formatMoney(booking.taxAmount)}</Text></View><View style={styles.priceRow}><Text style={styles.priceLabel}>Advance requested</Text><Text style={styles.priceValue}>{formatMoney(booking.advanceAmount)}</Text></View><View style={styles.rule} /><View style={styles.priceRow}><Text style={styles.total}>Grand total</Text><Text style={styles.total}>{formatMoney(booking.totalAmount)}</Text></View><Text style={styles.note}>No payment was collected in the app.</Text></View>
      {booking.userNotes ? <View style={styles.card}><Text style={styles.section}>Your notes</Text><Text style={styles.value}>{booking.userNotes}</Text></View> : null}
      {vendor?.phone ? <Button label="Call vendor" onPress={contact} secondary /> : null}
      {["estimate_requested", "pending", "accepted"].includes(booking.status) ? <Pressable disabled={busy} onPress={confirmCancel} style={styles.cancel}><Text style={styles.cancelText}>Cancel booking request</Text></Pressable> : null}
      {booking.status === "completed" && !reviewed && vendor ? <View style={styles.card}><Text style={styles.section}>Review your experience</Text><View style={styles.stars}>{[1, 2, 3, 4, 5].map((value) => <Pressable key={value} onPress={() => setRating(value)} accessibilityLabel={`Rate ${value} stars`}><Ionicons name={value <= rating ? "star" : "star-outline"} size={31} color="#E9A82C" /></Pressable>)}</View><TextInput value={comment} onChangeText={setComment} placeholder="Share your experience (optional)" placeholderTextColor="#9AA5B9" multiline style={styles.comment} /><Button label="Submit review" onPress={sendReview} loading={busy} /></View> : null}
    </>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#FCFBFA" }, content: { padding: 18, paddingBottom: 36 }, vendor: { backgroundColor: "white", padding: 12, borderRadius: 15, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 13 }, vendorIcon: { width: 51, height: 51, borderRadius: 11, backgroundColor: colors.indigoDark, justifyContent: "center", alignItems: "center" }, vendorName: { color: colors.slate, fontSize: 14, fontWeight: "800" }, vendorType: { color: colors.muted, fontSize: 11, marginTop: 4 }, statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }, label: { color: colors.muted, fontSize: 12 }, status: { color: colors.indigo, backgroundColor: colors.paleIndigo, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, fontSize: 11, fontWeight: "800", textTransform: "capitalize" }, card: { backgroundColor: "white", borderRadius: 15, padding: 15, marginBottom: 14 }, section: { color: colors.slate, fontSize: 14, fontWeight: "800", marginBottom: 13 }, value: { color: colors.slate, fontSize: 12, marginBottom: 9, textTransform: "capitalize" }, priceRow: { flexDirection: "row", justifyContent: "space-between", gap: 15, marginBottom: 9 }, priceLabel: { color: colors.muted, fontSize: 12, flex: 1 }, priceValue: { color: colors.slate, fontSize: 12, fontWeight: "700" }, rule: { borderTopWidth: 1, borderColor: "#E8EAF0", marginVertical: 6 }, total: { color: colors.slate, fontSize: 16, fontWeight: "800" }, note: { color: colors.muted, fontSize: 10, marginTop: 8 }, cancel: { alignItems: "center", padding: 13 }, cancelText: { color: "#C53939", fontSize: 12, fontWeight: "700" }, stars: { flexDirection: "row", gap: 7, marginBottom: 12 }, comment: { minHeight: 75, borderWidth: 1, borderColor: "#E4E7EF", borderRadius: 10, padding: 10, marginBottom: 14, color: colors.slate, textAlignVertical: "top" } });
