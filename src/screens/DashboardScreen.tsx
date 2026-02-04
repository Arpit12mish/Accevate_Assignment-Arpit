import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { fetchDashboardApi, DashboardModel } from "../api/dashboardApi";
import StatCard from "../components/StatCard";
import { clearSession, getSession } from "../storage/secure";

const { width } = Dimensions.get("window");

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

export default function DashboardScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState<DashboardModel | null>(null);
  const [accent, setAccent] = useState("#111827");

  const inFlightRef = useRef(false);

  const forceLogout = useCallback(async () => {
    await clearSession();
    navigation.replace("Login");
  }, [navigation]);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    if (!opts?.silent) setLoading(true);
    setErr("");

    try {
      const session = await getSession();
      if (!session) return forceLogout();

      const res = await fetchDashboardApi();
      setData(res);
      setAccent(res.dynamicColor);
    } catch (e: any) {
      if (e?.isAuthError) return forceLogout();
      setErr(e?.message ?? "Unable to load dashboard. Check connection.");
    } finally {
      if (!opts?.silent) setLoading(false);
      inFlightRef.current = false;
    }
  }, [forceLogout]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load({ silent: true }); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load({ silent: true });
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={accent} />
        <Text style={{ marginTop: 12 }}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
    >
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: accent }]}>
        <View style={styles.headerLeft}>
          <Ionicons name="grid-outline" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <TouchableOpacity onPress={forceLogout}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ERROR */}
      {err ? (
        <View style={styles.errorBox}>
          <Ionicons name="warning-outline" size={22} color="#B91C1C" />
          <Text style={styles.errorText}>{err}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* DYNAMIC COLOR */}
      <View style={styles.colorCard}>
        <Ionicons name="color-palette-outline" size={20} color={accent} />
        <Text style={styles.colorText}>Dynamic Theme Color: {accent}</Text>
      </View>

      {/* USER */}
      {data && (
        <View style={styles.userCard}>
          <Ionicons name="person-circle-outline" size={42} color={accent} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.userName}>{data.user.name}</Text>
            <Text style={styles.userMeta}>UserID: {data.user.userid}</Text>
            <Text style={styles.userMeta}>Mobile: {data.user.mobile}</Text>
          </View>
        </View>
      )}

      {/* REFRESH HINT */}
      <View style={styles.refreshHint}>
        <Ionicons name="refresh-outline" size={16} color="#666" />
        <Text style={styles.refreshText}>Pull down to refresh</Text>
      </View>

      {/* CAROUSEL */}
      {data && (
        <>
          <Text style={styles.sectionTitle}>Carousel</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data.carousel.map((url) => (
              <Image key={url} source={{ uri: url }} style={styles.banner} />
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Students</Text>
          <View style={styles.row}>
            <StatCard title="Boys" value={data.students.boys} accent={accent} icon="male-outline" />
            <StatCard title="Girls" value={data.students.girls} accent={accent} icon="female-outline" />
          </View>

          <Text style={styles.sectionTitle}>Fee Summary</Text>
          <View style={styles.row}>
            <StatCard title="Total" value={data.amount.total} accent={accent} icon="wallet-outline" />
            <StatCard title="Paid" value={data.amount.paid} accent={accent} icon="checkmark-circle-outline" />
            <StatCard title="Due" value={data.amount.due} accent={accent} icon="alert-circle-outline" />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { paddingTop: 54, paddingBottom: 18, paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "900", marginLeft: 8 },

  errorBox: { backgroundColor: "#FFF5F5", margin: 16, padding: 14, borderRadius: 14, alignItems: "center" },
  errorText: { color: "#B91C1C", marginVertical: 6 },
  retryBtn: { backgroundColor: "#111827", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  retryText: { color: "#fff", fontWeight: "900" },

  colorCard: { flexDirection: "row", alignItems: "center", margin: 16, padding: 12, borderRadius: 14, backgroundColor: "#F9FAFB" },
  colorText: { marginLeft: 10, fontWeight: "700" },

  userCard: { flexDirection: "row", margin: 16, padding: 16, borderRadius: 16, backgroundColor: "#F6F7FB", alignItems: "center" },
  userName: { fontSize: 18, fontWeight: "900" },
  userMeta: { color: "#555" },

  refreshHint: { flexDirection: "row", alignItems: "center", alignSelf: "center", marginBottom: 10 },
  refreshText: { marginLeft: 6, color: "#666" },

  sectionTitle: { fontSize: 16, fontWeight: "900", marginLeft: 16, marginHorizontal: 10, marginTop: 5 },

  banner: { width: width * 0.7, height: 200, borderRadius: 16, marginLeft: 16 },

  row: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
});
