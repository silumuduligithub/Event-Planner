import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isAxiosError } from "axios";
import * as Crypto from "expo-crypto";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { bookingApi, eventApi, vendorApi } from "../api/endpoints";
import { apiError } from "../api/client";
import {
  Button,
  Card,
  Field,
  Message,
  SectionTitle,
  Skeleton,
  formatDate,
  formatMoney,
  ui,
} from "../components/UI";
import { MainStackParams } from "../navigation/RootNavigator";
import { colors } from "../theme";
import type { Estimate, EstimateInput, Event, ServiceRequirements, Vendor } from "../types";
import { ServiceDetailsSheet, ServiceRequirementsView } from '../components/ServiceDetailsSheet';
import { artistToOption, serviceToOption, type ServiceOption } from '../utils/serviceRequirements';

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(12, 0, 0, 0);
  return date;
};
const isFixed = (pricingType: string) =>
  pricingType === "fixed" || pricingType === "per_event";

export function DynamicEstimateScreen({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParams, "DynamicEstimate">) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedServices, setSelectedServices] = useState<
    Record<string, string>
  >({});
  const [artistIds, setArtistIds] = useState<string[]>([]);
  const [serviceRequirements, setServiceRequirements] = useState<Record<string, ServiceRequirements>>({});
  const [artistRequirements, setArtistRequirements] = useState<Record<string, ServiceRequirements>>({});
  const [activeOption, setActiveOption] = useState<ServiceOption | null>(null);
  const [estimatedGuests, setEstimatedGuests] = useState(0);
  const [notes, setNotes] = useState('');
  const loadedContext = useRef('');
  const [eventId, setEventId] = useState<string | undefined>();
  const [occasionName, setOccasionName] = useState(route.params.occasion || "");
  const [intent, setIntent] = useState<'single_service' | 'full_event_package'>(route.params.intent || 'single_service');
  const [reviewOpen, setReviewOpen] = useState(false);
  const requestKey = useRef<string | null>(null);
  const [eventDate, setEventDate] = useState(tomorrow);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [showDate, setShowDate] = useState(false);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [estimateError, setEstimateError] = useState("");
  const [linkedEventError, setLinkedEventError] = useState("");
  const [linkedEventLoading, setLinkedEventLoading] = useState(!!route.params.eventId);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    vendorApi
      .detail(route.params.vendorId, route.params.occasion)
      .then((response) => {
        if (!active) return;
        const detail = response.data.data;
        const context = `${route.params.vendorId}:${route.params.eventId || ''}`;
        if (loadedContext.current && loadedContext.current !== context) {
          setSelectedServices({}); setArtistIds([]); setServiceRequirements({}); setArtistRequirements({}); setNotes(''); setEstimate(null);
        }
        loadedContext.current = context;
        setVendor(detail);
        if (!route.params.eventId) setCity(detail.address.city);
        const service = detail.services.find(item => item._id === route.params.serviceId);
        const artist = detail.artistsOrCelebrities.find(item => item._id === route.params.artistId);
        if (service) setActiveOption(serviceToOption(service));
        else if (artist) setActiveOption(artistToOption(artist));
        setError("");
      })
      .catch((cause) => {
        if (active) setError(apiError(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    eventApi
      .list()
      .then((response) => {
        if (active) {
          setEvents(response.data.data);
          const linked = response.data.data.find((item) => item._id === route.params.eventId);
          if (linked) { chooseEvent(linked); setLinkedEventError(""); }
          else if (route.params.eventId) setLinkedEventError("Linked event unavailable. Retry before requesting.");
          setLinkedEventLoading(false);
        }
      })
      .catch(() => {
        if (active) { setEvents([]); if (route.params.eventId) setLinkedEventError("Could not load the linked event. Retry before requesting."); setLinkedEventLoading(false); }
      });
    return () => {
      active = false;
    };
  }, [route.params.vendorId, route.params.occasion, route.params.eventId, route.params.serviceId, route.params.artistId, refresh]);

  const input = useMemo<EstimateInput | null>(() => {
    if (!vendor) return null;
    const items = vendor.services
      .filter((service) => selectedServices[service._id] !== undefined)
      .map((service) => ({
        serviceId: service._id,
        quantity: Number(selectedServices[service._id]),
        requirements: serviceRequirements[service._id] || {},
      }));
    if (
      items.some(
        (item) =>
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > 100000,
      )
    )
      return null;
    const bookingType = artistIds.length ? "orchestra_celebrity" : intent;
    if (!items.length && !artistIds.length) return null;
    if (intent === 'single_service' && items.length + artistIds.length !== 1) return null;
    return {
      vendorId: vendor._id,
      bookingType,
      ...(occasionName.trim() ? { occasion: occasionName.trim() } : {}),
      selectedServices: items,
      selectedCelebrities: artistIds.map((artistId) => ({ artistId, requirements: artistRequirements[artistId] || {} })),
    };
  }, [vendor, selectedServices, artistIds, intent, serviceRequirements, artistRequirements, occasionName]);

  useEffect(() => { requestKey.current = null; }, [input, eventDate, city, address, notes]);

  useEffect(() => {
    if (!input) return;
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      bookingApi
        .estimate(input, controller.signal)
        .then((response) => {
          if (active) setEstimate(response.data.data);
        })
        .catch((cause) => {
          if (active && cause?.code !== "ERR_CANCELED")
            setEstimateError(apiError(cause));
        });
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [input]);

  const toggleService = useCallback((id: string) => {
    setEstimate(null);
    setEstimateError("");
    if (intent === 'single_service') setArtistIds([]);
    setSelectedServices((current) => {
      const next = intent === 'single_service' ? {} as Record<string, string> : { ...current };
      if (current[id] !== undefined) delete next[id];
      else next[id] = vendor?.services.find(service => service._id === id)?.pricingType === 'per_plate' && estimatedGuests > 0 ? String(estimatedGuests) : "1";
      return next;
    });
  }, [intent, vendor, estimatedGuests]);
  const toggleArtist = useCallback((id: string) => {
    setEstimate(null);
    setEstimateError("");
    if (intent === 'single_service') setSelectedServices({});
    setArtistIds((current) => current.includes(id) ? current.filter((value) => value !== id) : intent === 'single_service' ? [id] : [...current, id]);
  }, [intent]);
  function setSelectionMode(mode: 'single_service' | 'full_event_package') {
    setIntent(mode); setEstimate(null); setEstimateError('');
    if (mode === 'single_service') {
      const first = Object.entries(selectedServices)[0];
      setSelectedServices(first ? { [first[0]]: first[1] } : {});
      setArtistIds(first ? [] : artistIds.slice(0, 1));
    }
  }
  function chooseEvent(event: Event | null) {
    requestKey.current = null;
    setEstimate(null); setEstimateError('');
    setSelectedServices({}); setArtistIds([]); setServiceRequirements({}); setArtistRequirements({});
    setEventId(event?._id);
    setEstimatedGuests(event?.estimatedGuests || 0);
    setOccasionName(event?.eventType || '');
    if (event) {
      setEventDate(new Date(event.eventDate));
      setCity(event.location.city);
    }
  }
  function saveOption(quantity: string, requirements: ServiceRequirements) {
    if (!activeOption) return;
    setEstimate(null); setEstimateError('');
    if (activeOption.artist) {
      if (intent === 'single_service') setSelectedServices({});
      setArtistIds(current => intent === 'single_service' ? [activeOption.id] : current.includes(activeOption.id) ? current : [...current, activeOption.id]);
      setArtistRequirements(current => ({ ...current, [activeOption.id]: requirements }));
    } else {
      if (intent === 'single_service') setArtistIds([]);
      setSelectedServices(current => ({ ...(intent === 'single_service' ? {} : current), [activeOption.id]: quantity }));
      setServiceRequirements(current => ({ ...current, [activeOption.id]: requirements }));
    }
    setActiveOption(null);
  }
  async function submit() {
    if (submitting) return;
    if (
      !input ||
      !estimate ||
      !city.trim() ||
      eventDate.getTime() <= Date.now()
    ) {
      Alert.alert(
        "Check booking details",
        "Select a service or artist, enter a city and a future date, and wait for the current estimate.",
      );
      return;
    }
    setSubmitting(true);
    try {
      if (!requestKey.current) requestKey.current = Crypto.randomUUID();
      const submissionKey = requestKey.current;
      await bookingApi.create({
        ...input,
        requestKey: submissionKey,
        expectedQuoteFingerprint: estimate.quoteFingerprint,
        eventDate: eventDate.toISOString(),
        eventLocation: {
          city: city.trim(),
          ...(address.trim() ? { address: address.trim() } : {}),
        },
        ...(eventId ? { eventId } : {}),
        ...(notes.trim() ? { userNotes: notes.trim() } : {}),
      });
      setReviewOpen(false);
      Alert.alert(
        "Request sent",
        "Your booking request has been sent to the vendor. No payment has been collected.",
        [
          {
            text: "View bookings",
            onPress: () => navigation.navigate("Tabs", { screen: "Bookings" }),
          },
        ],
      );
    } catch (cause) {
      if (isAxiosError(cause) && cause.response?.status === 409 && cause.response.data?.data?.quoteFingerprint) {
        setEstimate(cause.response.data.data as Estimate);
        setReviewOpen(false);
        requestKey.current = null;
        Alert.alert("Estimate changed", "Please review the updated price before sending your request.");
      } else Alert.alert("Request not sent", apiError(cause));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={ui.page} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={ui.content}
          keyboardShouldPersistTaps="handled"
        >
          {loading || linkedEventLoading ? (
            <View style={{ paddingTop: 20 }}>
              <Skeleton height={90} />
              <Skeleton height={150} />
              <Skeleton height={150} />
            </View>
          ) : error || linkedEventError || !vendor ? (
            <View style={{ paddingTop: 20 }}>
              <Message
                text={error || linkedEventError || "Vendor unavailable."}
                retry={() => {
                  setLoading(true);
                  setRefresh((n) => n + 1);
                }}
              />
            </View>
          ) : (
            <>
              <View style={styles.heading}>
                <View style={styles.vendorSummary}>
                  {vendor.portfolioImages?.[0] ? <Image source={{ uri: vendor.portfolioImages[0] }} style={styles.vendorThumb} /> : <View style={[styles.vendorThumb, styles.thumbFallback]}><Ionicons name="sparkles" color={colors.gold} size={25} /></View>}
                  <View style={{ flex: 1 }}><Text style={styles.summaryName}>{vendor.businessName}</Text><Text style={ui.muted}>{vendor.vendorType}</Text><Text style={ui.muted}>{formatDate(eventDate)}</Text></View>
                  <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                </View>
              </View>
              <SectionTitle title="What do you need?" subtitle={route.params.occasion ? `For ${route.params.occasion}` : "Choose your booking type"} />
              <View style={styles.intentRow}>
                <Pressable onPress={() => setSelectionMode('single_service')} style={[styles.intentChoice, intent === 'single_service' && styles.intentActive]} accessibilityRole="radio" accessibilityState={{ selected: intent === 'single_service' }}><Text style={intent === 'single_service' ? styles.intentActiveText : styles.intentText}>One service</Text></Pressable>
                <Pressable onPress={() => setSelectionMode('full_event_package')} style={[styles.intentChoice, intent === 'full_event_package' && styles.intentActive]} accessibilityRole="radio" accessibilityState={{ selected: intent === 'full_event_package' }}><Text style={intent === 'full_event_package' ? styles.intentActiveText : styles.intentText}>Multiple services</Text></Pressable>
              </View>
              <SectionTitle
                title="Choose services"
                subtitle="Select what belongs in your celebration"
              />
              {vendor.services.length ? (
                vendor.services.map((service) => {
                  const selected = selectedServices[service._id] !== undefined;
                  return (
                    <Card
                      key={service._id}
                      style={[
                        styles.optionCard,
                        selected && styles.optionSelected,
                      ]}
                    >
                      <Pressable
                        onPress={() => toggleService(service._id)}
                        style={styles.optionTop}
                        accessibilityRole="checkbox"
                        accessibilityLabel={`Select ${service.name}`}
                        accessibilityState={{ checked: selected }}
                      >
                        <Ionicons
                          name={selected ? "checkbox" : "square-outline"}
                          size={24}
                          color={selected ? colors.indigo : colors.muted}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.optionTitle}>{service.name}</Text>
                          <Text style={ui.muted}>
                            {service.pricingType.replace(/_/g, " ")} ·{" "}
                            {formatMoney(service.price)}
                          </Text>
                          {service.description ? <Text style={[ui.muted, { marginTop: 4 }]}>{service.description}</Text> : null}
                        </View>
                      </Pressable>
                      <Pressable accessibilityRole="button" accessibilityLabel={`View ${service.name} details`} onPress={() => setActiveOption(serviceToOption(service))} style={styles.detailsLink}><Text style={styles.detailsText}>{selected ? 'Edit service details' : 'View details & customize'} ›</Text></Pressable>
                      {selected ? <><Text style={styles.serviceContext}>{occasionName || 'Your service request'}{estimatedGuests > 0 ? ` · ${estimatedGuests} guests` : ''}</Text><ServiceRequirementsView requirements={serviceRequirements[service._id]} /></> : null}
                      {selected && !isFixed(service.pricingType) ? (
                        <View style={styles.quantityRow}>
                          <Text style={styles.quantityLabel}>
                            {service.pricingType === "per_plate"
                              ? "Guests / plates"
                              : service.pricingType === "per_hour"
                                ? "Hours"
                                : "Days"}
                          </Text>
                          <TextInput
                            accessibilityLabel={`${service.name} quantity`}
                            value={selectedServices[service._id]}
                            onChangeText={(value) => {
                              setEstimate(null);
                              setEstimateError("");
                              setSelectedServices((current) => ({
                                ...current,
                                [service._id]: value,
                              }));
                            }}
                            keyboardType="number-pad"
                            style={styles.quantityInput}
                            selectTextOnFocus
                          />
                        </View>
                      ) : null}
                    </Card>
                  );
                })
              ) : (
                <Message text="This vendor has no services listed." />
              )}
              {vendor.artistsOrCelebrities.length ? <>
                <SectionTitle title="Performers" subtitle="Choose individual artists or combine them with services" />
                {vendor.artistsOrCelebrities.map(artist => {
                  const selected = artistIds.includes(artist._id);
                  return <Card key={artist._id} style={[styles.optionCard, selected && styles.optionSelected, !artist.isAvailable && { opacity: 0.55 }]}>
                    <Pressable accessibilityRole="checkbox" accessibilityLabel={`Select ${artist.name}`} accessibilityState={{ checked: selected, disabled: !artist.isAvailable }} disabled={!artist.isAvailable} onPress={() => toggleArtist(artist._id)} style={styles.optionTop}>
                      <Ionicons name={selected ? 'checkbox' : 'square-outline'} size={24} color={selected ? colors.indigo : colors.muted} />
                      <View style={{ flex: 1 }}><Text style={styles.optionTitle}>{artist.name}</Text><Text style={ui.muted}>{artist.roleOrSkill || 'Performer'} · {formatMoney(artist.pricePerPerformance)} / performance</Text>{!artist.isAvailable ? <Text style={ui.muted}>Unavailable</Text> : null}</View>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel={`View ${artist.name} details`} onPress={() => setActiveOption(artistToOption(artist))} style={styles.detailsLink}><Text style={styles.detailsText}>View performance details ›</Text></Pressable>
                    {selected ? <ServiceRequirementsView requirements={artistRequirements[artist._id]} /> : null}
                  </Card>;
                })}
              </> : null}
              <SectionTitle
                title="Event details"
                subtitle="Tell the vendor when and where"
              />
              {!eventId ? <Field label="Occasion (optional)" value={occasionName} onChangeText={value => { setOccasionName(value); setEstimate(null); setEstimateError(''); }} maxLength={100} placeholder="Birthday, wedding, corporate or any occasion" /> : null}
              {events.length ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 9, marginBottom: 16 }}
                >
                  <Pressable
                    onPress={() => chooseEvent(null)}
                    style={[
                      styles.eventPill,
                      !eventId && styles.eventPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.eventPillText,
                        !eventId && { color: colors.white },
                      ]}
                    >
                      New booking
                    </Text>
                  </Pressable>
                  {events.map((event) => (
                    <Pressable
                      key={event._id}
                      onPress={() => chooseEvent(event)}
                      style={[
                        styles.eventPill,
                        eventId === event._id && styles.eventPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.eventPillText,
                          eventId === event._id && { color: colors.white },
                        ]}
                      >
                        {event.title}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : null}
              <Pressable
                onPress={() => setShowDate(true)}
                disabled={!!eventId}
                style={styles.dateButton}
              >
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color={colors.indigo}
                />
                <Text style={styles.dateText}>{formatDate(eventDate)}</Text>
                <Ionicons name="chevron-down" size={18} color={colors.muted} />
              </Pressable>
              {showDate ? (
                <View style={{ marginBottom: 15 }}>
                  <DateTimePicker
                    value={eventDate}
                    minimumDate={new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(_, date) => {
                      if (Platform.OS !== "ios") setShowDate(false);
                      if (date) setEventDate(date);
                    }}
                  />
                  {Platform.OS === "ios" ? (
                    <Pressable
                      onPress={() => setShowDate(false)}
                      style={{ alignSelf: "flex-end", padding: 8 }}
                    >
                      <Text style={{ color: colors.indigo, fontWeight: "800" }}>
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
                editable={!eventId}
                placeholder="Event city"
              />
              {eventId ? <Text style={[ui.muted, { marginBottom: 12 }]}>Date and city come from your linked event.</Text> : null}
              <Field
                label="Venue / address (optional)"
                value={address}
                onChangeText={setAddress}
                placeholder="Event location"
              />
              <Field label="Notes for this vendor (optional)" value={notes} onChangeText={setNotes} maxLength={2000} placeholder="Anything else the vendor should know" />
              <SectionTitle
                title="Your estimate"
                subtitle="Live prices confirmed by the vendor catalog"
              />
              {!input ? (
                <Message
                  text={
                    Object.values(selectedServices).some(
                      (quantity) =>
                        !Number.isInteger(Number(quantity)) ||
                        Number(quantity) < 1,
                    )
                      ? "Enter a whole-number quantity of at least 1."
                      : "Select a service or available performer to see an estimate."
                  }
                />
              ) : estimateError ? (
                <Message text={estimateError} />
              ) : !estimate ? (
                <Skeleton height={150} />
              ) : (
                <Card style={styles.estimateCard}>
                  {estimate.selectedServices.map((item) => (
                    <View key={item.serviceId} style={styles.priceRow}>
                      <Text style={styles.priceLabel}>
                        {item.name} × {item.quantity}
                      </Text>
                      <Text style={styles.priceValue}>
                        {formatMoney(item.totalPrice)}
                      </Text>
                    </View>
                  ))}
                  {estimate.selectedCelebrities.map((item) => (
                    <View key={item.artistId} style={styles.priceRow}>
                      <Text style={styles.priceLabel}>{item.name}</Text>
                      <Text style={styles.priceValue}>
                        {formatMoney(item.price)}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.divider} />
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Subtotal</Text>
                    <Text style={styles.priceValue}>
                      {formatMoney(estimate.subtotal)}
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>
                      Tax ({Math.round(estimate.taxRate * 100)}%)
                    </Text>
                    <Text style={styles.priceValue}>
                      {formatMoney(estimate.taxAmount)}
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.advance}>Advance requested</Text>
                    <Text style={styles.advance}>
                      {formatMoney(estimate.advanceAmount)}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.priceRow}>
                    <Text style={styles.total}>Grand total</Text>
                    <Text style={styles.total}>
                      {formatMoney(estimate.totalAmount)}
                    </Text>
                  </View>
                  <Text style={[ui.muted, { marginTop: 9 }]}>
                    Estimate only. No payment is collected when you send a
                    request.
                  </Text>
                </Card>
              )}
            </>
          )}
        </ScrollView>
        {vendor && !loading && !linkedEventLoading && !error && !linkedEventError ? (
          <View style={styles.footer}>
            {estimate ? <View style={styles.footerTotals}><Text style={styles.footerLabel}>Subtotal  {formatMoney(estimate.subtotal)}{`\n`}Tax  {formatMoney(estimate.taxAmount)}  ·  Advance  {formatMoney(estimate.advanceAmount)}</Text><View><Text style={styles.footerTotalLabel}>Grand total</Text><Text style={styles.footerTotal}>{formatMoney(estimate.totalAmount)}</Text></View></View> : null}
            <Button
              label="Review request →"
              onPress={() => setReviewOpen(true)}
              loading={submitting}
              disabled={!input || !estimate || !city.trim() || !!estimateError}
            />
          </View>
        ) : null}
        <Modal visible={reviewOpen} transparent animationType="slide" onRequestClose={() => { if (!submitting) setReviewOpen(false); }}>
          <View style={styles.reviewOverlay}><SafeAreaView style={styles.reviewSheet} edges={["bottom"]}><ScrollView contentContainerStyle={{ paddingBottom: 15 }}>
            <Text style={styles.reviewTitle}>Review your request</Text><Text style={ui.muted}>{vendor?.businessName} · {eventDate.toDateString()} · {city}</Text>
            {occasionName ? <Text style={styles.serviceContext}>{occasionName}</Text> : null}
            {estimate?.selectedServices.map(item => <View key={item.serviceId}><View style={styles.reviewLine}><Text style={styles.reviewItem}>{item.name} × {item.quantity}</Text><Text style={styles.reviewItem}>{formatMoney(item.totalPrice)}</Text></View><ServiceRequirementsView requirements={item.requirements} /></View>)}
            {estimate?.selectedCelebrities.map(item => <View key={item.artistId}><View style={styles.reviewLine}><Text style={styles.reviewItem}>{item.name}</Text><Text style={styles.reviewItem}>{formatMoney(item.price)}</Text></View><ServiceRequirementsView requirements={item.requirements} /></View>)}
            {notes.trim() ? <Text style={[ui.muted, { marginTop: 16 }]}>Notes: {notes.trim()}</Text> : null}
            <Text style={styles.reviewTotal}>Estimated total {estimate ? formatMoney(estimate.totalAmount) : ""}</Text>
            <Text style={styles.reviewNote}>This sends a request to this vendor only. Preferences and availability need confirmation. No payment is collected.</Text>
            <Button label="Send booking request" onPress={submit} loading={submitting} />
            <Pressable disabled={submitting} onPress={() => setReviewOpen(false)} style={styles.reviewBack}><Text style={styles.reviewBackText}>Edit selection</Text></Pressable>
          </ScrollView></SafeAreaView></View>
        </Modal>
        {activeOption && vendor ? <ServiceDetailsSheet
          key={`${activeOption.artist ? 'artist' : 'service'}:${activeOption.id}`}
          option={activeOption} vendorName={vendor.businessName} vendorType={vendor.vendorType} occasion={occasionName} guests={estimatedGuests}
          quantity={activeOption.artist ? '1' : selectedServices[activeOption.id] ?? (activeOption.pricingType === 'per_plate' && estimatedGuests > 0 ? String(estimatedGuests) : '1')}
          requirements={(activeOption.artist ? artistRequirements : serviceRequirements)[activeOption.id]}
          selected={activeOption.artist ? artistIds.includes(activeOption.id) : selectedServices[activeOption.id] !== undefined}
          replacesSelection={intent === 'single_service' && (Object.keys(selectedServices).length + artistIds.length > 0)}
          onClose={() => setActiveOption(null)} onSave={saveOption}
          onRemove={() => { if (activeOption.artist) toggleArtist(activeOption.id); else toggleService(activeOption.id); setActiveOption(null); }}
        /> : null}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  detailsLink: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', paddingHorizontal: 4 }, detailsText: { color: colors.indigo, fontSize: 12, fontWeight: '600' }, serviceContext: { color: colors.muted, fontSize: 12, marginTop: 6 },
  intentRow: { flexDirection: "row", gap: 9, marginBottom: 20 }, intentChoice: { flex: 1, padding: 13, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: "white", alignItems: "center" }, intentActive: { backgroundColor: colors.indigo, borderColor: colors.indigo }, intentText: { color: colors.slate, fontWeight: "800" }, intentActiveText: { color: "white", fontWeight: "800" },
  reviewOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,.45)" }, reviewSheet: { maxHeight: "80%", backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }, reviewTitle: { color: colors.slate, fontSize: 20, fontWeight: "800", marginBottom: 8 }, reviewLine: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: 13 }, reviewItem: { color: colors.slate, fontSize: 13, flexShrink: 1 }, reviewTotal: { color: colors.slate, fontSize: 17, fontWeight: "800", marginTop: 20 }, reviewNote: { color: colors.muted, fontSize: 12, lineHeight: 18, marginVertical: 18 }, reviewBack: { padding: 13, alignItems: "center" }, reviewBackText: { color: colors.indigo, fontWeight: "800" },
  heading: { paddingTop: 18, paddingBottom: 21 },
  vendorSummary: { backgroundColor: colors.white, padding: 10, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 11 },
  vendorThumb: { width: 55, height: 55, borderRadius: 10 },
  thumbFallback: { backgroundColor: colors.indigoDark, alignItems: "center", justifyContent: "center" },
  summaryName: { color: colors.slate, fontWeight: "800", fontSize: 14, marginBottom: 3 },
  eyebrow: {
    color: colors.indigo,
    fontWeight: "800",
    letterSpacing: 1.7,
    fontSize: 11,
    marginBottom: 10,
  },
  optionCard: { padding: 16, borderWidth: 1, borderColor: "transparent" },
  optionSelected: { borderColor: colors.indigo, backgroundColor: colors.paleIndigo },
  optionTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  optionTitle: {
    color: colors.slate,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 5,
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    marginTop: 13,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quantityLabel: { color: colors.muted, fontWeight: "700", fontSize: 13 },
  quantityInput: {
    width: 78,
    height: 39,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: "center",
    backgroundColor: colors.white,
    color: colors.slate,
    fontWeight: "800",
  },
  eventPill: {
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 11,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventPillActive: {
    backgroundColor: colors.indigo,
    borderColor: colors.indigo,
  },
  eventPillText: { color: colors.slate, fontWeight: "700", fontSize: 13 },
  dateButton: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 15,
  },
  dateText: { flex: 1, color: colors.slate, fontWeight: "700" },
  estimateCard: { backgroundColor: colors.slate, padding: 20 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  priceLabel: { flex: 1, color: "#CBD5E1", fontSize: 13 },
  priceValue: { color: colors.white, fontWeight: "700", fontSize: 13 },
  divider: { borderTopWidth: 1, borderColor: "#334155", marginVertical: 7 },
  advance: { color: "#FCD34D", fontWeight: "800", fontSize: 14 },
  total: { color: colors.white, fontWeight: "800", fontSize: 20 },
  footer: { padding: 13, backgroundColor: "#0B0B1A", borderTopLeftRadius: 17, borderTopRightRadius: 17 },
  footerTotals: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  footerLabel: { color: "#D8D9E8", fontSize: 11, lineHeight: 17 },
  footerTotalLabel: { color: "#E5AC41", fontSize: 10, textAlign: "right" },
  footerTotal: { color: "#F4C056", fontSize: 17, fontWeight: "800" },
});
