import { api } from "./client";

/**
 * Raw responses from PHP API
 */
type LoginRaw = {
  status: boolean;
  msg: string;
  userid?: number;
};

type VerifyOtpRaw = {
  status: boolean;
  msg: string;
  token?: string;
};

/**
 * Normalized return types (what the app uses)
 */
export type LoginResult = {
  userId: string;
  message: string;
};

export type VerifyOtpResult = {
  token: string;
  message: string;
};

/**
 * Helpers
 */
function assertNonEmpty(value: string, field: string) {
  if (!value || !value.trim()) {
    throw { isValidationError: true, message: `${field} is required` };
  }
}

function onlyDigits(value: string) {
  return value.replace(/[^0-9]/g, "");
}

/**
 * Login API
 * POST /login.php
 * Body: { userid, password }
 * Success: { status:true, userid:<number> }
 */
export async function loginApi(userid: string, password: string): Promise<LoginResult> {
  const u = userid.trim();
  const p = password; // don't trim passwords usually

  assertNonEmpty(u, "User ID");
  assertNonEmpty(p, "Password");

  const res = await api.post<LoginRaw>("/login.php", { userid: u, password: p });
  const data = res.data;

  if (!data?.status) {
    // API-level failure
    throw { isApiError: true, message: data?.msg || "Login failed" };
  }

  if (typeof data.userid !== "number") {
    throw { isApiError: true, message: "Login succeeded but userid missing" };
  }

  return {
    userId: String(data.userid),
    message: data.msg || "OTP sent",
  };
}

/**
 * Verify OTP API
 * POST /verify_otp.php
 * Body: { userid, otp }
 * Success: { status:true, token:"..." }
 */
export async function verifyOtpApi(userid: string, otp: string): Promise<VerifyOtpResult> {
  const id = userid.trim();
  assertNonEmpty(id, "User ID");

  const cleanedOtp = onlyDigits(otp);
  if (cleanedOtp.length !== 6) {
    throw { isValidationError: true, message: "OTP must be 6 digits" };
  }

  const res = await api.post<VerifyOtpRaw>("/verify_otp.php", {
    userid: id,
    otp: cleanedOtp,
  });

  const data = res.data;

  if (!data?.status) {
    throw { isApiError: true, message: data?.msg || "OTP verification failed" };
  }

  const token = (data.token || "").trim();
  if (!token) {
    throw { isApiError: true, message: "OTP verified but token missing" };
  }

  // Important: token must be raw, not "Bearer ..."
  if (token.toLowerCase().startsWith("bearer ")) {
    throw { isApiError: true, message: "Invalid token format from server" };
  }

  return {
    token,
    message: data.msg || "Login successful",
  };
}
