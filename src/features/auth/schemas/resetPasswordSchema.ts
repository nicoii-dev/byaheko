import * as yup from "yup";

export const resetPasswordSchema = yup.object().shape({
  code: yup
    .string()
    .required("Reset code is required")
    .length(6, "Reset code must be 6 digits"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});

export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;