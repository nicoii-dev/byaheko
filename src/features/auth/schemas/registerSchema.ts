import * as yup from "yup";

export const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 letters")
    .matches(/^[A-Za-z\s]+$/, "Letters and spaces only"),
  lastName: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 letters")
    .matches(/^[A-Za-z\s]+$/, "Letters and spaces only"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  mobileNumber: yup
    .string()
    .required("Mobile number is required")
    .matches(/^09\d{9}$/, "Mobile number must be 11 digits starting with 09"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

export type RegisterFormData = yup.InferType<typeof registerSchema>;