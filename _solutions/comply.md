---
title: "Comply.4"
slug: comply
tagline: "A self-check for regulated businesses: which duties arise, which are met, which fall due, each traced to its provision."
status: live
published: false
order: 30
---
Comply.4 is for regulated businesses and the compliance teams who answer for them. A product regime can run to dozens of articles and appendices, and much of it may not apply to a given product. The questions a team actually has are narrower: which of these duties arise for us, which have we met, and what is still outstanding? Comply.4 answers them from the business's own facts, and shows where each answer comes from.

## What it does

- **Duties that arise**: from answers about the company and the product, it works out which duties under the law apply and which do not.
- **A status for each duty**: every duty is marked not applicable, met, due, not met, or needs information. Where the text says "should" rather than "shall", a shortfall is shown as advice not followed and never counted as a breach.
- **Questions that would settle it**: where the answers so far cannot decide a duty, it says so and names the questions that would.
- **Traced to the text**: each result cites the provision it rests on and the answers that decided it, and says whether the duty binds the company directly or reaches it through national law.
- **Reading content (in development)**: a user can add a label photo, a product file or a web page. An AI model reads it into proposed answers, each shown with its evidence and open to correction. The rules alone decide compliance.

## How it works

The law is encoded in L4 as a rule pack: the questions, the duties, the provision behind each duty, and the readings taken where the text is ambiguous. Example cases, each stating the status every duty must produce, are run against the L4 rules. If the console and the L4 encoding ever disagree, the check fails.

The rules run in the browser. Once a regime is encoded, answering questions and getting results uses no AI at all; only the content-reading feature calls a model. The engine contains no law of its own, so a new regime is a new rule pack, not new software.

## Where it comes from

Comply.4 grew out of work on cosmetics regulation in Southeast Asia, including an earlier experiment that screened advertising claims against a national cosmetics law's prohibitions. The first rule pack covers the regional cosmetics regime: notification, safety, ingredients, labelling, claims and the product information file. It is a working draft that no one has yet reviewed. The substance lists are not yet modelled, and national implementing law, which sets the penalties, is out of scope.

[Read about L4](/l4), the language the rules are written in.
