import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParams } from "../navigation/RootNavigator";
import { AuthBrand, authColors, displayFont } from "../components/AuthUI";

const slides = [
  { title: "Celebrate\nLife’s Special\n", accent: "Moments", body: "Discover the best vendors, compare prices and plan your dream event with ease.", image: require("../../assets/onboarding/wedding-hero-v2.png") },
  { title: "Discover\n", accent: "Trusted Vendors", body: "From venues to catering, photography to entertainment — find everything in one place.", image: require("../../assets/onboarding/floral-table.png") },
  { title: "Plan, Book\n", accent: "& Enjoy", body: "Get instant estimates, manage bookings and create unforgettable experiences.", image: require("../../assets/onboarding/fireworks-couple.png") },
];

export function WelcomeScreen({ navigation }: NativeStackScreenProps<AuthStackParams, "Welcome">) {
  const [step, setStep] = useState(-1);
  if (step === -1) return <View style={styles.splash}>
    <Image source={require("../../assets/onboarding/floral-table.png")} style={StyleSheet.absoluteFill} resizeMode="cover" />
    <LinearGradient colors={["rgba(3,5,18,.95)", "rgba(6,7,22,.45)", "rgba(3,5,18,.95)"]} style={StyleSheet.absoluteFill} />
    <SafeAreaView style={styles.splashSafe}>
      <View style={styles.splashBrand}><Image source={require("../../assets/evently-customer-mark.png")} style={styles.splashMark} resizeMode="contain" /><Text style={styles.splashName}>Event<Text style={{ color: "#E9AE4A" }}>ly</Text></Text><Text style={styles.splashSubtitle}>Plan Beautiful Moments</Text></View>
      <View><Text style={styles.splashLine}>Events{`\n`}Made Extraordinary</Text><Pressable onPress={() => setStep(0)} style={styles.startButton}><Text style={styles.startText}>Get Started</Text><Ionicons name="arrow-forward" size={19} color="#101733" /></Pressable><Pressable onPress={() => navigation.navigate("Login")} style={styles.splashLogin}><Text style={styles.splashLoginText}>Already have an account?  <Text style={{ color: "#F5BD56", fontWeight: "800" }}>Login</Text></Text></Pressable></View>
    </SafeAreaView>
  </View>;
  const slide = slides[step];
  return <View style={styles.page}><SafeAreaView style={styles.safe}>
    <View style={styles.intro}><AuthBrand /><Text style={styles.title}>{slide.title}<Text style={styles.accent}>{slide.accent}</Text></Text><Text style={styles.body}>{slide.body}</Text></View>
    <View style={styles.photoArea}><Image source={slide.image} style={styles.photo} resizeMode="cover" /><LinearGradient colors={["transparent", "rgba(255,250,241,0.05)", "#FFF9EF"]} locations={[0, .82, 1]} style={StyleSheet.absoluteFill} /></View>
    <View style={styles.bottom}><View style={styles.dots}>{slides.map((_, index) => <View key={index} style={[styles.dot, step === index && styles.dotActive]} />)}</View><Pressable accessibilityLabel={step === 2 ? "Continue to login" : "Next onboarding screen"} onPress={() => step === 2 ? navigation.navigate("Login") : setStep(step + 1)} style={styles.next}><Ionicons name="arrow-forward" size={22} color="#271902" /></Pressable></View>
  </SafeAreaView></View>;
}
const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: "#070813" }, splashSafe: { flex: 1, justifyContent: "space-between", paddingHorizontal: 28, paddingBottom: 22 }, splashBrand: { alignItems: "center", marginTop: "34%" }, splashMark: { width: 98, height: 98 }, splashName: { ...displayFont, color: "#FFF9EF", fontSize: 42, letterSpacing: -2 }, splashSubtitle: { color: "#F3EADB", fontSize: 12, marginTop: 3 }, splashLine: { ...displayFont, color: "#FFF9EF", fontSize: 25, lineHeight: 28, marginBottom: 24 }, startButton: { height: 54, borderRadius: 28, backgroundColor: "#F3BC58", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24 }, startText: { color: "#101733", fontWeight: "800" }, splashLogin: { alignItems: "center", paddingTop: 18 }, splashLoginText: { color: "#FFF9EF", fontSize: 12 },
  page: { flex: 1, backgroundColor: "#FFF9EF" }, safe: { flex: 1 }, intro: { paddingHorizontal: 27, paddingTop: 31, zIndex: 1 }, title: { ...displayFont, color: authColors.ink, fontSize: 32, lineHeight: 34, letterSpacing: -1.1, marginTop: 30 }, accent: { color: "#D97813" }, body: { color: "#4F5871", fontSize: 13, lineHeight: 19, maxWidth: 290, marginTop: 11 }, photoArea: { flex: 1, marginTop: 22, overflow: "hidden" }, photo: { width: "100%", height: "100%" }, bottom: { position: "absolute", bottom: 20, left: 27, right: 27, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, dots: { flexDirection: "row", gap: 7 }, dot: { width: 6, height: 6, borderRadius: 4, backgroundColor: "#C9C9CB" }, dotActive: { backgroundColor: "#D58113" }, next: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#F4BD56", alignItems: "center", justifyContent: "center" },
});
