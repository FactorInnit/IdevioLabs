import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { LEGAL, TERMS_SECTIONS } from "@/lib/legal";
import { PRODUCT_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Terms of Service — ${PRODUCT_NAME}`,
  description: `Terms governing your use of ${LEGAL.productName} by ${LEGAL.companyName}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      description={`Please read these Terms carefully before using ${LEGAL.productName}. They explain your rights and responsibilities.`}
      sections={TERMS_SECTIONS}
    />
  );
}
