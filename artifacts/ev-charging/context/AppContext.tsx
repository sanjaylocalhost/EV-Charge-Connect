import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type VehicleType = "car" | "bike";

export interface Vehicle {
  id: string;
  type: VehicleType;
  brand: string;
  model: string;
  batteryCapacity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  walletBalance: number;
}

export interface ChargingSession {
  id: string;
  stationId: string;
  stationName: string;
  startTime: Date;
  endTime?: Date;
  energyConsumed?: number;
  cost?: number;
  vehicleId: string;
  status: "active" | "completed" | "cancelled";
}

interface AppContextType {
  user: User | null;
  isLoggedIn: boolean;
  currentSession: ChargingSession | null;
  chargingHistory: ChargingSession[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => void;
  removeVehicle: (vehicleId: string) => void;
  setActiveVehicle: (vehicleId: string) => void;
  startCharging: (stationId: string, stationName: string) => void;
  stopCharging: (energyConsumed: number, cost: number) => void;
  addToWallet: (amount: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "@ev_app_user";
const HISTORY_KEY = "@ev_app_history";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<ChargingSession | null>(null);
  const [chargingHistory, setChargingHistory] = useState<ChargingSession[]>([]);

  useEffect(() => {
    loadUser();
    loadHistory();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  };

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setChargingHistory(parsed.map((s: ChargingSession) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined,
        })));
      }
    } catch {}
  };

  const saveUser = async (u: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch {}
  };

  const saveHistory = async (history: ChargingSession[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {}
  };

  const login = async (email: string, _password: string): Promise<boolean> => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newUser: User = {
      id,
      name: email.split("@")[0],
      email,
      phone: "",
      vehicles: [],
      activeVehicleId: null,
      walletBalance: 500,
    };
    setUser(newUser);
    await saveUser(newUser);
    return true;
  };

  const logout = async () => {
    setUser(null);
    setCurrentSession(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    saveUser(updated);
  };

  const addVehicle = (vehicle: Omit<Vehicle, "id">) => {
    if (!user) return;
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newVehicle: Vehicle = { ...vehicle, id };
    const vehicles = [...user.vehicles, newVehicle];
    const activeVehicleId = user.activeVehicleId ?? id;
    const updated = { ...user, vehicles, activeVehicleId };
    setUser(updated);
    saveUser(updated);
  };

  const removeVehicle = (vehicleId: string) => {
    if (!user) return;
    const vehicles = user.vehicles.filter((v) => v.id !== vehicleId);
    const activeVehicleId =
      user.activeVehicleId === vehicleId
        ? vehicles[0]?.id ?? null
        : user.activeVehicleId;
    const updated = { ...user, vehicles, activeVehicleId };
    setUser(updated);
    saveUser(updated);
  };

  const setActiveVehicle = (vehicleId: string) => {
    if (!user) return;
    const updated = { ...user, activeVehicleId: vehicleId };
    setUser(updated);
    saveUser(updated);
  };

  const startCharging = (stationId: string, stationName: string) => {
    if (!user) return;
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const session: ChargingSession = {
      id,
      stationId,
      stationName,
      startTime: new Date(),
      vehicleId: user.activeVehicleId ?? "",
      status: "active",
    };
    setCurrentSession(session);
  };

  const stopCharging = (energyConsumed: number, cost: number) => {
    if (!currentSession || !user) return;
    const completed: ChargingSession = {
      ...currentSession,
      endTime: new Date(),
      energyConsumed,
      cost,
      status: "completed",
    };
    const newHistory = [completed, ...chargingHistory];
    setChargingHistory(newHistory);
    saveHistory(newHistory);
    setCurrentSession(null);
    const updated = { ...user, walletBalance: user.walletBalance - cost };
    setUser(updated);
    saveUser(updated);
  };

  const addToWallet = (amount: number) => {
    if (!user) return;
    const updated = { ...user, walletBalance: user.walletBalance + amount };
    setUser(updated);
    saveUser(updated);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        currentSession,
        chargingHistory,
        login,
        logout,
        updateUser,
        addVehicle,
        removeVehicle,
        setActiveVehicle,
        startCharging,
        stopCharging,
        addToWallet,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
