import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText, MessageSquare, BarChart3, Upload, Sparkles, Shield, Zap } from 'lucide-react';

export default async function Home() {
  const user = await currentUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="container px-4 py-24 mx-auto text-center">
          <Badge variant="outline" className="mb-6 text-sm">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Document Intelligence
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Transform documents into
            <span className="text-primary"> intelligent knowledge</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Upload documents, extract insights, and interact using natural language queries.
            Documind turns your files into a searchable, intelligent knowledge base powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <SignUpButton mode="modal">
              <Button size="lg" className="text-base px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button variant="outline" size="lg" className="text-base px-8">
                Sign In
              </Button>
            </SignInButton>
          </div>

          <div className="text-sm text-muted-foreground">
            No credit card required • Free tier available • Enterprise ready
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful features for document intelligence
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to turn your documents into actionable insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center mb-6">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Upload</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upload PDFs, Word docs, and text files. Our AI automatically extracts,
                  processes, and indexes your content for intelligent search.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/50">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center mb-6">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Q&A</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ask questions in natural language and get intelligent answers
                  with precise source citations and relevant document excerpts.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/50">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Knowledge Graph</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Visualize relationships between entities and concepts across
                  all your documents with interactive knowledge graphs.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Get instant results with our optimized search and AI processing pipeline.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
                <p className="text-muted-foreground">
                  Your documents are encrypted and stored securely with enterprise-grade security.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-lg bg-cyan-500 flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Multi-Format</h3>
                <p className="text-muted-foreground">
                  Support for PDF, Word, text files, and more with intelligent content extraction.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Documind Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to unlock the intelligence in your documents
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Upload",
                description: "Securely upload your documents to our platform",
                color: "bg-blue-500"
              },
              {
                step: "02",
                title: "Process",
                description: "AI extracts knowledge and creates searchable indexes",
                color: "bg-green-500"
              },
              {
                step: "03",
                title: "Query",
                description: "Ask questions using natural language",
                color: "bg-purple-500"
              },
              {
                step: "04",
                title: "Discover",
                description: "Get intelligent insights and visualizations",
                color: "bg-orange-500"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 ${item.color} text-white rounded-full flex items-center justify-center mx-auto mb-6 text-lg font-bold shadow-lg`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to transform your documents?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who have unlocked the power of their documents with Documind.
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
