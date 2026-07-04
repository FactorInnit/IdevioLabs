import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { LEGAL, PRIVACY_SECTIONS } from "@/lib/legal";
import { PRODUCT_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Privacy Policy — ${PRODUCT_NAME}`,
  description: `How ${LEGAL.companyName} collects, uses, and protects your data on ${LEGAL.productName}.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      description={`This policy describes how ${LEGAL.companyName} handles personal information when you use ${LEGAL.productName}.`}
      sections={PRIVACY_SECTIONS}
    />
  );
}
