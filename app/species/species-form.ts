// app/species/species-form.ts
import type { Database } from "@/lib/schema";
import { z } from "zod";

// Keep UI options in sync with your Supabase enum
export type Kingdom = Database["public"]["Enums"]["kingdom"];
export const kingdomOptions = [
  "Animalia",
  "Plantae",
  "Fungi",
  "Protista",
  "Archaea",
  "Bacteria",
] as const satisfies readonly Kingdom[];

// Zod enum for runtime validation (don’t use .options at render time)
export const kingdoms = z.enum(kingdomOptions);

// Zod schema the forms will use
export const speciesSchema = z.object({
  scientific_name: z.string().min(1, "Scientific name is required"),
  common_name: z.string().optional().nullable(),
  kingdom: kingdoms.optional(),
  // allow blank input; coerce numeric strings; keep >= 0
  total_population: z
    .union([z.coerce.number().int().nonnegative(), z.literal(""), z.null()])
    .transform((v) => (v === "" ? undefined : v))
    .optional()
    .nullable(),
  // allow empty string or a valid URL
  image: z
    .union([z.string().url("Must be a valid URL"), z.literal(""), z.null()])
    .transform((v) => (v === "" ? "" : v ?? "")) // normalize null → ""
    .optional(),
  description: z.string().optional().nullable(),
});

export type FormData = z.infer<typeof speciesSchema>;

export const defaultValues: FormData = {
  scientific_name: "",
  common_name: "",
  kingdom: undefined,
  total_population: undefined,
  image: "",
  description: "",
};
