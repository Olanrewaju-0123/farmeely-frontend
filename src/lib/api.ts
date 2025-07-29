import type {
  ApiResponse,
  LoginPayload,
  SignupPayload,
  User,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
  CreateGroupPayload,
  JoinGroupPayload,
  WalletFundingPayload,
  UpdateUserPayload,
  ChangePasswordPayload,
  Livestock,
  Group,
  Transaction,
} from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:2025"

class ApiClient {
  private async request<T>(
    endpoint: string,
    method: string,
    data?: any,
    headers?: HeadersInit,
    authToken?: string,
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, API_BASE_URL)
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }

    if (authToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${authToken}`,
      }
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url.toString(), options)
      const responseData = await response.json()

      console.log(`API Response for ${endpoint}:`, responseData) // Debug log

      if (!response.ok) {
        // If the response is not OK, throw an error with the message from the backend
        return {
          status: "error",
          message: responseData.message || "An unexpected error occurred.",
        }
      }

      return {
        status: "success",
        message: responseData.message,
        data: responseData.data as T,
        token: responseData.token, // Ensure token is captured if present
      }
    } catch (error: any) {
      console.error(`API Error for ${endpoint}:`, error)
      return {
        status: "error",
        message: error.message || "Network error during request.",
      }
    }
  }

  // User Authentication & Management
  login(payload: LoginPayload): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request("/auth/login", "POST", payload)
  }

  signup(payload: SignupPayload): Promise<ApiResponse<User>> {
    return this.request("/auth/register", "POST", payload)
  }

  forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse> {
    return this.request("/auth/forgot-password", "POST", payload)
  }

  resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse> {
    return this.request("/auth/reset-password", "POST", payload)
  }

  verifyEmail(payload: VerifyEmailPayload): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request("/auth/verify-email", "POST", payload)
  }

  getUser(authToken: string): Promise<ApiResponse<User>> {
    return this.request("/user/profile", "GET", undefined, undefined, authToken)
  }

  updateUser(payload: UpdateUserPayload, authToken: string): Promise<ApiResponse<User>> {
    return this.request("/user/profile", "PUT", payload, undefined, authToken)
  }

  changePassword(payload: ChangePasswordPayload, authToken: string): Promise<ApiResponse> {
    return this.request("/user/change-password", "PUT", payload, undefined, authToken)
  }

  // Group Management
  createGroup(payload: CreateGroupPayload, authToken: string): Promise<ApiResponse<Group>> {
    return this.request("/groups", "POST", payload, undefined, authToken)
  }

  getGroups(authToken: string): Promise<ApiResponse<Group[]>> {
    return this.request("/groups", "GET", undefined, undefined, authToken)
  }

  getGroupById(groupId: string, authToken: string): Promise<ApiResponse<Group>> {
    return this.request(`/groups/${groupId}`, "GET", undefined, undefined, authToken)
  }

  joinGroup(payload: JoinGroupPayload, authToken: string): Promise<ApiResponse> {
    return this.request("/groups/join", "POST", payload, undefined, authToken)
  }

  // Livestock Management
  getLivestock(authToken: string): Promise<ApiResponse<Livestock[]>> {
    return this.request("/livestock", "GET", undefined, undefined, authToken)
  }

  getLivestockById(livestockId: string, authToken: string): Promise<ApiResponse<Livestock>> {
    return this.request(`/livestock/${livestockId}`, "GET", undefined, undefined, authToken)
  }

  // Wallet & Transactions
  getWalletBalance(authToken: string): Promise<ApiResponse<{ balance: number }>> {
    return this.request("/wallet/balance", "GET", undefined, undefined, authToken)
  }

  fundWallet(payload: WalletFundingPayload, authToken: string): Promise<ApiResponse> {
    return this.request("/wallet/fund", "POST", payload, undefined, authToken)
  }

  getTransactions(authToken: string): Promise<ApiResponse<Transaction[]>> {
    return this.request("/wallet/transactions", "GET", undefined, undefined, authToken)
  }

  // Payment Gateway (if needed for direct calls)
  startPayment(payload: any, authToken: string): Promise<ApiResponse> {
    return this.request("/payments/start", "POST", payload, undefined, authToken)
  }

  verifyPayment(payload: { transaction_id: string }, authToken: string): Promise<ApiResponse> {
    return this.request("/payments/verify", "POST", payload, undefined, authToken)
  }
}

export const api = new ApiClient()
