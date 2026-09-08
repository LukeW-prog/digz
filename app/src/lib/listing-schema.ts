import { z } from 'zod'
import { LISTING } from './constants'
import { MEALS, ROOM_TYPE, SCHEDULE } from './types'

/**
 * Validation for the host listing form.
 *
 * Note what is not here: no field describing the person the host wants. The
 * structured fields cover the house and the arrangement only. That is the
 * whole point — see safety.md, "what we deliberately do not build".
 */

/**
 * Eircode: a routing key (letter, two digits) then four characters.
 * Kept deliberately permissive on the second half, since Eircode excludes
 * some letters and we would rather let Google reject a typo than block a
 * valid address on a regex we got slightly wrong.
 */
const eircode = z
  .string()
  .trim()
  .regex(
    /^[A-Za-z]\d{2}\s?[A-Za-z0-9]{4}$/,
    'That does not look like an Eircode. Example: W23 F6D8',
  )

/**
 * An empty form field arrives as "", not as absent. Turn it into undefined
 * before validating, so optional really means optional and we store NULL
 * rather than an empty string.
 */
const blankToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value

const optionalDate = z.preprocess(
  blankToUndefined,
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the date picker')
    .optional(),
)

export const listingSchema = z
  .object({
    // Private. Never rendered publicly. See data-model.md.
    addressLine: z
      .string()
      .trim()
      .min(5, 'Add the house name or number and the street')
      .max(200),
    eircode,

    roomType: z.enum(ROOM_TYPE),
    pricePerWeek: z.coerce
      .number()
      .int('Whole euro only')
      .min(
        LISTING.minPricePerWeek,
        `That looks too low. Minimum is EUR ${LISTING.minPricePerWeek} a week.`,
      )
      .max(
        LISTING.maxPricePerWeek,
        `That looks too high for digs. Maximum is EUR ${LISTING.maxPricePerWeek} a week.`,
      ),
    billsIncluded: z.coerce.boolean().default(false),

    schedule: z.enum(SCHEDULE),
    meals: z.enum(MEALS).default('none'),
    termStart: optionalDate,
    termEnd: optionalDate,

    smokingAllowed: z.coerce.boolean().default(false),
    petsInHouse: z.coerce.boolean().default(false),
    quietHours: z.coerce.boolean().default(false),

    description: z.preprocess(
      blankToUndefined,
      z
        .string()
        .trim()
        .max(
          LISTING.descriptionMaxLength,
          `Keep it under ${LISTING.descriptionMaxLength} characters.`,
        )
        .optional(),
    ),
  })
  .refine(
    (v) => !v.termStart || !v.termEnd || v.termEnd > v.termStart,
    { message: 'The end date must be after the start date', path: ['termEnd'] },
  )

export type ListingInput = z.infer<typeof listingSchema>

/** Pull the form fields out of FormData in the shape the schema expects. */
export function listingFromFormData(formData: FormData) {
  const str = (name: string) => {
    const value = formData.get(name)
    return typeof value === 'string' ? value : ''
  }
  const bool = (name: string) => formData.get(name) === 'on'

  return {
    addressLine: str('addressLine'),
    eircode: str('eircode'),
    roomType: str('roomType'),
    pricePerWeek: str('pricePerWeek'),
    billsIncluded: bool('billsIncluded'),
    schedule: str('schedule'),
    meals: str('meals') || 'none',
    termStart: str('termStart'),
    termEnd: str('termEnd'),
    smokingAllowed: bool('smokingAllowed'),
    petsInHouse: bool('petsInHouse'),
    quietHours: bool('quietHours'),
    description: str('description'),
  }
}

/** Flatten zod issues to `{ fieldName: message }` for rendering next to inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    out[key] ??= issue.message
  }
  return out
}
