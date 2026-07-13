"use client";

// HerVoice! — role-based login
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowLeft, ShieldCheck, HeartHandshake, Building2, BarChart3,
  Settings, Megaphone, Heart, KeyRound,
} from "lucide-react";
import { useHV, DEMO_ACCOUNTS, Role } from "../_lib/store";
import { HVLogo } from "../_components/shell";
import { Btn, Field, Input, cn } from "../_components/ui";

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  survivor: <Heart size={20} />,
  advocate: <HeartHandshake size={20} />,
  facility: <Building2 size={20} />,
  district: <BarChart3 size={20} />,
  admin: <Settings size={20} />,
  citizen: <Megaphone size={20} />,
};

export default function LoginPage() {
  const hv = useHV();
  const router = useRouter();
  const [selected, setSelected] = useState<Role>("survivor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [forgot, setForgot] = useState(false);

  useEffect(() => {
    if (hv.ready && !hv.unlocked) router.replace("/hervoice_26");
  }, [hv.ready, hv.unlocked, router]);

  const account = DEMO_ACCOUNTS.find((a) => a.role === selected)!;

  const selectRole = (role: Role) => {
    setSelected(role);
    const acc = DEMO_ACCOUNTS.find((a) => a.role === role)!;
    if (role !== "citizen") {
      setEmail(acc.email);
      setPassword(acc.password);
    }
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected === "citizen") {
      hv.loginAs("citizen");
      router.push("/hervoice_26/citizen");
      return;
    }
    const acc = hv.login(email, password);
    if (acc) router.push(acc.home);
    else setError("Incorrect email or password for this role.");
  };

  return (
    <div className="min-h-screen bg-hv-50/60 flex flex-col">
      <nav className="bg-white/85 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/hervoice_26"><HVLogo /></Link>
          <Link href="/hervoice_26" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-hv-800">
            <ArrowLeft size={15} /> Back
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden grid lg:grid-cols-[1.1fr,1fr]"
        >
          {/* Role picker */}
          <div className="p-7 sm:p-9 border-b lg:border-b-0 lg:border-r border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">Sign in to HerVoice!</h1>
            <p className="text-sm text-gray-500 mt-1.5">
              Select a demonstration role. Credentials pre-fill automatically for reviewers.
            </p>
            <div className="grid sm:grid-cols-2 gap-2.5 mt-6">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => selectRole(acc.role)}
                  className={cn(
                    "text-left p-3.5 rounded-2xl border transition-all",
                    selected === acc.role
                      ? "border-hv-500 bg-hv-50 ring-2 ring-hv-100"
                      : "border-gray-100 hover:border-hv-200 hover:bg-hv-50/40"
                  )}
                >
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-2.5",
                    selected === acc.role ? "bg-hv-800 text-white" : "bg-hv-50 text-hv-700")}>
                    {ROLE_ICONS[acc.role]}
                  </div>
                  <p className="text-sm font-bold text-gray-900">{acc.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{acc.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Credential form */}
          <div className="p-7 sm:p-9 bg-gradient-to-b from-white to-hv-50/50 flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-hv-800 text-white flex items-center justify-center">
                {ROLE_ICONS[selected]}
              </div>
              <div>
                <p className="font-bold text-gray-900">{account.label}</p>
                <p className="text-xs text-gray-500">{selected === "citizen" ? "No account needed — fully anonymous" : account.name}</p>
              </div>
            </div>

            {selected === "citizen" ? (
              <div className="mt-6 flex-1 flex flex-col">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Citizens never create an account. Complaints are anonymous by design and can be
                  submitted through this portal, by dialling <b>*384#</b> (USSD) or by texting the
                  short code <b>4646</b>.
                </p>
                <Btn size="lg" className="w-full mt-6" onClick={submit as unknown as React.MouseEventHandler}>
                  Continue anonymously <ArrowRight size={16} />
                </Btn>
              </div>
            ) : forgot ? (
              <div className="mt-6 flex-1">
                <p className="text-sm text-gray-600">
                  Enter your registered email and we will send a secure reset link. For survivor
                  accounts, reset links can also be delivered via your advocate for safety.
                </p>
                <div className="mt-4 space-y-3">
                  <Field label="Email address"><Input placeholder="you@example.mw" /></Field>
                  <Btn className="w-full" onClick={() => { setForgot(false); hv.showToast("Password reset link sent (simulated)"); }}>
                    Send reset link
                  </Btn>
                  <button onClick={() => setForgot(false)} className="text-xs text-gray-400 hover:text-gray-600 w-full text-center">
                    Back to sign in
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-4 flex-1 flex flex-col">
                <Field label="Email address">
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={account.email} autoComplete="off" />
                </Field>
                <Field label="Password">
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" autoComplete="off" />
                </Field>
                {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
                <div className="pt-1">
                  <Btn type="submit" size="lg" className="w-full">
                    Sign in as {account.label} <ArrowRight size={16} />
                  </Btn>
                </div>
                <button type="button" onClick={() => setForgot(true)} className="text-xs text-hv-600 hover:text-hv-800 font-medium text-center">
                  Forgot password?
                </button>
                <div className="mt-auto pt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                  <KeyRound size={11} /> Demo credentials pre-filled — just press sign in
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      <p className="text-center text-[11px] text-gray-400 pb-6 flex items-center justify-center gap-1.5">
        <ShieldCheck size={12} /> Role-based access control · Sessions expire on browser close · Demo environment
      </p>
    </div>
  );
}
