import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(7, "Phone number is required").max(32),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password is required"),
});

export const transferSchema = z
  .object({
    fromAccountId: z.string().min(1, "Source account is required"),
    toAccountNumber: z.string().trim().min(4).max(20).optional(),
    recipientName: z.string().trim().min(2).max(120).optional(),
    amount: z.coerce.number().positive("Amount must be greater than zero"),
    memo: z.string().trim().max(180).optional(),
  })
  .refine((data) => Boolean(data.toAccountNumber || data.recipientName), {
    message: "Recipient account number or name is required",
    path: ["toAccountNumber"],
  });

export const supportTicketSchema = z.object({
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(4000),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

export const adminUpdateUserStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]),
});

export const adminUpdateTransactionStatusSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  status: z.enum(["COMPLETED", "FAILED", "REVERSED"]),
  reviewNote: z.string().trim().max(500).optional(),
});

export const adminUpdateSupportTicketStatusSchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
  status: z.enum(["OPEN", "PENDING", "RESOLVED", "CLOSED"]),
});

export const scheduledTransferSchema = z
  .object({
    fromAccountId: z.string().min(1, "Source account is required"),
    destinationAccountNumber: z.string().trim().min(4).max(20).optional(),
    recipientName: z.string().trim().min(2).max(120).optional(),
    amount: z.coerce.number().positive("Amount must be greater than zero"),
    memo: z.string().trim().max(180).optional(),
    frequency: z.enum(["ONE_TIME", "WEEKLY", "BIWEEKLY", "MONTHLY"]),
    scheduledFor: z.coerce.date(),
  })
  .refine((data) => Boolean(data.destinationAccountNumber || data.recipientName), {
    message: "Recipient account number or name is required",
    path: ["destinationAccountNumber"],
  });

export const scheduledTransferUpdateSchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "CANCELLED"]),
});

export const sessionRevokeSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export const mfaToggleSchema = z.object({
  method: z.enum(["EMAIL", "SMS", "TOTP"]).default("EMAIL"),
  enabled: z.boolean(),
});

export const payeeCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  nickname: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
  accountNumber: z.string().trim().min(4).max(20).optional(),
  routingNumber: z.string().trim().min(9).max(9).optional(),
  address: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(32).optional(),
});

export const payeeUpdateSchema = payeeCreateSchema.partial().extend({
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const billPaymentCreateSchema = z.object({
  fromAccountId: z.string().min(1),
  payeeId: z.string().min(1),
  amount: z.coerce.number().positive(),
  memo: z.string().trim().max(180).optional(),
  dueDate: z.coerce.date().optional(),
  scheduledFor: z.coerce.date().optional(),
  submitForReview: z.boolean().optional(),
});

export const billPaymentUpdateSchema = z.object({
  action: z.enum(["cancel", "submit"]),
});

export const adminBillPaymentReviewSchema = z.object({
  billPaymentId: z.string().min(1),
  action: z.enum(["APPROVE", "FAIL", "CANCEL"]),
  reviewNote: z.string().trim().max(500).optional(),
});

export const disputeCreateSchema = z.object({
  transactionId: z.string().min(1),
  reason: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(4000),
});

export const disputeUpdateSchema = z.object({
  action: z.enum(["close"]),
});

export const adminDisputeUpdateSchema = z.object({
  disputeId: z.string().min(1),
  status: z.enum(["UNDER_REVIEW", "RESOLVED", "REJECTED", "CLOSED"]),
  resolutionNote: z.string().trim().max(2000).optional(),
});

export const adjustmentCreateSchema = z.object({
  accountId: z.string().min(1),
  amount: z.coerce.number().positive(),
  direction: z.enum(["DEBIT", "CREDIT"]),
  reason: z.string().trim().min(5).max(500),
});

export const adminAdjustmentActionSchema = z.object({
  adjustmentId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "POST"]),
  reviewNote: z.string().trim().max(500).optional(),
});

export const profileUpdateSchema = z.object({
  dateOfBirth: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format").optional(),
  addressLine1: z.string().trim().min(3).max(120).optional(),
  addressLine2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(80).optional(),
  state: z.string().trim().min(2).max(80).optional(),
  postalCode: z.string().trim().min(3).max(20).optional(),
  country: z.string().trim().min(2).max(80).optional(),
  employmentStatus: z.string().trim().min(2).max(80).optional(),
  annualIncome: z.coerce.number().nonnegative().optional(),
});

export const profileSubmitSchema = z.object({
  action: z.literal("submit_kyc"),
});

export const adminKycUpdateSchema = z
  .object({
    profileId: z.string().min(1),
    status: z.enum(["UNDER_REVIEW", "VERIFIED", "REJECTED"]),
    reviewNote: z.string().trim().max(2000).optional(),
  })
  .refine((data) => data.status !== "REJECTED" || Boolean(data.reviewNote?.trim()), {
    message: "Review note is required when rejecting KYC",
    path: ["reviewNote"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type PayeeCreateInput = z.infer<typeof payeeCreateSchema>;
export type PayeeUpdateInput = z.infer<typeof payeeUpdateSchema>;
export type BillPaymentCreateInput = z.infer<typeof billPaymentCreateSchema>;
export type BillPaymentUpdateInput = z.infer<typeof billPaymentUpdateSchema>;
export type AdminBillPaymentReviewInput = z.infer<typeof adminBillPaymentReviewSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
export type AdminUpdateUserStatusInput = z.infer<typeof adminUpdateUserStatusSchema>;
export type AdminUpdateTransactionStatusInput = z.infer<typeof adminUpdateTransactionStatusSchema>;
export type AdminUpdateSupportTicketStatusInput = z.infer<typeof adminUpdateSupportTicketStatusSchema>;
