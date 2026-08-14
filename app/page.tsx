import { SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  ArrowRight,
  FileText,
  Lock,
  MessageSquare,
  Network,
  Timer,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/auth";

const isLocalAuth = process.env.NEXT_PUBLIC_AUTH_MODE === "local";

const shelf = [
  {
    no: "01",
    icon: Upload,
    title: "Smart Upload",
    description:
      "Drop in a PDF, Word doc, or text file. It's read, chunked, and indexed automatically — no manual tagging.",
  },
  {
    no: "02",
    icon: MessageSquare,
    title: "AI Q&A",
    description:
      "Ask a question in plain language. Get an answer with the exact passage and document it came from.",
  },
  {
    no: "03",
    icon: Network,
    title: "Knowledge Graph",
    description:
      "See how entities and ideas connect across every file you've filed, not just within one document.",
  },
  {
    no: "04",
    icon: Timer,
    title: "Fast Retrieval",
    description:
      "Semantic search returns the right passage in milliseconds, however many documents are on file.",
  },
  {
    no: "05",
    icon: Lock,
    title: "Private by Default",
    description:
      "Documents are encrypted at rest and scoped to your account. Run it self-hosted if you'd rather keep it that way.",
  },
  {
    no: "06",
    icon: FileText,
    title: "Multi-Format",
    description: "PDF, DOCX, DOC, and plain text — filed the same way, searchable the same way.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Upload",
    description: "Add a document to your collection.",
  },
  {
    step: "02",
    title: "Process",
    description: "It's chunked, embedded, and indexed for search.",
  },
  {
    step: "03",
    title: "Query",
    description: "Ask a question the way you'd ask a colleague.",
  },
  {
    step: "04",
    title: "Discover",
    description: "Read the cited answer, or trace it on the graph.",
  },
];

export default async function Home() {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — the page presented as a single large index card */}
      <section className="px-4 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="mx-auto max-w-4xl">
          <div className="card-index px-6 py-10 sm:px-12 sm:py-14 animate-fadeIn">
            <div className="flex items-center justify-between catalog-number mb-8">
              <span>DOCUMIND — DOCUMENT INTELLIGENCE</span>
              <span>NO. 000214</span>
            </div>
            <hr className="rule-ledger mb-8" />

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] text-foreground mb-6 text-balance">
              Turn paper into an
              <br />
              answerable record.
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-10">
              Upload your documents. Documind reads, indexes, and cross-references
              them, so you can ask a question in plain language and get an answer
              with the receipt attached.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {isLocalAuth ? (
                <>
                  <Button asChild size="lg" className="text-base px-8">
                    <Link href="/sign-up">
                      Begin indexing
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-base px-8">
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                </>
              ) : (
                <>
                  <SignUpButton mode="modal">
                    <Button size="lg" className="text-base px-8">
                      Begin indexing
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button variant="outline" size="lg" className="text-base px-8">
                      Sign in
                    </Button>
                  </SignInButton>
                </>
              )}
            </div>

            <p className="catalog-number">
              No credit card required · Free tier · Self-hosted or cloud
            </p>
          </div>
        </div>
      </section>

      {/* The shelf — what gets filed */}
      <section className="px-4 py-20 border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl mb-14">
            <p className="catalog-number mb-3">THE COLLECTION</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4 text-balance">
              Everything a document needs on file
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Six things happen to a file the moment it's uploaded — quietly,
              and in this order.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {shelf.map((item) => (
              <div key={item.no} className="card-index p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-background">
                    <item.icon className="h-5 w-5 icon-blue" />
                  </div>
                  <span className="catalog-number">FIG. {item.no}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — a genuine four-step sequence, numbering earns its keep here */}
      <section className="px-4 py-20 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl mb-14">
            <p className="catalog-number mb-3">THE PROCESS</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground text-balance">
              Four steps, start to answer
            </h2>
          </div>

          <div className="relative grid md:grid-cols-4 gap-8">
            <div
              className="hidden md:block absolute top-6 left-0 right-0 h-px bg-ledger/50"
              aria-hidden
            />
            {processSteps.map((item) => (
              <div key={item.step} className="relative">
                <div className="relative z-10 mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-ledger bg-background font-mono text-sm font-semibold text-foreground">
                  {item.step}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing — a stamp on the way out */}
      <section className="px-4 py-24 border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4 text-balance">
            Your documents are waiting to be asked something.
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Open a free account and file your first document in under a minute.
          </p>
          {isLocalAuth ? (
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/sign-up">
                Start your file
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <SignUpButton mode="modal">
              <Button size="lg" className="text-base px-8">
                Start your file
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </SignUpButton>
          )}
        </div>
      </section>
    </div>
  );
}
