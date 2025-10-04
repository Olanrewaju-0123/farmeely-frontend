import type {
  ApiResponse,
  LoginPayload,
  SignupPayload,
  User,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
  JoinGroupPayload,
  WalletFundingPayload,
  UpdateUserPayload,
  Livestock,
  Group,
  Transaction,
  StartCreateGroupPayload,
  CompleteCreateGroupPayload,
  CompleteCreateGroupResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2025";

class ApiClient {
  private async request<T>(
    endpoint: string,
    method: string,
    data?: any,
    headers?: HeadersInit,
    authToken?: string
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, API_BASE_URL);
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (authToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${authToken}`,
      };
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url.toString(), options);
      const responseData = await response.json();

      console.log(`API Response for ${endpoint}:`, responseData); // Debug log

      if (!response.ok) {
        // If the response is not OK, throw an error with the message from the backend
        return {
          status: "error",
          message: responseData.message || "An unexpected error occurred.",
        };
      }

      return {
        status: "success",
        message: responseData.message,
        data: responseData.data as T,
        token: responseData.token, // Ensure token is captured if present
      };
    } catch (error: any) {
      console.error(`API Error for ${endpoint}:`, error);
      return {
        status: "error",
        message: error.message || "Network error during request.",
      };
    }
  }

  // User Authentication & Management
  login = (
    payload: LoginPayload
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    return this.request("/users/login", "POST", payload);
  };

  signup = (payload: SignupPayload): Promise<ApiResponse<User>> => {
    return this.request("/users/signup", "POST", payload);
  };

  forgotPassword = (payload: ForgotPasswordPayload): Promise<ApiResponse> => {
    return this.request(
      `/users/forgot-password/${payload.email}`,
      "POST",
      payload
    );
  };

  resetPassword = (payload: ResetPasswordPayload): Promise<ApiResponse> => {
    return this.request("/users/complete", "POST", payload);
  };

  verifyEmail = (
    payload: VerifyEmailPayload
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    return this.request(
      `/users/verify-email/${payload.email}/${payload.otp}`,
      "POST",
      payload
    );
  };

  getUser = (authToken: string): Promise<ApiResponse<User>> => {
    return this.request(
      "/users/profile",
      "GET",
      undefined,
      undefined,
      authToken
    );
  };

  updateUser(
    payload: UpdateUserPayload,
    authToken: string
  ): Promise<ApiResponse<User>> {
    return this.request(
      "/users/profile",
      "PATCH",
      payload,
      undefined,
      authToken
    );
  }

  // changePassword(payload: ChangePasswordPayload, authToken: string): Promise<ApiResponse> {
  //   return this.request("/users/change-password", "PUT", payload, undefined, authToken)
  // }

  resendOtp = (email: string): Promise<ApiResponse> => {
    return this.request(`/users/resend-otp/${email}`, "POST");
  };

  // Group Management
  startCreateGroup(
    payload: StartCreateGroupPayload,
    authToken: string
  ): Promise<ApiResponse<{ group_id: string }>> {
    return this.request(
      "/groups/create/start",
      "POST",
      payload,
      undefined,
      authToken
    );
  }

  // Complete group creation
  completeCreateGroup(
    payload: {
      groupId: string;
      paymentMethod: string;
      paymentReference?: string;
      amount?: string;
    },
    authToken: string
  ): Promise<ApiResponse<Group>> {
    return this.request(
      "/groups/create/complete",
      "POST",
      payload,
      undefined,
      authToken
    );
  }

  // Updated: Get active groups
  getActiveGroups(authToken: string): Promise<ApiResponse<Group[]>> {
    return this.request(
      "/groups/active",
      "GET",
      undefined,
      undefined,
      authToken
    );
  }

  // Get user's groups
  getMyGroups(authToken: string): Promise<ApiResponse<Group[]>> {
    return this.request(
      "/groups/my-groups",
      "GET",
      undefined,
      undefined,
      authToken
    );
  }

  getGroupById(
    groupId: string,
    authToken: string
  ): Promise<ApiResponse<Group>> {
    return this.request(
      `/groups/${groupId}`,
      "GET",
      undefined,
      undefined,
      authToken
    );
  }

  // Updated: Join group (start)
  joinGroup(
    groupId: string,
    payload: JoinGroupPayload,
    authToken: string
  ): Promise<ApiResponse> {
    return this.request(
      `/groups/${groupId}/join/start`,
      "POST",
      payload,
      undefined,
      authToken
    );
  }

  // Complete join group
  completeJoinGroup(
    paymentReference: string,
    authToken: string
  ): Promise<ApiResponse> {
    return this.request(
      `/groups/join/complete/${paymentReference}`,
      "POST",
      undefined,
      undefined,
      authToken
    );
  }

  // Livestock Management - Updated endpoint name
  getLivestocks(authToken: string): Promise<ApiResponse<Livestock[]>> {
    return this.request("/livestocks", "GET", undefined, undefined, authToken);
  }

  // Create livestock (admin function)
  createLivestock(
    payload: any,
    authToken: string
  ): Promise<ApiResponse<Livestock>> {
    return this.request("/livestocks", "POST", payload, undefined, authToken);
  }

  getLivestockById(
    livestockId: string,
    authToken: string
  ): Promise<ApiResponse<Livestock>> {
    return this.request(
      `/livestocks/${livestockId}`,
      "GET",
      undefined,
      undefined,
      authToken
    );
  }

  // Wallet & Transactions - Updated endpoints
  getWalletBalance(
    authToken: string
  ): Promise<ApiResponse<{ balance: number }>> {
    return this.request(
      "/wallet/balance",
      "GET",
      undefined,
      undefined,
      authToken
    );
  }

  // Updated: Start wallet funding
  startWalletFunding(
    payload: WalletFundingPayload,
    authToken: string
  ): Promise<ApiResponse> {
    return this.request(
      "/wallet/funding/start",
      "POST",
      payload,
      undefined,
      authToken
    );
  }

  // Complete wallet funding
  completeWalletFunding(
    reference: string,
    authToken: string
  ): Promise<ApiResponse> {
    return this.request(
      `/wallet/fund/complete/${reference}`,
      "POST",
      undefined,
      undefined,
      authToken
    );
  }

  getWalletTransactions(
    authToken: string
  ): Promise<ApiResponse<Transaction[]>> {
    return this.request(
      "/wallet/transactions",
      "GET",
      undefined,
      undefined,
      authToken
    );
  }

  getMyCreatedGroups(authToken: string): Promise<ApiResponse<Group[]>> {
    return this.request(
      "/groups/my-created",
      "GET",
      undefined,
      undefined,
      authToken
    );
  }

  // Get groups the user has joined (not created)
  getMyJoinedGroups(authToken: string): Promise<ApiResponse<Group[]>> {
    return this.request(
      "/groups/my-joined",
      "GET",
      undefined,
      undefined,
      authToken
    );
  }

  getGroupDetails(
    groupId: string,
    authToken: string
  ): Promise<ApiResponse<Group>> {
    return this.request(
      `/groups/${groupId}`,
      "GET",
      undefined,
      undefined,
      authToken
    );
  }

  deleteGroup(groupId: string, authToken: string): Promise<ApiResponse> {
    return this.request(
      `/groups/${groupId}`,
      "DELETE",
      undefined,
      undefined,
      authToken
    );
  }

  // Admin API methods
  getAdminDashboardStats(authToken: string): Promise<ApiResponse<any>> {
    return this.request(
      "/admin/dashboard/stats",
      "GET",
      undefined,
      undefined,
      authToken
    );
  }

  getAdminUsers(
    authToken: string,
    params?: { page?: number; limit?: number; search?: string }
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/admin/users?${queryString}`
      : "/admin/users";

    return this.request(endpoint, "GET", undefined, undefined, authToken);
  }

  getAdminUserById(
    userId: string,
    authToken: string
  ): Promise<ApiResponse<any>> {
    return this.request(
      `/admin/users/${userId}`,
      "GET",
      undefined,
      undefined,
      authToken
    );
  }

  updateUserStatus(
    userId: string,
    isActive: boolean,
    authToken: string
  ): Promise<ApiResponse> {
    return this.request(
      `/admin/users/${userId}/status`,
      "PATCH",
      { isActive },
      undefined,
      authToken
    );
  }

  getAdminGroups(
    authToken: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/admin/groups?${queryString}`
      : "/admin/groups";

    return this.request(endpoint, "GET", undefined, undefined, authToken);
  }

  getAdminTransactions(
    authToken: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/admin/transactions?${queryString}`
      : "/admin/transactions";

    return this.request(endpoint, "GET", undefined, undefined, authToken);
  }

  getAdminAnalytics(authToken: string): Promise<ApiResponse<any>> {
    return this.request(
      "/admin/analytics",
      "GET",
      undefined,
      undefined,
      authToken
    );
  }
}
export const api = new ApiClient();
