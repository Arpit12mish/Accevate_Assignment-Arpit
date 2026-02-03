import React, { useMemo, useRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";

type Props = { value: string; onChange: (v: string) => void; length?: number };

export default function OtpInput({ value, onChange, length = 6 }: Props) {
  const inputs = useRef<Array<TextInput | null>>([]);
  const digits = useMemo(() => value.padEnd(length, " ").split(""), [value, length]);

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(r) => {
                inputs.current[i] = r;
            }}
          value={digits[i] === " " ? "" : digits[i]}
          onChangeText={(t) => {
            const char = t.replace(/[^0-9]/g, "").slice(-1);
            const arr = value.split("");
            arr[i] = char;
            const merged = arr.join("").slice(0, length);
            onChange(merged);
            if (char && i < length - 1) inputs.current[i + 1]?.focus();
          }}
          keyboardType="number-pad"
          maxLength={1}
          style={styles.box}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  box: {
    width: 46,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFF",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
});
