import * as yup from 'yup';

export const verifyEmailSchema = yup.object().shape({
  code: yup
    .string()
    .required('Verification code is required')
    .matches(/^\d{6}$/, 'Enter the 6-digit code from your email'),
});

export type VerifyEmailFormData = yup.InferType<typeof verifyEmailSchema>;
