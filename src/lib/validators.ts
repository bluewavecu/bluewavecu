import { z } from "zod";
import { SIGNUP_ACCOUNT_TYPE_VALUES } from "@/data/signupAccountTypes";
import { SIGNUP_ANNUAL_INCOME_VALUES } from "@/data/signupAnnualIncome";
import { TRANSFER_METHOD_VALUES } from "@/data/transferMethods";
import { normalizeAmountValue } from "@/lib/amountInput";
import { US_STATE_CODES } from "@/data/usStates";
import { verifyMathChallenge } from "@/lib/mathChallenge";
import {
  getUsPhoneValidationError,
  normalizeUsPhone,
} from "@/lib/phoneNumber";
import { USERNAME_PATTERN } from "@/lib/username";

const mathChallengeSchema = z.object({
  mathToken: z.string().trim().min(1),
  mathAnswer: z.string().trim().min(1),
});

function withMathChallenge<T extends z.ZodTypeAny>(schema: T) {
  return schema
    .and(mathChallengeSchema)
    .superRefine((input, context) => {
      if (!verifyMathChallenge(input.mathToken, input.mathAnswer)) {
        context.addIssue({
          code: "custom",
          path: ["mathAnswer"],
          message: "Incorrect answer",
        });
      }
    });
}

function parseDateOfBirth(value: string) {
  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function isAtLeast18YearsOld(dateOfBirth: Date) {
  const today = new Date();
  let age = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - dateOfBirth.getUTCMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < dateOfBirth.getUTCDate())) {
    age -= 1;
  }

  return age >= 18;
}

const usPhoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .superRefine((value, context) => {
    const error = getUsPhoneValidationError(value);

    if (error) {
      context.addIssue({
        code: "custom",
        message: error,
      });
    }
  })
  .transform((value) => normalizeUsPhone(value));

const registerSchemaBase = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(60),
    lastName: z.string().trim().min(1, "Last name is required").max(60),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(32, "Username must be 32 characters or fewer")
      .regex(
        USERNAME_PATTERN,
        "Username may only contain letters, numbers, and underscores",
      )
      .transform((value) => value.toLowerCase()),
    email: z.string().trim().toLowerCase().email(),
    phone: usPhoneSchema,
    dateOfBirth: z
      .string()
      .trim()
      .min(1, "Date of birth is required")
      .refine((value) => parseDateOfBirth(value) !== null, "Enter a valid date of birth")
      .refine(
        (value) => {
          const parsed = parseDateOfBirth(value);
          return parsed ? isAtLeast18YearsOld(parsed) : false;
        },
        "You must be at least 18 years old to enroll",
      ),
    occupation: z.string().trim().min(2, "Occupation is required").max(120),
    annualIncomeRange: z.enum(SIGNUP_ANNUAL_INCOME_VALUES, {
      message: "Select your annual income range",
    }),
    addressLine1: z.string().trim().min(3, "Street address is required").max(160),
    addressLine2: z.string().trim().max(160).optional(),
    city: z.string().trim().min(2, "City is required").max(80),
    state: z.enum(US_STATE_CODES, { message: "Select a state" }),
    postalCode: z
      .string()
      .trim()
      .min(3, "Postal code is required")
      .max(16)
      .regex(/^[A-Za-z0-9\s-]+$/, "Enter a valid postal code"),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    transactionPin: z.string().regex(/^\d{6}$/, "Transaction PIN must be 6 digits"),
    accountTypes: z
      .array(z.enum(SIGNUP_ACCOUNT_TYPE_VALUES))
      .min(1, "Select at least one account type")
      .refine((accountTypes) => accountTypes.includes("SAVINGS"), {
        message: "A savings account is required for membership",
      }),
  })
  .transform((input) => ({
    ...input,
    fullName: `${input.firstName} ${input.lastName}`.trim(),
    country: "US",
    dateOfBirth: parseDateOfBirth(input.dateOfBirth)!,
    addressLine2: input.addressLine2?.trim() || undefined,
  }));

export const registerSchema = withMathChallenge(registerSchemaBase);

export const adminCreateMemberSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(60),
    lastName: z.string().trim().min(1, "Last name is required").max(60),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(32, "Username must be 32 characters or fewer")
      .regex(
        USERNAME_PATTERN,
        "Username may only contain letters, numbers, and underscores",
      )
      .transform((value) => value.toLowerCase()),
    email: z.string().trim().toLowerCase().email(),
    phone: usPhoneSchema,
    dateOfBirth: z
      .string()
      .trim()
      .min(1, "Date of birth is required")
      .refine((value) => parseDateOfBirth(value) !== null, "Enter a valid date of birth")
      .refine(
        (value) => {
          const parsed = parseDateOfBirth(value);
          return parsed ? isAtLeast18YearsOld(parsed) : false;
        },
        "Member must be at least 18 years old",
      ),
    occupation: z.string().trim().min(2, "Occupation is required").max(120),
    addressLine1: z.string().trim().min(3, "Street address is required").max(160),
    addressLine2: z.string().trim().max(160).optional(),
    city: z.string().trim().min(2, "City is required").max(80),
    state: z.enum(US_STATE_CODES, { message: "Select a state" }),
    postalCode: z
      .string()
      .trim()
      .min(3, "Postal code is required")
      .max(16)
      .regex(/^[A-Za-z0-9\s-]+$/, "Enter a valid postal code"),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    accountTypes: z
      .array(z.enum(SIGNUP_ACCOUNT_TYPE_VALUES))
      .min(1, "Select at least one account type")
      .refine((accountTypes) => accountTypes.includes("SAVINGS"), {
        message: "A savings account is required for membership",
      }),
    status: z.enum(["PENDING", "ACTIVE"]).default("PENDING"),
    kycStatus: z
      .enum(["NOT_STARTED", "SUBMITTED", "UNDER_REVIEW", "VERIFIED", "REJECTED"])
      .default("NOT_STARTED"),
    markEmailVerified: z.boolean().default(true),
    statusNote: z.string().trim().max(500).optional(),
  })
  .transform((input) => ({
    ...input,
    fullName: `${input.firstName} ${input.lastName}`.trim(),
    country: "US",
    dateOfBirth: parseDateOfBirth(input.dateOfBirth)!,
    addressLine2: input.addressLine2?.trim() || undefined,
  }));

export const loginSchema = z
  .object({
    portal: z.enum(["member", "admin"]).default("member"),
    email: z.string().trim().toLowerCase().email().optional(),
    username: z
      .string()
      .trim()
      .min(3, "Username is required")
      .max(32)
      .regex(USERNAME_PATTERN, "Enter a valid username")
      .transform((value) => value.toLowerCase())
      .optional(),
    password: z.string().min(1, "Password is required").optional(),
    loginChallengeId: z.string().trim().min(1).optional(),
    otpCode: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Verification code must be 6 digits")
      .optional(),
  })
  .superRefine((input, ctx) => {
    if (input.portal === "admin") {
      if (!input.email) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "Email is required",
        });
      }

      if (!input.password) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: "Password is required",
        });
      }

      return;
    }

    if (input.loginChallengeId) {
      if (!input.otpCode) {
        ctx.addIssue({
          code: "custom",
          path: ["otpCode"],
          message: "Verification code is required",
        });
      }

      return;
    }

    if (!input.username) {
      ctx.addIssue({
        code: "custom",
        path: ["username"],
        message: "Username is required",
      });
    }

    if (!input.password) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Password is required",
      });
    }
  });

export const verifyEmailSchema = z.object({
  verificationChallengeId: z.string().trim().min(1, "Verification session expired"),
  otpCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

export const resendEmailVerificationSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username is required")
    .max(32)
    .regex(USERNAME_PATTERN, "Enter a valid username")
    .transform((value) => value.toLowerCase()),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits").optional(),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => Boolean(data.token) || (Boolean(data.email) && Boolean(data.code)), {
    message: "Use the reset link from your email or enter your email and verification code",
    path: ["code"],
  });

const transferPayloadBaseSchema = z.object({
  fromAccountId: z.string().min(1, "Source account is required"),
  transferMethod: z.enum(TRANSFER_METHOD_VALUES, {
    message: "Select a transfer method",
  }),
  toAccountNumber: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().trim().min(4).max(34).optional(),
  ),
  recipientName: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().trim().min(2).max(120).optional(),
  ),
  amount: z.preprocess(
    normalizeAmountValue,
    z.coerce.number().positive("Amount must be greater than zero"),
  ),
  memo: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().trim().max(180).optional(),
  ),
  receiverAddress: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().trim().min(5).max(240).optional(),
  ),
  swiftCode: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().trim().min(8).max(11).optional(),
  ),
  beneficiaryBankName: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().trim().min(2).max(120).optional(),
  ),
  bankCountry: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().trim().min(2).max(60).optional(),
  ),
});

type TransferPayloadBase = z.infer<typeof transferPayloadBaseSchema>;

function refineTransferPayload<T extends z.ZodType<TransferPayloadBase>>(schema: T) {
  return schema
    .refine((data) => Boolean(data.toAccountNumber || data.recipientName), {
      message: "Recipient account number or name is required",
      path: ["toAccountNumber"],
    })
    .refine((data) => data.transferMethod !== "WIRE" || Boolean(data.receiverAddress?.trim()), {
      message: "Receiver address is required for wire transfers",
      path: ["receiverAddress"],
    })
    .refine(
      (data) =>
        data.transferMethod !== "INTERNATIONAL_WIRE" ||
        Boolean(
          data.recipientName?.trim() &&
            data.toAccountNumber?.trim() &&
            data.swiftCode?.trim() &&
            data.beneficiaryBankName?.trim() &&
            data.bankCountry?.trim() &&
            data.receiverAddress?.trim(),
        ),
      {
        message: "Complete all international wire fields",
        path: ["swiftCode"],
      },
    );
}

export const transferOtpRequestSchema = refineTransferPayload(transferPayloadBaseSchema);

export const transferSchema = refineTransferPayload(
  transferPayloadBaseSchema.extend({
    otpCode: z.preprocess(
      (value) => (value === "" || value === null || value === undefined ? undefined : value),
      z
        .string()
        .regex(/^\d{6}$/, "Verification code must be 6 digits")
        .optional(),
    ),
    transactionPin: z.preprocess(
      (value) => (value === "" || value === null || value === undefined ? undefined : value),
      z
        .string()
        .regex(/^\d{6}$/, "Transaction PIN must be 6 digits")
        .optional(),
    ),
    stepOtpCodes: z.preprocess((value) => {
      if (!value || typeof value !== "object") {
        return undefined;
      }

      const entries = Object.entries(value as Record<string, unknown>).filter(
        ([, code]) => typeof code === "string" && code.trim().length > 0,
      );

      return entries.length > 0 ? Object.fromEntries(entries) : undefined;
    }, z.record(z.string(), z.string().regex(/^\d{6}$/, "Verification code must be 6 digits")).optional()),
  }),
);

export const supportTicketSchema = z.object({
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(4000),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  category: z
    .enum(["ACCOUNT", "TRANSFER", "BILL_PAY", "CARD", "LOAN", "SECURITY", "OTHER"])
    .optional(),
});

export const cardApplySchema = z.object({
  accountId: z.string().min(1, "Select an account"),
  cardType: z.enum(["DEBIT", "CREDIT"]),
});

export const adminReviewCardApplicationSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  action: z.enum(["APPROVE", "DECLINE"]),
  reviewNote: z.string().trim().max(500).optional(),
  spendingLimit: z.coerce.number().positive().optional(),
});

export const adminIssueMemberCardSchema = z.object({
  accountId: z.string().min(1, "Select an account"),
  cardType: z.enum(["DEBIT", "CREDIT"]),
  spendingLimit: z.coerce.number().positive().optional(),
});

export const idDocumentTypeSchema = z.enum([
  "DRIVERS_LICENSE",
  "PASSPORT",
  "STATE_ID",
  "NATIONAL_ID",
]);

export const adminReviewIdVerificationSchema = z
  .object({
    submissionId: z.string().min(1, "Submission ID is required"),
    action: z.enum(["APPROVE", "REJECT", "DECLINE"]),
    reviewNote: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.action === "APPROVE" || Boolean(data.reviewNote?.trim()), {
    message: "Review note is required when rejecting or declining ID verification",
    path: ["reviewNote"],
  });

export const cardActionSchema = z.object({
  cardId: z.string().min(1),
  action: z.enum([
    "LOCK",
    "UNLOCK",
    "REPORT_LOST",
    "REQUEST_REPLACEMENT",
    "TRAVEL_NOTICE",
    "UPDATE_SPENDING_LIMIT",
  ]),
  note: z.string().trim().max(500).optional(),
});

export const loanApplySchema = z.object({
  loanType: z.string().trim().min(3).max(80),
  requestedAmount: z.number().positive().max(1_000_000),
  termMonths: z.number().int().min(6).max(360),
  purpose: z.string().trim().min(10).max(2000),
});

export const adminUpdateUserStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "ON_HOLD", "DISABLED"]).optional(),
  statusNote: z.string().trim().max(500).optional(),
  transactionsUnrestricted: z.boolean().optional(),
  action: z
    .enum([
      "REINSTATE",
      "DELETE",
      "PURGE",
      "GENERATE_TRANSACTION_PIN",
      "CLEAR_TRANSACTION_PIN",
    ])
    .optional(),
});

export const adminUpdateBankingPolicySchema = z.object({
  requireTransactionOtp: z.boolean().optional(),
  requireTransferReview: z.boolean().optional(),
});

export const adminMarkTransactionDelayedSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  reviewNote: z.string().trim().max(500).optional(),
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
    amount: z.preprocess(
      normalizeAmountValue,
      z.coerce.number().positive("Amount must be greater than zero"),
    ),
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
  amount: z.preprocess(normalizeAmountValue, z.coerce.number().positive()),
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
  amount: z.preprocess(normalizeAmountValue, z.coerce.number().positive()),
  direction: z.enum(["DEBIT", "CREDIT"]),
  reason: z.string().trim().min(5).max(500),
  effectiveAt: z.coerce.date().optional(),
});

export const adminAdjustmentActionSchema = z.object({
  adjustmentId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "POST"]),
  reviewNote: z.string().trim().max(500).optional(),
});

export const adminGenerateTransactionsSchema = z
  .object({
    userId: z.string().min(1),
    accountId: z.string().min(1),
    creditCount: z.coerce.number().int().min(0).max(1000),
    debitCount: z.coerce.number().int().min(0).max(1000),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date(),
  })
  .refine((input) => input.creditCount + input.debitCount >= 1, {
    message: "Enter at least one credit or debit.",
  })
  .refine((input) => input.creditCount + input.debitCount <= 1000, {
    message: "Maximum 1000 transactions per batch.",
  });

const transferOtpStepKeySchema = z.enum([
  "IDENTITY_CHECK",
  "AMOUNT_CONFIRMATION",
  "BENEFICIARY_VERIFICATION",
  "SECURITY_CLEARANCE",
  "FINAL_RELEASE",
]);

export const adminTransferOtpStepUpdateSchema = z.object({
  userId: z.string().min(1),
  stepKey: transferOtpStepKeySchema,
  enabled: z.boolean(),
  code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits").optional(),
});

export const adminTransferOtpStepsBulkUpdateSchema = z.object({
  userId: z.string().min(1),
  enableAll: z.boolean().optional(),
  disableAll: z.boolean().optional(),
  updates: z
    .array(
      z.object({
        stepKey: transferOtpStepKeySchema,
        enabled: z.boolean(),
        code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits").optional(),
      }),
    )
    .optional(),
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

const contactFormSchemaBase = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(32).optional(),
  topic: z.string().trim().min(2).max(80),
  message: z.string().trim().min(10).max(4000),
});

export const contactFormSchema = withMathChallenge(contactFormSchemaBase);

export const transactionPinResetRequestSchema = z.object({});

export const transactionPinResetSchema = z
  .object({
    challengeId: z.string().min(1, "Verification session expired. Request a new code."),
    otpCode: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code"),
    transactionPin: z.string().regex(/^\d{6}$/, "Transaction PIN must be 6 digits"),
    confirmTransactionPin: z.string().regex(/^\d{6}$/, "Confirm your 6-digit PIN"),
  })
  .refine((input) => input.transactionPin === input.confirmTransactionPin, {
    message: "Transaction PINs must match",
    path: ["confirmTransactionPin"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type PayeeCreateInput = z.infer<typeof payeeCreateSchema>;
export type PayeeUpdateInput = z.infer<typeof payeeUpdateSchema>;
export type BillPaymentCreateInput = z.infer<typeof billPaymentCreateSchema>;
export type BillPaymentUpdateInput = z.infer<typeof billPaymentUpdateSchema>;
export type AdminBillPaymentReviewInput = z.infer<typeof adminBillPaymentReviewSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
export type TransferOtpRequestInput = z.infer<typeof transferOtpRequestSchema>;
export type CardApplyInput = z.infer<typeof cardApplySchema>;
export type AdminIssueMemberCardInput = z.infer<typeof adminIssueMemberCardSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
export type CardActionInput = z.infer<typeof cardActionSchema>;
export type LoanApplyInput = z.infer<typeof loanApplySchema>;
export type AdminUpdateUserStatusInput = z.infer<typeof adminUpdateUserStatusSchema>;
export type AdminCreateMemberInput = z.input<typeof adminCreateMemberSchema>;
export type AdminUpdateTransactionStatusInput = z.infer<typeof adminUpdateTransactionStatusSchema>;
export type AdminUpdateSupportTicketStatusInput = z.infer<typeof adminUpdateSupportTicketStatusSchema>;
