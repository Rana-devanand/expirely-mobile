import { CONFIG } from "../services/config";
import { storage } from "./storage";

interface RequestOptions extends RequestInit {
  token?: string;
  data?: any;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, data, headers, ...customConfig } = options;

  // 1. Get token from storage if not provided
  let authToken = token || (await storage.getAccessToken());

  const config: RequestInit = {
    ...customConfig,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const url = `${CONFIG.API_URL}${endpoint}`;
  console.log(`🚀 [API] ${customConfig.method || "GET"} ${url}`);

  try {
    const response = await fetch(url, config);

    // Handle Token Refresh
    if (response.status === 401 && !url.includes("/users/refresh")) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            const retryConfig = {
              ...config,
              headers: {
                ...config.headers,
                Authorization: `Bearer ${newToken}`,
              },
            };
            resolve(fetch(url, retryConfig).then((r) => r.json()));
          });
        });
      }

      isRefreshing = true;
      const refreshToken = await storage.getRefreshToken();

      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${CONFIG.API_URL}/users/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          const refreshData = await refreshRes.json();

          if (refreshRes.ok && refreshData.success) {
            const { accessToken, refreshToken: newRefreshToken } =
              refreshData.data;
            await storage.saveTokens(accessToken, newRefreshToken);

            isRefreshing = false;
            onRefreshed(accessToken);

            // Retry original request
            const retryConfig = {
              ...config,
              headers: {
                ...config.headers,
                Authorization: `Bearer ${accessToken}`,
              },
            };
            const retryResponse = await fetch(url, retryConfig);
            return await retryResponse.json();
          }
        } catch (e) {
          console.error("Refresh failed", e);
        }
      }

      // If we reach here, refresh failed or no token
      isRefreshing = false;
      await storage.clearAll();
      // Optionally trigger a state logout in Redux here if possible,
      // but throwing will likely be handled by components
    }

    const responseData = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        responseData.message || "Something went wrong",
        responseData,
      );
    }

    return responseData as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : "Network error");
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, data: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", data }),
  put: <T>(endpoint: string, data: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", data }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
  patch: <T>(endpoint: string, data: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", data }),
};
