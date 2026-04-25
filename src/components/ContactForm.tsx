"use client";

import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

type FormData = {
  name: string;
  email: string;
  organisation: string;
  enquiryType: string;
  subject: string;
  message: string;
};

const enquiryTypes = [
  "Programme Evaluation",
  "Health Systems Technical Assistance",
  "Health Financing Advisory",
  "Policy Research & Analysis",
  "Digital Health Governance",
  "Speaking / Keynote",
  "Other",
];

export default function ContactForm() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [data, setData] = useState<FormData>({
    name: "",
    email: "",
    organisation: "",
    enquiryType: "",
    subject: "",
    message: "",
  });

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!data.name.trim()) errs.name = "Name is required";
    if (!data.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = "Enter a valid email";
    if (!data.enquiryType) errs.enquiryType = "Please select an enquiry type";
    if (!data.subject.trim()) errs.subject = "Subject is required";
    if (!data.message.trim()) errs.message = "Message is required";
    else if (data.message.trim().length < 30) errs.message = "Please provide more detail (minimum 30 characters)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setFormState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      setFormState("success");
    } catch {
      setFormState("error");
    }
  };

  if (formState === "success") {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-bold text-navy-900 mb-2">Message Sent!</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Thank you for reaching out. Dr. Mosiwa will respond within 2 business days.
        </p>
        <button
          onClick={() => { setFormState("idle"); setData({ name: "", email: "", organisation: "", enquiryType: "", subject: "", message: "" }); }}
          className="mt-6 text-gold-600 hover:text-gold-700 text-sm font-semibold"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Dr. Jane Smith"
            className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors outline-none focus:ring-2 focus:ring-gold-500/30 ${
              errors.name ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300 focus:border-gold-500"
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Work Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="jane@organisation.org"
            className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors outline-none focus:ring-2 focus:ring-gold-500/30 ${
              errors.email ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300 focus:border-gold-500"
            }`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>
      </div>

      {/* Organisation */}
      <div>
        <label htmlFor="organisation" className="block text-sm font-medium text-gray-700 mb-1.5">
          Organisation / Institution
        </label>
        <input
          id="organisation"
          type="text"
          value={data.organisation}
          onChange={(e) => handleChange("organisation", e.target.value)}
          placeholder="Ministry of Health / World Bank / NGO Name"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 focus:border-gold-500 text-sm transition-colors outline-none focus:ring-2 focus:ring-gold-500/30"
        />
      </div>

      {/* Enquiry type */}
      <div>
        <label htmlFor="enquiryType" className="block text-sm font-medium text-gray-700 mb-1.5">
          Nature of Enquiry <span className="text-red-500">*</span>
        </label>
        <select
          id="enquiryType"
          value={data.enquiryType}
          onChange={(e) => handleChange("enquiryType", e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors outline-none focus:ring-2 focus:ring-gold-500/30 bg-white ${
            errors.enquiryType ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300 focus:border-gold-500"
          }`}
        >
          <option value="">Select enquiry type…</option>
          {enquiryTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {errors.enquiryType && <p className="mt-1 text-xs text-red-500">{errors.enquiryType}</p>}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          id="subject"
          type="text"
          value={data.subject}
          onChange={(e) => handleChange("subject", e.target.value)}
          placeholder="e.g. Baseline evaluation for PHC programme in Kenya"
          className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors outline-none focus:ring-2 focus:ring-gold-500/30 ${
            errors.subject ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300 focus:border-gold-500"
          }`}
        />
        {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          value={data.message}
          onChange={(e) => handleChange("message", e.target.value)}
          placeholder="Please describe your programme, the support you need, your timeline, and any other relevant details…"
          className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors outline-none focus:ring-2 focus:ring-gold-500/30 resize-none ${
            errors.message ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300 focus:border-gold-500"
          }`}
        />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
        <p className="mt-1 text-xs text-gray-400">{data.message.length} characters</p>
      </div>

      {formState === "error" && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          Something went wrong. Please try again or email directly at{" "}
          <a href="mailto:bmosiwa@gmail.com" className="font-semibold underline">bmosiwa@gmail.com</a>.
        </div>
      )}

      <button
        type="submit"
        disabled={formState === "loading"}
        className="w-full py-4 bg-gold-500 hover:bg-gold-600 disabled:bg-gold-300 text-white font-semibold rounded-lg transition-colors shadow-sm text-sm flex items-center justify-center gap-2"
      >
        {formState === "loading" ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Sending…
          </>
        ) : (
          <>
            Send Enquiry
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Your information is kept strictly confidential and will only be used to respond to your enquiry.
      </p>
    </form>
  );
}
