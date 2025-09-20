import toast from "react-hot-toast";

export const showToast = {
  success: (message: string) =>
    toast.success(message, {
      duration: 4000,
      position: "top-right",
    }),

  error: (message: string) =>
    toast.error(message, {
      duration: 5000,
      position: "top-right",
    }),

  loading: (message: string) =>
    toast.loading(message, {
      position: "top-right",
    }),

  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((result: T) => string);
      error: string | ((error: any) => string);
    },
  ) =>
    toast.promise(promise, {
      loading,
      success,
      error,
    }),

  dismiss: (toastId?: string) => toast.dismiss(toastId),

  custom: (message: string, options?: any) =>
    toast(message, {
      duration: 4000,
      position: "top-right",
      ...options,
    }),
};
