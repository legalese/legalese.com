import { Metadata } from "next";
import { SectionIndex } from "../_components/section-views";
import { getSectionEntries } from "@/lib/sections";

export const metadata: Metadata = {
  title: "Apps",
  description: "Applications built on L4 and the Commons library for the people the law applies to.",
};

export default function AppsIndex() {
  return <SectionIndex section="apps" entries={getSectionEntries("apps")} intro="Applications built on L4 and the Commons library for the people the law applies to." />;
}
