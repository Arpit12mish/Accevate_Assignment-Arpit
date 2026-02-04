import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  value: string | number;
  accent: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export default function StatCard({ title, value, accent, icon }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: accent }]}>
        {icon && <Ionicons name={icon} size={18} color="#fff" />}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
    marginHorizontal: 8,
    
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
  },
  title: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
