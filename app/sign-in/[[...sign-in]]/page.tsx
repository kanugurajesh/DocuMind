import { SignIn } from "@clerk/nextjs";
import { LocalSignInForm } from "@/components/auth/local-sign-in-form";

const isLocalAuth = process.env.NEXT_PUBLIC_AUTH_MODE === "local";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card-index px-8 py-10">
          <div className="flex items-center justify-between catalog-number mb-6">
            <span>MEMBERSHIP CARD</span>
            <span>RETURNING</span>
          </div>
          <hr className="rule-ledger mb-6" />

          <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Sign in to reach your indexed documents.
          </p>

          {isLocalAuth ? (
            <LocalSignInForm />
          ) : (
            <SignIn
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-none border-0 bg-transparent p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "border-border text-foreground hover:bg-accent rounded-sm",
                  dividerLine: "bg-border",
                  dividerText: "text-muted-foreground",
                  formFieldLabel: "text-foreground",
                  formFieldInput:
                    "border-border bg-background text-foreground rounded-sm",
                  formButtonPrimary:
                    "bg-primary hover:bg-primary/85 text-primary-foreground rounded-sm",
                  footerActionLink: "text-foreground underline decoration-ledger",
                  identityPreviewText: "text-foreground",
                  identityPreviewEditButton: "text-foreground",
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
