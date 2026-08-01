import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { updateProject } from "@/lib/actions/projects";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Edit Project" };

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });
  if (!project) notFound();

  const boundUpdate = updateProject.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Edit Project</h2>
        <p className="text-slate-400 text-sm mt-1">{project.name}</p>
      </div>
      <ProjectForm action={boundUpdate} defaultValues={project} submitLabel="Save Changes" />
    </div>
  );
}
