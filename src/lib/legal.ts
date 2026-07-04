import { COMPANY_NAME, PRODUCT_NAME } from "@/lib/brand";
import { SITE_DOMAIN, SITE_URL, SUPPORT_EMAIL } from "@/lib/site";

/** Update this date whenever legal pages change materially. */
export const LEGAL_LAST_UPDATED = "July 4, 2026";

export const LEGAL = {
  companyName: COMPANY_NAME,
  productName: PRODUCT_NAME,
  website: SITE_URL,
  domain: SITE_DOMAIN,
  supportEmail: SUPPORT_EMAIL,
  billingEmail: SUPPORT_EMAIL,
} as const;

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    paragraphs: [
      `${LEGAL.companyName} ("we", "us", "our") operates ${LEGAL.productName} at ${LEGAL.website} (the "Service"). This Privacy Policy explains what personal data we collect, how we use it, and the choices you have.`,
      `By using the Service, you agree to this Privacy Policy. If you do not agree, please do not use the Service.`,
    ],
  },
  {
    id: "data-we-collect",
    title: "2. Information we collect",
    paragraphs: ["We collect information in the following ways:"],
    bullets: [
      "Account information — name, email address, and password (if you sign up with email).",
      "Authentication data — if you sign in with Google, we receive your Google account ID, name, and email from Google.",
      "Google Calendar data — if you connect Google Calendar, we store an OAuth refresh token and your connected Google email so we can display your calendar events inside the Service. We request read-only calendar access.",
      "Startup and workspace data — business ideas, roadmaps, tasks, notes, team messages, progress, budgets, and other content you enter into the Service.",
      "AI interactions — prompts and messages you send to the AI founder coach and related AI features.",
      "Payment information — paid subscriptions are processed by Stripe. We do not store full card numbers; we receive customer IDs, subscription status, and billing metadata from Stripe.",
      "Usage and technical data — browser type, device information, IP address, pages visited, and cookies required to keep you signed in.",
    ],
  },
  {
    id: "how-we-use",
    title: "3. How we use your information",
    paragraphs: ["We use personal data to:"],
    bullets: [
      "Provide, maintain, and improve the Service.",
      "Generate AI-powered roadmaps, validation reports, competitor research, and coaching responses.",
      "Authenticate you and keep your account secure.",
      "Sync and display Google Calendar events when you choose to connect.",
      "Process subscriptions and manage your plan.",
      "Send service-related messages (for example, account or billing notices).",
      "Detect abuse, fraud, and technical issues.",
      "Comply with legal obligations.",
    ],
  },
  {
    id: "ai-processing",
    title: "4. AI and third-party processors",
    paragraphs: [
      `${LEGAL.productName} uses third-party AI providers (such as OpenAI) to power certain features. Content you submit may be sent to those providers to generate responses. Do not submit confidential information you are not comfortable sharing with AI processors.`,
      "AI outputs are generated automatically and may be inaccurate or incomplete. They are not legal, financial, tax, or investment advice.",
      "We also use infrastructure providers including Vercel (hosting), Turso (database), Stripe (payments), and Google (sign-in and optional calendar access). These providers process data on our behalf under their own terms and privacy policies.",
    ],
  },
  {
    id: "sharing",
    title: "5. How we share information",
    paragraphs: [
      "We do not sell your personal data. We may share information only in these situations:",
    ],
    bullets: [
      "With service providers that help us run the Service (hosting, database, payments, AI, authentication).",
      "When you connect third-party integrations (for example, Google Calendar or Calendly links you add).",
      "If required by law, regulation, legal process, or governmental request.",
      "To protect the rights, property, or safety of our users, the public, or our company.",
      "In connection with a merger, acquisition, or sale of assets, with notice where required by law.",
    ],
  },
  {
    id: "retention",
    title: "6. Data retention",
    paragraphs: [
      "We keep your account and workspace data for as long as your account is active or as needed to provide the Service.",
      "If you delete your account or ask us to delete data, we will remove or anonymize personal data within a reasonable period, except where we must retain information for legal, security, or billing purposes.",
    ],
  },
  {
    id: "security",
    title: "7. Security",
    paragraphs: [
      "We use reasonable technical and organizational measures to protect personal data, including encrypted connections (HTTPS), secure session handling, and access controls.",
      "No online service can guarantee absolute security. You are responsible for keeping your password confidential and for activity under your account.",
    ],
  },
  {
    id: "your-rights",
    title: "8. Your choices and rights",
    paragraphs: [
      "Depending on where you live, you may have rights to access, correct, delete, or export your personal data, or to object to or restrict certain processing.",
      `To make a privacy request, email ${LEGAL.supportEmail}. We may need to verify your identity before responding.`,
      "You can disconnect Google Calendar at any time from the Calendar settings in your workspace.",
      "You can manage marketing emails by using unsubscribe links if we send them. Service-related emails may still be sent.",
    ],
  },
  {
    id: "cookies",
    title: "9. Cookies and similar technologies",
    paragraphs: [
      "We use essential cookies and similar technologies to keep you signed in, remember preferences, and secure the Service.",
      "We may use analytics cookies in the future to understand how the Service is used. If we do, we will update this policy and, where required, ask for consent.",
      "You can control cookies through your browser settings. Blocking essential cookies may prevent parts of the Service from working.",
    ],
  },
  {
    id: "children",
    title: "10. Children",
    paragraphs: [
      "The Service is not intended for children under 16. We do not knowingly collect personal data from children under 16. If you believe a child has provided us data, contact us and we will delete it.",
    ],
  },
  {
    id: "international",
    title: "11. International transfers",
    paragraphs: [
      "Your data may be processed in countries other than your own, including where our service providers operate. We take steps designed to protect your data in line with this Privacy Policy.",
    ],
  },
  {
    id: "changes",
    title: "12. Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. We will post the updated version on this page and change the \"Last updated\" date. Material changes may also be communicated by email or in-product notice.",
      "Continued use of the Service after changes become effective means you accept the updated policy.",
    ],
  },
  {
    id: "contact",
    title: "13. Contact us",
    paragraphs: [
      `Questions about this Privacy Policy or our data practices? Email ${LEGAL.supportEmail}.`,
    ],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "agreement",
    title: "1. Agreement to terms",
    paragraphs: [
      `These Terms of Service ("Terms") govern your access to and use of ${LEGAL.productName}, operated by ${LEGAL.companyName} at ${LEGAL.website} (the "Service").`,
      "By creating an account, accessing, or using the Service, you agree to these Terms and our Privacy Policy. If you use the Service on behalf of an organization, you represent that you have authority to bind that organization.",
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    paragraphs: [
      "You must be at least 16 years old and able to form a binding contract to use the Service.",
      "You may not use the Service if you are barred from doing so under applicable law or if we have previously suspended your account.",
    ],
  },
  {
    id: "account",
    title: "3. Your account",
    paragraphs: [
      "You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.",
      "You agree to provide accurate information and to keep your account details up to date.",
      "Notify us promptly at " + LEGAL.supportEmail + " if you suspect unauthorized access to your account.",
    ],
  },
  {
    id: "service",
    title: "4. The Service",
    paragraphs: [
      `${LEGAL.productName} is a software platform that helps founders plan, organize, and track startup work using roadmaps, workspace tools, integrations, and AI-assisted features.`,
      "We may add, change, or remove features at any time. We try to avoid disrupting paid features you rely on, but the Service is provided on an evolving basis.",
    ],
  },
  {
    id: "ai-disclaimer",
    title: "5. AI features — important disclaimer",
    paragraphs: [
      "The Service includes AI-generated content such as roadmaps, validation reports, competitor summaries, and coaching responses.",
      "AI output may be wrong, incomplete, outdated, or inappropriate for your situation. You must independently review and verify anything before relying on it.",
      "AI features do not constitute legal, financial, tax, investment, medical, or professional advice. You are solely responsible for decisions you make using the Service.",
    ],
  },
  {
    id: "your-content",
    title: "6. Your content",
    paragraphs: [
      'You retain ownership of content you submit to the Service ("User Content").',
      "You grant us a worldwide, non-exclusive license to host, store, reproduce, process, and display User Content only as needed to operate and improve the Service, including providing AI features you request.",
      "You represent that you have the rights needed to submit User Content and that it does not violate these Terms or applicable law.",
    ],
  },
  {
    id: "acceptable-use",
    title: "7. Acceptable use",
    paragraphs: ["You agree not to:"],
    bullets: [
      "Use the Service for unlawful, harmful, fraudulent, or abusive purposes.",
      "Attempt to gain unauthorized access to the Service, other accounts, or our systems.",
      "Reverse engineer, scrape, or overload the Service except as permitted by law.",
      "Upload malware or content that infringes intellectual property or privacy rights.",
      "Use the Service to build a competing product by systematically extracting data or outputs.",
      "Misrepresent AI-generated content as human professional advice to third parties in a regulated context.",
    ],
  },
  {
    id: "integrations",
    title: "8. Third-party services",
    paragraphs: [
      "The Service may integrate with third-party services such as Google, Stripe, Calendly, and OpenAI. Your use of those services is subject to their terms and policies.",
      "We are not responsible for third-party services and do not guarantee their availability or accuracy.",
    ],
  },
  {
    id: "plans",
    title: "9. Plans, billing, and subscriptions",
    paragraphs: [
      "We offer free and paid subscription plans. Plan limits and features are described on our pricing page.",
      "Paid subscriptions are billed in advance on a recurring monthly basis through Stripe unless stated otherwise.",
      "Prices may change with reasonable notice. Price changes apply to future billing periods after notice.",
      "Taxes may be added where required. You authorize us and our payment processor to charge your payment method for applicable fees.",
      "If payment fails, we may suspend or downgrade your account until payment is resolved.",
      "See our Refund Policy for cancellation and refund details.",
    ],
  },
  {
    id: "termination",
    title: "10. Suspension and termination",
    paragraphs: [
      "You may stop using the Service at any time and may cancel a paid subscription as described in our Refund Policy.",
      "We may suspend or terminate access if you violate these Terms, create risk for us or other users, or if required by law.",
      "Upon termination, your right to use the Service ends. Provisions that by nature should survive (including payment obligations, disclaimers, and limits of liability) will survive.",
    ],
  },
  {
    id: "ip",
    title: "11. Our intellectual property",
    paragraphs: [
      `The Service, including software, design, branding, and documentation (excluding User Content), is owned by ${LEGAL.companyName} and its licensors and is protected by intellectual property laws.`,
      "We grant you a limited, non-exclusive, non-transferable license to use the Service for your internal business purposes while your account is active and in good standing.",
    ],
  },
  {
    id: "disclaimers",
    title: "12. Disclaimers",
    paragraphs: [
      'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
      "We do not warrant that the Service will be uninterrupted, secure, error-free, or that AI outputs will be accurate or suitable for your needs.",
    ],
  },
  {
    id: "liability",
    title: "13. Limitation of liability",
    paragraphs: [
      "To the maximum extent permitted by law, " + LEGAL.companyName + " and its officers, employees, and suppliers will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, goodwill, or business opportunity.",
      "Our total liability for any claim relating to the Service is limited to the greater of (a) the amount you paid us in the 12 months before the claim or (b) USD $100.",
      "Some jurisdictions do not allow certain limitations, so some of the above may not apply to you.",
    ],
  },
  {
    id: "indemnity",
    title: "14. Indemnification",
    paragraphs: [
      "You agree to defend, indemnify, and hold harmless " + LEGAL.companyName + " from claims, damages, and expenses (including reasonable legal fees) arising from your use of the Service, your User Content, or your violation of these Terms.",
    ],
  },
  {
    id: "law",
    title: "15. Governing law and disputes",
    paragraphs: [
      "These Terms are governed by the laws applicable to the operator of the Service, without regard to conflict-of-law rules.",
      "Before filing a formal claim, you agree to contact us at " + LEGAL.supportEmail + " and try to resolve the dispute informally within 30 days.",
      "Except where prohibited by law, disputes will be resolved in the courts located where " + LEGAL.companyName + " is established, and you consent to personal jurisdiction there.",
    ],
  },
  {
    id: "changes-terms",
    title: "16. Changes to these Terms",
    paragraphs: [
      "We may update these Terms from time to time. If we make material changes, we will provide notice by posting the updated Terms and updating the \"Last updated\" date, and where appropriate by email or in-product notice.",
      "Continued use after changes become effective constitutes acceptance of the updated Terms.",
    ],
  },
  {
    id: "contact-terms",
    title: "17. Contact",
    paragraphs: [
      `Questions about these Terms? Email ${LEGAL.supportEmail}.`,
    ],
  },
];

export const REFUND_SECTIONS: LegalSection[] = [
  {
    id: "overview",
    title: "1. Overview",
    paragraphs: [
      `This Refund and Cancellation Policy applies to paid subscriptions for ${LEGAL.productName} ("Service") operated by ${LEGAL.companyName}.`,
      "By subscribing to a paid plan, you agree to this policy together with our Terms of Service.",
    ],
  },
  {
    id: "billing-cycle",
    title: "2. Billing cycle",
    paragraphs: [
      "Pro and Ultra plans are billed monthly in advance through Stripe.",
      "Your subscription renews automatically each billing period unless you cancel before the renewal date.",
    ],
  },
  {
    id: "cancel",
    title: "3. How to cancel",
    paragraphs: [
      `Email ${LEGAL.billingEmail} from the address on your account and ask to cancel your subscription, or use the Stripe customer portal if we provide a self-serve link in your account settings.`,
      "Cancellation stops future charges. You will keep access to paid features until the end of the current billing period unless we state otherwise.",
      "After the billing period ends, your account will revert to the Free plan and paid-only limits will apply.",
    ],
  },
  {
    id: "refunds",
    title: "4. Refunds",
    paragraphs: [
      "Because the Service delivers digital access immediately, fees are generally non-refundable once a billing period has started.",
      "We may offer a refund at our sole discretion in cases such as duplicate charges, extended service outages caused by us, or billing errors.",
      "If you believe you were charged in error, contact us within 14 days of the charge at " + LEGAL.billingEmail + " with your account email and invoice details.",
    ],
  },
  {
    id: "downgrades",
    title: "5. Downgrades and plan changes",
    paragraphs: [
      "If you downgrade from a higher plan to a lower plan, the change typically takes effect at the next billing cycle.",
      "If a downgrade causes you to exceed plan limits (for example, number of startups), you may need to archive or delete content before the downgrade takes effect.",
    ],
  },
  {
    id: "chargebacks",
    title: "6. Chargebacks",
    paragraphs: [
      "If you dispute a charge with your bank instead of contacting us first, we may suspend your account while the dispute is investigated.",
    ],
  },
  {
    id: "contact-refunds",
    title: "7. Contact",
    paragraphs: [
      `Billing questions or refund requests: ${LEGAL.billingEmail}.`,
    ],
  },
];
