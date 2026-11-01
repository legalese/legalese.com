import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import Alert from "@/app/_components/alert";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllPosts } from "../lib/api";
import { CtaSection } from "@/app/_components/cta-section";
import { HeroAscii } from "@/app/_components/hero-ascii";
import Link from "next/link";

export default function Index() {
  const allPosts = getAllPosts();
  const recentPosts = allPosts.slice(0, 4);

  return (
    <main>
      <Alert>
          Compose L4 with AI and deploy AI skills and MCP tools to Legalese Cloud with our&nbsp;
          <a href="https://marketplace.visualstudio.com/items?itemName=Legalese.l4-vscode" className="text-accent">VS Code Extension 1.6</a>
      </Alert>
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-white to-amber-50 to-60%">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-white" />
        <HeroAscii />
        <div
          className="relative container mx-auto flex flex-col px-6 md:px-10"
          style={{ minHeight: "clamp(540px, calc(100svh - 2.5rem), 880px)" }}
        >
          <Header />
          <section className="flex flex-1 items-start pb-56 lg:items-center lg:pb-28">
            <div data-hero-copy className="w-full max-w-[40rem]">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-6">
                <span className="whitespace-nowrap">AI is</span>{' '}
                <span className="whitespace-nowrap text-accent">eating law</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed [text-shadow:0_0_14px_#fffbeb,0_0_4px_#fffbeb]">
                Legalese builds governance &amp; compliance solutions for our AI future.
                With L4 we treat legal policy and contracts as executable specifications for use by humans and AI.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://marketplace.visualstudio.com/items?itemName=Legalese.l4-vscode" 
                  target="_blank" 
                  rel="noopener"
                  className="bg-accent text-white border-2 border-accent px-8 py-3 rounded-lg font-medium hover:bg-accent-hover hover:border-accent-hover transition-colors"
                >
                  L4 in VS Code
                </a>
                <a 
                  href="https://legalese.com/l4" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="border-2 border-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-900 hover:text-white transition-colors"
                >
                  Explore L4
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Container>
        {/* What is L4 Section */}
        <section className="mb-20 py-16 -mx-5 px-5 ">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-center">
            What is L4?
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 mb-8 text-center">
              L4 is our domain-specific programming language for law. It treats legal rules 
              and contracts as executable specifications (rules-as-code), allowing you to:
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-3">Formalize rules with precision</h3>
                <p className="text-gray-600">
                  Express legal logic with mathematical precision, enabling automated analysis and eliminating ambiguity and contradictions.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-3">Test contracts against scenarios</h3>
                <p className="text-gray-600">
                  Run your contracts through test cases to verify behavior before deployment, 
                  just like software testing.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-3">Run compliance tools for humans &amp; AI</h3>
                <p className="text-gray-600">
                  Deploy your rules to Legalese Cloud as MCP tools for AI agents, as WebMCP embedded in your website or as REST API's.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-3">Generate applications</h3>
                <p className="text-gray-600">
                  Compile L4 specifications into user-facing applications, decision services, 
                  and natural language explanations.
                </p>
              </div>
            </div>
            <div className="text-center mt-8">
              <a 
                href="https://github.com/legalese/l4-ide" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent font-medium hover:text-accent-hover transition-colors"
              >
                View on GitHub →
              </a>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="max-w-6xl mx-auto m-20">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                About Legalese
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Marc Andreessen said, "software is eating the world"; at Legalese, we say 
                <em> AI is eating law</em>. Our solution to the broken-law problem is to 
                resolve it at a fundamental level, using math, computer science, and logic.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                At the core, we are an open-source computational law project working on the 
                drafting of legal documents the way programmers develop software.
              </p>
              <Link 
                href="/about" 
                className="text-accent font-medium hover:text-accent-hover transition-colors"
              >
                Learn more about us →
              </Link>
            </div>
            <div className="lg:w-1/2">
              <div className="rounded-lg text-sm overflow-x-auto">
                <iframe src="https://play.legalese.com/?id=49ca8910-b83b-4ac9-8836-a120df51ea13" frame-border="0" width="100%" height="380px" loading="lazy" />
                <p className="text-sm text-gray-500 mt-3 italic">
                  Why can't legal contracts be as clear as code?
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* News/Press Section */}
        <section className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
            In the News
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <a 
              href="https://www.straitstimes.com/singapore/focus-on-tech-and-the-law-at-new-smu-centre" 
              target="_blank"
              rel="noopener noreferrer"
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <p className="text-sm text-gray-500 mb-2">Straits Times • 2020</p>
              <h3 className="font-bold mb-2">SMU to create a working programming language for law</h3>
              <p className="text-gray-600 text-sm">First-of-its-kind research partnership</p>
            </a>
            <a 
              href="https://www.techinasia.com/singapore-legalese-audacious-goal-to-create-a-programming-language-for-the-legal-industry" 
              target="_blank"
              rel="noopener noreferrer"
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <p className="text-sm text-gray-500 mb-2">Tech in Asia • 2017</p>
              <h3 className="font-bold mb-2">Singapore startup's audacious goal</h3>
              <p className="text-gray-600 text-sm">Creating a programming language for the legal industry</p>
            </a>
            <a 
              href="https://www.artificiallawyer.com/2016/07/29/al-interview-software-is-eating-law-legalese-com/" 
              target="_blank"
              rel="noopener noreferrer"
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <p className="text-sm text-gray-500 mb-2">Artificial Lawyer • 2016</p>
              <h3 className="font-bold mb-2">Software is Eating Law</h3>
              <p className="text-gray-600 text-sm">Interview with Legalese</p>
            </a>
          </div>
          <div className="text-center mt-8">
            <Link 
              href="/media" 
              className="text-accent font-medium hover:text-accent-hover transition-colors"
            >
              View all press coverage →
            </Link>
          </div>
        </section>

        {/* Blog Section */}
        {recentPosts.length > 0 && (
          <section className="max-w-6xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">
              Latest from the Blog
            </h2>
            <MoreStories posts={recentPosts} />
            <div className="text-center mt-8">
              <Link 
                href="/posts" 
                className="text-accent font-medium hover:text-accent-hover transition-colors"
              >
                View all posts →
              </Link>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <CtaSection />
      </Container>
    </main>
  );
}
