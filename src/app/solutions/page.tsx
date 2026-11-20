import { Metadata } from "next";
import { SectionIndex } from "../_components/section-views";
import { getSectionEntries } from "@/lib/sections";

export const metadata: Metadata = {
  title: "Solutions",
  description: "Rules written once in L4, tested against scenarios, applied where decisions are made.",
};

export default function SolutionsIndex() {
  return <SectionIndex section="solutions" entries={getSectionEntries("solutions")} intro="Rules written once in L4, tested against scenarios, applied where decisions are made." />;
}
