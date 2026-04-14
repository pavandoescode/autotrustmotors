"use client";

import { useState } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";

interface LeadFormProps {
  vehicleId?: string;
  vehicleTitle?: string;
}

export default function LeadForm({ vehicleId, vehicleTitle }: LeadFormProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: vehicleTitle ? `Hi, I'm interested in the ${vehicleTitle}. Please share more details.` : "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          vehicleId: vehicleId || undefined,
          message: vehicleTitle
            ? `Inquiry about: ${vehicleTitle}\n${form.message}`
            : form.message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setForm({
          name: "",
          phone: "",
          message: vehicleTitle ? `Hi, I'm interested in the ${vehicleTitle}. Please share more details.` : "",
        });
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white border border-border-light rounded-xl p-6 shadow-sm">
        <div className="w-16 h-16 bg-action-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-action-green" />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">Thank You!</h3>
        <p className="text-text-secondary text-sm mb-4">
          Your inquiry has been submitted. Our team will contact you shortly.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm text-brand-primary hover:text-brand-primary-hover font-medium transition-colors"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border-light rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-text-primary mb-1">
        {vehicleTitle ? "Interested in this car?" : "Get In Touch"}
      </h3>
      <p className="text-sm text-text-muted mb-5">
        Fill out the form and we&apos;ll get back to you within hours.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          placeholder="Your Name *"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 bg-surface-light border border-border-light rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-colors"
        />
        <input
          type="tel"
          placeholder="Phone Number *"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full px-4 py-3 bg-surface-light border border-border-light rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-colors"
        />
        <textarea
          placeholder="Your Message (optional)"
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-4 py-3 bg-surface-light border border-border-light rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-colors resize-none"
        />

        {status === "error" && (
          <p className="text-sm text-red-500">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed btn-primary text-sm"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Inquiry
            </>
          )}
        </button>
      </form>
    </div>
  );
}
