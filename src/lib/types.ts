export interface ApiResponse<T = any> {
  status: "success" | "error"
  message?: string
  data?: T
  token?: string // Optional token for login/signup responses
  error?: string // Optional error message
}

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  role?: string
  isVerified?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  email: string
  otp: string
  newPassword: string
}

export interface VerifyEmailPayload {
  email: string
  otp: string
}

export interface CreateGroupPayload {
  group_name: string
  group_description: string
  total_slots: number
  price_per_slot: number
  livestock_id: number
  start_date: string
  end_date: string
  group_image_url?: string
}

export interface JoinGroupPayload {
  group_id: number
  user_id: number
  slots_taken: number
  payment_method: string
  amount_paid: number
  transaction_id?: string
  payment_status?: string
}

export interface WalletFundingPayload {
  amount: number
  payment_method: string
  transaction_id?: string
}

export interface UpdateUserPayload {
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

export interface Livestock {
  id: number
  name: string
  description: string
  image_url: string
  min_amount: number
  max_amount: number
  current_price: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: number
  user_id: number
  amount: number
  type: "credit" | "debit"
  status: "pending" | "completed" | "failed"
  description: string
  createdAt: string
  updatedAt: string
}

export interface Group {
  id: number
  group_name: string
  group_description: string
  total_slots: number
  slots_taken: number
  price_per_slot: number
  livestock_id: number
  start_date: string
  end_date: string
  group_image_url?: string
  status: string
  createdAt: string
  updatedAt: string
  Livestock: Livestock
}
