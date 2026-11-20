---
title: "Insure.4"
slug: insure
tagline: "Insurance law and policy wordings in L4, so cover, price and claim answers are computed from the rules and cite their clause."
status: live
published: false
order: 80
---
Insure.4 is for insurers, brokers and insurance regulators. Insurance runs on long documents that customers do not read and staff read differently. Answers vary from one channel to the next, and wordings drift away from the law and from each other without anyone noticing until a claim or an inspection brings it out.

## What it does

- **Policy Quality Assurance**: checks each wording, certificate and sales page against the law it answers to, and against the insurer's other wordings. Every finding comes with its clause, the rule it departs from, a test that reproduces it and a severity.
- **Cover and claims decisions with their clause**: whether a loss is covered, which exclusion applies, the limit, the documents a claim file needs and the deadlines, each answer traced to the provision relied on.
- **One answer for every channel**: the website, a messaging app, the contact centre and the claims team ask the same rules and get the same answer, whoever asks.
- **Agent assist**: contact-centre and claims staff ask questions in plain language and see the answer with its clause before they tell the customer.
- **Re-checking when the law changes**: when a decree or circular is amended, the wordings are tested again against the new text.

## How it works

The law and the policies are encoded in L4. An AI model drafts each rule from the source text, quoting the clause it encodes, with tests taken from the source. Gates check that the encoding compiles, that every test passes and that every quotation matches the source exactly. Gates are not enough on their own, so a legal engineer reviews each rule and signs it off before it is used.

The encoded rules then run deterministically in Legalese Cloud, through a web console, an API, or MCP for AI assistants. A language model may hold the conversation with a customer, but the rules decide cover and amounts, and every answer records the clause and the version of the wording it used, so it can be audited later. A person still approves anything that reaches a customer, and an assessor approves every payment.

## Where it comes from

Insure.4 grew out of work for a vehicle-ecosystem insurer in Southeast Asia, now proposed as a pilot. For that work the national compulsory motor insurance decree and its amendment, the insurance business law and the road traffic law were encoded in L4, together with dozens of publicly available motor, health and property wordings. These encodings are drafts that a locally qualified lawyer has not yet reviewed.

The public law encodings behind Insure.4 sit in the [Commons](/commons); the language is described at [L4](/l4).
