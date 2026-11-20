---
title: "Litigate.4"
slug: litigate
tagline: "A register of causes of action, their elements, gates, defences and forum, built to be applied to the facts of a dispute."
status: live
published: false
order: 60
---
Litigate.4 is for law firms and claims teams who assess whether a client has a claim. The first questions are always the same: which cause of action fits these facts, what has to be proved, what stands in the way, and where the claim must be brought. That knowledge usually sits in practitioners' heads and in scattered statute text. Litigate.4 sets it out cause by cause, in a fixed shape, so that it can be checked, reused and, in time, run against a set of facts.

## What it does

- **Causes of action, cause by cause**: each entry names the claimant, the defendant and the provision that creates the claim.
- **Elements**: what the claimant must prove, with any section an element points to unpacked rather than cited in passing.
- **Gates kept apart from elements**: monetary limits, time windows, limitation periods and required prior steps are recorded separately, because they decide whether a claim can proceed, not whether it is made out.
- **Defences and remedies**: defences with the burden of proof where the text states it, and remedies with any election the claimant must make.
- **Forum as a first-class field**: much of the volume sits in tribunals and administrative schemes rather than in court, so each entry says where the claim goes.
- **Shared patterns written once**: tests that recur across statutes, such as a tribunal's claim limit and bar on splitting claims, or a reliance-then-loss pattern, are identified so they need only be encoded a single time.

## How it works

Each cause is written first in plain English from the statute text, with every element cited to its source by file and line. Those slots (elements, gates, defences, remedies, forum) are the ones an L4 encoding needs, and the L4 encoding is in development. Once encoded, each cause is tested against scenarios taken from the statute before it is relied on.

The aim is a claims-assessment layer: given the facts of a dispute, it will show which causes are available, which elements are met or still open, and which gates or defences may defeat the claim. A lawyer reviews the result; Litigate.4 does the systematic first pass.

## Where it comes from

The work began with Singapore. A sweep of about 500 Acts produced a register of statutory causes of action focused on high-volume claims brought by individuals: consumers, employees, injured people, neighbours and family members. It records where the corpus has gaps, and where statute only modifies a common-law claim, a layer still to be added. The same register underpins SUE, a self-help consumer app [in development](/apps).

The source texts behind the register are kept in the [Commons](/commons).
