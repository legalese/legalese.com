---
title: "Negotiate.4"
slug: negotiate
tagline: "Contract quality assurance: encode a contract in L4, test it against scenarios, and find the gaps before anyone signs."
status: live
published: false
order: 70
---
Negotiate.4 is for law firms and in-house teams who draft and review contracts that matter: acquisition agreements, long-term supply and licensing deals, anything where a missed edge case becomes a dispute. A careful read finds a lot. It does not reliably find what happens when a deadline, a condition and a termination right interact in a sequence nobody pictured. Negotiate.4 turns the contract into rules that can be run, so those sequences can be tried before signing rather than argued about afterwards.

## What it does

- **Executable contract**: the operative clauses (conditions, notices, cure periods, termination rights, end dates) are encoded in L4, with each rule tied to its clause number.
- **Scenario testing**: timelines and fact patterns are run through the encoding to show who may do what, and when, under each set of facts.
- **Findings register**: each gap, edge case or inconsistency is recorded with the clauses involved and whose risk it is, so the reviewer can see which side should care.
- **Readings side by side**: where the words support more than one reading, both are encoded and their outcomes compared, instead of one being chosen silently.
- **Stress tests**: the deal timeline is tested for the chance of missing a long-stop date, with and without a dispute or a regulatory delay, and the inputs that are assumptions are labelled as such.
- **Negotiation rehearsal**: proposed repairs are put to agents acting for each side, to see which fixes are likely to be agreed and which will move risk and stick.

## How it works

The contract is encoded in L4 clause by clause, together with the general law that governs how it is read. Assertions taken from the text check the encoding, and each place where the wording forks is written down rather than resolved by assumption.

Scenarios are then played through the encoding, and each outcome is traced back to the clauses that produced it. The results are brought together in a console, viewed from either party's side or from a neutral one, alongside a written report of findings and suggested repairs that counsel can take into the markup.

## Where it comes from

Negotiate.4 grew out of the quality-assurance method Legalese uses on legislation. Its first full run was on a published acquisition agreement. The findings were frozen first and only then compared with how the agreement's terms were later tested: several matched points that turned out to matter, and others were new. The tools are in active development and Negotiate.4 is available as a pilot.

The same method, applied to statutes, is behind the encodings in [the commons](/commons).
