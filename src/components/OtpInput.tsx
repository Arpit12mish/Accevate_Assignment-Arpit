import React, { useEffect, useMemo, useRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";

type Props = {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  editable?: boolean;
  autoFocus?: boolean;
};

export default function OtpInput({
  value,
  onChange,
  length = 6,
  editable = true,
  autoFocus = true,
}: Props) {
  const inputs = useRef<Array<TextInput | null>>([]);

  // Always normalize value to max `length`
  const normalized = useMemo(() => value.replace(/\D/g, "").slice(0, length), [value, length]);

  const digits = useMemo(() => {
    return normalized.padEnd(length, " ").split("");
  }, [normalized, length]);

  useEffect(() => {
    if (autoFocus && editable) {
      setTimeout(() => inputs.current[0]?.focus(), 200);
    }
  }, [autoFocus, editable]);

  const focusIndex = (i: number) => {
    if (i >= 0 && i < length) inputs.current[i]?.focus();
  };

  const setAt = (i: number, char: string) => {
    const arr = normalized.split("");
    while (arr.length < length) arr.push("");
    arr[i] = char;
    const merged = arr.join("").slice(0, length);
    onChange(merged);
  };

  const handleChange = (i: number, text: string) => {
    if (!editable) return;

    const clean = text.replace(/\D/g, "");

    // ✅ Paste support (user pastes full OTP)
    if (clean.length > 1) {
      const merged = (normalized.slice(0, i) + clean + normalized.slice(i + clean.length)).slice(0, length);
      onChange(merged);

      const nextIndex = Math.min(i + clean.length, length - 1);
      focusIndex(nextIndex);
      return;
    }

    const char = clean.slice(-1); // last digit
    setAt(i, char);

    if (char && i < length - 1) focusIndex(i + 1);
  };

  const handleKeyPress = (i: number, key: string) => {
    if (!editable) return;

    // ✅ Backspace: if current empty → move left
    if (key === "Backspace") {
      const current = digits[i];
      if (current === " " || current === "") {
        if (i > 0) {
          setAt(i - 1, "");
          focusIndex(i - 1);
        }
      } else {
        // clear current digit
        setAt(i, "");
      }
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(r) => {
            inputs.current[i] = r;
          }}
          value={digits[i] === " " ? "" : digits[i]}
          onChangeText={(t) => handleChange(i, t)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
          keyboardType="number-pad"
          maxLength={length} // allow paste
          editable={editable}
          selectTextOnFocus={editable}
          style={[styles.box, !editable && styles.boxDisabled]}
          returnKeyType="done"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
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
  boxDisabled: {
    opacity: 0.6,
  },
});
