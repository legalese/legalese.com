import { Metadata } from "next";
import { SectionIndex } from "../_components/section-views";
import { getSectionEntries } from "@/lib/sections";

export const metadata: Metadata = {
  title: "Products",
  description: "The tools for writing, testing and running law as code.",
};

export default function ProductsIndex() {
  return <SectionIndex section="products" entries={getSectionEntries("products")} intro="The tools for writing, testing and running law as code." />;
}
