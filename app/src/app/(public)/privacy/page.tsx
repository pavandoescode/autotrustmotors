import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read our privacy policy to understand how AutoTrust Motors collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-surface-light border-b border-border-light py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Privacy Policy</h1>
          <p className="text-text-secondary text-sm">Last updated: April 2026</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl p-8 sm:p-12 border border-border-light shadow-sm">
            <h2 className="text-2xl font-bold text-text-primary mb-5">1. Information We Collect</h2>
            <p className="text-text-secondary mb-8 leading-relaxed font-sans text-base">
              We collect information you provide directly to us, such as your name, email address, phone number,
              and any messages you submit through our contact forms or inquiry forms. We also collect information
              about your usage of our website, including pages visited, time spent, and device information.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mb-5">2. How We Use Your Information</h2>
            <p className="text-text-secondary mb-8 leading-relaxed font-sans text-base">
              We use the information we collect to respond to your inquiries and provide customer support,
              send you updates about vehicles that match your interests, improve our website and services,
              and comply with legal obligations.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mb-5">3. Information Sharing</h2>
            <p className="text-text-secondary mb-8 leading-relaxed font-sans text-base">
              We do not sell, trade, or otherwise transfer your personally identifiable information to third
              parties without your consent, except as required by law or to protect our rights. We may share
              anonymized, aggregated data for analytics purposes.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mb-5">4. Data Security</h2>
            <p className="text-text-secondary mb-8 leading-relaxed font-sans text-base">
              We implement appropriate security measures to protect your personal information against
              unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
              over the Internet is 100% secure.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mb-5">5. Cookies</h2>
            <p className="text-text-secondary mb-8 leading-relaxed font-sans text-base">
              Our website uses cookies to enhance your browsing experience. You can choose to disable cookies
              through your browser settings, though this may affect some functionality of our website.
            </p>

            <h2 className="text-2xl font-bold text-text-primary mb-5">6. Contact Us</h2>
            <p className="text-text-secondary leading-relaxed font-sans text-base">
              If you have any questions about this Privacy Policy, please contact us at{" "}
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
