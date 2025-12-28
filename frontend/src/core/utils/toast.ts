/**
 * @author Ananthapadmanabhan V K
 * Toast utility for the application
 * This file contains the toast utility for the application
 * @returns TOAST_CONFIG object with the toast configuration
 * @param message - The message to display
 * @param options - The options to display the toast
 */

import { toast } from 'react-toastify';

// Get toast configuration from environment variables
const TOAST_AUTO_CLOSE = Number(import.meta.env.VITE_TOAST_AUTO_CLOSE) || 5000;
const TOAST_POSITION = (import.meta.env.VITE_TOAST_POSITION as any) || 'top-right';

/**
 * Toast configuration constants
 * Uses environment variables with fallback to defaults
 */
export const TOAST_CONFIG = {
  position: TOAST_POSITION,
  autoClose: TOAST_AUTO_CLOSE,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

/**
 * Shows an error toast notification
 * @param message - Error message to display
 * @param options - Optional toast configuration overrides
 */
export const showErrorToast = (
  message: string,
  options?: Partial<typeof TOAST_CONFIG>
) => {
  try {
    toast.error(message, {
      ...TOAST_CONFIG,
      ...options,
    });
  } catch (error) {
    // Fallback to console if toast fails
    console.error('Toast Error:', message, error);
  }
};

/**
 * Shows a success toast notification
 * @param message - Success message to display
 * @param options - Optional toast configuration overrides
 */
export const showSuccessToast = (
  message: string,
  options?: Partial<typeof TOAST_CONFIG>
) => {
  try {
    toast.success(message, {
      ...TOAST_CONFIG,
      ...options,
    });
  } catch (error) {
    console.error('Toast Error:', message, error);
  }
};

/**
 * Shows an info toast notification
 * @param message - Info message to display
 * @param options - Optional toast configuration overrides
 */
export const showInfoToast = (
  message: string,
  options?: Partial<typeof TOAST_CONFIG>
) => {
  try {
    toast.info(message, {
      ...TOAST_CONFIG,
      ...options,
    });
  } catch (error) {
    console.error('Toast Error:', message, error);
  }
};

/**
 * Shows a warning toast notification
 * @param message - Warning message to display
 * @param options - Optional toast configuration overrides
 */
export const showWarningToast = (
  message: string,
  options?: Partial<typeof TOAST_CONFIG>
) => {
  try {
    toast.warning(message, {
      ...TOAST_CONFIG,
      ...options,
    });
  } catch (error) {
    console.error('Toast Error:', message, error);
  }
};

/**
 * Extracts error message from various error formats
 * @param error - Error object (AxiosError, Error, or any)
 * @param defaultMessage - Default message if error message cannot be extracted
 * @returns Extracted error message
 */
export const extractErrorMessage = (
  error: any,
  defaultMessage: string = 'An unexpected error occurred. Please try again.'
): string => {
  if (!error) {
    return defaultMessage;
  }

  // Handle Axios error response
  if (error?.response?.data) {
    const errorData = error.response.data;
    return (
      errorData?.message ||
      errorData?.error ||
      errorData?.title ||
      errorData?.error_description ||
      defaultMessage
    );
  }

  // Handle standard Error object
  if (error?.message) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
};

/**
 * Shows error toast from error object (handles Axios errors, standard errors, etc.)
 * @param error - Error object to extract message from
 * @param defaultMessage - Default message if error message cannot be extracted
 * @param options - Optional toast configuration overrides
 */
export const showErrorToastFromError = (
  error: any,
  defaultMessage: string = 'An unexpected error occurred. Please try again.',
  options?: Partial<typeof TOAST_CONFIG>
) => {
  const message = extractErrorMessage(error, defaultMessage);
  showErrorToast(message, options);
};

