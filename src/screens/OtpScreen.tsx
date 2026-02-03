import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import OtpInput from "../components/OtpInput";
import { verifyOtpApi } from "../api/authApi";
import { setSession, clearSession } from "../storage/secure";

type Props = NativeStackScreenProps<RootStackParamList, "Otp">;

export default function OtpScreen({ route, navigation }: Props) {
  const { userid } = route.params;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onVerify = async () => {
    if (loading) return; // ✅ prevent multiple calls
    setErr("");
    setLoading(true);

    try {
      // verifyOtpApi does validation + throws clean message
      const { token } = await verifyOtpApi(userid, otp);

      // ✅ store complete session securely
      const ok = await setSession({ token, userId: userid });
      if (!ok) {
        throw { message: "Failed to store session securely. Please try again." };
      }

      navigation.replace("Dashboard");
    } catch (e: any) {
      setErr(e?.message ?? "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const goBackToLogin = async () => {
    await clearSession();
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.sub}>Enter the 6-digit OTP sent to your mobile</Text>

      <OtpInput value={otp} onChange={setOtp} />

      {!!err && <Text style={styles.error}>{err}</Text>}

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.7 }]}
        onPress={onVerify}
        disabled={loading}
        activeOpacity={0.9}
      >
        <Text style={styles.btnText}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goBackToLogin} disabled={loading}>
        <Text style={styles.back}>← Back to Login</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>Test OTP (as per Postman): 123456</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F6F7FB",
  },
  title: { fontSize: 24, fontWeight: "900", textAlign: "center" },
  sub: { textAlign: "center", color: "#666", marginTop: 6, marginBottom: 18 },

  btn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "900" },

  error: { color: "crimson", marginTop: 10, textAlign: "center" },
  back: { textAlign: "center", color: "#111827", marginTop: 14, fontWeight: "800" },
  hint: { textAlign: "center", color: "#777", marginTop: 14 },
});
