import { SignUp } from "@clerk/nextjs";
import { LocalSignUpForm } from "@/components/auth/local-sign-up-form";

const isLocalAuth = process.env.NEXT_PUBLIC_AUTH_MODE === "local";

export default function Page() {
  if (isLocalAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Create an Account
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Start turning your documents into intelligent knowledge
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <LocalSignUpForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <SignUp />
    </div>
  );
}
