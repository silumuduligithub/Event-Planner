import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { eventApi } from "../api/endpoints";
import { apiError } from "../api/client";
import { Button, Field, formatDate, ui } from "../components/UI";
import { MainStackParams } from "../navigation/RootNavigator";
import { useAuth } from "../state/AuthContext";
import { colors } from "../theme";

const suggestions = ["Wedding", "Ring Ceremony", "Birthday", "Anniversary", "Corporate", "Concert", "Cultural"];
const initialDate = () => { const value = new Date(); value.setDate(value.getDate() + 7); value.setHours(12, 0, 0, 0); return value; };

export function PlanEventScreen({ navigation, route }: NativeStackScreenProps<MainStackParams, "PlanEvent">) {
  const { user } = useAuth();
  const [occasion, setOccasion] = useState(route.params?.occasion || "");
  const [title, setTitle] = useState("");
  const [city, setCity] = useState(user?.city || "");
  const [guests, setGuests] = useState("");
  const [date, setDate] = useState(initialDate);
  const [showDate, setShowDate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function continueToVendors() {
    const count = guests.trim() ? Number(guests) : 0;
    if (!occasion.trim() || !city.trim() || date.getTime() <= Date.now() || !Number.isInteger(count) || count < 0) {
      setError("Enter an occasion, city, future date, and valid guest count.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await eventApi.create({
        title: title.trim() || `${occasion.trim()} Event`,
        eventType: occasion.trim(),
        eventDate: date.toISOString(),
        location: { city: city.trim() },
        estimatedGuests: count,
        totalBudget: 0,
      });
      navigation.replace("VendorListing", { occasion: occasion.trim(), eventId: response.data.data._id, city: city.trim(), intent: "full_event_package" });
    } catch (cause) { setError(apiError(cause)); }
    finally { setSaving(false); }
  }

  return <SafeAreaView style={ui.page} edges={["bottom"]}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
    <Text style={styles.title}>What are you planning?</Text>
    <Text style={styles.subtitle}>Choose a suggestion or name any occasion. You can book only the services you need.</Text>
    <View style={styles.chips}>{suggestions.map((value) => <Pressable key={value} onPress={() => setOccasion(value)} accessibilityRole="button" accessibilityState={{ selected: occasion === value }} style={[styles.chip, occasion === value && styles.chipActive]}><Text style={[styles.chipText, occasion === value && styles.chipTextActive]}>{value}</Text></Pressable>)}</View>
    <Field label="Occasion" value={occasion} onChangeText={setOccasion} maxLength={100} placeholder="e.g. Housewarming or school function" />
    <Field label="Event name (optional)" value={title} onChangeText={setTitle} placeholder="Give your event a name" />
    <Field label="City" value={city} onChangeText={setCity} placeholder="Where will it happen?" />
    <Field label="Guests (optional)" value={guests} onChangeText={setGuests} keyboardType="number-pad" placeholder="Approximate guest count" />
    <Text style={styles.label}>Event date</Text>
    <Pressable onPress={() => setShowDate(true)} style={styles.dateButton}><Text style={styles.dateText}>{formatDate(date)}</Text></Pressable>
    {showDate ? <View><DateTimePicker value={date} minimumDate={new Date()} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(_, value) => { if (Platform.OS !== "ios") setShowDate(false); if (value) setDate(value); }} />{Platform.OS === "ios" ? <Pressable onPress={() => setShowDate(false)} style={styles.done}><Text style={styles.doneText}>Done</Text></Pressable> : null}</View> : null}
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <Text style={styles.note}>Next, choose one vendor and select services. You can add more vendors to this event later.</Text>
    <Button label="Find vendors" onPress={continueToVendors} loading={saving} />
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 }, title: { color: colors.slate, fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginBottom: 20 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  chip: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 18, backgroundColor: "white", borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.indigo, borderColor: colors.indigo }, chipText: { color: colors.slate, fontWeight: "700" }, chipTextActive: { color: "white" },
  label: { color: colors.slate, fontWeight: "700", marginBottom: 8 }, dateButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 15, backgroundColor: "white", marginBottom: 14 },
  dateText: { color: colors.slate }, done: { alignSelf: "flex-end", padding: 10 }, doneText: { color: colors.indigo, fontWeight: "700" },
  error: { color: "#B42318", marginBottom: 12 }, note: { color: colors.muted, lineHeight: 19, marginBottom: 18 },
});
