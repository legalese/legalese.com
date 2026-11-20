---
title: "Prosecute.4"
slug: prosecute
tagline: "Offences encoded element by element, so a charge is framed only when every element is made out, and refused with reasons when it is not."
status: live
published: false
order: 50
---
Prosecute.4 is for prosecuting authorities and the police officers who prepare cases for them. A charge states that every legal condition of an offence is met. Checked by hand across many files, a charge can be laid on facts that do not support it, or the same facts charged differently from one desk to the next. Prosecute.4 puts the law into a form that can be checked, so the same facts lead to the same answer.

## What it does

- **Charge selection**: given the facts an officer has established, lists which sections are made out and which are not.
- **Elements, not summaries**: each offence is encoded from its defining section, and the charge laid under the punishing section.
- **Refusal with reasons**: where an element is missing, no charge text is produced; the refusal names the elements that were not made out.
- **Charges in statutory form**: where the elements are met, the charge is recited in the form the criminal procedure law prescribes, including the manner of the offence where the law requires it.
- **Exceptions and defences**: general exceptions and private defence are encoded as their own rules, so a defence is checked rather than assumed away.
- **Diagrams of the law**: each offence can be drawn as a ladder of its elements, for review by lawyers who do not read code.

## How it works

The offences are written once in L4, section by section, from the official text of the statute. Each is tested against scenarios taken from the law itself: the statute's own illustrations, and charges quoted word for word in reported judgments, including charges the courts found defective. A test passes only if the encoding frames the charges that were good and refuses the ones that were not, for the same reason the court gave.

The tested rules are then applied where charging decisions are made. An officer or prosecutor enters the facts of a case, and the rules return the charges the facts support, with their wording, or the gaps that stop a charge being framed. Prosecute.4 is in development as a specialisation of the Legalese Suite; a charge generator built on these encodings exists as a proof of concept.

## Where it comes from

Prosecute.4 grew from encoding Singapore's Penal Code 1871. There are now three encodings of it in the open Commons library: a hand-built set of property, intimidation and hurt offences tested against reported charges, and two encodings of the whole Code, one of which covers 443 sections with over 1,300 tests. All are drafts and have not yet been reviewed by a lawyer.
See the encodings in the [Commons](/commons), or read about [L4](/l4).
