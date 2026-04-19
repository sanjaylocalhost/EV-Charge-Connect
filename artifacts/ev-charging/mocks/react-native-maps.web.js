import React from "react";
import { View } from "react-native";

const MapView = ({ children, style }) => React.createElement(View, { style }, children);
const Marker = ({ children }) => children ?? null;
const PROVIDER_DEFAULT = null;
const PROVIDER_GOOGLE = null;

module.exports = {
  default: MapView,
  MapView,
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
};
