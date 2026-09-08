import Link from 'next/link'
import type { SearchFilters } from '@/lib/listings'
import { ROOM_TYPE, ROOM_TYPE_LABEL } from '@/lib/types'

/**
 * Filters, as a plain GET form.
 *
 * No JavaScript required, and every search is a shareable URL. That also means
 * results work on a bad connection, which is in the quality bar in README.md.
 *
 * Rendered twice: a collapsed disclosure on phones, an open surface on wide
 * screens. On a phone the surface filled the entire first screen, so you landed
 * on the site and saw controls instead of rooms. Two renders is the price of
 * fixing that without reaching for JavaScript, and only one is ever visible.
 *
 * Note which filters do not exist here: nothing about who the student is.
 * See safety.md, "what we deliberately do not build".
 */
export function SearchFiltersForm({
  filters,
  resultCount,
}: {
  filters: SearchFilters
  resultCount: number
}) {
  const active = countActive(filters)

  return (
    <>
      {/* Phones */}
      <details className="surface overflow-hidden p-0 lg:hidden">
        <summary className="cursor-pointer list-none px-4 py-3.5">
          <span className="label inline-flex w-full items-center justify-between gap-2 text-ink">
            <span>
              Filters
              {active > 0 && (
                <span className="ml-2 rounded-sm bg-accent px-1.5 py-0.5 text-on-accent">
                  {active}
                </span>
              )}
            </span>
            <span aria-hidden>
              {resultCount} {resultCount === 1 ? 'room' : 'rooms'}
            </span>
          </span>
        </summary>
        <div className="border-t border-rule p-4">
          <Fields filters={filters} idPrefix="m" />
        </div>
      </details>

      {/* Wide screens */}
      <form
        method="get"
        action="/"
        className="hidden h-fit lg:sticky lg:top-28 lg:block"
        aria-label="Filter rooms"
      >
        <h2 className="label border-b border-rule pb-4">Filters</h2>
        <div className="mt-5">
          <Fields filters={filters} idPrefix="d" inline />
        </div>
      </form>
    </>
  )
}

function countActive(f: SearchFilters): number {
  return [
    f.schedule,
    f.mealsIncluded || undefined,
    f.roomType,
    f.maxPricePerWeek,
    f.maxWalkMinutes,
  ].filter(Boolean).length
}

/**
 * The fields themselves. `inline` means the caller already provided the form
 * element, which the desktop surface does so the whole surface is the form.
 */
function Fields({
  filters,
  idPrefix,
  inline = false,
}: {
  filters: SearchFilters
  idPrefix: string
  inline?: boolean
}) {
  const id = (name: string) => `${idPrefix}-${name}`

  const body = (
    <>
      <div className="space-y-4">
        <fieldset>
          <legend className="field-label">Which nights</legend>
          <Radio
            name="schedule"
            value=""
            label="Any"
            checked={!filters.schedule}
          />
          <Radio
            name="schedule"
            value="mon_fri"
            label="Monday to Friday"
            checked={filters.schedule === 'mon_fri'}
          />
          <Radio
            name="schedule"
            value="full_week"
            label="Full week"
            checked={filters.schedule === 'full_week'}
          />
        </fieldset>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="meals"
            value="1"
            defaultChecked={filters.mealsIncluded}
            className="size-5 rounded border-rule accent-accent"
          />
          Meals included
        </label>

        <div>
          <label className="field-label" htmlFor={id('room')}>
            Room type
          </label>
          <select
            id={id('room')}
            name="room"
            defaultValue={filters.roomType ?? ''}
            className="field-input"
          >
            <option value="">Any</option>
            {ROOM_TYPE.map((value) => (
              <option key={value} value={value}>
                {ROOM_TYPE_LABEL[value]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor={id('maxPrice')}>
            Most per week
          </label>
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-soft">
              €
            </span>
            <input
              id={id('maxPrice')}
              name="maxPrice"
              type="number"
              inputMode="numeric"
              min={40}
              max={500}
              step={5}
              placeholder="Any"
              defaultValue={filters.maxPricePerWeek ?? ''}
              className="field-input"
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor={id('maxWalk')}>
            Longest walk to campus
          </label>
          <select
            id={id('maxWalk')}
            name="maxWalk"
            defaultValue={filters.maxWalkMinutes ?? ''}
            className="field-input"
          >
            <option value="">Any</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="20">20 minutes</option>
            <option value="30">30 minutes</option>
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor={id('sort')}>
            Sort by
          </label>
          <select
            id={id('sort')}
            name="sort"
            defaultValue={filters.sort}
            className="field-input"
          >
            <option value="walk">Quickest to campus</option>
            <option value="price">Cheapest first</option>
            <option value="newest">Most recently posted</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button type="submit" className="btn-primary !py-2 !text-sm">
          Show rooms
        </button>
        <Link href="/" className="text-sm text-soft hover:underline">
          Clear
        </Link>
      </div>
    </>
  )

  if (inline) return body

  return (
    <form method="get" action="/" aria-label="Filter rooms">
      {body}
    </form>
  )
}

function Radio({
  name,
  value,
  label,
  checked,
}: {
  name: string
  value: string
  label: string
  checked: boolean
}) {
  return (
    <label className="mt-1.5 flex items-center gap-3 text-sm">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={checked}
        className="size-4 accent-accent"
      />
      {label}
    </label>
  )
}
