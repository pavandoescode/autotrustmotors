import type { Metadata } from "next";
import { Award, Users, Car, ShieldCheck, Target, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about AutoTrust Motors — your trusted destination for quality pre-owned cars. Our story, mission, and commitment to customer satisfaction.",
};

const stats = [
  { value: "500+", label: "Cars Sold" },
  { value: "2000+", label: "Happy Customers" },
  { value: "10+", label: "Years Experience" },
  { value: "50+", label: "Brands Available" },
];

const values = [
  { icon: ShieldCheck, title: "Trust & Transparency", description: "Every vehicle comes with a full history report and transparent pricing with no hidden fees." },
  { icon: Award, title: "Quality Assurance", description: "Our 150-point inspection ensures every car meets our exacting standards before listing." },
  { icon: Target, title: "Customer First", description: "Your satisfaction is our priority. We go the extra mile to find your perfect vehicle." },
  { icon: Heart, title: "Passion for Cars", description: "Our team shares a deep passion for automobiles, ensuring expert guidance at every step." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface-light border-b border-border-light py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-3 leading-tight">
              About <span className="text-brand-primary">AutoTrust Motors</span>
            </h1>
            <p className="text-sm text-text-secondary max-w-xl mx-auto">
              Quality pre-owned cars since 2016. 500+ happy customers. Every car inspected, every price transparent.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-6">
                <p className="text-3xl sm:text-4xl font-extrabold text-brand-primary mb-2 tracking-tight">{stat.value}</p>
                <p className="text-sm text-text-secondary font-medium uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-14 bg-surface-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6 leading-tight">
                A Legacy of <span className="text-brand-primary">Trust</span>
              </h2>
              <div className="space-y-4 text-text-secondary leading-relaxed text-sm sm:text-base">
                <p>
                  AutoTrust Motors was born from a simple belief: purchasing a pre-owned car should be
                  as delightful as buying a brand-new one. Our founder, a lifelong automotive enthusiast,
                  saw an opportunity to transform the pre-owned car market.
                </p>
                <p>
                  Today, we are one of the most trusted names in the pre-owned car segment. Our
                  team of automotive experts carefully selects every vehicle, ensuring it meets our stringent quality
                  standards. From the moment you walk into our showroom to the day you drive home your
                  dream car, we ensure a seamless experience.
                </p>
                <p>
                  With our warranty, buy-back guarantee, and flexible payment options,
                  we make car ownership worry-free and accessible to everyone.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-48 bg-surface-light border border-border-light rounded-xl flex items-center justify-center">
                  <Car className="w-16 h-16 text-brand-primary/30" />
                </div>
                <div className="h-32 bg-brand-primary/[0.06] rounded-xl flex items-center justify-center">
                  <Award className="w-12 h-12 text-brand-primary/50" />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="h-32 bg-brand-primary/[0.06] rounded-xl flex items-center justify-center">
                  <Users className="w-12 h-12 text-brand-primary/50" />
                </div>
                <div className="h-48 bg-surface-light border border-border-light rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-16 h-16 text-brand-primary/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3 leading-tight">
              Our Core <span className="text-brand-primary">Values</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto text-sm">The principles that drive everything we do.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="p-6 text-center">
                  <div className="w-14 h-14 bg-brand-primary/[0.06] rounded-xl flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-8 h-8 text-brand-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">{value.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
