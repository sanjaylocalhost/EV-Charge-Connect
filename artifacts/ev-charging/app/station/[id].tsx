import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Linking,
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
import { NEARBY_STATIONS, estimateChargingCost } from "@/data/vehicles";
import { useColors } from "@/hooks/useColors";

function openGoogleMaps(latitude: number, longitude: number, label: string) {
  const encodedLabel = encodeURIComponent(label);
  const url = Platform.select({
    ios: `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`,
    android: `google.navigation:q=${latitude},${longitude}`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodedLabel}&travelmode=driving`,
  });
  Linking.canOpenURL(url!).then((supported) => {
    if (supported) {
      Linking.openURL(url!);
    } else {
      const fallback = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
      Linking.openURL(fallback);
    }
  });
}

export default function StationDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, currentSession, startCharging } = useApp();

  const station = NEARBY_STATIONS.find((s) => s.id === id);

  if (!station) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Station not found</Text>
      </View>
    );
  }

  const statusColor =
    station.availablePorts === 0 ? colors.stationOffline
    : station.availablePorts <= 2 ? colors.stationBusy
    : colors.stationOnline;

  const speedColor: Record<string, string> = {
    "DC Fast": "#ef4444", "AC Fast": "#f59e0b", "AC Slow": "#6b7280", "BESCOM": "#10b981",
  };

  const activeVehicle = user?.vehicles.find((v) => v.id === user.activeVehicleId);
  const estimate = activeVehicle
    ? estimateChargingCost(activeVehicle.batteryCapacity, station.priceWithGST)
    : null;

  const handleStartCharging = () => {
    startCharging(station.id, station.name);
    router.push({ pathname: "/charging", params: { stationId: station.id } });
  };

  const hasActiveVehicle = !!user?.activeVehicleId;
  const hasAvailablePort = station.availablePorts > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 10), backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {station.name}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 120 : 160 }]}>
        <View style={[styles.stationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.stationTop}>
            <View style={[styles.stationIconBig, { backgroundColor: colors.primary + "18" }]}>
              <MaterialCommunityIcons name="ev-station" size={36} color={colors.primary} />
            </View>
            <View style={styles.stationTitleGroup}>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: (speedColor[station.chargerSpeed] ?? "#999") + "20" }]}>
                  <Ionicons name="flash" size={11} color={speedColor[station.chargerSpeed]} />
                  <Text style={[styles.badgeText, { color: speedColor[station.chargerSpeed] }]}>{station.chargerSpeed}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: statusColor + "22" }]}>
                  <View style={[styles.dot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.badgeText, { color: statusColor }]}>
                    {station.availablePorts === 0 ? "Busy" : `${station.availablePorts} free`}
                  </Text>
                </View>
              </View>
              <Text style={[styles.stationAddress, { color: colors.mutedForeground }]}>{station.address}</Text>
              <Text style={[styles.providerText, { color: colors.mutedForeground }]}>by {station.provider}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.directionsBtn, { backgroundColor: "#1a73e8" }]}
            activeOpacity={0.85}
            onPress={() => openGoogleMaps(station.latitude, station.longitude, station.name)}
          >
            <MaterialCommunityIcons name="google-maps" size={18} color="#fff" />
            <Text style={styles.directionsBtnText}>Get Directions on Google Maps</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.statsGrid}>
            {[
              { icon: "flash", label: "Max Power", value: `${station.maxPower} kW` },
              { icon: "location-outline", label: "Distance", value: `${station.distance} km` },
              { icon: "star", label: "Rating", value: `${station.rating}/5` },
              { icon: "cash-outline", label: "Price (incl. GST)", value: `₹${station.priceWithGST}/kWh` },
            ].map((item) => (
              <View key={item.label} style={[styles.statItem, { backgroundColor: colors.muted }]}>
                <Ionicons name={item.icon as any} size={18} color={colors.primary} />
                <Text style={[styles.statVal, { color: colors.foreground }]}>{item.value}</Text>
                <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {estimate && activeVehicle && (
          <View style={[styles.estimateCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
            <View style={styles.estimateHeader}>
              <Ionicons name="calculator-outline" size={18} color={colors.primary} />
              <Text style={[styles.estimateTitle, { color: colors.foreground }]}>
                Charge Estimate for {activeVehicle.model}
              </Text>
            </View>
            <View style={styles.estimateGrid}>
              <View style={styles.estimateStat}>
                <Text style={[styles.estimateValue, { color: colors.foreground }]}>{estimate.energyKwh} kWh</Text>
                <Text style={[styles.estimateLabel, { color: colors.mutedForeground }]}>Energy (20→80%)</Text>
              </View>
              <View style={[styles.estimateDivider, { backgroundColor: colors.border }]} />
              <View style={styles.estimateStat}>
                <Text style={[styles.estimateValue, { color: colors.primary }]}>₹{estimate.costWithGST}</Text>
                <Text style={[styles.estimateLabel, { color: colors.mutedForeground }]}>Total Cost</Text>
              </View>
              <View style={[styles.estimateDivider, { backgroundColor: colors.border }]} />
              <View style={styles.estimateStat}>
                <Text style={[styles.estimateValue, { color: colors.foreground }]}>{estimate.timeMinutes} min</Text>
                <Text style={[styles.estimateLabel, { color: colors.mutedForeground }]}>Est. Time</Text>
              </View>
            </View>
            <Text style={[styles.estimateNote, { color: colors.mutedForeground }]}>
              * Includes 18% GST. Actual cost depends on charging speed and usage.
            </Text>
          </View>
        )}

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>Connector Types</Text>
          <View style={styles.connectorList}>
            {station.supportsCar && (
              <View style={[styles.connectorChip, { backgroundColor: "#3b82f618" }]}>
                <MaterialCommunityIcons name="car-electric" size={16} color="#3b82f6" />
                <Text style={[styles.connectorText, { color: "#3b82f6" }]}>Electric Car</Text>
              </View>
            )}
            {station.supportsBike && (
              <View style={[styles.connectorChip, { backgroundColor: "#f59e0b18" }]}>
                <MaterialCommunityIcons name="scooter-electric" size={16} color="#f59e0b" />
                <Text style={[styles.connectorText, { color: "#f59e0b" }]}>Electric Bike</Text>
              </View>
            )}
          </View>
        </View>

        {station.amenities?.length > 0 && (
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>Amenities</Text>
            <View style={styles.connectorList}>
              {station.amenities.map((a) => (
                <View key={a} style={[styles.connectorChip, { backgroundColor: colors.muted }]}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                  <Text style={[styles.connectorText, { color: colors.foreground }]}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {!hasActiveVehicle && (
          <View style={[styles.warningCard, { backgroundColor: "#f59e0b18", borderColor: "#f59e0b40" }]}>
            <Ionicons name="warning-outline" size={18} color="#f59e0b" />
            <Text style={[styles.warningText, { color: "#f59e0b" }]}>
              Add a vehicle to see charge estimates and start a session
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + (Platform.OS === "web" ? 0 : 20) }]}>
        {currentSession ? (
          <PrimaryButton
            title="Charging in Progress..."
            variant="secondary"
            onPress={() => router.push({ pathname: "/charging", params: { stationId: station.id } })}
          />
        ) : (
          <PrimaryButton
            title={
              !hasAvailablePort ? "No Ports Available"
              : !hasActiveVehicle ? "Add Vehicle to Charge"
              : "Start Charging"
            }
            onPress={handleStartCharging}
            disabled={!hasAvailablePort || !hasActiveVehicle}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "center" },
  content: { padding: 16, gap: 12 },
  stationCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  stationTop: { flexDirection: "row", gap: 14, marginBottom: 14 },
  stationIconBig: { width: 66, height: 66, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  stationTitleGroup: { flex: 1, gap: 6 },
  badgeRow: { flexDirection: "row", gap: 6 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  stationAddress: { fontSize: 13, fontFamily: "Inter_400Regular" },
  providerText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginBottom: 14 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statItem: { width: "47%", borderRadius: 12, padding: 12, alignItems: "flex-start", gap: 4 },
  statVal: { fontSize: 15, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 11, fontFamily: "Inter_400Regular" },

  estimateCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  estimateHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  estimateTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  estimateGrid: { flexDirection: "row", alignItems: "center" },
  estimateStat: { flex: 1, alignItems: "center", gap: 4 },
  estimateValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  estimateLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  estimateDivider: { width: 1, height: 40 },
  estimateNote: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },

  infoCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  infoTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  connectorList: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  connectorChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  connectorText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  warningCard: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  warningText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  footer: { padding: 16, borderTopWidth: 1 },
  directionsBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, marginBottom: 14 },
  directionsBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "center" },
});
