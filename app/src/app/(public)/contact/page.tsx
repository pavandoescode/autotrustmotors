import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import LeadForm from "@/components/organisms/LeadForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with AutoTrust Motors. Visit our showroom, call us, or send us a message for any inquiries about our pre-owned vehicles.",
};

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Our Showroom",
    details: ["123 Auto Mall, MG Road", "Bangalore, Karnataka 560001"],
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+91 99999 99999", "+91 88888 88888"],
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["info@autotrustmotors.in", "sales@autotrustmotors.in"],
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Mon - Sat: 10:00 AM - 8:00 PM", "Sunday: By Appointment"],
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-surface-light border-b border-border-light py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            Contact Us
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto text-sm">
            Question about a vehicle? Want to book a test drive? Call us or send a message.
          </p>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact Info */}
            <div className="md:col-span-2 space-y-8">
              {contactInfo.map((info) => {
                const Icon = info.icon;
                return (
                  <div key={info.title} className="flex gap-5 items-start">
                    <div className="w-12 h-12 bg-brand-primary/[0.06] rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div className="pt-1">
                      <h3 className="text-base font-bold text-text-primary mb-1">{info.title}</h3>
                      {info.details.map((detail) => (
                        <p key={detail} className="text-sm text-text-secondary leading-relaxed">{detail}</p>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Map Embed */}
              <div className="rounded-xl overflow-hidden border border-border-light h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0095775093!2d77.60924!3d12.97525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzMxLjAiTiA3N8KwMzYnMzMuMyJF!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Showroom Location"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-3">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
