import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StatCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string | number;
  accent: string;
}) {
  return (
    <View style={[styles.card, { borderColor: accent }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#FAFAFA",
  },
  title: { color: "#555", fontWeight: "700", marginBottom: 8 },
  value: { fontSize: 18, fontWeight: "900" },
});
