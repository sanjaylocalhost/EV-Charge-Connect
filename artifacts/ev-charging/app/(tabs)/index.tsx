import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

import { StationCard } from "@/components/StationCard";
import { useApp } from "@/context/AppContext";
import { NEARBY_STATIONS, ChargingStation } from "@/data/vehicles";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isLoggedIn } = useApp();
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [filter, setFilter] = useState<"all" | "car" | "bike">("all");

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/auth");
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  const filteredStations =
    filter === "all"
      ? NEARBY_STATIONS
      : filter === "car"
      ? NEARBY_STATIONS.filter((s) => s.supportsCar)
      : NEARBY_STATIONS.filter((s) => s.supportsBike);

  const activeVehicle = user?.vehicles.find((v) => v.id === user.activeVehicleId);

  const speedColor = (speed: string) => {
    switch (speed) {
      case "DC Fast": return "#ef4444";
      case "AC Fast": return "#f59e0b";
      case "BESCOM": return "#10b981";
      default: return "#6b7280";
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 10) }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good day,</Text>
          <Text style={[styles.userName, { color: colors.foreground }]}>
            {user?.name?.split(" ")[0] ?? "Rider"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {activeVehicle && (
            <View style={[styles.vehiclePill, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "30" }]}>
              <MaterialCommunityIcons
                name={activeVehicle.type === "car" ? "car-electric" : "scooter-electric"}
                size={14}
                color={colors.primary}
              />
              <Text style={[styles.vehiclePillText, { color: colors.primary }]}>
                {activeVehicle.model}
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {(user?.name ?? "U")[0].toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {Platform.OS !== "web" ? (
          <MapSection
            filteredStations={filteredStations}
            setSelectedStation={setSelectedStation}
            selectedStation={selectedStation}
            colors={colors}
            router={router}
          />
        ) : (
          <View style={[styles.webMapFallback, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="map-outline" size={32} color={colors.mutedForeground} />
            <Text style={[styles.webMapText, { color: colors.mutedForeground }]}>
              Live map available on mobile
            </Text>
            <Text style={[styles.webMapSub, { color: colors.mutedForeground }]}>
              Scan QR with Expo Go to see nearby stations on map with your current location
            </Text>
          </View>
        )}

        <View style={[styles.pricingBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.pricingTitle, { color: colors.foreground }]}>Bengaluru Rates (incl. 18% GST)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pricingScroll}>
            {[
              { label: "BESCOM", price: "₹7.6", color: "#10b981", sub: "AC Slow" },
              { label: "AC Fast", price: "₹13–18", color: "#f59e0b", sub: "22 kW" },
              { label: "DC Fast", price: "₹18–25", color: "#ef4444", sub: "50–100 kW" },
            ].map((p) => (
              <View key={p.label} style={[styles.priceChip, { backgroundColor: p.color + "15", borderColor: p.color + "40" }]}>
                <Text style={[styles.priceChipLabel, { color: p.color }]}>{p.label}</Text>
                <Text style={[styles.priceChipPrice, { color: colors.foreground }]}>{p.price}</Text>
                <Text style={[styles.priceChipSub, { color: colors.mutedForeground }]}>{p.sub}/kWh</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Nearby Stations</Text>
            <View style={styles.filterRow}>
              {(["all", "car", "bike"] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: filter === f ? colors.primary : colors.muted,
                      borderColor: filter === f ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.filterText, { color: filter === f ? colors.primaryForeground : colors.mutedForeground }]}>
                    {f === "all" ? "All" : f === "car" ? "Car" : "Bike"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {filteredStations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onPress={() => router.push({ pathname: "/station/[id]", params: { id: station.id } })}
            />
          ))}

          <View style={{ height: Platform.OS === "web" ? 34 : 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

function MapSection({ filteredStations, setSelectedStation, selectedStation, colors, router }: any) {
  const MapView = require("react-native-maps").default;
  const { Marker } = require("react-native-maps");
  const Location = require("expo-location");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setUserLocation(coords);
          mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.08, longitudeDelta: 0.08 }, 800);
        }
      } catch {}
    })();
  }, []);

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{ latitude: 12.9784, longitude: 77.6408, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPress={() => setSelectedStation(null)}
      >
        {filteredStations.map((station: ChargingStation) => {
          const markerColor =
            station.availablePorts === 0 ? colors.stationOffline
            : station.availablePorts <= 2 ? colors.stationBusy
            : colors.stationOnline;
          return (
            <Marker
              key={station.id}
              coordinate={{ latitude: station.latitude, longitude: station.longitude }}
              onPress={() => setSelectedStation(station)}
            >
              <View style={[styles.markerOuter, { borderColor: markerColor }]}>
                <View style={[styles.markerInner, { backgroundColor: markerColor }]}>
                  <Ionicons name="flash" size={11} color="#fff" />
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <TouchableOpacity
        style={[styles.myLocationBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => {
          if (userLocation) {
            mapRef.current?.animateToRegion({ ...userLocation, latitudeDelta: 0.04, longitudeDelta: 0.04 }, 600);
          }
        }}
      >
        <Ionicons name="locate" size={20} color={colors.primary} />
      </TouchableOpacity>

      {selectedStation && (
        <View style={[styles.mapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Close button */}
          <TouchableOpacity
            style={[styles.mapCardClose, { backgroundColor: colors.muted }]}
            onPress={() => setSelectedStation(null)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={14} color={colors.foreground} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push({ pathname: "/station/[id]", params: { id: selectedStation.id } })}
            activeOpacity={0.85}
          >
            <View style={styles.mapCardTop}>
              <Text style={[styles.mapCardName, { color: colors.foreground }]} numberOfLines={1}>
                {selectedStation.name}
              </Text>
              <View style={[styles.mapCardBadge, { backgroundColor: selectedStation.chargerSpeed === "DC Fast" ? "#ef444420" : selectedStation.chargerSpeed === "BESCOM" ? "#10b98120" : "#f59e0b20" }]}>
                <Text style={{ fontSize: 10, fontFamily: "Inter_700Bold", color: selectedStation.chargerSpeed === "DC Fast" ? "#ef4444" : selectedStation.chargerSpeed === "BESCOM" ? "#10b981" : "#f59e0b" }}>
                  {selectedStation.chargerSpeed}
                </Text>
              </View>
            </View>
            <Text style={[styles.mapCardAddress, { color: colors.mutedForeground }]}>{selectedStation.address}</Text>
            <View style={styles.mapCardRow}>
              <View style={styles.mapPortsRow}>
                <View style={[styles.mapPortDot, { backgroundColor: selectedStation.availablePorts === 0 ? colors.stationOffline : selectedStation.availablePorts <= 2 ? colors.stationBusy : colors.stationOnline }]} />
                <Text style={[styles.mapCardStat, { color: colors.mutedForeground }]}>
                  {selectedStation.availablePorts}/{selectedStation.totalPorts} ports free
                </Text>
              </View>
              <Text style={[styles.mapCardPrice, { color: colors.primary }]}>
                ₹{selectedStation.priceWithGST}/kWh
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.mapCardActions}>
            <TouchableOpacity
              style={[styles.mapDirectionsBtn, { flex: 1 }]}
              activeOpacity={0.85}
              onPress={() => {
                const url = Platform.select({
                  ios: `comgooglemaps://?daddr=${selectedStation.latitude},${selectedStation.longitude}&directionsmode=driving`,
                  android: `google.navigation:q=${selectedStation.latitude},${selectedStation.longitude}`,
                  default: `https://www.google.com/maps/dir/?api=1&destination=${selectedStation.latitude},${selectedStation.longitude}&travelmode=driving`,
                });
                Linking.canOpenURL(url!).then((ok) => {
                  Linking.openURL(ok ? url! : `https://www.google.com/maps/dir/?api=1&destination=${selectedStation.latitude},${selectedStation.longitude}&travelmode=driving`);
                });
              }}
            >
              <MaterialCommunityIcons name="google-maps" size={15} color="#fff" />
              <Text style={styles.mapDirectionsBtnText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapViewBtn, { borderColor: colors.primary }]}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: "/station/[id]", params: { id: selectedStation.id } })}
            >
              <Text style={[styles.mapViewBtnText, { color: colors.primary }]}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  userName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  vehiclePill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  vehiclePillText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  scroll: { flex: 1 },

  mapContainer: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, overflow: "hidden", height: 190, position: "relative" },
  map: { flex: 1 },
  markerOuter: { width: 30, height: 30, borderRadius: 15, borderWidth: 2.5, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 4, elevation: 4 },
  markerInner: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  myLocationBtn: { position: "absolute", top: 10, right: 10, width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  mapCard: { position: "absolute", bottom: 8, left: 8, right: 8, borderRadius: 14, borderWidth: 1, padding: 12, gap: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 },
  mapCardClose: { position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", zIndex: 10 },
  mapCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, paddingRight: 26 },
  mapCardName: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },
  mapCardBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  mapCardAddress: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  mapCardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  mapPortsRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  mapPortDot: { width: 7, height: 7, borderRadius: 3.5 },
  mapCardStat: { fontSize: 11, fontFamily: "Inter_400Regular" },
  mapCardPrice: { fontSize: 12, fontFamily: "Inter_700Bold" },
  mapCardActions: { flexDirection: "row", gap: 8, marginTop: 2 },
  mapDirectionsBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "#1a73e8", borderRadius: 8, paddingVertical: 8 },
  mapDirectionsBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  mapViewBtn: { borderWidth: 1.5, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
  mapViewBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  webMapFallback: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, height: 110, alignItems: "center", justifyContent: "center", gap: 6 },
  webMapText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  webMapSub: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 260 },

  pricingBanner: { marginHorizontal: 16, marginBottom: 12, borderRadius: 14, borderWidth: 1, padding: 12 },
  pricingTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  pricingScroll: { gap: 8 },
  priceChip: { alignItems: "center", borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, minWidth: 90 },
  priceChipLabel: { fontSize: 11, fontFamily: "Inter_700Bold" },
  priceChipPrice: { fontSize: 15, fontFamily: "Inter_700Bold", marginTop: 2 },
  priceChipSub: { fontSize: 10, fontFamily: "Inter_400Regular" },

  section: { paddingHorizontal: 16 },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 10 },
  filterRow: { flexDirection: "row", gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
