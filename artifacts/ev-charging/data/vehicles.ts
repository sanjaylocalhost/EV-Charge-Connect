export interface VehicleModel {
  brand: string;
  model: string;
  batteryCapacity: number;
  range: number;
  color: string;
  connectorType: "CCS2" | "CHAdeMO" | "Type2" | "GB/T" | "Proprietary";
  chargePort: "car" | "bike";
}

export const BRAND_COLORS: Record<string, string> = {
  "Tata": "#00338D",
  "MG": "#C8102E",
  "Hyundai": "#002C5F",
  "Kia": "#05141F",
  "Mahindra": "#E31837",
  "BYD": "#1B1B2F",
  "Volvo": "#003057",
  "Ola": "#1A1A2E",
  "Ather": "#E84118",
  "TVS": "#003087",
  "Bajaj": "#003DA5",
  "Hero": "#CC0000",
  "Honda": "#CC0000",
  "Simple One": "#6C5CE7",
  "Revolt": "#2D3436",
};

export const CAR_MODELS: VehicleModel[] = [
  { brand: "Tata", model: "Nexon EV", batteryCapacity: 40.5, range: 465, color: "#00338D", connectorType: "CCS2", chargePort: "car" },
  { brand: "Tata", model: "Punch EV", batteryCapacity: 35, range: 421, color: "#00338D", connectorType: "CCS2", chargePort: "car" },
  { brand: "Tata", model: "Tiago EV", batteryCapacity: 24, range: 315, color: "#00338D", connectorType: "CCS2", chargePort: "car" },
  { brand: "MG", model: "ZS EV", batteryCapacity: 50.3, range: 461, color: "#C8102E", connectorType: "CCS2", chargePort: "car" },
  { brand: "MG", model: "Comet EV", batteryCapacity: 17.3, range: 230, color: "#C8102E", connectorType: "CCS2", chargePort: "car" },
  { brand: "Hyundai", model: "Ioniq 5", batteryCapacity: 72.6, range: 631, color: "#002C5F", connectorType: "CCS2", chargePort: "car" },
  { brand: "Hyundai", model: "Kona Electric", batteryCapacity: 39.2, range: 452, color: "#002C5F", connectorType: "CCS2", chargePort: "car" },
  { brand: "Kia", model: "EV6", batteryCapacity: 77.4, range: 708, color: "#05141F", connectorType: "CCS2", chargePort: "car" },
  { brand: "Mahindra", model: "XEV 9e", batteryCapacity: 79, range: 656, color: "#E31837", connectorType: "CCS2", chargePort: "car" },
  { brand: "Mahindra", model: "BE 6e", batteryCapacity: 59, range: 535, color: "#E31837", connectorType: "CCS2", chargePort: "car" },
  { brand: "BYD", model: "Atto 3", batteryCapacity: 60.5, range: 521, color: "#1B1B2F", connectorType: "CCS2", chargePort: "car" },
  { brand: "Volvo", model: "XC40 Recharge", batteryCapacity: 82, range: 418, color: "#003057", connectorType: "CCS2", chargePort: "car" },
];

export const BIKE_MODELS: VehicleModel[] = [
  { brand: "Ola", model: "S1 Pro", batteryCapacity: 4, range: 195, color: "#1A1A2E", connectorType: "Proprietary", chargePort: "bike" },
  { brand: "Ola", model: "S1 Air", batteryCapacity: 3, range: 151, color: "#1A1A2E", connectorType: "Proprietary", chargePort: "bike" },
  { brand: "Ather", model: "450X", batteryCapacity: 3.7, range: 150, color: "#E84118", connectorType: "Proprietary", chargePort: "bike" },
  { brand: "Ather", model: "450S", batteryCapacity: 2.9, range: 115, color: "#E84118", connectorType: "Proprietary", chargePort: "bike" },
  { brand: "TVS", model: "iQube", batteryCapacity: 5.1, range: 145, color: "#003087", connectorType: "Type2", chargePort: "bike" },
  { brand: "Bajaj", model: "Chetak", batteryCapacity: 3.2, range: 126, color: "#003DA5", connectorType: "Proprietary", chargePort: "bike" },
  { brand: "Hero", model: "Vida V1 Pro", batteryCapacity: 3.94, range: 165, color: "#CC0000", connectorType: "Type2", chargePort: "bike" },
  { brand: "Honda", model: "Activa Electric", batteryCapacity: 1.5, range: 102, color: "#CC0000", connectorType: "Proprietary", chargePort: "bike" },
  { brand: "Simple One", model: "Simple One", batteryCapacity: 5, range: 300, color: "#6C5CE7", connectorType: "Type2", chargePort: "bike" },
  { brand: "Revolt", model: "RV400", batteryCapacity: 3.24, range: 150, color: "#2D3436", connectorType: "Type2", chargePort: "bike" },
];

export type ChargerSpeed = "DC Fast" | "AC Fast" | "AC Slow" | "BESCOM";

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalPorts: number;
  availablePorts: number;
  powerType: "AC" | "DC" | "Both";
  chargerSpeed: ChargerSpeed;
  maxPower: number;
  pricePerUnit: number;
  priceWithGST: number;
  rating: number;
  distance: number;
  supportsCar: boolean;
  supportsBike: boolean;
  amenities: string[];
  provider: string;
}

function withGST(price: number) {
  return parseFloat((price * 1.18).toFixed(1));
}

export const NEARBY_STATIONS: ChargingStation[] = [
  {
    id: "s1",
    name: "Tata Power EZ Charge",
    address: "100 Feet Road, Indiranagar",
    latitude: 12.9784,
    longitude: 77.6408,
    totalPorts: 6,
    availablePorts: 4,
    powerType: "Both",
    chargerSpeed: "DC Fast",
    maxPower: 50,
    pricePerUnit: 18,
    priceWithGST: withGST(18),
    rating: 4.5,
    distance: 0.8,
    supportsCar: true,
    supportsBike: false,
    amenities: ["Parking", "24/7", "App Payment"],
    provider: "Tata Power",
  },
  {
    id: "s2",
    name: "Statiq Fast Charger",
    address: "80 Feet Road, Koramangala",
    latitude: 12.9352,
    longitude: 77.6245,
    totalPorts: 4,
    availablePorts: 2,
    powerType: "DC",
    chargerSpeed: "DC Fast",
    maxPower: 100,
    pricePerUnit: 22,
    priceWithGST: withGST(22),
    rating: 4.2,
    distance: 1.4,
    supportsCar: true,
    supportsBike: false,
    amenities: ["Mall Parking", "UPI", "App Control"],
    provider: "Statiq",
  },
  {
    id: "s3",
    name: "ChargeZone Hub",
    address: "Sector 2, HSR Layout",
    latitude: 12.9121,
    longitude: 77.6446,
    totalPorts: 8,
    availablePorts: 6,
    powerType: "Both",
    chargerSpeed: "AC Fast",
    maxPower: 22,
    pricePerUnit: 13,
    priceWithGST: withGST(13),
    rating: 4.7,
    distance: 2.1,
    supportsCar: true,
    supportsBike: true,
    amenities: ["24/7", "Café nearby", "UPI"],
    provider: "ChargeZone",
  },
  {
    id: "s4",
    name: "Ather Grid Station",
    address: "Whitefield Main Road",
    latitude: 12.9698,
    longitude: 77.7499,
    totalPorts: 3,
    availablePorts: 1,
    powerType: "AC",
    chargerSpeed: "AC Slow",
    maxPower: 7.2,
    pricePerUnit: 11,
    priceWithGST: withGST(11),
    rating: 4.0,
    distance: 3.6,
    supportsCar: false,
    supportsBike: true,
    amenities: ["Scooter Only", "App Required"],
    provider: "Ather",
  },
  {
    id: "s5",
    name: "BESCOM EV Charging",
    address: "MG Road Metro Station",
    latitude: 12.9753,
    longitude: 77.6101,
    totalPorts: 5,
    availablePorts: 5,
    powerType: "AC",
    chargerSpeed: "BESCOM",
    maxPower: 7.2,
    pricePerUnit: 7.6,
    priceWithGST: 7.6,
    rating: 3.8,
    distance: 4.2,
    supportsCar: true,
    supportsBike: true,
    amenities: ["Cheapest", "Metro Parking", "Card Payment"],
    provider: "BESCOM",
  },
  {
    id: "s6",
    name: "Bolt.Earth Charger",
    address: "Electronic City Phase 1",
    latitude: 12.8399,
    longitude: 77.6784,
    totalPorts: 4,
    availablePorts: 0,
    powerType: "DC",
    chargerSpeed: "DC Fast",
    maxPower: 60,
    pricePerUnit: 20,
    priceWithGST: withGST(20),
    rating: 4.1,
    distance: 5.8,
    supportsCar: true,
    supportsBike: false,
    amenities: ["Office Park", "App Control", "UPI"],
    provider: "Bolt.Earth",
  },
  {
    id: "s7",
    name: "Kazam AC Point",
    address: "Jayanagar 4th Block",
    latitude: 12.9279,
    longitude: 77.5937,
    totalPorts: 3,
    availablePorts: 2,
    powerType: "AC",
    chargerSpeed: "AC Fast",
    maxPower: 22,
    pricePerUnit: 14,
    priceWithGST: withGST(14),
    rating: 4.3,
    distance: 6.5,
    supportsCar: true,
    supportsBike: true,
    amenities: ["Residential Area", "QR Pay"],
    provider: "Kazam",
  },
];

export function estimateChargingCost(
  batteryCapacity: number,
  pricePerUnit: number,
  fromPercent = 20,
  toPercent = 80
): { energyKwh: number; costBase: number; costWithGST: number; timeMinutes: number; power: number } {
  const energyKwh = batteryCapacity * (toPercent - fromPercent) / 100;
  const costBase = energyKwh * pricePerUnit;
  const costWithGST = costBase * 1.18;
  const power = 7.2;
  const timeMinutes = Math.round((energyKwh / power) * 60);
  return { energyKwh: parseFloat(energyKwh.toFixed(2)), costBase: parseFloat(costBase.toFixed(0)), costWithGST: parseFloat(costWithGST.toFixed(0)), timeMinutes, power };
}
