import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Sign in to access your document intelligence platform
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none border-0 bg-transparent",
                headerTitle: "text-slate-900 dark:text-white",
                headerSubtitle: "text-slate-600 dark:text-slate-300",
                socialButtonsBlockButton: "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700",
                dividerLine: "bg-slate-200 dark:bg-slate-600",
                dividerText: "text-slate-500 dark:text-slate-400",
                formFieldLabel: "text-slate-700 dark:text-slate-200",
                formFieldInput: "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white",
                footerActionLink: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300",
                identityPreviewText: "text-slate-700 dark:text-slate-200",
                identityPreviewEditButton: "text-indigo-600 dark:text-indigo-400"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
