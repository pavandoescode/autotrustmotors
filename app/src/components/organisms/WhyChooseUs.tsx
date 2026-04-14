import { CheckCircle2, BadgeIndianRupee, FileCheck2 } from "lucide-react";

const features = [
  {
    icon: CheckCircle2,
    title: "150-Point Certified",
    description:
      "Every vehicle goes through a rigorous 150-point inspection by certified mechanics before it reaches our lot.",
    highlight: "Every car inspected",
  },
  {
    icon: BadgeIndianRupee,
    title: "No Hidden Charges",
    description:
      "What you see is what you pay. Complete price transparency from day one — no surprises at signing.",
    highlight: "Transparent pricing",
  },
  {
    icon: FileCheck2,
    title: "Same-Day RC Transfer",
    description:
      "From documentation to RC transfer, we handle all paperwork so you drive home the same day.",
    highlight: "Hassle-free paperwork",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-10 sm:py-14 bg-brand-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wide mb-2">
              Our Guarantee
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              Why 500+ Customers
              <br className="hidden sm:block" /> Choose Us
            </h2>
          </div>
          <p className="text-blue-100 text-sm max-w-xs">
            Every purchase backed by our quality promise. No fine print.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex flex-col p-5 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 transition-colors"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-4 shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Tag */}
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wide mb-1.5">
                  {feature.highlight}
                </p>
                <h3 className="text-base font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-blue-100 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
