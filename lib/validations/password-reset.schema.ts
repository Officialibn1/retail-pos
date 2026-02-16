import { z } from "zod";

// Password Reset validation schemas
export const requestPasswordResetSchema = z.object({
	email: z.string().email("Invalid email address"),
	type: z.enum(["LINK", "OTP"]).default("LINK"),
});

export const verifyOTPSchema = z.object({
	email: z.string().email("Invalid email address"),
	otp: z.string().length(6, "OTP must be 6 digits"),
});

export const resetPasswordSchema = z
	.object({
		token: z.string().min(1, "Reset token is required"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.max(100, "Password must not exceed 100 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Password must contain at least one uppercase letter, one lowercase letter, and one number",
			),
		confirmPassword: z.string().min(1, "Password confirmation is required"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type RequestPasswordResetInput = z.infer<
	typeof requestPasswordResetSchema
>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
