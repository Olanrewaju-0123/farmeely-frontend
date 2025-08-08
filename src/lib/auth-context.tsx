"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import type {
  User,
  ApiResponse,
  LoginPayload,
  SignupPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from "@/lib/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (
    payload: LoginPayload
  ) => Promise<ApiResponse<{ user: User; token: string }>>;
  signup: (payload: SignupPayload) => Promise<ApiResponse<User>>;
  logout: () => void;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<ApiResponse>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<ApiResponse>;
  verifyEmail: (
    payload: VerifyEmailPayload
  ) => Promise<ApiResponse<{ user: User; token: string }>>;
  resendOtp: (email: string) => Promise<ApiResponse>;
  fetchUserProfile: (authToken: string) => Promise<ApiResponse<User>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Initial loading state
  const router = useRouter();
  const { toast } = useToast();

  const fetchUserProfile = useCallback(
    async (authToken: string): Promise<ApiResponse<User>> => {
      try {
        const userProfileResponse = await api.getUser(authToken);
        if (
          userProfileResponse.status === "success" &&
          userProfileResponse.data
        ) {
          setUser(userProfileResponse.data);
          localStorage.setItem(
            "user",
            JSON.stringify(userProfileResponse.data)
          );
          return { status: "success", data: userProfileResponse.data };
        } else {
          console.error(
            "AuthContext: Failed to fetch user profile:",
            userProfileResponse.message
          );
          return {
            status: "error",
            message:
              userProfileResponse.message || "Failed to fetch user profile.",
          };
        }
      } catch (error: any) {
        console.error("AuthContext: Error fetching user profile:", error);
        return {
          status: "error",
          message: error.message || "Network error fetching user profile.",
        };
      }
    },
    []
  );

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        console.log("🔍 Loading auth data:");
        console.log("Stored token:", storedToken ? "Present" : "Missing");
        console.log("Stored user:", storedUser ? "Present" : "Missing");

        if (storedToken) {
          setToken(storedToken);
          // Attempt to fetch user profile with the token to validate it
          const userProfileResponse = await fetchUserProfile(storedToken);
          console.log("User profile response:", userProfileResponse)
          if (userProfileResponse.status === "success") {
            console.log("✅ Token validated successfully")
            // User profile fetched successfully, user state is already set by fetchUserProfile
          } else {
            // Token might be invalid or expired, clear it
            console.warn(
              "AuthContext: Stored token invalid or expired. Logging out."
            );
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          }
        } else if (storedUser) {
          // If only user data is present but no token, clear it
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error) {
        console.error(
          "AuthContext: Error loading auth data from localStorage:",
          error
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthData();
  }, [fetchUserProfile]);

  const login = useCallback(
    async (
      payload: LoginPayload
    ): Promise<ApiResponse<{ user: User; token: string }>> => {
      setIsLoading(true);
      try {
        const response = await api.login(payload);
        console.log("AuthContext: Login API response:", response); // Debug log

        if (response.status === "success" && response.token) {
          setToken(response.token);
          localStorage.setItem("token", response.token);

          // Fetch user profile after successful login
          const userProfileResponse = await fetchUserProfile(response.token);
          if (
            userProfileResponse.status === "success" &&
            userProfileResponse.data
          ) {
            // User profile already set by fetchUserProfile
            toast({
              title: "Login Successful",
              description:
                response.message || "You have been successfully logged in.",
              variant: "default",
            });
            router.push("/dashboard");
            return {
              status: "success",
              message: response.message,
              data: { user: userProfileResponse.data, token: response.token },
            };
          } else {
            // If profile fetch fails, still consider login successful but log error
            console.error(
              "AuthContext: Failed to fetch user profile after login:",
              userProfileResponse.message
            );
            toast({
              title: "Login Successful (Profile Fetch Failed)",
              description:
                userProfileResponse.message ||
                "Logged in, but failed to load profile.",
              variant: "destructive", // Use destructive for partial success/warning
            });
            router.push("/dashboard"); // Still redirect, but with a warning
            return {
              status: "success",
              message: response.message,
              data: { user: userProfileResponse.data!, token: response.token },
            }; // userProfileResponse.data might be null here
          }
        } else {
          toast({
            title: "Login Failed",
            description:
              response.message || "Invalid credentials or no token received.",
            variant: "destructive",
          });
          return {
            status: "error",
            message: response.message || "Login failed: No token received.",
          };
        }
      } catch (error: any) {
        console.error("AuthContext: Login error:", error);
        toast({
          title: "Error",
          description: error.message || "Network error during login.",
          variant: "destructive",
        });
        return {
          status: "error",
          message: error.message || "Network error during login.",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUserProfile, router, toast]
  );

  const signup = useCallback(
    async (payload: SignupPayload): Promise<ApiResponse<User>> => {
      setIsLoading(true);
      try {
        const response = await api.signup(payload);
        if (response.status === "success") {
          toast({
            title: "Signup Successful",
            description:
              response.message ||
              "Account created successfully. Please verify your email.",
            variant: "default",
          });
          router.push("/auth/verify-email");
        } else {
          toast({
            title: "Signup Failed",
            description: response.message || "An error occurred during signup.",
            variant: "destructive",
          });
        }
        return response;
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Network error during signup.",
          variant: "destructive",
        });
        return {
          status: "error",
          message: error.message || "Network error during signup.",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [router, toast]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "default",
    });
    router.push("/auth/login");
  }, [router, toast]);

  const forgotPassword = useCallback(
    async (payload: ForgotPasswordPayload): Promise<ApiResponse> => {
      setIsLoading(true);
      try {
        const response = await api.forgotPassword(payload);
        if (response.status === "success") {
          toast({
            title: "OTP Sent",
            description: response.message || "OTP sent to your email.",
            variant: "default",
          });
          router.push("/auth/reset-password"); // Or to a page where OTP is entered
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to send OTP.",
            variant: "destructive",
          });
        }
        return response;
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Network error during forgot password.",
          variant: "destructive",
        });
        return {
          status: "error",
          message: error.message || "Network error during forgot password.",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [router, toast]
  );

  const resetPassword = useCallback(
    async (payload: ResetPasswordPayload): Promise<ApiResponse> => {
      setIsLoading(true);
      try {
        const response = await api.resetPassword(payload);
        if (response.status === "success") {
          toast({
            title: "Password Reset",
            description:
              response.message || "Your password has been reset successfully.",
            variant: "default",
          });
          router.push("/auth/login");
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to reset password.",
            variant: "destructive",
          });
        }
        return response;
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Network error during password reset.",
          variant: "destructive",
        });
        return {
          status: "error",
          message: error.message || "Network error during password reset.",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [router, toast]
  );

  const verifyEmail = useCallback(
    async (
      payload: VerifyEmailPayload
    ): Promise<ApiResponse<{ user: User; token: string }>> => {
      setIsLoading(true);
      try {
        const response = await api.verifyEmail(payload);
        if (response.status === "success" && response.token) {
          setToken(response.token);
          localStorage.setItem("token", response.token);

          // Assuming verifyEmail also returns user data or can be fetched
          const userProfileResponse = await fetchUserProfile(response.token);
          if (
            userProfileResponse.status === "success" &&
            userProfileResponse.data
          ) {
            toast({
              title: "Email Verified",
              description:
                response.message ||
                "Your email has been successfully verified.",
              variant: "default",
            });
            router.push("/dashboard");
            return {
              status: "success",
              message: response.message,
              data: { user: userProfileResponse.data, token: response.token },
            };
          } else {
            console.error(
              "AuthContext: Failed to fetch user profile after email verification:",
              userProfileResponse.message
            );
            toast({
              title: "Email Verified (Profile Fetch Failed)",
              description:
                userProfileResponse.message ||
                "Email verified, but failed to load profile.",
              variant: "destructive",
            });
            router.push("/dashboard");
            return {
              status: "success",
              message: response.message,
              data: { user: userProfileResponse.data!, token: response.token },
            };
          }
        } else {
          toast({
            title: "Verification Failed",
            description:
              response.message || "Invalid OTP or an error occurred.",
            variant: "destructive",
          });
          return {
            status: "error",
            message: response.message || "Verification failed.",
          };
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description:
            error.message || "Network error during email verification.",
          variant: "destructive",
        });
        return {
          status: "error",
          message: error.message || "Network error during email verification.",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUserProfile, router, toast]
  );

  const resendOtp = useCallback(
    async (email: string): Promise<ApiResponse> => {
      setIsLoading(true);
      try {
        const response = await api.resendOtp(email);
        if (response.status === "success") {
          toast({
            title: "OTP Resent",
            description: response.message || "A new OTP has been sent to your email.",
            variant: "default",
          });
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to resend OTP.",
            variant: "destructive",
          });
        }
        return response;
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Network error while resending OTP.",
          variant: "destructive",
        });
        return {
          status: "error",
          message: error.message || "Network error while resending OTP.",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const value = React.useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      verifyEmail,
      fetchUserProfile,
      resendOtp,
    }),
    [
      user,
      token,
      isLoading,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      verifyEmail,
      fetchUserProfile,
      resendOtp
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
