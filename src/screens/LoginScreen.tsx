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
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { loginApi } from "../api/authApi";
import { getSession, saveUserId, clearSession } from "../storage/secure";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const { width } = Dimensions.get("window");

// simple responsive helper
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const CARD_MAX_WIDTH = 420;

export default function LoginScreen({ navigation }: Props) {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) navigation.replace("Dashboard");
    })();
  }, [navigation]);

  const onLogin = async () => {
    if (loading) return;
    setErr("");
    setLoading(true);

    try {
      await clearSession();
      const { userId } = await loginApi(userid, password);

      const ok = await saveUserId(userId);
      if (!ok) throw { message: "Failed to save session data. Please try again." };

      navigation.replace("Otp", { userid: userId });
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 10}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardWrap}>
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
                returnKeyType="next"
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={onLogin}
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
          </View>

          {/* bottom spacer so last button never sits behind keyboard */}
          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: "#F6F7FB" },

  // centers on large screens, scrolls on small screens
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },

  cardWrap: {
    width: "100%",
    alignItems: "center",
  },

  card: {
    width: "100%",
    maxWidth: CARD_MAX_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: clamp(width * 0.045, 16, 22),
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },

  logo: {
    width: clamp(width * 0.42, 140, 190),
    height: clamp(width * 0.20, 70, 90),
    alignSelf: "center",
    marginBottom: 10,
    resizeMode: "contain",
  },

  title: { fontSize: clamp(width * 0.06, 20, 24), fontWeight: "900", textAlign: "center" },
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
