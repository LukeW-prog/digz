'use client'

import { useActionState, useState } from 'react'
import { createListing, type ListingFormState } from './actions'
import { LISTING } from '@/lib/constants'
import {
  MEALS,
  MEALS_LABEL,
  ROOM_TYPE,
  ROOM_TYPE_LABEL,
  SCHEDULE,
  SCHEDULE_LABEL,
} from '@/lib/types'

const initialState: ListingFormState = {}

export function ListingForm() {
  const [state, formAction, pending] = useActionState(
    createListing,
    initialState,
  )
  const [description, setDescription] = useState('')

  const remaining = LISTING.descriptionMaxLength - description.length
  const err = (field: string) => state.errors?.[field]

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state.message && (
        <p role="alert" className="card border-danger bg-danger-tint p-4 text-danger">
          {state.message}
        </p>
      )}

      <Section
        title="Where is it?"
        hint="Only the town is shown publicly. Students never see your address until you choose to share it."
      >
        <Field
          label="Address"
          name="addressLine"
          hint="House name or number, and the street."
          error={err('addressLine')}
          autoComplete="street-address"
        />
        <Field
          label="Eircode"
          name="eircode"
          hint="For example W23 F6D8. We use it to work out walking time to campus."
          error={err('eircode')}
          autoComplete="postal-code"
          className="max-w-48"
        />
      </Section>

      <Section title="The room">
        <Choice
          label="Room type"
          name="roomType"
          options={ROOM_TYPE.map((v) => [v, ROOM_TYPE_LABEL[v]])}
          error={err('roomType')}
        />

        <div>
          <label className="field-label" htmlFor="pricePerWeek">
            Price per week
          </label>
          <p className="field-hint" id="pricePerWeek-hint">
            In euro, per week. Digs around Maynooth is usually 120 to 150.
          </p>
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-lg text-muted">
              €
            </span>
            <input
              id="pricePerWeek"
              name="pricePerWeek"
              type="number"
              inputMode="numeric"
              min={LISTING.minPricePerWeek}
              max={LISTING.maxPricePerWeek}
              required
              aria-describedby="pricePerWeek-hint"
              aria-invalid={!!err('pricePerWeek')}
              className="field-input max-w-32"
            />
            <span className="text-muted">a week</span>
          </div>
          {err('pricePerWeek') && (
            <p className="field-error" role="alert">
              {err('pricePerWeek')}
            </p>
          )}
        </div>

        <Check name="billsIncluded" label="Bills are included in that price" />
      </Section>

      <Section title="The arrangement">
        <Choice
          label="Which nights?"
          name="schedule"
          options={SCHEDULE.map((v) => [v, SCHEDULE_LABEL[v]])}
          error={err('schedule')}
        />
        <Choice
          label="Meals"
          name="meals"
          options={MEALS.map((v) => [v, MEALS_LABEL[v]])}
          error={err('meals')}
        />

        <fieldset>
          <legend className="field-label">Term dates</legend>
          <p className="field-hint">
            Leave blank if you are flexible.
          </p>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="field-hint block" htmlFor="termStart">
                From
              </label>
              <input
                id="termStart"
                name="termStart"
                type="date"
                className="field-input"
              />
            </div>
            <div>
              <label className="field-hint block" htmlFor="termEnd">
                Until
              </label>
              <input
                id="termEnd"
                name="termEnd"
                type="date"
                aria-invalid={!!err('termEnd')}
                className="field-input"
              />
              {err('termEnd') && (
                <p className="field-error" role="alert">
                  {err('termEnd')}
                </p>
              )}
            </div>
          </div>
        </fieldset>
      </Section>

      <Section
        title="House rules"
        hint="Rules about the house, not about who lives in it."
      >
        <Check name="smokingAllowed" label="Smoking is allowed" />
        <Check name="petsInHouse" label="There are pets in the house" />
        <Check name="quietHours" label="We keep quiet hours in the evening" />
      </Section>

      <Section title="Anything else?">
        <div>
          <label className="field-label" htmlFor="description">
            Describe the house{' '}
            <span className="font-normal text-muted">(optional)</span>
          </label>

          <div className="mb-2 rounded-lg border border-warning-border bg-warning-tint p-3 text-sm">
            <p className="font-medium">Describe the house, not the person.</p>
            <p className="mt-1 text-muted">
              It is against the law to publish an advert that states a
              preference on gender, nationality, race, religion, age, family
              status or housing assistance. The form will not accept it. This
              applies even where you may lawfully choose who lives in your own
              home.
            </p>
          </div>

          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={LISTING.descriptionMaxLength}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-describedby="description-count"
            aria-invalid={!!err('description')}
            className="field-input"
            placeholder="Quiet house, ten minutes' walk from the front gate. Own desk and fast broadband. Dinner Monday to Thursday."
          />

          <p
            id="description-count"
            className="mt-1 text-sm text-muted"
            aria-live="polite"
          >
            {remaining} characters left
          </p>

          {err('description') && (
            <p className="field-error" role="alert">
              {err('description')}
            </p>
          )}

          {state.blocklistHits && state.blocklistHits.length > 0 && (
            <div
              role="alert"
              className="mt-3 rounded-lg border border-danger bg-danger-tint p-4"
            >
              <p className="font-semibold text-danger">
                Please edit these {state.blocklistHits.length === 1 ? 'words' : 'phrases'} before posting
              </p>
              <ul className="mt-3 space-y-3">
                {state.blocklistHits.map((hit) => (
                  <li key={hit.phrase}>
                    <p className="font-medium">
                      &ldquo;{hit.phrase}&rdquo;
                    </p>
                    <p className="text-sm text-muted">{hit.message}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-muted">
                Your listing has not been posted. Edit the text above and try
                again.
              </p>
            </div>
          )}
        </div>
      </Section>

      <div className="flex items-center gap-4 border-t border-border pt-6">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Posting…' : 'Post the listing'}
        </button>
        <p className="text-sm text-muted">
          It goes live straight away. You can edit or remove it any time.
        </p>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ bits */

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

function Field({
  label,
  name,
  hint,
  error,
  className = '',
  ...rest
}: {
  label: string
  name: string
  hint?: string
  error?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      {hint && (
        <p className="field-hint" id={`${name}-hint`}>
          {hint}
        </p>
      )}
      <input
        id={name}
        name={name}
        required
        aria-describedby={hint ? `${name}-hint` : undefined}
        aria-invalid={!!error}
        className={`field-input ${className}`}
        {...rest}
      />
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function Choice({
  label,
  name,
  options,
  error,
}: {
  label: string
  name: string
  options: [string, string][]
  error?: string
}) {
  return (
    <div>
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        required
        defaultValue=""
        aria-invalid={!!error}
        className="field-input"
      >
        <option value="" disabled>
          Choose one
        </option>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function Check({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-center gap-3 text-base">
      <input
        type="checkbox"
        name={name}
        className="size-5 rounded border-border accent-brand"
      />
      {label}
    </label>
  )
}
