import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { userApi, vendorApi } from "../api/endpoints";
import { apiError } from "../api/client";
import {
  Button,
  Card,
  Message,
  SectionTitle,
  Skeleton,
  formatMoney,
  ui,
} from "../components/UI";
import { MainStackParams } from "../navigation/RootNavigator";
import { colors } from "../theme";
import type { Review, Vendor } from "../types";

export function VendorDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParams, "VendorDetail">) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [saved, setSaved] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [section, setSection] = useState<"About" | "Services" | "Reviews" | "Gallery">("About");
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError("");
      vendorApi
        .detail(route.params.vendorId, route.params.occasion)
        .then((response) => {
          if (active) setVendor(response.data.data);
        })
        .catch((cause) => {
          if (active) setError(apiError(cause));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      userApi.saved().then(({ data }) => { if (active) setSaved(data.data.some((item) => item._id === route.params.vendorId)); }).catch(() => {});
      vendorApi.reviews(route.params.vendorId).then(({ data }) => { if (active) setReviews(data.data.reviews); }).catch(() => {});
      return () => {
        active = false;
      };
      // Retry changes refresh so the focused screen loads again.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.params.vendorId, route.params.occasion, refresh]),
  );
  async function toggleSaved() {
    if (!vendor) return;
    try { if (saved) await userApi.unsave(vendor._id); else await userApi.save(vendor._id); setSaved(!saved); }
    catch (cause) { Alert.alert("Could not update saved vendors", apiError(cause)); }
  }
  return (
    <SafeAreaView style={ui.page} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 22 }}>
        {loading ? (
          <View style={{ padding: 20 }}>
            <Skeleton height={250} />
            <Skeleton height={180} />
          </View>
        ) : error || !vendor ? (
          <View style={{ padding: 20 }}>
            <Message
              text={error || "Vendor unavailable."}
              retry={() => setRefresh((n) => n + 1)}
            />
          </View>
        ) : (
          <>
            <View style={styles.topBar}><Pressable onPress={() => navigation.goBack()} accessibilityLabel="Go back"><Ionicons name="arrow-back" size={22} color={colors.slate} /></Pressable><Text style={styles.topBarTitle}>Vendor Details</Text><Pressable onPress={toggleSaved} accessibilityLabel={saved ? "Remove saved vendor" : "Save vendor"}><Ionicons name={saved ? "heart" : "heart-outline"} size={22} color={colors.indigo} /></Pressable></View>
            {vendor.portfolioImages?.[0] ? (
              <Image
                source={{ uri: vendor.portfolioImages[0] }}
                style={styles.banner}
              />
            ) : (
              <View style={styles.bannerFallback}>
                <Ionicons name="sparkles" size={70} color="#C7D2FE" />
                <Text style={styles.bannerFallbackText}>
                  {vendor.vendorType}
                </Text>
              </View>
            )}
            {vendor.portfolioImages?.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>{vendor.portfolioImages.map((uri, index) => <Image key={`${uri}-${index}`} source={{ uri }} style={styles.galleryImage} />)}</ScrollView> : null}
            <View style={styles.content}>
              <View style={styles.badgeRow}>
                <Text style={styles.badge}>{vendor.vendorType}</Text>
                {vendor.isVerified ? (
                  <Text style={styles.verified}>✓ Verified</Text>
                ) : null}
              </View>
              <Text style={styles.vendorName}>{vendor.businessName}</Text>
              <Text style={styles.rating}>{vendor.reviewCount ? `★ ${vendor.rating.toFixed(1)} (${vendor.reviewCount} reviews)` : "New vendor"}</Text>
              <Text style={[ui.muted, { marginTop: 8 }]}>
                <Ionicons name="location-outline" size={14} />{" "}
                {vendor.address.city}
                {vendor.address.state ? `, ${vendor.address.state}` : ""}
              </Text>
              <View style={styles.summary}>
                <View>
                  <Text style={styles.summaryLabel}>STARTING AT</Text>
                  <Text style={styles.summaryValue}>
                    {formatMoney(vendor.startingPrice)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.summaryLabel}>RATING</Text>
                  <Text style={styles.summaryValue}>
                    {vendor.reviewCount
                      ? `★ ${vendor.rating.toFixed(1)}`
                      : "New"}
                  </Text>
                </View>
                <View>
                  <Text style={styles.summaryLabel}>SERVICES</Text>
                  <Text style={styles.summaryValue}>
                    {vendor.services?.length || 0}
                  </Text>
                </View>
              </View>
              <View style={styles.tabs}>{(["About", "Services", "Reviews", "Gallery"] as const).map((item) => <Pressable key={item} onPress={() => setSection(item)} style={[styles.tab, section === item && styles.tabActive]}><Text style={[styles.tabText, section === item && styles.tabTextActive]}>{item}</Text></Pressable>)}</View>
              {section === "About" && vendor.description ? (
                <>
                  <SectionTitle title="About" />
                  <Text style={[ui.body, { marginBottom: 26 }]}>
                    {vendor.description}
                  </Text>
                </>
              ) : null}
              {section === "Gallery" && vendor.portfolioImages?.length ? (
                <>
                  <SectionTitle title="Portfolio" />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10, marginBottom: 24 }}
                  >
                    {vendor.portfolioImages.map((uri, index) => (
                      <Image
                        key={`${uri}-${index}`}
                        source={{ uri }}
                        style={styles.portfolioImage}
                      />
                    ))}
                  </ScrollView>
                </>
              ) : null}
              {section === "Gallery" && !vendor.portfolioImages?.length ? <Message text="This vendor has not added portfolio photos yet." /> : null}
              {section === "Reviews" ? reviews.length ? reviews.map((review) => <Card key={review._id}><Text style={styles.reviewAuthor}>{review.userId?.name || "Customer"}  <Text style={styles.reviewStars}>{"★".repeat(review.rating)}</Text></Text>{review.comment ? <Text style={ui.body}>{review.comment}</Text> : null}</Card>) : <Message text="No reviews yet. Reviews appear after completed bookings." /> : null}
              {section === "Services" ? <><SectionTitle
                title="Services"
                subtitle="Build a booking around what you need"
              />
              {vendor.services?.length ? (
                vendor.services.map((service) => (
                  <Card key={service._id} style={styles.serviceCard}>
                    <View style={{ flex: 1 }}>
                      <Pressable accessibilityRole="button" accessibilityLabel={`View ${service.name} details`} onPress={() => navigation.navigate('DynamicEstimate', { vendorId: vendor._id, occasion: route.params.occasion, eventId: route.params.eventId, intent: route.params.intent, serviceId: service._id })} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={styles.itemTitle}>{service.name}</Text><Text style={{ color: colors.indigo, fontSize: 12 }}>View details & customize ›</Text></Pressable>
                      <Text style={ui.muted}>
                        {service.pricingType.replace(/_/g, " ")}
                      </Text>
                      {service.description ? (
                        <Text style={[ui.muted, { marginTop: 5 }]}>
                          {service.description}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={styles.itemPrice}>
                      {formatMoney(service.price)}
                    </Text>
                  </Card>
                ))
              ) : (
                <Message text="No services listed yet." />
              )}
              {vendor.artistsOrCelebrities?.length ? (
                <>
                  <SectionTitle
                    title="Artist roster"
                    subtitle="Featured talent available for your event"
                  />
                  {vendor.artistsOrCelebrities.map((artist) => (
                    <Card key={artist._id} style={styles.artistCard}>
                      {artist.photo ? (
                        <Image
                          source={{ uri: artist.photo }}
                          style={styles.artistImage}
                        />
                      ) : (
                        <View style={styles.artistFallback}>
                          <Ionicons
                            name="mic"
                            size={24}
                            color={colors.indigo}
                          />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Pressable accessibilityRole="button" accessibilityLabel={`View ${artist.name} details`} onPress={() => navigation.navigate('DynamicEstimate', { vendorId: vendor._id, occasion: route.params.occasion, eventId: route.params.eventId, intent: route.params.intent, artistId: artist._id })} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={styles.itemTitle}>{artist.name}</Text><Text style={{ color: colors.indigo, fontSize: 12 }}>View performance details ›</Text></Pressable>
                        <Text style={ui.muted}>
                          {artist.roleOrSkill || "Performer"}
                        </Text>
                        <Text style={styles.itemPrice}>
                          {formatMoney(artist.pricePerPerformance)} /
                          performance
                        </Text>
                        {artist.sampleAudioVideoUrl &&
                        /^https?:\/\//i.test(artist.sampleAudioVideoUrl) ? (
                          <Pressable
                            onPress={() =>
                              Linking.openURL(artist.sampleAudioVideoUrl!)
                            }
                            style={{ marginTop: 7 }}
                          >
                            <Text style={styles.sample}>View sample ↗</Text>
                          </Pressable>
                        ) : null}
                      </View>
                      <Text
                        style={{
                          color: artist.isAvailable
                            ? colors.success
                            : colors.muted,
                          fontSize: 11,
                          fontWeight: "700",
                        }}
                      >
                        {artist.isAvailable ? "Available" : "Unavailable"}
                      </Text>
                    </Card>
                  ))}
                </>
              ) : null}</> : null}
            </View>
          </>
        )}
      </ScrollView>
      {vendor &&
      !loading &&
      !error &&
      (vendor.services?.length ||
        vendor.artistsOrCelebrities?.some((artist) => artist.isAvailable)) ? (
        <View style={styles.footer}>
          <Button
            label="Choose services & estimate"
            onPress={() =>
              navigation.navigate("DynamicEstimate", { vendorId: vendor._id, occasion: route.params.occasion, eventId: route.params.eventId, intent: route.params.intent })
            }
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.border, marginTop: 8, marginBottom: 18 },
  tab: { paddingVertical: 11, paddingHorizontal: 8 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.indigo },
  tabText: { color: colors.muted, fontSize: 12 },
  tabTextActive: { color: colors.indigo, fontWeight: "800" },
  reviewAuthor: { color: colors.slate, fontSize: 13, fontWeight: "800", marginBottom: 6 },
  reviewStars: { color: colors.gold },
  topBar: { height: 50, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topBarTitle: { color: colors.slate, fontSize: 14, fontWeight: "800" },
  gallery: { gap: 7, paddingHorizontal: 12, paddingVertical: 10 },
  galleryImage: { width: 67, height: 51, borderRadius: 8 },
  vendorName: { color: colors.slate, fontWeight: "800", fontSize: 22 },
  rating: { color: "#D99017", fontSize: 12, fontWeight: "700", marginTop: 4 },
  banner: { width: "100%", height: 238 },
  bannerFallback: {
    height: 238,
    backgroundColor: colors.indigoDark,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerFallbackText: {
    color: "#C7D2FE",
    fontSize: 13,
    letterSpacing: 1.3,
    marginTop: 10,
    fontWeight: "800",
  },
  content: { padding: 20 },
  badgeRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  badge: {
    color: colors.indigo,
    backgroundColor: colors.paleIndigo,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    fontWeight: "800",
    fontSize: 11,
  },
  verified: { color: colors.success, fontSize: 12, fontWeight: "800" },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    padding: 19,
    borderRadius: 21,
    marginVertical: 25,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  summaryValue: {
    color: colors.slate,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 5,
  },
  portfolioImage: { width: 170, height: 125, borderRadius: 15 },
  serviceCard: { flexDirection: "row", gap: 12, alignItems: "center" },
  itemTitle: {
    color: colors.slate,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  itemPrice: { color: colors.indigo, fontSize: 13, fontWeight: "800" },
  artistCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  artistImage: { width: 54, height: 54, borderRadius: 17 },
  artistFallback: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paleIndigo,
  },
  sample: { color: colors.indigo, fontSize: 12, fontWeight: "800" },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
});
