---
title: "From Vibes to Verification: Why the Age of AI Needs Rules You Can Run"
published: true
excerpt: AI got good at coding because compilers don't lie. It can get just as
  good at law — if we give it a compiler for rules. That's what we're building.
coverImage: /assets/blog/content/legal-code.jpg
date: 2026-04-03T00:00:00.000Z
author:
  name: Thomas Gorissen
  picture: /assets/blog/authors/thomas.jpg
ogImage:
  url: /assets/blog/content/legal-code.jpg
---
## Code Has Compilers. Law Has Opinions.

There is an underappreciated reason AI got so good at writing code so quickly: code has a **deterministic evaluator**. Write a function, run it, and the compiler will tell you — unambiguously — whether it works. That tight feedback loop, repeated billions of times across millions of programs, is what turned large language models from generators of plausible-looking code into generators of *working* code.

Law has no such loop. When AI produces a legal interpretation, a contract clause, or a compliance assessment, there is no compiler to check it against. No runtime. No test suite. The output may read with authority. It may even be correct. But there is no mechanism to know — short of hiring a lawyer, which rather defeats the purpose.

This is not a shortcoming of any particular model. It is an infrastructure problem. The legal domain simply lacks the verification layer that software has had for decades.

## The Hallucination Problem Everyone Is Aware of but Quietly Ignoring

The embarrassing cases — [lawyers citing invented precedents](https://www.bbc.com/news/world-us-canada-65735769) in court filings — made headlines. But those were the obvious failures, the ones that got caught because someone bothered to check.

The more concerning failures are quieter. A clause that's *almost* right but introduces an unintended loophole. A compliance assessment that sounds correct but misses an edge case buried in a regulation. A policy interpretation that's accurate 95% of the time and wrong on the 5% that matters most.

In software engineering, this class of problem was addressed decades ago. Code is not trusted because it "looks right." It is compiled, tested, type-checked, linted, and run through continuous integration pipelines before it reaches production.

Legal language has none of this infrastructure. And rather than building it, the industry has done something remarkable: it has shipped AI-generated legal output anyway, on the implicit assumption that probabilistic correctness is good enough.

Every enterprise deploying AI for contract review, compliance checking, or regulatory analysis is, in effect, running untested code in production. The regulators see it too, which is why AI governance frameworks are multiplying — though those frameworks are themselves drafted in the same ambiguous natural language they purport to govern, which brings us neatly back to the original problem.

## Rules-as-Code: A Compiler for Law

The idea behind what we are building at Legalese is, in principle, straightforward: **give rules a runtime.**

Our language, [L4](https://legalese.com/l4), allows legislation, regulations, policies, and contract terms to be expressed as executable code — though not code that resembles Java or Python. L4 reads like the legal text it represents:

```l4
GIVEN person IS A Person
DECIDE `the person is eligible for benefits` IF
    person `is a citizen`
    AND person `has resided for at least 5 years`
    AND NOT person `has been disqualified`
```

That is not pseudocode. It compiles, type-checks, and runs. A lawyer can read it and understand what it says. A developer can integrate it into a production system. And an AI can test its own output against it — the same deterministic feedback that made it good at writing code in the first place.

Once a rule exists in L4, the question shifts from "what does the AI think this regulation means?" to "does this set of facts satisfy the rule?" The answer is definitive — yes or no — accompanied by a full evaluation trace showing which conditions were met and which were not.

The goal is not to replace lawyers, or to replace AI. It is to give both something neither currently has: **ground truth for rules.**

## What This Looks Like in Practice

The tooling exists today. It is not a research prototype.

**AI writes L4 well, and humans can audit it.** Because L4's syntax was designed to mirror natural language, AI can generate working implementations from plain English descriptions. More importantly, the same readability that makes L4 writable by AI makes it auditable by non-programmers. You review L4 the way you would review a legal draft — except this draft actually executes. We are steadily improving AI's fluency with L4, but even now, the results are practical.

**A full development environment.** The [VS Code extension](https://marketplace.visualstudio.com/items?itemName=Legalese.l4-vscode) provides syntax highlighting, autocompletion, live error detection, and code navigation. Ladder diagrams render rules as interactive flowcharts, updated in real time. A Result Inspector evaluates rules against test inputs using `#EVAL`, `#CHECK`, and `#ASSERT` directives — essentially unit tests for legislation.

**One-click deployment.** L4 rules can be deployed as REST API endpoints on [Legalese Cloud](https://legalese.cloud) directly from the editor. JSON Schema documentation is generated automatically. Any system — a website, an internal tool, a mobile app — can call them.

**AI agents as consumers of rules.** A built-in MCP (Model Context Protocol) server allows AI agents — Claude, Cursor, GitHub Copilot — to discover and invoke deployed L4 rules as callable tools. The agent does not interpret the rule; it *executes* it. The result is deterministic and verifiable. A WebMCP option extends the same capability to browser-based AI with a single script tag.

**Legal building blocks included.** Standard libraries cover jurisdiction codes (ISO 3166), currencies (ISO 4217), legal person types, and ownership structures — the recurring primitives of legal logic. And all these libraries is something we're sure our [Community](https://legalese.com/community) will expand on.

## The Feedback Loop

AI became proficient at coding through a cycle: write code, get deterministic feedback from a compiler, adjust, repeat. That loop ran at enormous scale. The same dynamic can apply to rules — if the rules have a runtime.

The cycle looks like this: AI helps express rules in L4. Those rules, once codified, run deterministically. AI can then test its own legal reasoning against them. Better feedback produces better AI output, which in turn makes it easier to codify more rules.

This is already observable in practice. When an AI agent calls an L4 rule via MCP, it is not estimating compliance — it is executing it. When a developer drafts L4 with AI assistance and runs the type checker, they get the same objective feedback that makes AI-assisted software development productive.

The practical consequence for organizations is that, instead of deploying AI and hoping it interprets internal policies correctly, they can deploy the policies themselves as executable services — and let any AI, or any system, call them directly. Same rules, every time, deterministically, with a full audit trail.

## You Could See This Coming

In January 2017, my cofounder Meng Weng Wong published a three-part series that traced the problem from [the dysfunction of legal drafting](/posts/the-problem-with-legal) through [seventy years of academic attempts](/posts/prior-art-legal-informatics) to formalize law, to [the case for computational law](/posts/computational-law).

The central observations hold up. Legal drafting remains stubbornly error-prone — Meng catalogued cases where [a misplaced comma cost $38 million in today's dollars](https://priceonomics.com/the-most-expensive-typo-in-legislative-history/), where [Oxford commas decided labor disputes](https://qz.com/932004/the-oxford-comma-a-maine-court-settled-the-grammar-debate-over-serial-commas-with-a-ruling-on-overtime-pay-for-dairy-truck-drivers/), where [punctuation determined gun rights](http://www.businessinsider.com/the-comma-in-the-second-amendment-2013-8). Decades of research into legal informatics, from [Loevinger's Jurimetrics](https://en.wikipedia.org/wiki/Jurimetrics) in 1948 to the [British Nationality Act encoded in Prolog](https://en.wikipedia.org/wiki/British_Nationality_Act_Implementation_Using_Prolog), had produced deep theory and almost no adoption.

The argument was that law needed a domain-specific language — the same kind of purpose-built formal system that transformed chip design, accounting, and publishing. In 2017, that was a hard pitch to make. The idea of non-programmers working with formal logic seemed remote.

What changed is that AI made the distance between natural language and formal language dramatically shorter. The formalization step that once required specialized expertise can now be assisted — and audited — by the same people who write the rules in English.

## What Comes Next

Several capabilities are in active development. Formal verification will allow automated detection of contradictions and gaps in rule sets — analysis that currently requires weeks of manual legal review. Natural language generation will produce polished English (or any language) from L4, so that rules can be maintained as executable code and published as traditional legal text, provably consistent across translations. Auto-generated web applications will turn any L4 rule set into a structured questionnaire without custom frontend work.

The underlying question is not whether AI will reshape how rules are written, interpreted, and enforced — that much seems certain. The question is whether the transformation will rest on probabilistic interpretation or on deterministic verification.

That verification layer is what we are building. It is early, and there is a great deal still to do. But the tools work, the approach is sound, and the need — as anyone who has watched AI confidently misstate a legal rule can attest — is not theoretical.

**[Try L4 in your browser](https://play.legalese.com) or [install the VS Code extension](https://marketplace.visualstudio.com/items?itemName=Legalese.l4-vscode) and start codifying your rules.**