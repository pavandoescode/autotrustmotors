import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  car: string;
  quote: string;
  rating: number;
  location: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Rajesh Sharma",
    car: "Maruti Suzuki Swift",
    quote:
      "Great experience from start to finish. The team was transparent about every detail, and the car was in excellent condition. RC transfer done same day!",
    rating: 5,
    location: "Mumbai",
  },
  {
    name: "Priya Mehta",
    car: "Hyundai Creta",
    quote:
      "I was skeptical about buying a pre-owned car, but AutoTrust Motors changed my mind completely. The price was fair and they handled all the paperwork.",
    rating: 5,
    location: "Delhi",
  },
  {
    name: "Arjun Patel",
    car: "Tata Nexon",
    quote:
      "The entire process was seamless — from browsing online to driving my car home. Easy financing and no hidden charges. Highly recommended!",
    rating: 5,
    location: "Ahmedabad",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-10 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
              What Our Customers Say
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Verified reviews from real buyers.
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-text-primary">4.9</span>
            <span className="text-xs text-text-muted">(500+ reviews)</span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="p-5 rounded-lg border border-border-light bg-surface-light hover:border-brand-primary/30 hover:shadow-sm transition-all duration-200"
            >
              {/* Stars */}
              <StarRating rating={testimonial.rating} />

              {/* Quote */}
              <p className="text-text-secondary text-sm leading-relaxed mt-3 mb-4">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Divider */}
              <div className="h-px bg-border-light mb-4" />

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-text-primary text-sm">{testimonial.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{testimonial.location}</p>
                </div>
                <span className="px-2.5 py-1 bg-brand-primary/[0.06] text-brand-primary text-[11px] font-semibold rounded-md border border-brand-primary/[0.12]">
                  {testimonial.car}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
