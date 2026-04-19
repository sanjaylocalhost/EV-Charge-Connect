import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
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
import { NEARBY_STATIONS } from "@/data/vehicles";
import { useColors } from "@/hooks/useColors";

export default function ChargingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { stationId } = useLocalSearchParams<{ stationId: string }>();
  const { currentSession, stopCharging, user } = useApp();

  const station = NEARBY_STATIONS.find((s) => s.id === stationId);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.1, { duration: 1000 }), -1, true);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const energyConsumed = elapsed * (station?.maxPower ?? 7) * (1 / 3600);
  const cost = energyConsumed * (station?.pricePerUnit ?? 12);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    stopCharging(parseFloat(energyConsumed.toFixed(3)), parseFloat(cost.toFixed(2)));
    router.push({
      pathname: "/payment",
      params: {
        energy: energyConsumed.toFixed(3),
        cost: cost.toFixed(2),
        station: station?.name ?? "Charging Station",
        duration: elapsed.toString(),
      },
    });
  };

  const activeVehicle = user?.vehicles.find((v) => v.id === user.activeVehicleId);

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Charging Session
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 100 : 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pulseContainer}>
          <Animated.View
            style={[
              styles.pulseRing,
              pulseStyle,
              { borderColor: colors.primary + "30" },
            ]}
          />
          <View style={[styles.chargingCircle, { backgroundColor: colors.primary + "18", borderColor: colors.primary }]}>
            <Ionicons name="flash" size={52} color={colors.primary} />
          </View>
        </View>

        <Text style={[styles.sessionTime, { color: colors.foreground }]}>
          {formatTime(elapsed)}
        </Text>
        <Text style={[styles.sessionLabel, { color: colors.mutedForeground }]}>
          Charging in progress
        </Text>

        {station && (
          <Text style={[styles.stationName, { color: colors.mutedForeground }]}>
            {station.name}
          </Text>
        )}

        <View style={styles.statsRow}>
          {[
            { label: "Energy", value: `${energyConsumed.toFixed(2)} kWh`, icon: "battery-charging" },
            { label: "Cost", value: `₹${cost.toFixed(2)}`, icon: "cash-outline" },
            { label: "Power", value: `${station?.maxPower ?? 7} kW`, icon: "flash-outline" },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[
                styles.statBox,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Ionicons name={stat.icon as any} size={20} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {activeVehicle && (
          <View
            style={[
              styles.vehicleInfo,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons name="car-outline" size={18} color={colors.mutedForeground} />
            <Text style={[styles.vehicleText, { color: colors.foreground }]}>
              {activeVehicle.brand} {activeVehicle.model}
            </Text>
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
          title="Stop Charging"
          variant="danger"
          onPress={handleStop}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { paddingHorizontal: 24, paddingTop: 40, alignItems: "center", gap: 16 },
  pulseContainer: { alignItems: "center", justifyContent: "center", marginBottom: 8 },
  pulseRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
  },
  chargingCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  sessionTime: { fontSize: 48, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  sessionLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  stationName: { fontSize: 13, fontFamily: "Inter_500Medium" },
  statsRow: { flexDirection: "row", gap: 12, width: "100%" },
  statBox: {
    flex: 1,
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  statValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
  },
  vehicleText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  footer: { padding: 16, borderTopWidth: 1 },
});
