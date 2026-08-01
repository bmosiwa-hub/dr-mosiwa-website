import { ProjectForm } from "@/components/projects/ProjectForm";
import { createProject } from "@/lib/actions/projects";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Project" };

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">New Project</h2>
        <p className="text-slate-400 text-sm mt-1">Fill in the details to create a new project.</p>
      </div>
      <ProjectForm action={createProject} />
    </div>
  );
}
