import type { Metadata } from 'next'
import Link from 'next/link'
import { Archivo, Fraunces } from 'next/font/google'
import './globals.css'

/**
 * Fraunces for display: a variable serif with optical sizing and a genuine
 * amount of character. Archivo for everything functional.
 *
 * The pairing is the point. Contrast between a warm editorial serif and a
 * neutral grotesk is what stops a page reading as a template.
 */
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
  display: 'swap',
})

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Digs — rooms near Maynooth University',
    template: '%s · Digs',
  },
  description:
    'Find digs near Maynooth University. Monday to Friday or full week, meals, and walking time to campus in minutes.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en-IE"
      className={`${fraunces.variable} ${archivo.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-sm focus:bg-raised focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>

        <header className="border-b border-rule">
          <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-6 px-5 py-4 sm:px-8">
            <Link
              href="/"
              className="font-display text-2xl font-semibold tracking-tight"
            >
              Digs
              <span className="text-accent">.</span>
            </Link>

            <nav className="flex items-baseline gap-6">
              <Link
                href="/safety"
                className="label hover:text-ink hover:underline"
              >
                Staying safe
              </Link>
              <Link
                href="/host/new"
                className="label text-accent hover:underline"
              >
                List a room
              </Link>
            </nav>
          </div>
        </header>

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="mt-24 border-t border-rule">
          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
            <p className="max-w-2xl text-sm leading-relaxed text-soft">
              Digs is a noticeboard. We do not inspect properties, we are not
              party to any agreement between a host and a student, and{' '}
              <strong className="font-semibold text-ink">
                we never ask you for money
              </strong>
              . Anyone asking you to pay Digs is not us.
            </p>

            <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-rule pt-6">
              {[
                ['/safety', 'Staying safe'],
                ['/what-digs-is', 'What digs is'],
                ['/report', 'Report a listing'],
                ['/terms', 'Terms'],
                ['/privacy', 'Privacy'],
              ].map(([href, text]) => (
                <Link key={href} href={href} className="label hover:text-ink">
                  {text}
                </Link>
              ))}
            </nav>
          </div>
        </footer>
      </body>
    </html>
  )
}
