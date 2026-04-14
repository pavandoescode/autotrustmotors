import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Read our terms and conditions governing the use of AutoTrust Motors website and services.",
};

export default function TermsPage() {
  return (
    <>
      <section className="bg-surface-light border-b border-border-light py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Terms &amp; Conditions</h1>
          <p className="text-text-secondary text-sm">Last updated: April 2026</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl p-8 sm:p-12 border border-border-light shadow-sm">
            <h2 className="text-2xl font-bold text-text-primary mb-5">1. Acceptance of Terms</h2>
            <p className="text-text-secondary mb-8 leading-relaxed font-sans text-base">
              By accessing and using the AutoTrust Motors website, you agree to be bound by these Terms and
              Conditions. If you do not agree with any part of these terms, please do not use our website.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mb-5">2. Vehicle Listings</h2>
            <p className="text-text-secondary mb-8 leading-relaxed font-sans text-base">
              All vehicle listings on our website are subject to availability. Prices are indicative and may
              vary based on the condition inspection at the time of purchase. We reserve the right to modify
              or remove listings without prior notice.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mb-5">3. Pricing & Payments</h2>
            <p className="text-text-secondary mb-8 leading-relaxed font-sans text-base">
              All prices displayed are ex-showroom and do not include registration, insurance, or other
              statutory charges unless explicitly stated. EMI calculations on our website are indicative
              and actual terms may vary based on your financial profile and the lending institution.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mb-5">4. Warranty & Returns</h2>
            <p className="text-text-secondary mb-8 leading-relaxed font-sans text-base">
              Our 6-month warranty covers engine and transmission components as specified in the warranty
              document provided at the time of sale. The buy-back guarantee is subject to terms and conditions
              which will be explained in detail at the time of purchase.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mb-5">5. User Submissions</h2>
            <p className="text-text-secondary mb-8 leading-relaxed font-sans text-base">
              Any information submitted through our contact forms or inquiry forms will be used solely for
              the purpose of responding to your queries and providing relevant vehicle information. We will
              not share your information with unauthorized third parties.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mb-5">6. Limitation of Liability</h2>
            <p className="text-text-secondary mb-8 leading-relaxed font-sans text-base">
              AutoTrust Motors shall not be liable for any indirect, incidental, or consequential damages
              arising from the use of our website or services. Our total liability shall not exceed the
              amount paid by you for the specific transaction in question.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mb-5">7. Contact</h2>
            <p className="text-text-secondary leading-relaxed font-sans text-base">
              For any questions regarding these Terms & Conditions, reach out at{" "}
              <a href="mailto:info@autotrustmotors.in" className="text-brand-primary hover:text-brand-primary-hover transition-colors font-medium">
                info@autotrustmotors.in
              </a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
