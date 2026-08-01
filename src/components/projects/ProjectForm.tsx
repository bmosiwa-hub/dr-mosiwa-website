"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { PROJECT_CATEGORY_LABELS, PROJECT_STATUS_LABELS, PRIORITY_LABELS, COLOR_LABELS } from "@/lib/utils";

type Project = {
  name: string;
  shortName: string | null;
  description: string | null;
  category: string;
  clientName: string | null;
  organization: string | null;
  fundingAgency: string | null;
  country: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  priority: string;
  colorLabel: string | null;
  budget: number | null;
  notes: string | null;
};

type FormState = { error?: string } | null;
type FormAction = (prevState: FormState, formData: FormData) => Promise<FormState>;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

const inputClass =
  "w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors";
const selectClass =
  "w-full h-10 bg-slate-900 border border-slate-700 rounded-lg px-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors";
const textareaClass =
  "w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-300 mb-1.5">{children}</label>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <h3 className="text-white font-semibold text-sm">{title}</h3>
      {children}
    </div>
  );
}

interface Props {
  action: FormAction;
  defaultValues?: Partial<Project>;
  submitLabel?: string;
}

export function ProjectForm({ action, defaultValues, submitLabel = "Create Project" }: Props) {
  const d = defaultValues ?? {};
  const [state, formAction] = useActionState<FormState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-lg px-4 py-3">
          {state.error}
        </div>
      )}

      <Section title="Basic Information">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Label>Project Name *</Label>
            <input name="name" defaultValue={d.name ?? ""} required className={inputClass} placeholder="e.g. SRHR Policy Development" />
          </div>
          <div>
            <Label>Short Name</Label>
            <input name="shortName" defaultValue={d.shortName ?? ""} className={inputClass} placeholder="e.g. SRHR-POL" />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <textarea name="description" defaultValue={d.description ?? ""} rows={3} className={textareaClass} placeholder="Brief description…" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Category *</Label>
            <select name="category" defaultValue={d.category ?? "CONSULTANCY"} className={selectClass}>
              {Object.entries(PROJECT_CATEGORY_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Color Label</Label>
            <select name="colorLabel" defaultValue={d.colorLabel ?? ""} className={selectClass}>
              <option value="">None</option>
              {COLOR_LABELS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section title="Client & Organization">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Client</Label><input name="clientName" defaultValue={d.clientName ?? ""} className={inputClass} placeholder="Client name" /></div>
          <div><Label>Organization</Label><input name="organization" defaultValue={d.organization ?? ""} className={inputClass} placeholder="Organization" /></div>
          <div><Label>Funding Agency</Label><input name="fundingAgency" defaultValue={d.fundingAgency ?? ""} className={inputClass} placeholder="e.g. WHO, USAID" /></div>
          <div><Label>Country</Label><input name="country" defaultValue={d.country ?? ""} className={inputClass} placeholder="Country / Region" /></div>
        </div>
      </Section>

      <Section title="Timeline & Status">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Start Date</Label><input type="date" name="startDate" defaultValue={d.startDate ? new Date(d.startDate).toISOString().split("T")[0] : ""} className={inputClass} /></div>
          <div><Label>End Date</Label><input type="date" name="endDate" defaultValue={d.endDate ? new Date(d.endDate).toISOString().split("T")[0] : ""} className={inputClass} /></div>
          <div>
            <Label>Status *</Label>
            <select name="status" defaultValue={d.status ?? "NOT_STARTED"} className={selectClass}>
              {Object.entries(PROJECT_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <Label>Priority *</Label>
            <select name="priority" defaultValue={d.priority ?? "MEDIUM"} className={selectClass}>
              {Object.entries(PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
        <div><Label>Budget (USD)</Label><input type="number" name="budget" defaultValue={d.budget?.toString() ?? ""} className={inputClass} placeholder="Optional" step="0.01" /></div>
      </Section>

      <Section title="Notes">
        <textarea name="notes" defaultValue={d.notes ?? ""} rows={4} className={textareaClass} placeholder="Any additional notes…" />
      </Section>

      <div className="flex justify-end gap-3">
        <a href="/astelpo_26/projects" className="h-10 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-sm flex items-center transition-colors">Cancel</a>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
