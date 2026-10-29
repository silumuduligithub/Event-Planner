import React, { useCallback, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackParams } from "../navigation/RootNavigator";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { eventApi } from "../api/endpoints";
import { apiError } from "../api/client";
import {
  Button,
  Card,
  Field,
  Message,
  Skeleton,
  formatDate,
  formatMoney,
  ui,
} from "../components/UI";
import { colors } from "../theme";
import type { Event } from "../types";

const types = [
  "Wedding",
  "Ring Ceremony",
  "Birthday",
  "Corporate",
  "Anniversary",
  "Concert",
  "Cultural",
];
const initialDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(12, 0, 0, 0);
  return date;
};

export function EventsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("Wedding");
  const [city, setCity] = useState("");
  const [date, setDate] = useState(initialDate);
  const [showDate, setShowDate] = useState(false);
  const [budget, setBudget] = useState("");
  const [guests, setGuests] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError("");
      eventApi
        .list()
        .then((response) => {
          if (active) setEvents(response.data.data);
        })
        .catch((cause) => {
          if (active) setError(apiError(cause));
        })
        .finally(() => {
          if (active) {
            setLoading(false);
            setRefreshing(false);
          }
        });
      return () => {
        active = false;
      };
      // Retry changes refresh so the focused screen loads again.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh]),
  );
  async function create() {
    const amount = budget.trim() ? Number(budget) : 0;
    const people = guests.trim() ? Number(guests) : 0;
    if (
      !title.trim() ||
      !eventType.trim() ||
      !city.trim() ||
      date.getTime() <= Date.now() ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      !Number.isInteger(people) ||
      people < 0
    ) {
      setFormError(
        "Add a title, city, future date, and valid budget and guest count.",
      );
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await eventApi.create({
        title: title.trim(),
        eventType: eventType.trim(),
        eventDate: date.toISOString(),
        location: { city: city.trim() },
        totalBudget: amount,
        estimatedGuests: people,
      });
      setModal(false);
      setTitle("");
      setCity("");
      setBudget("");
      setGuests("");
      setDate(initialDate());
      setRefresh((n) => n + 1);
    } catch (cause) {
      setFormError(apiError(cause));
    } finally {
      setSaving(false);
    }
  }
  return (
    <SafeAreaView style={ui.page} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[ui.content, { paddingTop: 22 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.indigo}
            onRefresh={() => {
              setRefreshing(true);
              setRefresh((n) => n + 1);
            }}
          />
        }
      >
        <View style={styles.headerRow}><Text style={styles.headerTitle}>My Events</Text><Pressable onPress={() => setModal(true)} style={styles.createButton}><Ionicons name="add" color="white" size={16} /><Text style={styles.createText}>Create Event</Text></Pressable></View>
        {events.slice(0, 1).map((event) => <View key={event._id} style={styles.featured}><Image source={require("../../assets/onboarding/wedding-hero-v2.png")} style={StyleSheet.absoluteFill} resizeMode="cover" /><View style={styles.featuredShade} /><View style={styles.featuredText}><Text style={styles.countdown}>{event.title}</Text><Text style={styles.featuredDetail}><Ionicons name="calendar-outline" size={12} />  {formatDate(event.eventDate)}</Text><Text style={styles.featuredDetail}><Ionicons name="location-outline" size={12} />  {event.location.city}</Text></View></View>)}
        <Text style={styles.listTitle}>Your Plans</Text>
        {loading ? (
          <>
            <Skeleton height={140} />
            <Skeleton height={140} />
          </>
        ) : error ? (
          <Message text={error} retry={() => setRefresh((n) => n + 1)} />
        ) : !events.length ? (
          <Message text="No events yet. Create one to keep your plans together." />
        ) : (
          events.map((event) => (
            <Pressable key={event._id} onPress={() => navigation.navigate("EventDetail", { eventId: event._id })}>
            <Card>
              <View style={styles.eventTop}>
                <View style={styles.eventIcon}>
                  <Ionicons
                    name={
                      event.eventType === "Concert"
                        ? "musical-notes"
                        : "calendar"
                    }
                    color={colors.indigo}
                    size={23}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={ui.muted}>
                    {event.eventType} · {event.location.city}
                  </Text>
                </View>
                <Text style={styles.status}>{event.status}</Text>
              </View>
              <View style={styles.eventBottom}>
                <Text style={styles.detail}>{formatDate(event.eventDate)}</Text>
                <Text style={styles.detail}>
                  Budget {formatMoney(event.totalBudget)}
                </Text>
              </View>
            </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
      <Modal
        visible={modal}
        transparent
        animationType="slide"
        onRequestClose={() => setModal(false)}
      >
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.sheet}
          >
            <SafeAreaView edges={["bottom"]}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 12 }}
              >
                <View style={styles.sheetTop}>
                  <Text style={styles.sheetTitle}>Create an event</Text>
                  <Pressable
                    onPress={() => setModal(false)}
                    accessibilityLabel="Close"
                  >
                    <Ionicons name="close" size={24} color={colors.slate} />
                  </Pressable>
                </View>
                <Field
                  label="Event name"
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Your celebration"
                />
                <Text style={styles.fieldLabel}>Occasion</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, marginBottom: 18 }}
                >
                  {types.map((type) => (
                    <Pressable
                      key={type}
                      onPress={() => setEventType(type)}
                      style={[
                        styles.typePill,
                        eventType === type && styles.typePillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeText,
                          eventType === type && { color: colors.white },
                        ]}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Field label="Or enter any occasion" value={eventType} onChangeText={setEventType} placeholder="e.g. Housewarming" />
                <Pressable
                  onPress={() => setShowDate(true)}
                  style={styles.dateButton}
                >
                  <Ionicons
                    name="calendar-outline"
                    color={colors.indigo}
                    size={19}
                  />
                  <Text style={styles.dateText}>{formatDate(date)}</Text>
                </Pressable>
                {showDate ? (
                  <View>
                    <DateTimePicker
                      value={date}
                      minimumDate={new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(_, value) => {
                        if (Platform.OS !== "ios") setShowDate(false);
                        if (value) setDate(value);
                      }}
                    />
                    {Platform.OS === "ios" ? (
                      <Pressable
                        onPress={() => setShowDate(false)}
                        style={{ alignSelf: "flex-end", padding: 8 }}
                      >
                        <Text
                          style={{ color: colors.indigo, fontWeight: "800" }}
                        >
                          Done
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
                <Field
                  label="City"
                  value={city}
                  onChangeText={setCity}
                  placeholder="Event city"
                />
                <Field
                  label="Budget (₹)"
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="decimal-pad"
                  placeholder="Optional"
                />
                <Field
                  label="Expected guests"
                  value={guests}
                  onChangeText={setGuests}
                  keyboardType="number-pad"
                  placeholder="Optional"
                />
                {formError ? (
                  <Text style={styles.error}>{formError}</Text>
                ) : null}
                <Button
                  label="Create event"
                  onPress={create}
                  loading={saving}
                />
              </ScrollView>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  headerTitle: { color: colors.slate, fontWeight: "800", fontSize: 16 },
  createButton: { backgroundColor: colors.indigo, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 9, flexDirection: "row", alignItems: "center", gap: 4 },
  createText: { color: "white", fontSize: 11, fontWeight: "800" },
  featured: { height: 190, borderRadius: 16, overflow: "hidden", justifyContent: "flex-end", marginBottom: 22 },
  featuredShade: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(9,7,20,.35)" },
  featuredText: { padding: 17 }, countdown: { color: "white", fontWeight: "800", fontSize: 23, marginBottom: 6 },
  featuredDetail: { color: "white", fontSize: 11, marginTop: 2 },
  eyebrow: {
    color: colors.indigo,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.7,
    marginBottom: 9,
  },
  addCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    borderRadius: 22,
    padding: 17,
    backgroundColor: colors.paleIndigo,
    marginBottom: 27,
  },
  addIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.indigo,
    alignItems: "center",
    justifyContent: "center",
  },
  addTitle: {
    color: colors.slate,
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 4,
  },
  listTitle: {
    color: colors.slate,
    fontWeight: "800",
    fontSize: 20,
    marginBottom: 16,
  },
  eventTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  eventIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.paleIndigo,
    alignItems: "center",
    justifyContent: "center",
  },
  eventTitle: {
    color: colors.slate,
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 4,
  },
  status: {
    color: colors.indigo,
    fontWeight: "800",
    backgroundColor: colors.paleIndigo,
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 10,
    textTransform: "capitalize",
  },
  eventBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
    paddingTop: 14,
  },
  detail: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  overlay: {
    flex: 1,
    backgroundColor: "#0F172A88",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.soft,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    padding: 22,
  },
  sheetTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  sheetTitle: { color: colors.slate, fontSize: 23, fontWeight: "800" },
  fieldLabel: {
    color: colors.slate,
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 9,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typePillActive: {
    backgroundColor: colors.indigo,
    borderColor: colors.indigo,
  },
  typeText: { color: colors.slate, fontWeight: "700", fontSize: 12 },
  dateButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 15,
    marginBottom: 16,
  },
  dateText: { color: colors.slate, fontWeight: "700" },
  error: { color: colors.danger, fontSize: 13, marginBottom: 14 },
});
