"use client";

import { useState } from "react";

const ROOM_ESTIMATES: Record<string, { low: number; high: number }> = {
  "Maynooth": { low: 450, high: 900 },
};

export default function Home() {
  const [town, setTown] = useState("Maynooth");
  const [showEstimate, setShowEstimate] = useState(false);

  const estimate = ROOM_ESTIMATES[town];

  return (
    <div className="flex flex-1 items-center justify-center bg-amber-50 px-4 py-10">
      <main className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold leading-snug text-stone-900 sm:text-3xl">
            What could your spare room earn?
          </h1>
          <p className="mt-2 text-base text-stone-600">
            Free to check. No commitment, no listing yet.
          </p>

          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setShowEstimate(true);
            }}
          >
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-stone-700">
                Your town
              </span>
              <select
                className="min-h-12 rounded-xl border border-stone-300 bg-white px-4 text-base text-stone-900"
                value={town}
                onChange={(e) => {
                  setTown(e.target.value);
                  setShowEstimate(false);
                }}
              >
                <option value="Maynooth">Maynooth</option>
              </select>
            </label>

            <button
              type="submit"
              className="min-h-12 rounded-xl bg-emerald-700 px-4 text-base font-semibold text-white active:bg-emerald-800"
            >
              See my estimate
            </button>
          </form>

          {showEstimate && estimate && (
            <div className="mt-6 rounded-xl bg-emerald-50 p-5">
              <p className="text-sm font-medium text-emerald-800">
                Rooms in {town} are earning
              </p>
              <p className="mt-1 text-3xl font-bold text-emerald-900">
                €{estimate.low}–€{estimate.high}
                <span className="text-base font-medium text-emerald-800">
                  {" "}
                  / month
                </span>
              </p>
              <p className="mt-3 text-sm text-emerald-800">
                Up to €14,000 of that is tax-free under the Rent-a-Room
                scheme.
              </p>
              <button
                type="button"
                className="mt-4 min-h-12 w-full rounded-xl border-2 border-emerald-700 px-4 text-base font-semibold text-emerald-800 active:bg-emerald-100"
              >
                Tell me what hosting involves
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-stone-500">
          Sample prototype — figures shown are indicative, not live data.
        </p>
      </main>
    </div>
  );
}
