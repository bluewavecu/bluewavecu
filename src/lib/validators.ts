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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;
