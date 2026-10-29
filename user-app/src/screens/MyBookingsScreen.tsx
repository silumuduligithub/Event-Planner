import React, { useCallback, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackParams } from "../navigation/RootNavigator";
import { Ionicons } from "@expo/vector-icons";
import { bookingApi } from "../api/endpoints";
import { apiError } from "../api/client";
import {
  Card,
  Message,
  Skeleton,
  formatDate,
  formatMoney,
  ui,
} from "../components/UI";
import { colors } from "../theme";
import type { Booking } from "../types";

const pastStatuses = new Set(["completed", "cancelled", "rejected"]);
const statusColors: Record<string, { text: string; background: string }> = {
  estimate_requested: { text: "#92400E", background: "#FEF3C7" },
  pending: { text: "#92400E", background: "#FEF3C7" },
  accepted: { text: colors.indigo, background: colors.paleIndigo },
  in_progress: { text: colors.indigo, background: colors.paleIndigo },
  completed: { text: colors.success, background: "#D1FAE5" },
  cancelled: { text: colors.muted, background: "#F1F5F9" },
  rejected: { text: colors.danger, background: "#FEE2E2" },
};

export function MyBookingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"Active" | "Past">("Active");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError("");
      bookingApi
        .list()
        .then((response) => {
          if (active) setBookings(response.data.data);
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
  const visible = bookings.filter((booking) =>
    tab === "Past"
      ? pastStatuses.has(booking.status)
      : !pastStatuses.has(booking.status),
  );
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
        <Text style={styles.header}>My Bookings</Text>
        <View style={styles.tabs}>
          {(["Active", "Past"] as const).map((name) => (
            <Pressable
              key={name}
              onPress={() => setTab(name)}
              style={[styles.tab, tab === name && styles.activeTab]}
            >
              <Text
                style={[styles.tabText, tab === name && styles.activeTabText]}
              >
                {name}
              </Text>
            </Pressable>
          ))}
        </View>
        {loading ? (
          <>
            <Skeleton height={160} />
            <Skeleton height={160} />
          </>
        ) : error ? (
          <Message text={error} retry={() => setRefresh((n) => n + 1)} />
        ) : visible.length === 0 ? (
          <Message
            text={
              tab === "Active"
                ? "No active bookings yet. Explore vendors to get started."
                : "Your past bookings will appear here."
            }
          />
        ) : (
          visible.map((booking) => {
            const vendorName =
              typeof booking.vendorId === "string"
                ? "Vendor"
                : booking.vendorId?.businessName || "Vendor";
            const status = statusColors[booking.status] || statusColors.pending;
            return (
              <Pressable key={booking._id} onPress={() => navigation.navigate("BookingDetail", { bookingId: booking._id })}>
              <Card>
                <View style={styles.cardTop}>
                  {typeof booking.vendorId !== "string" && booking.vendorId.portfolioImages?.[0] ? <Image source={{ uri: booking.vendorId.portfolioImages[0] }} style={styles.bookingImage} /> : <View style={styles.iconBox}><Ionicons name={booking.bookingType === "orchestra_celebrity" ? "musical-notes" : "sparkles"} color={colors.indigo} size={20} /></View>}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vendorName}>{vendorName}</Text>
                    <Text style={styles.bookingMeta}>
                      {formatDate(booking.eventDate)} ·{" "}
                      {booking.eventLocation.city}
                    </Text>
                  </View>
                </View>
                <View style={styles.line} />
                <View style={styles.cardBottom}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.amountLabel}>ESTIMATED TOTAL</Text>
                    <Text style={styles.amount}>
                      {formatMoney(booking.totalAmount)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.status,
                      { backgroundColor: status.background },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: status.text }]}>
                      {booking.status.replace(/_/g, " ")}
                    </Text>
                  </View>
                </View>
                <Text style={[ui.muted, { marginTop: 12 }]}>Advance requested: {formatMoney(booking.advanceAmount)}</Text>
              </Card>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  header: { color: colors.slate, fontSize: 16, fontWeight: "800", marginBottom: 22 },
  bookingImage: { width: 53, height: 53, borderRadius: 11 },
  bookingMeta: { color: colors.muted, fontSize: 11, marginTop: 5 },
  eyebrow: {
    color: colors.indigo,
    fontWeight: "800",
    letterSpacing: 1.7,
    fontSize: 11,
    marginBottom: 9,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#EDEFF5",
    borderRadius: 16,
    padding: 4,
    marginBottom: 21,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 13 },
  activeTab: { backgroundColor: colors.indigo },
  tabText: { fontWeight: "800", color: colors.muted, fontSize: 13 },
  activeTabText: { color: colors.white },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.paleIndigo,
    alignItems: "center",
    justifyContent: "center",
  },
  vendorName: {
    color: colors.slate,
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 4,
  },
  line: { borderTopWidth: 1, borderColor: colors.border, marginVertical: 17 },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountLabel: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 1,
  },
  amount: {
    color: colors.slate,
    fontSize: 19,
    fontWeight: "800",
    marginTop: 4,
  },
  status: { borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7 },
  statusText: { fontSize: 11, fontWeight: "800", textTransform: "capitalize" },
});
