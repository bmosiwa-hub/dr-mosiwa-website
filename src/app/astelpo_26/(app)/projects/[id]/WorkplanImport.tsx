"use client";

import { useRef, useState, useTransition } from "react";
import { bulkCreateFromWorkplan } from "@/lib/actions/workplan";
import { Upload, X, CheckSquare, Square, FileText, Flag, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ExtractedTask = {
  title: string;
  description: string | null;
  priority: string;
  dueDate: string | null;
};
type ExtractedMilestone = {
  name: string;
  description: string | null;
  targetDate: string | null;
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-slate-400",
  MEDIUM: "text-blue-400",
  HIGH: "text-amber-400",
  CRITICAL: "text-red-400",
};

type Stage =
  | { type: "idle" }
  | { type: "extracting" }
  | { type: "review"; tasks: ExtractedTask[]; milestones: ExtractedMilestone[] }
  | { type: "importing" }
  | { type: "done"; taskCount: number; milestoneCount: number }
  | { type: "error"; message: string };

export function WorkplanImport({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>({ type: "idle" });
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [selectedMilestones, setSelectedMilestones] = useState<Set<number>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  function reset() {
    setStage({ type: "idle" });
    setSelectedTasks(new Set());
    setSelectedMilestones(new Set());
    if (fileRef.current) fileRef.current.value = "";
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStage({ type: "extracting" });

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(`/astelpo_26/api/extract-workplan`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setStage({ type: "error", message: data.error ?? "Extraction failed." });
        return;
      }

      const tasks: ExtractedTask[] = data.tasks ?? [];
      const milestones: ExtractedMilestone[] = data.milestones ?? [];

      if (tasks.length === 0 && milestones.length === 0) {
        setStage({ type: "error", message: "No tasks or milestones were found in the document." });
        return;
      }

      setSelectedTasks(new Set(tasks.map((_, i) => i)));
      setSelectedMilestones(new Set(milestones.map((_, i) => i)));
      setStage({ type: "review", tasks, milestones });
    } catch {
      setStage({ type: "error", message: "Network error. Please try again." });
    }
  }

  function toggleTask(i: number) {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function toggleMilestone(i: number) {
    setSelectedMilestones((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function handleImport() {
    if (stage.type !== "review") return;
    const { tasks, milestones } = stage;
    const chosenTasks = tasks.filter((_, i) => selectedTasks.has(i));
    const chosenMilestones = milestones.filter((_, i) => selectedMilestones.has(i));

    setStage({ type: "importing" });

    startTransition(async () => {
      try {
        await bulkCreateFromWorkplan(projectId, chosenTasks, chosenMilestones);
        setStage({ type: "done", taskCount: chosenTasks.length, milestoneCount: chosenMilestones.length });
      } catch {
        setStage({ type: "error", message: "Failed to save items. Please try again." });
      }
    });
  }

  const totalSelected =
    stage.type === "review" ? selectedTasks.size + selectedMilestones.size : 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-8 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium transition-colors"
      >
        <Upload className="w-3.5 h-3.5" />
        Import Workplan
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-white font-semibold">Import Workplan</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Upload a PDF, Word, or Excel workplan to extract tasks and milestones automatically
                </p>
              </div>
              <button onClick={close} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {stage.type === "idle" && (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-12 text-center cursor-pointer transition-colors group"
                >
                  <Upload className="w-10 h-10 mx-auto mb-3 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  <p className="text-white font-medium mb-1">Click to upload your workplan</p>
                  <p className="text-slate-500 text-sm">PDF, Word (.docx), or Excel (.xlsx) — max 10 MB</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFile}
                  />
                </div>
              )}

              {stage.type === "extracting" && (
                <div className="text-center py-16">
                  <Loader2 className="w-10 h-10 mx-auto mb-4 text-indigo-400 animate-spin" />
                  <p className="text-white font-medium">Extracting workplan…</p>
                  <p className="text-slate-400 text-sm mt-1">Claude is reading your document and identifying tasks and milestones</p>
                </div>
              )}

              {stage.type === "importing" && (
                <div className="text-center py-16">
                  <Loader2 className="w-10 h-10 mx-auto mb-4 text-indigo-400 animate-spin" />
                  <p className="text-white font-medium">Importing items…</p>
                </div>
              )}

              {stage.type === "done" && (
                <div className="text-center py-16">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-400" />
                  <p className="text-white font-semibold text-lg">Import complete</p>
                  <p className="text-slate-400 text-sm mt-2">
                    Created {stage.taskCount} task{stage.taskCount !== 1 ? "s" : ""}
                    {stage.milestoneCount > 0 && ` and ${stage.milestoneCount} milestone${stage.milestoneCount !== 1 ? "s" : ""}`}
                  </p>
                  <button
                    onClick={close}
                    className="mt-6 h-9 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}

              {stage.type === "error" && (
                <div className="text-center py-16">
                  <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-400" />
                  <p className="text-white font-medium">Extraction failed</p>
                  <p className="text-red-400 text-sm mt-1">{stage.message}</p>
                  <button
                    onClick={reset}
                    className="mt-6 h-9 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    Try again
                  </button>
                </div>
              )}

              {stage.type === "review" && (
                <div className="space-y-6">
                  <p className="text-slate-400 text-sm">
                    Found <span className="text-white font-medium">{stage.tasks.length} tasks</span> and{" "}
                    <span className="text-white font-medium">{stage.milestones.length} milestones</span>.
                    Uncheck anything you don't want to import.
                  </p>

                  {stage.tasks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-white font-medium text-sm">Tasks</h3>
                        <span className="text-xs text-slate-500">({selectedTasks.size} selected)</span>
                        <button
                          onClick={() =>
                            selectedTasks.size === stage.tasks.length
                              ? setSelectedTasks(new Set())
                              : setSelectedTasks(new Set(stage.tasks.map((_, i) => i)))
                          }
                          className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          {selectedTasks.size === stage.tasks.length ? "Deselect all" : "Select all"}
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {stage.tasks.map((task, i) => (
                          <button
                            key={i}
                            onClick={() => toggleTask(i)}
                            className={cn(
                              "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors",
                              selectedTasks.has(i)
                                ? "bg-slate-800 border-slate-700"
                                : "bg-slate-950 border-slate-800 opacity-50"
                            )}
                          >
                            {selectedTasks.has(i)
                              ? <CheckSquare className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                              : <Square className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                            }
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{task.title}</p>
                              {task.description && (
                                <p className="text-slate-500 text-xs mt-0.5 truncate">{task.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className={cn("text-xs font-medium", PRIORITY_COLORS[task.priority] ?? "text-slate-400")}>
                                {task.priority}
                              </span>
                              {task.dueDate && (
                                <span className="text-xs text-slate-500">{task.dueDate}</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {stage.milestones.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Flag className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-white font-medium text-sm">Milestones</h3>
                        <span className="text-xs text-slate-500">({selectedMilestones.size} selected)</span>
                        <button
                          onClick={() =>
                            selectedMilestones.size === stage.milestones.length
                              ? setSelectedMilestones(new Set())
                              : setSelectedMilestones(new Set(stage.milestones.map((_, i) => i)))
                          }
                          className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          {selectedMilestones.size === stage.milestones.length ? "Deselect all" : "Select all"}
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {stage.milestones.map((m, i) => (
                          <button
                            key={i}
                            onClick={() => toggleMilestone(i)}
                            className={cn(
                              "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors",
                              selectedMilestones.has(i)
                                ? "bg-slate-800 border-slate-700"
                                : "bg-slate-950 border-slate-800 opacity-50"
                            )}
                          >
                            {selectedMilestones.has(i)
                              ? <CheckSquare className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                              : <Square className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                            }
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{m.name}</p>
                              {m.description && (
                                <p className="text-slate-500 text-xs mt-0.5 truncate">{m.description}</p>
                              )}
                            </div>
                            {m.targetDate && (
                              <span className="text-xs text-slate-500 flex-shrink-0">{m.targetDate}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {stage.type === "review" && (
              <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  {totalSelected} item{totalSelected !== 1 ? "s" : ""} selected
                </p>
                <div className="flex gap-3">
                  <button onClick={reset} className="h-9 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors">
                    Start over
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={totalSelected === 0}
                    className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Import {totalSelected} item{totalSelected !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
