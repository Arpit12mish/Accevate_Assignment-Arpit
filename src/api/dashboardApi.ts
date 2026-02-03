import { api } from "./client";

/**
 * Raw API response shape (success case)
 */
type DashboardRaw = {
  status: boolean;
  msg: string;
  user?: {
    id: number;
    userid: string;
    name: string;
    mobile: string;
  };
  dashboard?: {
    carousel?: string[];
    student?: { Boy?: number; Girl?: number };
    amount?: { Total?: number; Paid?: number; due?: number };
    color?: { dynamic_color?: string };
  };
};

/**
 * Normalized shape used by the UI
 */
export type DashboardModel = {
  message: string;
  user: {
    id: number;
    userid: string;
    name: string;
    mobile: string;
  };
  carousel: string[];
  students: { boys: number; girls: number };
  amount: { total: number; paid: number; due: number };
  dynamicColor: string; // always a valid hex color if possible
};

function isTokenInvalidMessage(msg: string) {
  const m = (msg || "").toLowerCase();
  return m.includes("invalid") && m.includes("token");
}

function isValidHexColor(c: string) {
  return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(c);
}

export async function fetchDashboardApi(): Promise<DashboardModel> {
  const res = await api.post<DashboardRaw>("/dashboard.php", {});
  const data = res.data;

  // ✅ API-level failure (even if HTTP 200)
  if (!data?.status) {
    const msg = data?.msg || "Dashboard access denied";

    // treat token invalid as auth error
    if (isTokenInvalidMessage(msg)) {
      throw { isAuthError: true, message: msg };
    }

    throw { isApiError: true, message: msg };
  }

  // ✅ Validate required parts for UI
  const user = data.user;
  const dash = data.dashboard;

  if (!user || !dash) {
    throw { isApiError: true, message: "Dashboard data missing from server" };
  }

  const dynamicColorRaw = dash.color?.dynamic_color || "#111827";
  const dynamicColor = isValidHexColor(dynamicColorRaw)
    ? dynamicColorRaw
    : "#111827";

  return {
    message: data.msg || "Dashboard loaded",
    user: {
      id: user.id,
      userid: user.userid,
      name: user.name,
      mobile: user.mobile,
    },
    carousel: Array.isArray(dash.carousel) ? dash.carousel : [],
    students: {
      boys: Number(dash.student?.Boy ?? 0),
      girls: Number(dash.student?.Girl ?? 0),
    },
    amount: {
      total: Number(dash.amount?.Total ?? 0),
      paid: Number(dash.amount?.Paid ?? 0),
      due: Number(dash.amount?.due ?? 0),
    },
    dynamicColor,
  };
}
