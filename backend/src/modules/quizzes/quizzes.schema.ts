import { z } from "zod";

export const submitQuizSchema = z
  .object({
    // Pour MCQ/TRUE_FALSE : un tableau d'identifiants de réponse (cuid).
    // Pour CODE_FILL : un tableau contenant une seule chaîne (le texte saisi).
    answers: z.record(z.string().cuid(), z.array(z.string().min(1).max(200))),
  })
  .strict();

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
