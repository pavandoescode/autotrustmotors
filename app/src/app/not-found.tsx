import Link from "next/link";
import { ArrowLeft, Car } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-surface-light px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center space-y-8">

        {/* Decorative Icon */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-brand-primary/[0.06] border border-brand-primary/[0.12]">
            <Car className="w-9 h-9 text-brand-primary relative z-10" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-4">
          <h1 className="text-7xl md:text-8xl font-bold text-text-primary">
            4<span className="text-brand-primary">0</span>4
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-text-primary">
            Page Not Found
          </h2>
          <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
            It looks like you&apos;ve taken a wrong turn. The vehicle or page you are searching for might have been sold or no longer exists.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover transition-all btn-primary"
          >
            <ArrowLeft className="w-5 h-5" />
            Return Home
          </Link>
        </div>

      </div>
    </div>
  );
}
