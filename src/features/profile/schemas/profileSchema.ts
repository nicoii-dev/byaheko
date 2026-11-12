import * as yup from 'yup';

export const profileSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 letters')
    .matches(/^[A-Za-z\s.'-]+$/, 'Use letters, spaces, or . \' - only'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 letters')
    .matches(/^[A-Za-z\s.'-]+$/, 'Use letters, spaces, or . \' - only'),
  mobileNumber: yup
    .string()
    .required('Mobile number is required')
    .matches(/^09\d{9}$/, 'Use an 11-digit number starting with 09'),
});

export type ProfileFormData = yup.InferType<typeof profileSchema>;
