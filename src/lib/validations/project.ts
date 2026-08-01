import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  shortName: z.string().max(20).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  category: z.enum([
    "CONSULTANCY",
    "RESEARCH",
    "PROPOSAL",
    "BUSINESS_DEVELOPMENT",
    "PERSONAL",
    "TRAINING",
    "OPERATIONS",
  ]),
  clientName: z.string().max(100).optional().or(z.literal("")),
  organization: z.string().max(100).optional().or(z.literal("")),
  fundingAgency: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  status: z.enum([
    "NOT_STARTED",
    "PLANNING",
    "ACTIVE",
    "ON_HOLD",
    "COMPLETED",
    "CANCELLED",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  colorLabel: z.string().optional().or(z.literal("")),
  budget: z.coerce.number().optional().nullable(),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

export type ProjectInput = z.infer<typeof projectSchema>;
