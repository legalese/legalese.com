---
title: About Legalese
slug: about
navTitle: About us
showInHeader: true
headerOrder: 10
footerColumn: company
footerOrder: 10
lastModified: 2026-03-23
effectiveDate: 2026-03-23
---
## What is Legalese?

Marc Andreessen said, [software is eating the world](https://www.wsj.com/articles/SB10001424053111903480904576512250915629460); at Legalese, we say *AI is eating law*. Our solution to the broken-law problem is to resolve it at a fundamental level, using math, computer science, and logic. At the core, we are an [open-source](http://producingoss.com/) complaw project working on the drafting of legal documents the way programmers develop software.

We start by creating and implementing **L4**, a [domain-specific language (DSL)](https://en.wikipedia.org/wiki/Domain-specific_language) for *legal* that is specifically designed to capture the particularities of law, its semantics, deontics, and logic. Just as [Cadence](https://www.cadence.com/)'s [Verilog](https://en.wikipedia.org/wiki/Verilog) allows programmers to draft circuits, Legalese's *L4* will allow programmers to express law.

Our activities are distributed across 2 parallel tracks:

- **DSL research**: [use-inspired](https://en.wikipedia.org/wiki/Pasteur%27s_quadrant) R&D on the design of a DSL for law
- **product development**: development of user-facing web apps in different verticals and domains

These are a [stack](https://a16z.com/2015/01/22/the-full-stack-startup/): the web apps sit atop smart contracts which sits atop smart law/statutes/business process rules, and they all sit atop a bunch of math, logic, and a few "[magic](https://en.wikipedia.org/wiki/Clarke%27s_three_laws)" tricks.

**[L4](https://legalese.com/l4)** is our domain-specific programming language for law. It treats legal rules and contracts as executable specifications, allowing you to formalize rules with mathematical precision, test contracts against scenarios, find logical contradictions automatically, and generate user-facing applications from legal specifications. Try the [web-based IDE](https://play.legalese.com/), explore the [documentation](https://legalese.com/l4), or check out the [open-source code on GitHub](https://github.com/legalese/l4-ide).

L4 has been piloted with government agencies for regulatory compliance, insurance companies for policy analysis, and legislative drafting offices for rules-as-code initiatives. The toolchain includes a VS Code extension, interactive REPL, decision service, and formal verification capabilities.

## Innovation Premise: Law better off as Code

The legal industry today is where software was in the late 1950s: getting ready to make the jump from macros to compiled languages. [Tomorrow's lawyers](http://www.amazon.com/Tomorrows-Lawyers-Introduction-Your-Future/dp/019966806X/) will look a lot like today's programmers: drawing on opensource libraries, they will configure code for clients that compiles to readable contracts – maybe English, Mandarin Chinese, maybe Ethereum/Hyperledger. From that future, we will look back on today's lawyers, drafting agreements in Microsoft Word and checking references mandraulically, as white-collar successors to [John Henry](https://en.wikipedia.org/wiki/John_Henry_(folklore)).

A *smart contracts* world needs computational legal more than ever. The [Institute of International Finance (2016)](https://www.iif.com/publication/research-note/getting-smart-contracts-blockchain) writes:

> Because few lawyers have the coding skills to draft their own smart contracts, computer programmers would play a larger role, creating new liability questions for faulty algorithms and even ethical issues regarding the practice of law by non-lawyers. Conceivably, smart contracts could reduce some legal cost around contract execution and dispute resolution by making execution automatic. However, legal cost could shift from execution to the drafting phase.

## Why Legalese?

Efforts like [Clerky](https://www.clerky.com/), [Ironclad](https://ironclad.ai/), [Docracy](https://www.docracy.com/), [Common Form](https://commonform.github.io/) and [CommonAccord](http://www.commonaccord.org/), we think (respectfully), tend to run aground on the shoals of English: their "logic" is templates, stitched together the way PHP stitches together HTML.

At Legalese, we're more inclined to come at this at a [pure play](https://en.wikipedia.org/wiki/Pure_play) angle: we are thinking about how software can *truly* eat legal (not just the legal *profession*). We are talking about building core infrastructures, [generativity](https://en.wikipedia.org/wiki/Generativity), and [GPTs](https://en.wikipedia.org/wiki/General_purpose_technology).

Let's talk AI – specifically, the neglected child of AI research paradigms, Symbolic AI. Of the Apollonian tradition, it is driven by reason, rule-based reasoning, deterministic, and rooted in formalisms. This is **not** AI that simply ventures a guess when it doesn't quite know the answer; it's AI that you are *supposed to reason with* from first principles; an algorithm that you can argue with.

So we're taking a cue from commercial successes like [ContractExpress](http://www.contractexpress.com/) which uses deeper formalisms (Prolog). *L4*, the domain-specific language we're building from first principles, will do for the [deontic modal calculus](http://link.springer.com/book/10.1007%2F978-3-642-31570-1) what functional languages did for the [lambda calculus](http://dl.acm.org/citation.cfm?id=363749). This solid foundation in CS theory enables the mapping of mature software concepts to the legal domain: compilation, dependency management, static analysis, and unit & integration testing.

Essentially, moving from **syntax** → **semantics** → **pragmatics**. From *what does it say* → *what does it mean* → *what does it mean* ***for you***.

## Why now?

Thirty years of academic research in deontic modal logic, contract formalisation, static analysis, and language design are coming to fruition. Contracts are multiparadigmatic: they can be object-oriented, event-driven (reactive), functional, aspect-oriented, declarative, and imperative, all in the same document. Academic contract formalisations are just now beginning to satisfy the necessary properties for reduction to software practice.

## What Legalese is *Not*

- **Computational Legal Augmentation**: Legalese excludes the "computational legal augmentation" field. Defeasibility is essential to law, lest the law turn monstrous. However, it renders deductive logic futile. We retreat to the easier, more deterministic, less controversial end of the spectrum.
- **General purpose language that allows non-programmers to program**: L4 is not a language that "allows non-programmers to program". An expert who can write legal code in L4, by that act becomes a programmer. That said, the apps that Legalese-the-company build will instagrammify L4 in the form of "[low-code platforms](https://en.wikipedia.org/wiki/Low-code_development_platforms)".
- **Expert system that gives legal advice**: Legalese is absolutely not an expert system that gives legal advice.
- **Online repo of existing legal materials**: Legalese does not simply fight to get existing legal materials online. That's the job of the Free Law Project, Public.Resource.Org, FALM, OpenLaws, and the LIIs.
- **Building legal ontologies**: Legal Ontologies are a huge area of research which we would like to reuse, not reinvent.
- **Statistical AI**: We don't use deep learning, machine learning, or natural language processing and pretend it produces correct and authoritative interpretations against existing legislation or policy. The AI we're interested in is neuro-symbolic AI.

&nbsp;