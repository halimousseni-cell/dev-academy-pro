import { z } from "zod";

export const submitExamSchema = z
  .object({
    answers: z.record(z.string().cuid(), z.array(z.string().min(1).max(200))),
  })
  .strict();

export type SubmitExamInput = z.infer<typeof submitExamSchema>;
