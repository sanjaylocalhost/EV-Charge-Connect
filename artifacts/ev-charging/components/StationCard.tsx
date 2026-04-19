import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { ChargingStation } from "@/data/vehicles";

interface StationCardProps {
  station: ChargingStation;
  onPress: () => void;
  compact?: boolean;
}

function SpeedBadge({ speed }: { speed: string }) {
  const colorMap: Record<string, string> = {
    "DC Fast": "#ef4444",
    "AC Fast": "#f59e0b",
    "AC Slow": "#6b7280",
    "BESCOM": "#10b981",
  };
  const c = colorMap[speed] ?? "#6b7280";
  return (
    <View style={[sb.badge, { backgroundColor: c + "18", borderColor: c + "40" }]}>
      <Ionicons name="flash" size={10} color={c} />
      <Text style={[sb.text, { color: c }]}>{speed}</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  text: { fontSize: 10, fontFamily: "Inter_700Bold" },
});

export function StationCard({ station, onPress }: StationCardProps) {
  const colors = useColors();
  const statusColor =
    station.availablePorts === 0
      ? colors.stationOffline
      : station.availablePorts <= 2
      ? colors.stationBusy
      : colors.stationOnline;

  const statusLabel =
    station.availablePorts === 0 ? "Busy"
    : station.availablePorts <= 2 ? "Few Left"
    : "Available";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + "18" }]}>
          <MaterialCommunityIcons name="ev-station" size={22} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {station.name}
          </Text>
          <Text style={[styles.address, { color: colors.mutedForeground }]} numberOfLines={1}>
            {station.address}
          </Text>
          <View style={styles.badgeRow}>
            <SpeedBadge speed={station.chargerSpeed} />
            <View style={[styles.providerBadge, { backgroundColor: colors.muted }]}>
              <Text style={[styles.providerText, { color: colors.mutedForeground }]}>{station.provider}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.bottomRow}>
        <View style={styles.stat}>
          <Ionicons name="flash" size={13} color={colors.mutedForeground} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>{station.maxPower} kW</Text>
        </View>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="power-plug" size={13} color={colors.mutedForeground} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>
            {station.availablePorts}/{station.totalPorts}
          </Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>{station.distance} km</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.primary }]}>₹{station.priceWithGST}</Text>
          <Text style={[styles.priceUnit, { color: colors.mutedForeground }]}>/kWh</Text>
        </View>
      </View>

      {station.amenities?.length > 0 && (
        <View style={styles.amenitiesRow}>
          {station.amenities.slice(0, 3).map((a) => (
            <View key={a} style={[styles.amenityChip, { backgroundColor: colors.muted }]}>
              <Text style={[styles.amenityText, { color: colors.mutedForeground }]}>{a}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  iconContainer: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  address: { fontSize: 12, fontFamily: "Inter_400Regular" },
  badgeRow: { flexDirection: "row", gap: 6, marginTop: 2 },
  providerBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  providerText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginVertical: 10 },
  bottomRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  priceContainer: { flexDirection: "row", alignItems: "baseline", marginLeft: "auto" },
  price: { fontSize: 15, fontFamily: "Inter_700Bold" },
  priceUnit: { fontSize: 11, fontFamily: "Inter_400Regular", marginLeft: 2 },
  amenitiesRow: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
  amenityChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  amenityText: { fontSize: 10, fontFamily: "Inter_400Regular" },
});
