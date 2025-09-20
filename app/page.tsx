import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import {
  ArrowRight,
  BarChart3,
  FileText,
  MessageSquare,
  Shield,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function Home() {
  const user = await currentUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.02] -z-10" />
        <div className="container px-4 py-24 mx-auto text-center">
          <Badge variant="outline" className="mb-6 text-sm border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/50">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Document Intelligence
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white">
            Transform documents into
            <span className="text-indigo-600 dark:text-indigo-400"> intelligent knowledge</span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Upload documents, extract insights, and interact using natural
            language queries. Documind turns your files into a searchable,
            intelligent knowledge base powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <SignUpButton mode="modal">
              <Button size="lg" className="text-base px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button size="lg" className="text-base px-8 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-800 border border-slate-300 shadow-lg hover:shadow-xl transition-all duration-200 dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 dark:text-white dark:border-slate-600">
                Sign In
              </Button>
            </SignInButton>
          </div>

          <div className="text-sm text-slate-500 dark:text-slate-400">
            No credit card required • Free tier available • Enterprise ready
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Powerful features for document intelligence
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Everything you need to turn your documents into actionable
              insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="relative overflow-hidden border border-slate-300 shadow-lg bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 transition-all duration-200 hover:shadow-xl dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 dark:border-slate-600">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center mb-6">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">Smart Upload</h3>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  Upload PDFs, Word docs, and text files. Our AI automatically
                  extracts, processes, and indexes your content for intelligent
                  search.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border border-slate-300 shadow-lg bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 transition-all duration-200 hover:shadow-xl dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 dark:border-slate-600">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center mb-6">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">AI Q&A</h3>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  Ask questions in natural language and get intelligent answers
                  with precise source citations and relevant document excerpts.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border border-slate-300 shadow-lg bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 transition-all duration-200 hover:shadow-xl dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 dark:border-slate-600">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">Knowledge Graph</h3>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                  Visualize relationships between entities and concepts across
                  all your documents with interactive knowledge graphs.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden border border-slate-300 shadow-lg bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 transition-all duration-200 hover:shadow-xl dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 dark:border-slate-600">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">Lightning Fast</h3>
                <p className="text-slate-700 dark:text-slate-200">
                  Get instant results with our optimized search and AI
                  processing pipeline.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border border-slate-300 shadow-lg bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 transition-all duration-200 hover:shadow-xl dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 dark:border-slate-600">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">Secure & Private</h3>
                <p className="text-slate-700 dark:text-slate-200">
                  Your documents are encrypted and stored securely with
                  enterprise-grade security.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border border-slate-300 shadow-lg bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 transition-all duration-200 hover:shadow-xl dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 dark:border-slate-600">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-lg bg-cyan-500 flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">Multi-Format</h3>
                <p className="text-slate-700 dark:text-slate-200">
                  Support for PDF, Word, text files, and more with intelligent
                  content extraction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              How Documind Works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Four simple steps to unlock the intelligence in your documents
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Upload",
                description: "Securely upload your documents to our platform",
                color: "bg-blue-500",
              },
              {
                step: "02",
                title: "Process",
                description:
                  "AI extracts knowledge and creates searchable indexes",
                color: "bg-green-500",
              },
              {
                step: "03",
                title: "Query",
                description: "Ask questions using natural language",
                color: "bg-purple-500",
              },
              {
                step: "04",
                title: "Discover",
                description: "Get intelligent insights and visualizations",
                color: "bg-orange-500",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className={`w-16 h-16 ${item.color} text-white rounded-full flex items-center justify-center mx-auto mb-6 text-lg font-bold shadow-lg`}
                >
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Ready to transform your documents?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have unlocked the power of their
            documents with Documind.
          </p>
          <SignUpButton mode="modal">
            <Button size="lg" className="text-base px-8">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </SignUpButton>
        </div>
      </section>
    </div>
  );
}
