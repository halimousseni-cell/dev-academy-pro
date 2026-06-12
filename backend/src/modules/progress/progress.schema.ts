import { z } from "zod";

export const updateLessonProgressSchema = z
  .object({
    lessonId: z.string().cuid(),
    status: z.enum(["IN_PROGRESS", "COMPLETED"]),
    timeSpentSeconds: z.number().int().min(0).max(24 * 60 * 60),
  })
  .strict();

export type UpdateLessonProgressInput = z.infer<typeof updateLessonProgressSchema>;
