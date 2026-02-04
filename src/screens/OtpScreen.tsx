import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
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
    if (loading) return;
    if (otp.length !== 6) {
      setErr("Enter a valid 6-digit OTP");
      return;
    }

    setErr("");
    setLoading(true);

    try {
      const { token } = await verifyOtpApi(userid, otp);

      const ok = await setSession({ token, userId: userid });
      if (!ok) throw new Error("Secure session storage failed.");

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
      {/* Back Button */}
      <TouchableOpacity style={styles.backRow} onPress={goBackToLogin} disabled={loading}>
        <Ionicons name="arrow-back-outline" size={22} color="#111827" />
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>

      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.sub}>Enter the 6-digit OTP sent to your mobile</Text>

      <OtpInput value={otp} onChange={setOtp} editable={!loading} />

      {!!err && <Text style={styles.error}>{err}</Text>}

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={onVerify}
        disabled={loading}
        activeOpacity={0.9}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.btnText}>Verify OTP</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.hint}>Test OTP: 123456</Text>
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

  backRow: {
    position: "absolute",
    top: 50,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    marginLeft: 6,
    fontWeight: "700",
    color: "#111827",
  },

  title: { fontSize: 24, fontWeight: "900", textAlign: "center" },
  sub: { textAlign: "center", color: "#666", marginTop: 6, marginBottom: 24 },

  btn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  btnDisabled: { opacity: 0.7 },

  btnText: { color: "#FFF", fontSize: 16, fontWeight: "900" },

  error: { color: "crimson", marginTop: 10, textAlign: "center" },
  hint: { textAlign: "center", color: "#777", marginTop: 14 },
});
