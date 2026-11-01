---
title: "Why have a rules-as-code programming language now that AI solved coding?"
published: true
excerpt: AI got brilliant at code because compilers, types, and tests do the
  verifying. Strip the scaffolding and the same models look a lot less
  brilliant. Law has no such scaffolding. A rules language is how you build it.
coverImage: /assets/blog/content/rules-as-code-future.jpg
date: 2026-05-27T00:00:00.000Z
author:
  name: Thomas Gorissen
  picture: /assets/blog/authors/thomas.jpg
ogImage:
  url: /assets/blog/content/rules-as-code-future.jpg
---
The most reasonable question I get about L4 is some variant of: *"If AI is going to write code for everyone, why do we need a special language for rules at all? Can't a model just write the policy in Python?"*

It is a fair question. It is also, on close inspection, backwards.

## What got "solved" wasn't what people think

When people say "AI solved coding," they are observing that LLMs got remarkably good at producing working software. What made that possible was not the model. It was the **scaffolding around the model**.

Compilers refuse nonsense. Type systems narrow the search space. Tests fail loudly. Linters complain. CI blocks merges. Code review catches what slips through. Each is an external truth-checker — deterministic feedback that does not care how plausible the code looks. AI got good at coding *because* those checks existed. Strip them away and the same models produce confidently-broken code at the rate they always did.

My [previous post](/posts/2026-04-01-from-vibes-to-verification) made a version of this argument: law has no compiler, so AI legal output has no ground truth to converge against. The follow-up worth making is that giving rules a runtime is not just about catching hallucinations. It restructures *who* can do the work, and *what* the AI is allowed to do.

## The bottleneck moved from authoring to auditing

For decades, the cost of formalising law was *writing it down* precisely — lawyers would not, programmers could not. AI collapses that cost: a reasonably-prompted model drafts a first-pass formalisation of a contract clause or tax rule in seconds.

But once authoring is cheap, the next bottleneck shows up: **who reads the result?**

This is where general-purpose languages quietly fail. A tax rule written in Python is auditable by Python programmers — not by the regulator who promulgated it, the lawyer who advises on it, the citizen who lives under it, or the compliance officer who has to attest to it. "The AI wrote it" is not a defensible answer when something goes wrong; somebody has to read it and say *yes, this is what the regulation says.*

This is what L4's surface syntax is for. A decision reads like a definition in the rule it represents; parameters are introduced and typed the way a drafter would introduce defined terms; and identifiers can carry spaces, so a predicate name matches the legal phrase verbatim rather than being mangled into programmer casing. The audience for an L4 rule is the same audience as for the legal text. AI made code production cheap; L4 makes code *review* possible for the people who own the rule.

## Even if everyone could read Python, Python wouldn't fit

Grant the previous point — assume every lawyer learns Python. You still have a problem: law is not shaped like Python.

Legal rules are full of constructs general-purpose languages do not model as first-class citizens: obligations and prohibitions, parties and roles, deadlines, reparations on breach, temporal validity, jurisdictional scope. You can simulate them with plumbing, but simulation is not the same as a type checker that enforces them.

L4 has them. A regulative rule in L4 names a party, states whether the party is obliged, permitted, or forbidden to perform an act, gives the deadline by which the act must happen, and then names two futures: what follows if the obligation is met, and what reparation applies if it is breached. A residential lease clause becomes exactly that — the tenant is obliged to pay rent within seven days; if they do, the lease continues; if they do not, the landlord may issue a notice of breach.

Obligation, permission, and prohibition are language-level deontic operators, not conventions. Deadlines, consequences, and reparations are part of the same construct. Standard libraries cover jurisdictions (ISO 3166), currencies (ISO 4217, stored in minor units so rounding bugs cannot sneak in), legal-person types, and ownership structures. These are not dressing on top of an imperative language — they are primitives the typechecker reasons about, and the [Result Inspector](https://marketplace.visualstudio.com/items?itemName=Legalese.l4-vscode) evaluates a rule against the expected outcomes an author writes alongside it.

The gap shows up plainly in AI-generated Python today. Coding agents pad their output with semantic commentary — file-level docstrings, function-purpose blocks, inline "why" notes, breadcrumbs about how a value flows through the system. The comments exist because the language does not carry the relevant semantics; the agent is annotating around the code's blind spots so future readers — humans and other agents — can navigate it. L4 needs almost none of that scaffolding. The deontic operator already says the clause is an obligation; the deadline is declared as a deadline; the predicate name already states what it means in plain English. Many of the semantics that AI tries to recover in Python comments are first-class in L4 — and checked, not just asserted in prose.

Ask an AI to translate a regulation into Python and you get a function. Ask it to translate the same regulation into L4 and you get a structure that names what kind of legal object each clause is, and that the runtime can actually reason about. That structural fidelity is the difference between "a model that happens to be correct" and "a model that can be *checked*."

## Two halves of one whole

In reality *L4 vs. AI.* are two halves of the same whole — and the whole has a name in current literature, [**neuro-symbolic AI**](https://arxiv.org/pdf/2505.20313): a neural component that translates between natural language and a formal representation, and a symbolic component that executes the representation deterministically. The neural part is good at meaning; the symbolic part is good at consequences. Neither does the other's job well.

L4 is the symbolic half — a typed, executable language with a deterministic evaluator and a WASM backend that runs orders of magnitude faster than calling an LLM. The neural half is whatever model is on hand: Claude drafting a clause as a function and marking it for deployment, or an agent invoking a deployed rule over [MCP](https://legalese.cloud) and trusting the result because the evaluation is reproducible. Each side does what it is good at; the type checker arbitrates.

The closest more recent analogy is Geoff Huntley's [Ralph loop](https://ghuntley.com/ralph/) — running a coding agent in a tight loop where state lives outside the model, in files and tests and git history, while context resets between iterations. The agent does not have to remember; it can check against deterministic evaluation and state.

Rules-as-code is the same shape, for legal logic. The model proposes; the runtime disposes. A failed assertion surfaces in the inspector; the model tries again. L4 can even trace an evaluation, showing which branch fired and which did not, and that trace is itself something the model can read. The loop converges not because the model is uber-clever but because the language does not let it lie.

## The thing AI couldn't do alone

The deepest answer to *"why have a rules language now"* is that without one, AI is being asked to do the part of the job it is worst at — being the source of truth — and not allowed to do the part it is best at, which is translation between human language and structured representation.

We are not building [L4](https://legalese.com/l4) because we think AI failed at code. We are building it because AI succeeded at code in a particular way — on top of decades of compiler and type-system work — and we want the same thing to be true for rules. If the next decade of legal infrastructure rests on something other than vibes, it will be because lawyers, regulators, and AI agents can all point at the same artefact and agree on what it does.

That artefact is a rule with a runtime. Now is precisely the moment to build it.

**[Try L4 in your browser](https://play.legalese.com)** — or read [my prior post](/posts/2026-04-01-from-vibes-to-verification) for a more context.
