import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type PaymentMethod = "wallet" | "upi" | "qr" | "card";

export default function PaymentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { energy, cost, station, duration } = useLocalSearchParams<{
    energy: string;
    cost: string;
    station: string;
    duration: string;
  }>();
  const { user } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wallet");
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const costNum = parseFloat(cost ?? "0");
  const energyNum = parseFloat(energy ?? "0");
  const durationSecs = parseInt(duration ?? "0");

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const handlePayment = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1800));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(false);
    setPaid(true);
  };

  if (paid) {
    return (
      <View style={[styles.root, styles.successRoot, { backgroundColor: colors.background }]}>
        <View style={[styles.successIcon, { backgroundColor: colors.primary + "18", borderColor: colors.primary }]}>
          <Ionicons name="checkmark" size={52} color={colors.primary} />
        </View>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>Payment Done!</Text>
        <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
          ₹{costNum.toFixed(2)} paid successfully
        </Text>
        <View style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Station", value: station },
            { label: "Energy", value: `${energyNum.toFixed(3)} kWh` },
            { label: "Duration", value: formatDuration(durationSecs) },
            { label: "Method", value: paymentMethod === "wallet" ? "EV Wallet" : paymentMethod === "upi" ? "UPI" : paymentMethod === "qr" ? "QR Code" : "Debit Card" },
            { label: "Total", value: `₹${costNum.toFixed(2)}` },
          ].map((row, i, arr) => (
            <View key={row.label}>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                <Text style={[styles.receiptValue, { color: colors.foreground, fontFamily: row.label === "Total" ? "Inter_700Bold" : "Inter_500Medium" }]}>{row.value}</Text>
              </View>
              {i < arr.length - 1 && <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />}
            </View>
          ))}
        </View>
        <PrimaryButton title="Back to Home" onPress={() => router.replace("/(tabs)")} style={{ marginTop: 8, width: "100%" }} />
      </View>
    );
  }

  const methods: { key: PaymentMethod; label: string; sub: string; icon: any; lib: "ion" | "mci" }[] = [
    { key: "wallet", label: "EV Wallet", sub: `Balance: ₹${user?.walletBalance?.toFixed(0) ?? "0"}`, icon: "wallet-outline", lib: "ion" },
    { key: "upi", label: "UPI Payment", sub: "GPay, PhonePe, Paytm, BHIM", icon: "cellphone-nfc", lib: "mci" },
    { key: "qr", label: "Scan QR Code", sub: "Scan station QR to pay", icon: "qr-code-outline", lib: "ion" },
    { key: "card", label: "Debit / Credit Card", sub: "Visa, Mastercard, RuPay", icon: "card-outline", lib: "ion" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 10),
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Payment</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 120 : 160 },
        ]}
      >
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <Text style={styles.summaryAmount}>₹{costNum.toFixed(2)}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryDetail}>{station}</Text>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Ionicons name="flash" size={14} color="#ffffffaa" />
              <Text style={styles.summaryStatText}>{energyNum.toFixed(2)} kWh</Text>
            </View>
            <View style={styles.summaryStat}>
              <Ionicons name="time-outline" size={14} color="#ffffffaa" />
              <Text style={styles.summaryStatText}>{formatDuration(durationSecs)}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          SELECT PAYMENT METHOD
        </Text>

        {methods.map((method) => {
          const isSelected = paymentMethod === method.key;
          return (
            <TouchableOpacity
              key={method.key}
              onPress={() => setPaymentMethod(method.key)}
              activeOpacity={0.85}
              style={[
                styles.methodCard,
                {
                  backgroundColor: colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.methodIcon,
                  {
                    backgroundColor: isSelected
                      ? colors.primary + "18"
                      : colors.muted,
                  },
                ]}
              >
                {method.lib === "ion" ? (
                  <Ionicons
                    name={method.icon}
                    size={22}
                    color={isSelected ? colors.primary : colors.mutedForeground}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={method.icon}
                    size={22}
                    color={isSelected ? colors.primary : colors.mutedForeground}
                  />
                )}
              </View>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodLabel, { color: colors.foreground }]}>
                  {method.label}
                </Text>
                <Text style={[styles.methodSub, { color: colors.mutedForeground }]}>
                  {method.sub}
                </Text>
              </View>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          );
        })}

        {paymentMethod === "qr" && (
          <View
            style={[
              styles.qrContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.qrPlaceholder, { borderColor: colors.border }]}>
              <MaterialCommunityIcons name="qrcode" size={100} color={colors.foreground} />
            </View>
            <Text style={[styles.qrLabel, { color: colors.mutedForeground }]}>
              Scan this QR at the station to complete payment
            </Text>
          </View>
        )}

        {paymentMethod === "upi" && (
          <View style={[styles.upiGrid, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
              <TouchableOpacity
                key={app}
                style={[styles.upiApp, { backgroundColor: colors.muted }]}
              >
                <MaterialCommunityIcons name="cellphone-nfc" size={24} color={colors.primary} />
                <Text style={[styles.upiAppText, { color: colors.foreground }]}>{app}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 0 : 20),
          },
        ]}
      >
        <PrimaryButton
          title={`Pay ₹${costNum.toFixed(2)}`}
          loading={loading}
          onPress={handlePayment}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  successRoot: { alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 16 },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", borderWidth: 3 },
  successTitle: { fontSize: 28, fontFamily: "Inter_700Bold" },
  successSub: { fontSize: 15, fontFamily: "Inter_400Regular" },
  receiptCard: { borderRadius: 16, borderWidth: 1, padding: 18, width: "100%", gap: 0 },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  receiptLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  receiptValue: { fontSize: 14, fontFamily: "Inter_500Medium" },
  receiptDivider: { height: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { padding: 20, gap: 12 },
  summaryCard: { borderRadius: 18, padding: 22, gap: 4 },
  summaryLabel: { color: "#ffffffaa", fontSize: 13, fontFamily: "Inter_500Medium" },
  summaryAmount: { color: "#fff", fontSize: 40, fontFamily: "Inter_700Bold", marginBottom: 4 },
  summaryRow: {},
  summaryDetail: { color: "#ffffffcc", fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryStats: { flexDirection: "row", gap: 16, marginTop: 12 },
  summaryStat: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryStatText: { color: "#ffffffaa", fontSize: 13, fontFamily: "Inter_400Regular" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1, marginTop: 4 },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    gap: 14,
  },
  methodIcon: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  methodInfo: { flex: 1 },
  methodLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  methodSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  qrContainer: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: "center", gap: 12 },
  qrPlaceholder: { borderWidth: 1, borderRadius: 12, padding: 16 },
  qrLabel: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  upiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, borderRadius: 16, borderWidth: 1, padding: 16 },
  upiApp: { width: "46%", borderRadius: 12, padding: 14, alignItems: "center", gap: 8 },
  upiAppText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  footer: { padding: 16, borderTopWidth: 1 },
});
