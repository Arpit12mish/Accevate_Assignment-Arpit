import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { loginApi } from "../api/authApi";
import { getSession, saveUserId, clearSession } from "../storage/secure";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ✅ Optional: if already logged in, go dashboard
  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) {
        navigation.replace("Dashboard");
      }
    })();
  }, [navigation]);

  const onLogin = async () => {
    if (loading) return; // ✅ hard block double taps

    setErr("");
    setLoading(true);

    try {
      // If someone lands here while still having stale session, clear it
      await clearSession();

      const { userId } = await loginApi(userid, password);

      const ok = await saveUserId(userId);
      if (!ok) {
        throw { message: "Failed to save session data. Please try again." };
      }

      navigation.replace("Otp", { userid: userId });
    } catch (e: any) {
      // ✅ unified error handling from our API layer
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} />

        <Text style={styles.title}>Login</Text>
        <Text style={styles.sub}>Enter your credentials to receive OTP</Text>

        <TextInput
          style={styles.input}
          placeholder="User ID"
          value={userid}
          onChangeText={setUserid}
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        {!!err && <Text style={styles.error}>{err}</Text>}

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={onLogin}
          disabled={loading}
          activeOpacity={0.9}
        >
          <Text style={styles.btnText}>{loading ? "Signing in..." : "Login"}</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          After login, you will be redirected to OTP verification.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7FB", justifyContent: "center" },
  card: {
    marginHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  logo: {
    width: 150,
    height: 80,
    alignSelf: "center",
    marginBottom: 10,
    resizeMode: "contain",
  },
  title: { fontSize: 22, fontWeight: "900", textAlign: "center" },
  sub: { textAlign: "center", color: "#666", marginTop: 6, marginBottom: 16 },
  input: {
    height: 54,
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: 12,
  },
  btn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "900" },
  error: { color: "crimson", marginBottom: 10, textAlign: "center" },
  note: { marginTop: 12, textAlign: "center", color: "#777", fontSize: 12 },
});
