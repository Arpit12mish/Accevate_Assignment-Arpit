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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { fetchDashboardApi, DashboardModel } from "../api/dashboardApi";
import StatCard from "../components/StatCard";
import { clearSession, getSession } from "../storage/secure";

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

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      if (!opts?.silent) setLoading(true);
      setErr("");

      try {
        // ✅ hard guard: if session missing, logout
        const session = await getSession();
        if (!session) {
          await forceLogout();
          return;
        }

        const res = await fetchDashboardApi(); // returns DashboardModel
        setData(res);
        setAccent(res.dynamicColor); // ✅ dynamic color updates on every fetch
      } catch (e: any) {
        // ✅ centralized auth handling
        if (e?.isAuthError) {
          await forceLogout();
          return;
        }

        setErr(e?.message ?? "Failed to load dashboard");
      } finally {
        if (!opts?.silent) setLoading(false);
        inFlightRef.current = false;
      }
    },
    [forceLogout]
  );

  // initial load
  useEffect(() => {
    load();
  }, [load]);

  // every time screen focuses → refetch (dynamic color changes)
  useFocusEffect(
    useCallback(() => {
      load({ silent: true });
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load({ silent: true });
    setRefreshing(false);
  };

  const logout = async () => {
    await forceLogout();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={[styles.header, { backgroundColor: accent }]}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.9}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 10, color: "#333" }}>Loading dashboard...</Text>
          </View>
        ) : err ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{err}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : !data ? (
          <Text style={{ color: "#333" }}>No data available</Text>
        ) : (
          <>
            {/* User Card */}
            <View style={styles.userCard}>
              <Text style={styles.userName}>{data.user.name}</Text>
              <Text style={styles.userMeta}>UserID: {data.user.userid}</Text>
              <Text style={styles.userMeta}>Mobile: {data.user.mobile}</Text>

              <View style={[styles.badge, { backgroundColor: accent }]}>
                <Text style={styles.badgeText}>Dynamic: {accent}</Text>
              </View>
            </View>

            <Text style={styles.helper}>
              Pull-to-refresh OR revisit this screen to see the dynamic color update on every API hit.
            </Text>

            {/* Carousel */}
            <Text style={styles.sectionTitle}>Carousel</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {data.carousel.map((url) => (
                <Image key={url} source={{ uri: url }} style={styles.banner} />
              ))}
            </ScrollView>

            {/* Student stats */}
            <Text style={styles.sectionTitle}>Students</Text>
            <View style={styles.row}>
              <StatCard title="Boys" value={data.students.boys} accent={accent} />
              <View style={{ width: 12 }} />
              <StatCard title="Girls" value={data.students.girls} accent={accent} />
            </View>

            {/* Amount stats */}
            <Text style={styles.sectionTitle}>Fee Summary</Text>
            <View style={styles.row}>
              <StatCard title="Total" value={data.amount.total} accent={accent} />
            </View>

            <View style={{ height: 12 }} />

            <View style={styles.row}>
              <StatCard title="Paid" value={data.amount.paid} accent={accent} />
              <View style={{ width: 12 }} />
              <StatCard title="Due" value={data.amount.due} accent={accent} />
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    paddingTop: 54,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#FFF", fontSize: 20, fontWeight: "900" },
  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  logoutText: { color: "#FFF", fontWeight: "900" },

  body: { padding: 16 },

  userCard: {
    backgroundColor: "#F6F7FB",
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  userName: { fontSize: 18, fontWeight: "900", marginBottom: 4 },
  userMeta: { color: "#555", marginTop: 2 },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 10,
  },
  badgeText: { color: "#FFF", fontWeight: "900" },

  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10, marginTop: 4 },
  banner: { width: 260, height: 200, borderRadius: 16, marginRight: 12, backgroundColor: "#EEE" },

  row: { flexDirection: "row", marginVertical: 4 },

  helper: { color: "#666", marginVertical: 16, paddingHorizontal: 4, lineHeight: 18 },

  errorBox: {
    backgroundColor: "#FFF5F5",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  errorText: { color: "#B91C1C", fontWeight: "700", textAlign: "center" },
  retryBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  retryText: { color: "#FFF", fontWeight: "900" },
});
