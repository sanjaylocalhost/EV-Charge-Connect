import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser, addToWallet, chargingHistory } = useApp();
  const router = useRouter();

  const [editName, setEditName] = useState(false);
  const [editPhone, setEditPhone] = useState(false);
  const [nameVal, setNameVal] = useState(user?.name ?? "");
  const [phoneVal, setPhoneVal] = useState(user?.phone ?? "");

  const totalEnergy = chargingHistory.reduce(
    (sum, s) => sum + (s.energyConsumed ?? 0),
    0
  );
  const totalSpent = chargingHistory.reduce(
    (sum, s) => sum + (s.cost ?? 0),
    0
  );

  const handleSaveName = () => {
    updateUser({ name: nameVal });
    setEditName(false);
  };

  const handleSavePhone = () => {
    updateUser({ phone: phoneVal });
    setEditPhone(false);
  };

  const handleTopUp = (amount: number) => {
    addToWallet(amount);
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      logout();
      router.replace("/auth");
      return;
    }
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/auth");
        },
      },
    ]);
  };

  const MenuItem = ({
    icon,
    label,
    value,
    onEdit,
    onSave,
    editing,
    editValue,
    onChangeText,
    keyboardType,
  }: {
    icon: any;
    label: string;
    value: string;
    onEdit?: () => void;
    onSave?: () => void;
    editing?: boolean;
    editValue?: string;
    onChangeText?: (t: string) => void;
    keyboardType?: any;
  }) => (
    <View
      style={[
        styles.menuItem,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: colors.primary + "18" }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        {editing ? (
          <TextInput
            style={[styles.menuInput, { color: colors.foreground, borderColor: colors.border }]}
            value={editValue}
            onChangeText={onChangeText}
            autoFocus
            keyboardType={keyboardType}
          />
        ) : (
          <Text style={[styles.menuValue, { color: colors.foreground }]}>
            {value || "Not set"}
          </Text>
        )}
      </View>
      {editing ? (
        <TouchableOpacity onPress={onSave}>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        </TouchableOpacity>
      ) : onEdit ? (
        <TouchableOpacity onPress={onEdit}>
          <Ionicons name="pencil-outline" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 10) },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 34 : 100 },
        ]}
      >
        <View style={styles.avatarSection}>
          <View style={[styles.bigAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.bigAvatarText}>
              {(user?.name ?? "U")[0].toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.foreground }]}>
            {user?.name}
          </Text>
          <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
            {user?.email}
          </Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Sessions", value: chargingHistory.length.toString() },
            {
              label: "Energy Used",
              value: `${totalEnergy.toFixed(1)} kWh`,
            },
            { label: "Spent", value: `₹${totalSpent.toFixed(0)}` },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[
                styles.statBox,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.walletCard,
            { backgroundColor: colors.primary, borderRadius: 16 },
          ]}
        >
          <View style={styles.walletTop}>
            <Ionicons name="wallet" size={22} color="#fff" />
            <Text style={styles.walletLabel}>Wallet Balance</Text>
          </View>
          <Text style={styles.walletAmount}>₹{user?.walletBalance?.toFixed(0)}</Text>
          <View style={styles.topUpRow}>
            {[100, 200, 500].map((amount) => (
              <TouchableOpacity
                key={amount}
                onPress={() => handleTopUp(amount)}
                style={styles.topUpBtn}
              >
                <Text style={styles.topUpText}>+₹{amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          PERSONAL INFO
        </Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="person-outline"
            label="Full Name"
            value={user?.name ?? ""}
            onEdit={() => {
              setNameVal(user?.name ?? "");
              setEditName(true);
            }}
            onSave={handleSaveName}
            editing={editName}
            editValue={nameVal}
            onChangeText={setNameVal}
          />
          <MenuItem
            icon="mail-outline"
            label="Email"
            value={user?.email ?? ""}
          />
          <MenuItem
            icon="call-outline"
            label="Phone"
            value={user?.phone ?? ""}
            onEdit={() => {
              setPhoneVal(user?.phone ?? "");
              setEditPhone(true);
            }}
            onSave={handleSavePhone}
            editing={editPhone}
            editValue={phoneVal}
            onChangeText={setPhoneVal}
            keyboardType="phone-pad"
          />
        </View>

        {chargingHistory.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              RECENT SESSIONS
            </Text>
            {chargingHistory.slice(0, 3).map((session) => (
              <View
                key={session.id}
                style={[
                  styles.sessionCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={[styles.sessionIcon, { backgroundColor: colors.primary + "18" }]}>
                  <Ionicons name="flash" size={18} color={colors.primary} />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionStation, { color: colors.foreground }]}>
                    {session.stationName}
                  </Text>
                  <Text style={[styles.sessionDate, { color: colors.mutedForeground }]}>
                    {new Date(session.startTime).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <View style={styles.sessionRight}>
                  <Text style={[styles.sessionCost, { color: colors.foreground }]}>
                    ₹{session.cost?.toFixed(0)}
                  </Text>
                  <Text style={[styles.sessionEnergy, { color: colors.mutedForeground }]}>
                    {session.energyConsumed?.toFixed(1)} kWh
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        <PrimaryButton
          title="Sign Out"
          variant="outline"
          onPress={handleLogout}
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  content: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  avatarSection: { alignItems: "center", paddingVertical: 20, gap: 6 },
  bigAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  bigAvatarText: { color: "#fff", fontSize: 32, fontFamily: "Inter_700Bold" },
  userName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  userEmail: { fontSize: 13, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", gap: 10 },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  walletCard: { padding: 20 },
  walletTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  walletLabel: { color: "#ffffffcc", fontSize: 13, fontFamily: "Inter_500Medium" },
  walletAmount: { color: "#fff", fontSize: 32, fontFamily: "Inter_700Bold", marginBottom: 16 },
  topUpRow: { flexDirection: "row", gap: 10 },
  topUpBtn: {
    backgroundColor: "#ffffff22",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ffffff44",
  },
  topUpText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1, marginTop: 8 },
  menuGroup: { gap: 8 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  menuIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 2 },
  menuValue: { fontSize: 15, fontFamily: "Inter_500Medium" },
  menuInput: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    borderBottomWidth: 1,
    paddingBottom: 2,
  },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  sessionIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sessionInfo: { flex: 1, gap: 2 },
  sessionStation: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sessionDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sessionRight: { alignItems: "flex-end", gap: 2 },
  sessionCost: { fontSize: 15, fontFamily: "Inter_700Bold" },
  sessionEnergy: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
