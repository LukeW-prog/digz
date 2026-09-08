import Link from 'next/link'
import type { SearchFilters } from '@/lib/listings'
import { ROOM_TYPE, ROOM_TYPE_LABEL } from '@/lib/types'

/**
 * Filters, as a plain GET form.
 *
 * No JavaScript required, and every search is a shareable URL. That also means
 * results work on a bad connection, which is in the quality bar in README.md.
 *
 * Note which filters do not exist here: nothing about who the student is.
 * See safety.md, "what we deliberately do not build".
 */
export function SearchFiltersForm({ filters }: { filters: SearchFilters }) {
  return (
    <form
      method="get"
      action="/"
      className="card h-fit p-4 lg:sticky lg:top-4"
      aria-label="Filter rooms"
    >
      <h2 className="font-semibold">Filters</h2>

      <div className="mt-4 space-y-4">
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
            className="size-5 rounded border-border accent-brand"
          />
          Meals included
        </label>

        <div>
          <label className="field-label" htmlFor="room">
            Room type
          </label>
          <select
            id="room"
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
          <label className="field-label" htmlFor="maxPrice">
            Most per week
          </label>
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-muted">
              €
            </span>
            <input
              id="maxPrice"
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
          <label className="field-label" htmlFor="maxWalk">
            Longest walk to campus
          </label>
          <select
            id="maxWalk"
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
          <label className="field-label" htmlFor="sort">
            Sort by
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={filters.sort}
            className="field-input"
          >
            <option value="walk">Closest to campus</option>
            <option value="price">Cheapest first</option>
            <option value="newest">Most recently posted</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button type="submit" className="btn-primary !py-2 !text-sm">
          Show rooms
        </button>
        <Link href="/" className="text-sm text-muted hover:underline">
          Clear
        </Link>
      </div>
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
        className="size-4 accent-brand"
      />
      {label}
    </label>
  )
}
