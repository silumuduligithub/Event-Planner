import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardTypeOptions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme";

export const authColors = {
  ink: "#101733",
  muted: "#64708A",
  border: "#DDE2EE",
  indigo: "#3427DD",
};
export const displayFont = {
  fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
};

export function AuthBrand({ large = false }: { large?: boolean }) {
  return (
    <View style={styles.brandRow} accessibilityLabel="Evently">
      <Image
        source={require("../../assets/evently-customer-mark.png")}
        style={large ? styles.brandMarkLarge : styles.brandMark}
        resizeMode="contain"
      />
      <Text style={[styles.brandName, large && styles.brandNameLarge]}>
        Event<Text style={styles.brandGold}>ly</Text>
      </Text>
    </View>
  );
}

export function AuthProgress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <View style={styles.progress} accessibilityLabel={`Step ${step} of 3`}>
      {[1, 2, 3].map((index) => (
        <View
          key={index}
          style={[styles.progressBar, index === step && styles.progressActive]}
        />
      ))}
    </View>
  );
}

export function AuthBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.topOrb} />
      <View style={styles.bottomOrb} />
    </View>
  );
}

export function AuthNotice({ message }: { message: string }) {
  return (
    <View style={styles.notice} accessibilityRole="alert">
      <Ionicons name="alert-circle-outline" size={19} color="#A3332A" />
      <Text style={styles.noticeText}>{message}</Text>
    </View>
  );
}

export function AuthField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secure,
  autoComplete,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  secure?: boolean;
  autoComplete?: "email" | "name" | "tel" | "password" | "new-password";
}) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <Ionicons name={icon} size={18} color={authColors.ink} />
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9AA5B9"
          keyboardType={keyboardType}
          secureTextEntry={secure && !visible}
          autoCapitalize={
            keyboardType === "email-address" ? "none" : "sentences"
          }
          autoComplete={autoComplete}
          style={styles.input}
          textContentType={
            secure
              ? autoComplete === "new-password"
                ? "newPassword"
                : "password"
              : undefined
          }
        />
        {secure ? (
          <Pressable
            onPress={() => setVisible((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={visible ? "Hide password" : "Show password"}
            hitSlop={10}
          >
            <Ionicons
              name={visible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={authColors.muted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function AuthButton({
  label,
  onPress,
  loading,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.buttonPress,
        (pressed || loading) && { opacity: 0.8 },
      ]}
    >
      <LinearGradient
        colors={["#4F40F0", "#2417A9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Text style={styles.buttonText}>{label}</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandMark: { width: 38, height: 38 },
  brandMarkLarge: { width: 53, height: 53 },
  brandName: {
    ...displayFont,
    color: authColors.ink,
    fontSize: 25,
    letterSpacing: -1.2,
  },
  brandNameLarge: { fontSize: 36, letterSpacing: -1.7 },
  brandGold: { color: "#B87817" },
  progress: { flexDirection: "row", alignItems: "center", gap: 5 },
  progressBar: {
    width: 17,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#B9C2D4",
  },
  progressActive: { backgroundColor: "#3225D7" },
  topOrb: {
    position: "absolute",
    width: 510,
    height: 330,
    borderRadius: 260,
    borderWidth: 1,
    borderColor: "#D8DAFB",
    backgroundColor: "#F5F5FF",
    left: -160,
    top: -215,
    transform: [{ rotate: "-18deg" }],
  },
  bottomOrb: {
    position: "absolute",
    width: 450,
    height: 260,
    borderRadius: 220,
    backgroundColor: "#F2F2FF",
    right: -180,
    bottom: -160,
    transform: [{ rotate: "18deg" }],
  },
  fieldWrap: { marginBottom: 23 },
  label: {
    color: authColors.ink,
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 10,
  },
  field: {
    minHeight: 56,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: authColors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.76)",
  },
  input: {
    flex: 1,
    color: authColors.ink,
    fontSize: 14,
    paddingVertical: 13,
    minWidth: 0,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 13,
    marginBottom: 16,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#F3CBC7",
    backgroundColor: "#FFF4F2",
  },
  noticeText: { flex: 1, color: "#8D2D25", fontSize: 13, lineHeight: 19 },
  buttonPress: { borderRadius: 18, overflow: "hidden" },
  button: {
    minHeight: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
    paddingHorizontal: 20,
  },
  buttonText: { color: colors.white, fontWeight: "800", fontSize: 16 },
});
