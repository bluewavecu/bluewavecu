export type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

export type UserRole = "USER" | "ADMIN";
export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED";
export type AccountType = "CHECKING" | "SAVINGS" | "CREDIT";
export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRANSFER"
  | "PAYMENT"
  | "CARD"
  | "FEE"
  | "REFUND";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "REVERSED";
export type CardType = "DEBIT" | "CREDIT";
export type SupportTicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type SafeUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthTokenPayload = {
  userId: string;
  role: UserRole;
};

export type SerializedAccount = {
  id: string;
  userId: string;
  accountType: AccountType;
  accountNumber: string;
  routingNumber: string;
  balance: number;
  availableBalance: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SerializedTransaction = {
  id: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  merchant: string | null;
  reference: string;
  status: TransactionStatus;
  createdAt: Date;
};
