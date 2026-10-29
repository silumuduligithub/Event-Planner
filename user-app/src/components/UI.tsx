import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, shadow } from "../theme";

export const formatMoney = (amount: number) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
export const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function Button({
  label,
  onPress,
  loading,
  disabled,
  secondary,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.indigo : colors.white} />
      ) : (
        <Text
          style={[styles.buttonText, secondary && { color: colors.indigo }]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#94A3B8"
        style={[styles.input, error && { borderColor: colors.danger }]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}
export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}
    </View>
  );
}
export function Message({ text, retry }: { text: string; retry?: () => void }) {
  return (
    <Card>
      <Text style={styles.muted}>{text}</Text>
      {retry ? (
        <Pressable onPress={retry} style={{ marginTop: 10 }}>
          <Text style={{ color: colors.indigo, fontWeight: "700" }}>
            Try again
          </Text>
        </Pressable>
      ) : null}
    </Card>
  );
}
export function Skeleton({ height = 110 }: { height?: number }) {
  return <View style={[styles.skeleton, { height }]} />;
}
export function Hero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <LinearGradient
      colors={[colors.indigoDark, colors.indigo, "#C7435A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <Text style={styles.heroEyebrow}>{eyebrow.toUpperCase()}</Text>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
    </LinearGradient>
  );
}

export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.soft },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  title: {
    color: colors.slate,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  body: { color: colors.slate, fontSize: 15, lineHeight: 23 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  row: { flexDirection: "row", alignItems: "center" },
});
const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: 11,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.indigo,
  },
  buttonSecondary: { backgroundColor: colors.paleIndigo },
  buttonText: { color: colors.white, fontSize: 13, fontWeight: "700" },
  fieldLabel: {
    color: colors.slate,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    color: colors.slate,
    backgroundColor: colors.white,
    fontSize: 13,
  },
  error: { color: colors.danger, fontSize: 12, marginTop: 5 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    ...shadow,
  },
  sectionTitle: {
    color: colors.slate,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  muted: { color: colors.muted, fontSize: 13 },
  skeleton: { backgroundColor: "#E8ECF5", borderRadius: 20, marginBottom: 14 },
  hero: {
    padding: 24,
    borderRadius: 26,
    minHeight: 184,
    justifyContent: "center",
    marginBottom: 22,
    overflow: "hidden",
  },
  heroEyebrow: {
    color: "#FDE68A",
    fontSize: 11,
    letterSpacing: 2.1,
    fontWeight: "800",
    marginBottom: 9,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 28,
    maxWidth: 290,
  },
  heroSubtitle: {
    color: "#E0E7FF",
    fontSize: 13,
    marginTop: 9,
    lineHeight: 19,
    maxWidth: 300,
  },
});
