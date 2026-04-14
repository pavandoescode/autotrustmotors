"use client";

import { useState, useMemo } from "react";
import { Calculator, IndianRupee, ChevronDown, ChevronUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface EMICalculatorProps {
  vehiclePrice: number;
}

export default function EMICalculator({ vehiclePrice }: EMICalculatorProps) {
  const [loanAmount, setLoanAmount] = useState(Math.round(vehiclePrice * 0.8));
  const [interestRate, setInterestRate] = useState(9.5);
  const [tenure, setTenure] = useState(60); // months
  const [isExpanded, setIsExpanded] = useState(false);

  const emiDetails = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const n = tenure;

    if (monthlyRate === 0) {
      const emi = principal / n;
      return {
        emi: Math.round(emi),
        totalPayment: Math.round(principal),
        totalInterest: 0,
        principalPercent: 100,
        interestPercent: 0,
      };
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
      (Math.pow(1 + monthlyRate, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - principal;

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      principalPercent: Math.round((principal / totalPayment) * 100),
      interestPercent: Math.round((totalInterest / totalPayment) * 100),
    };
  }, [loanAmount, interestRate, tenure]);



  return (
    <div className="bg-white border border-border-light rounded-xl p-6 shadow-sm">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/[0.06] rounded-lg flex items-center justify-center group-hover:bg-brand-primary/[0.1] transition-colors">
            <Calculator className="w-5 h-5 text-brand-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-text-primary">EMI Calculator</h3>
            <p className="text-xs text-text-muted">Estimate your monthly payments</p>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-full border border-border-light flex items-center justify-center transition-all duration-300 ${isExpanded ? "bg-brand-primary text-white border-brand-primary rotate-180" : "bg-surface-light text-text-muted rotate-0 hover:border-brand-primary hover:text-brand-primary"}`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? "max-h-[1000px] opacity-100 mt-8 pt-6 border-t border-border-light" : "max-h-0 opacity-0"}`}>
        <div className="space-y-8">
        {/* Loan Amount Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-secondary">Loan Amount</label>
            <span className="text-sm font-bold text-brand-primary">{formatPrice(loanAmount, { short: true })}</span>
          </div>
          <input
            type="range"
            min={100000}
            max={vehiclePrice}
            step={50000}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand-primary"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>₹1L</span>
            <span>{formatPrice(vehiclePrice, { short: true })}</span>
          </div>
        </div>

        {/* Interest Rate Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-secondary">Interest Rate</label>
            <span className="text-sm font-bold text-brand-primary">{interestRate}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={20}
            step={0.5}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand-primary"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>5%</span>
            <span>20%</span>
          </div>
        </div>

        {/* Tenure Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-secondary">Loan Tenure</label>
            <span className="text-sm font-bold text-brand-primary">{tenure} months</span>
          </div>
          <input
            type="range"
            min={12}
            max={84}
            step={6}
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-brand-primary"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>12 mo</span>
            <span>84 mo</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-light" />

        {/* EMI Result */}
        <div className="text-center p-5 bg-brand-primary rounded-lg">
          <p className="text-sm text-blue-200 mb-1">Monthly EMI</p>
          <div className="flex items-center justify-center gap-1">
            <IndianRupee className="w-6 h-6 text-white" />
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {emiDetails.emi.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Pie Chart Visual */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E5E7EB" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.915" fill="none"
                stroke="#2563EB" strokeWidth="3"
                strokeDasharray={`${emiDetails.principalPercent} ${100 - emiDetails.principalPercent}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-text-primary">{emiDetails.principalPercent}%</span>
            </div>
          </div>
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-primary" />
                <span className="text-sm text-text-secondary">Principal</span>
              </div>
              <span className="text-sm font-semibold text-text-primary">{formatPrice(loanAmount, { short: true })}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-border-light" />
                <span className="text-sm text-text-secondary">Interest</span>
              </div>
              <span className="text-sm font-semibold text-text-primary">{formatPrice(emiDetails.totalInterest, { short: true })}</span>
            </div>
            <div className="h-px bg-border-light" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-secondary">Total</span>
              <span className="text-sm font-bold text-text-primary">{formatPrice(emiDetails.totalPayment, { short: true })}</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
