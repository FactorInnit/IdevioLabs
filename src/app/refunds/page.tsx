import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { LEGAL, REFUND_SECTIONS } from "@/lib/legal";
import { PRODUCT_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Refund Policy — ${PRODUCT_NAME}`,
  description: `Cancellation and refund terms for ${LEGAL.productName} paid subscriptions.`,
  alternates: { canonical: "/refunds" },
};

export default function RefundsPage() {
  return (
    <LegalDocument
      title="Refund & Cancellation Policy"
      description={`How billing, cancellation, and refunds work for paid ${LEGAL.productName} plans.`}
      sections={REFUND_SECTIONS}
    />
  );
}
