import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const logo = require("../assets/logo.png");

export default function TopBar({ title }: { title?: string }) {
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <View>
        <Text style={styles.brand}>
          Let'sMove <Text style={{ color: "#1B7A3D" }}>Kigali</Text>
        </Text>
        {title && <Text style={styles.pageTitle}>{title}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 12,
  },
  logo: { width: 44, height: 44 },
  brand: { fontSize: 19, fontWeight: "800", color: "#222" },
  pageTitle: { fontSize: 13, color: "#888", fontWeight: "600", marginTop: 1 },
});