import { z } from 'zod';

/**
 * PHASE 2 SEAM — see decisions/0007-phase-boundaries.md
 *
 * Phase 1 ships a mailto: link, so nothing validates against this yet. It is
 * defined now so the shape of a contact message is settled before there are two
 * places (client form and server endpoint) that have to agree on it.
 *
 * Phase 2: `POST /api/contact` parses its body with `contactMessageSchema`, and the
 * client form derives its field names and error messages from the same source.
 *
 * Uses the standalone `zod` package rather than the one re-exported from
 * `astro:content` — this schema must be importable by a plain Node server process
 * that has no Astro runtime.
 */
export const contactMessageSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  subject: z.string().trim().max(150).optional(),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be under 5000 characters'),

  /** Honeypot. Bots fill it, humans never see it; a non-empty value is a silent drop. */
  website: z.string().max(0).optional(),
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;

/** Shape persisted in Phase 2. Kept alongside the input schema so the DB migration
 *  and the endpoint can't drift apart. */
export type StoredContactMessage = ContactMessage & {
  id: string;
  createdAt: Date;
  ipHash: string | null;
  userAgent: string | null;
  read: boolean;
};
