export interface ApiResponse<T = any> {
  status: "success" | "error"
  message?: string
  data?: T
  token?: string // Optional token for login/signup responses
  error?: string // Optional error message
}

export interface User {
  id: string; // Maps to user_id
  email: string;
 othernames?: string; // Updated to match backend/auth-context
  surname?: string; // Updated to match backend/auth-context
  phoneNumber?: string; // Maps to phoneNumber
  address?: string;
  location?: string;
  role?: "user" | "admin";
  is_email_verified?: boolean;  // Maps to is_email_verified
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  email: string
  password: string
  surname: string
  othernames: string
  phoneNumber: string
  location: string
  address: string
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
  groupName: string; // Matches CreateGroups.groupName
  group_description: string;
  totalSlot: number; // Matches CreateGroups.totalSlot
  slotPrice: number; // Matches CreateGroups.slotPrice
  livestock_id: string; // Matches CreateGroups.livestock_id
  start_date: string;
  end_date: string;
  group_image_url?: string;
}

export interface StartCreateGroupPayload {
  livestock_id: string;
  groupName: string;
  description: string;
  totalSlot: number;
  slotPrice: number;
  creatorInitialSlots: number;
}

export interface CompleteCreateGroupPayload {
  groupId: string
  paymentMethod: "wallet" | "others"
  paymentReference?: string
}

export interface CreateGroupResponse{
  group_id : string
}

export interface CompleteCreateGroupResponse {
  group_id: string
  paymentLink?: string
  paymentReference?: string
}


export interface JoinGroupPayload {
  group_id: string;
  user_id: string;
  slots: number;
  payment_method?: string; // Optional based on joinGroups
  amount_paid?: number;    // From pendingPaymentModel if included
  payment_status?: string; // From pendingPaymentModel if included
  transaction_id?: string;
  joined_at?: string;
}

export interface WalletFundingPayload {
  amount: number
  payment_method?: string
  transaction_id?: string
	payment_url: string

  // data: {
	// 		payment_url: string
	// 	}
}

export interface UpdateUserPayload {
  surname?: string
  othernames?: string
  phoneNumber?: string
  address?: string
  location?: string
}


export interface Livestock {
  id?: number;
  livestock_id: string;
  name: string;
  breed?: string;
  weight?: number;
  price: number;
  imageUrl?: string;
  description?: string;
  available: boolean;
  minimum_amount: number; // Updated to match model
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id?: number; // Maps to sn
  transaction_id: string;
  wallet_id?: string;
  email: string;
  user_id: string;
  amount: number;
  transaction_type: "credit" | "debit"; 
  payment_means?: "wallet" | "others"; // Matches Transactions.payment_means
  status: "pending" | "success" | "failed"; // Matches Transactions.status
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id?: number; // Maps to sn
  group_id: string; // Matches CreateGroups.group_id
  groupName: string;
  group_name?: string; // Matches CreateGroups.groupName
  group_description?: string; // Matches CreateGroups.description
  description: string
  totalSlot: number; // Matches CreateGroups.totalSlot
  totalSlotLeft: number
  slotTaken: number; // Matches CreateGroups.slotTaken
  slotPrice: number; // Matches CreateGroups.slotPrice
  livestock_id: string; // Matches CreateGroups.livestock_id
  created_by: string; // Matches CreateGroups.created_by
  start_date?: string; // Matches CreateGroups.created_at
  end_date?: string; // Matches CreateGroups.updated_at
  group_image_url?: string;
  status: "pending" | "active" | "completed" | "cancelled"; // Matches CreateGroups.status
  createdAt?: string;
  updatedAt?: string;
  progress?: number // Calculated field
  userSlots?: number // For joined groups
  joinedAt?: string // For joined groups
  creatorInitialSlots?: number
  finalSlotPriceTaken?: number;
  totalSlotPriceLeft?: number;
  paymentReference?: string;
  paymentMethod?: string;
  // Nested livestock data when included
  livestock?: {
    livestock_id: string
    name: string
    price: number
    minimum_amount: number
    imageUrl?: string
    description?: string
  }
  // Nested creator data when included
  creator?: {
    user_id: string
    surname: string
    othernames: string
    email: string
    initialSlots?: number;
  }
}
  // Remove livestock and livestock_price; use livestock_id instead, or add nesting if API joins with Livestocks


export interface InitializePaymentPayload {
  group_id: string
  slots: number
  amount: number
  paymentMethod: string
}

export interface InitializePaymentResponse {
  status: "success" | "error"
  message?: string
  paymentUrl?: string
  reference?: string
  data?: any
}

export interface PaymentVerificationPayload {
  reference: string
  groupId: string
  slots: number
  amount: number
}

export interface PaymentVerificationResponse {
  status: "success" | "error"
  message?: string
  payment?: any
  group?: any
}
