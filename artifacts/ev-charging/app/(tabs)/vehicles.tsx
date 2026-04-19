import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
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
import { BIKE_MODELS, BRAND_COLORS, CAR_MODELS, VehicleModel, estimateChargingCost, NEARBY_STATIONS } from "@/data/vehicles";
import { useColors } from "@/hooks/useColors";

const CAR_IMAGE = require("@/assets/images/ev-car.png");
const BIKE_IMAGE = require("@/assets/images/ev-bike.png");

function BrandBadge({ brand, size = 32 }: { brand: string; size?: number }) {
  const brandColor = BRAND_COLORS[brand] ?? "#444";
  const initials = brand.slice(0, 2).toUpperCase();
  return (
    <View style={[styles.brandBadge, { width: size, height: size, borderRadius: size / 4, backgroundColor: brandColor }]}>
      <Text style={[styles.brandBadgeText, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

function ModelCard({ item, selected, onPress, vehicleType }: { item: VehicleModel; selected: boolean; onPress: () => void; vehicleType: "car" | "bike" }) {
  const colors = useColors();
  const brandColor = BRAND_COLORS[item.brand] ?? "#444";

  const avgStation = NEARBY_STATIONS.find(s => vehicleType === "car" ? s.supportsCar : s.supportsBike);
  const estimate = avgStation ? estimateChargingCost(item.batteryCapacity, avgStation.priceWithGST) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.modelCard,
        {
          backgroundColor: selected ? brandColor + "12" : colors.card,
          borderColor: selected ? brandColor : colors.border,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <View style={[styles.modelCardHeader, { backgroundColor: brandColor + "18" }]}>
        <View style={styles.modelCardHeaderLeft}>
          <BrandBadge brand={item.brand} size={34} />
          <View>
            <Text style={[styles.modelCardBrand, { color: brandColor }]}>{item.brand}</Text>
            <Text style={[styles.modelCardName, { color: colors.foreground }]}>{item.model}</Text>
          </View>
        </View>
        <Image
          source={vehicleType === "car" ? CAR_IMAGE : BIKE_IMAGE}
          style={styles.vehicleImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.modelCardBody}>
        <View style={styles.specRow}>
          <View style={styles.spec}>
            <Ionicons name="battery-charging" size={13} color={colors.mutedForeground} />
            <Text style={[styles.specValue, { color: colors.foreground }]}>{item.batteryCapacity} kWh</Text>
          </View>
          <View style={styles.spec}>
            <MaterialCommunityIcons name="map-marker-distance" size={13} color={colors.mutedForeground} />
            <Text style={[styles.specValue, { color: colors.foreground }]}>{item.range} km</Text>
          </View>
          <View style={styles.spec}>
            <MaterialCommunityIcons name="electric-switch" size={13} color={colors.mutedForeground} />
            <Text style={[styles.specValue, { color: colors.foreground }]}>{item.connectorType}</Text>
          </View>
        </View>

        {estimate && (
          <View style={[styles.estimateRow, { backgroundColor: colors.muted }]}>
            <Text style={[styles.estimateLabel, { color: colors.mutedForeground }]}>20→80% charge est.</Text>
            <Text style={[styles.estimateValue, { color: colors.foreground }]}>
              ₹{estimate.costWithGST} · ~{estimate.timeMinutes} min
            </Text>
          </View>
        )}
      </View>

      {selected && (
        <View style={[styles.selectedCheck, { backgroundColor: brandColor }]}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function VehiclesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addVehicle, removeVehicle, setActiveVehicle } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"type" | "model">("type");
  const [selectedType, setSelectedType] = useState<"car" | "bike">("car");
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);

  const models = selectedType === "car" ? CAR_MODELS : BIKE_MODELS;

  const handleAdd = () => {
    if (!selectedModel) return;
    addVehicle({
      type: selectedType,
      brand: selectedModel.brand,
      model: selectedModel.model,
      batteryCapacity: selectedModel.batteryCapacity,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowModal(false);
    setStep("type");
    setSelectedModel(null);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 10) }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>My Vehicles</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {user?.vehicles?.length ?? 0} registered
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => { setShowModal(true); setStep("type"); }}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 34 : 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {(!user?.vehicles || user.vehicles.length === 0) ? (
          <View style={styles.emptyState}>
            <Image source={CAR_IMAGE} style={styles.emptyImage} resizeMode="contain" />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No vehicles added</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Add your EV to see charge estimates and find compatible stations nearby
            </Text>
            <PrimaryButton
              title="Add My EV"
              onPress={() => { setShowModal(true); setStep("type"); }}
              style={styles.emptyBtn}
            />
          </View>
        ) : (
          user.vehicles.map((vehicle) => {
            const isActive = vehicle.id === user.activeVehicleId;
            const brandColor = BRAND_COLORS[vehicle.brand] ?? "#444";
            return (
              <TouchableOpacity
                key={vehicle.id}
                onPress={() => setActiveVehicle(vehicle.id)}
                activeOpacity={0.85}
                style={[
                  styles.vehicleCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isActive ? brandColor : colors.border,
                    borderWidth: isActive ? 2 : 1,
                  },
                ]}
              >
                <View style={[styles.vehicleCardBanner, { backgroundColor: brandColor + "18" }]}>
                  <View style={styles.vehicleCardBannerLeft}>
                    <BrandBadge brand={vehicle.brand} size={36} />
                    <View>
                      <Text style={[styles.vehicleCardBrand, { color: brandColor }]}>{vehicle.brand}</Text>
                      <Text style={[styles.vehicleCardModel, { color: colors.foreground }]}>{vehicle.model}</Text>
                    </View>
                  </View>
                  <Image
                    source={vehicle.type === "car" ? CAR_IMAGE : BIKE_IMAGE}
                    style={styles.cardVehicleImage}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.vehicleCardFooter}>
                  <View style={styles.vehicleMetaRow}>
                    <View style={[styles.typePill, { backgroundColor: vehicle.type === "car" ? "#3b82f618" : "#f59e0b18" }]}>
                      <MaterialCommunityIcons
                        name={vehicle.type === "car" ? "car-electric" : "scooter-electric"}
                        size={12}
                        color={vehicle.type === "car" ? "#3b82f6" : "#f59e0b"}
                      />
                      <Text style={[styles.typePillText, { color: vehicle.type === "car" ? "#3b82f6" : "#f59e0b" }]}>
                        {vehicle.type === "car" ? "Electric Car" : "Electric Bike"}
                      </Text>
                    </View>
                    <Text style={[styles.vehicleCapacity, { color: colors.mutedForeground }]}>
                      {vehicle.batteryCapacity} kWh battery
                    </Text>
                  </View>

                  <View style={styles.vehicleCardActions}>
                    {isActive ? (
                      <View style={[styles.activePill, { backgroundColor: brandColor }]}>
                        <Ionicons name="checkmark-circle" size={12} color="#fff" />
                        <Text style={styles.activePillText}>Active Vehicle</Text>
                      </View>
                    ) : (
                      <Text style={[styles.tapToActivate, { color: colors.mutedForeground }]}>
                        Tap to set active
                      </Text>
                    )}
                    <TouchableOpacity onPress={() => removeVehicle(vehicle.id)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={18} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHandle}>
            <View style={[styles.handle, { backgroundColor: colors.mutedForeground }]} />
          </View>

          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {step === "type" ? "Choose Vehicle Type" : `Select ${selectedType === "car" ? "Car" : "Bike"} Model`}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {step === "type" ? (
            <View style={styles.typeGrid}>
              <TouchableOpacity
                onPress={() => { setSelectedType("car"); setStep("model"); }}
                activeOpacity={0.85}
                style={[styles.typeCard, { backgroundColor: colors.card, borderColor: "#3b82f6" }]}
              >
                <View style={[styles.typeCardImageBg, { backgroundColor: "#3b82f612" }]}>
                  <Image source={CAR_IMAGE} style={styles.typeCardImage} resizeMode="contain" />
                </View>
                <Text style={[styles.typeCardTitle, { color: colors.foreground }]}>Electric Car</Text>
                <Text style={[styles.typeCardSub, { color: colors.mutedForeground }]}>{CAR_MODELS.length} models</Text>
                <View style={styles.typeCardBrands}>
                  {["Tata", "MG", "Hyundai", "Kia"].map(b => (
                    <View key={b} style={[styles.smallBrand, { backgroundColor: BRAND_COLORS[b] }]}>
                      <Text style={styles.smallBrandText}>{b.slice(0,2)}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setSelectedType("bike"); setStep("model"); }}
                activeOpacity={0.85}
                style={[styles.typeCard, { backgroundColor: colors.card, borderColor: "#f59e0b" }]}
              >
                <View style={[styles.typeCardImageBg, { backgroundColor: "#f59e0b12" }]}>
                  <Image source={BIKE_IMAGE} style={styles.typeCardImage} resizeMode="contain" />
                </View>
                <Text style={[styles.typeCardTitle, { color: colors.foreground }]}>Electric Scooter</Text>
                <Text style={[styles.typeCardSub, { color: colors.mutedForeground }]}>{BIKE_MODELS.length} models</Text>
                <View style={styles.typeCardBrands}>
                  {["Ola", "Ather", "TVS", "Bajaj"].map(b => (
                    <View key={b} style={[styles.smallBrand, { backgroundColor: BRAND_COLORS[b] }]}>
                      <Text style={styles.smallBrandText}>{b.slice(0,2)}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity onPress={() => setStep("type")} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={20} color={colors.primary} />
                <Text style={[styles.backText, { color: colors.primary }]}>Change type</Text>
              </TouchableOpacity>

              <FlatList
                data={models}
                keyExtractor={(item) => item.brand + item.model}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => (
                  <ModelCard
                    item={item}
                    selected={selectedModel?.model === item.model && selectedModel?.brand === item.brand}
                    onPress={() => setSelectedModel(item)}
                    vehicleType={selectedType}
                  />
                )}
              />

              {selectedModel && (
                <View style={[styles.confirmBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                  <View style={styles.confirmInfo}>
                    <BrandBadge brand={selectedModel.brand} size={28} />
                    <Text style={[styles.confirmText, { color: colors.foreground }]}>
                      {selectedModel.brand} {selectedModel.model}
                    </Text>
                  </View>
                  <PrimaryButton title="Add Vehicle" onPress={handleAdd} style={{ flex: 1 }} />
                </View>
              )}
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginTop: 2 },
  content: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 14 },
  emptyImage: { width: 200, height: 140 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 280, lineHeight: 22 },
  emptyBtn: { marginTop: 4, width: 200 },

  vehicleCard: { borderRadius: 16, overflow: "hidden" },
  vehicleCardBanner: { padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  vehicleCardBannerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  vehicleCardBrand: { fontSize: 11, fontFamily: "Inter_700Bold" },
  vehicleCardModel: { fontSize: 16, fontFamily: "Inter_700Bold" },
  cardVehicleImage: { width: 90, height: 55 },
  vehicleCardFooter: { padding: 12, gap: 8 },
  vehicleMetaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  typePill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  typePillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  vehicleCapacity: { fontSize: 12, fontFamily: "Inter_400Regular" },
  vehicleCardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  activePill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  activePillText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  tapToActivate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  deleteBtn: { padding: 4 },

  brandBadge: { alignItems: "center", justifyContent: "center" },
  brandBadgeText: { color: "#fff", fontFamily: "Inter_700Bold" },

  modal: { flex: 1 },
  modalHandle: { alignItems: "center", paddingTop: 12 },
  handle: { width: 40, height: 4, borderRadius: 2 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  modalTitle: { fontSize: 19, fontFamily: "Inter_700Bold", flex: 1 },

  typeGrid: { flexDirection: "row", gap: 12, paddingHorizontal: 16, marginTop: 4 },
  typeCard: { flex: 1, borderWidth: 2, borderRadius: 18, overflow: "hidden" },
  typeCardImageBg: { padding: 16, alignItems: "center" },
  typeCardImage: { width: "100%", height: 80 },
  typeCardTitle: { fontSize: 14, fontFamily: "Inter_700Bold", textAlign: "center", paddingHorizontal: 12 },
  typeCardSub: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 12 },
  typeCardBrands: { flexDirection: "row", gap: 4, padding: 12, paddingTop: 8 },
  smallBrand: { width: 22, height: 22, borderRadius: 5, alignItems: "center", justifyContent: "center" },
  smallBrandText: { color: "#fff", fontSize: 8, fontFamily: "Inter_700Bold" },

  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingBottom: 12 },
  backText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  modelCard: { borderRadius: 14, overflow: "hidden" },
  modelCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12 },
  modelCardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  modelCardBrand: { fontSize: 10, fontFamily: "Inter_700Bold" },
  modelCardName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  vehicleImage: { width: 80, height: 50 },
  modelCardBody: { padding: 12, paddingTop: 0, gap: 8 },
  specRow: { flexDirection: "row", gap: 14 },
  spec: { flexDirection: "row", alignItems: "center", gap: 4 },
  specValue: { fontSize: 12, fontFamily: "Inter_500Medium" },
  estimateRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  estimateLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  estimateValue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  selectedCheck: { position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },

  confirmBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderTopWidth: 1 },
  confirmInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  confirmText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
