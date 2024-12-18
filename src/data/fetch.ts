import axios from "axios";

// Predefined API base URL
export const Api = axios.create({
  baseURL: "http://localhost:5000",
});

// Subscription Model Interface
export interface Subscription {
  id: number;
  name: string;
  amount: number;
  description: string;
  validity_hours: number;
}

// Network Access Request Interface
export interface NetworkAccessRequest {
  mac_address: string;
  phone_number: string;
  amount: number;
  subscription_id: number;
}

// Payment and Network Access Interface
export interface PaymentNetworkAccessResponse {
  status: "success" | "failed";
  message?: string;
  network_token?: string;
  access_duration?: number; // in hours
}

// Initiate Payment and Network Access
export const initiateNetworkAccess = async (
  accessRequest: NetworkAccessRequest
): Promise<PaymentNetworkAccessResponse> => {
  try {
    const response = await Api.post<PaymentNetworkAccessResponse>(
      "/network/access",
      accessRequest
    );
    return response.data;
  } catch (error) {
    console.error("Network access request failed:", error);
    throw error;
  }
};

// Verify Network Access Token
export const verifyNetworkAccess = async (token: string): Promise<boolean> => {
  try {
    const response = await Api.post<{ valid: boolean }>(
      "/network/verify-token",
      { token }
    );
    return response.data.valid;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
};
