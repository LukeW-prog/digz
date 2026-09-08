import type { Metadata } from 'next'
import Link from 'next/link'
import { ViewTransition } from 'react'
import { Archivo, Fraunces } from 'next/font/google'
import './globals.css'

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
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-lg focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>

        {/*
          The header floats. It is sticky glass, so page content blurs as it
          passes underneath rather than sliding under an opaque bar.
        */}
        <header className="sticky top-0 z-40" style={{ viewTransitionName: 'site-header' }}>
          <div className="glass-solid border-b border-rule">
            <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-6 px-5 py-4 sm:px-8">
              <Link
                href="/"
                className="font-display text-2xl font-semibold tracking-tight transition-opacity duration-300 hover:opacity-70"
              >
                Digs
                <span className="text-accent">.</span>
              </Link>

              <nav className="flex items-baseline gap-6">
                <Link
                  href="/safety"
                  className="label transition-colors duration-300 hover:text-ink"
                >
                  Staying safe
                </Link>
                <Link
                  href="/host/new"
                  className="label text-accent transition-opacity duration-300 hover:opacity-70"
                >
                  List a room
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/*
          Crossfades the page on navigation. Without browser support the app
          works exactly as before, just without the animation.
        */}
        <ViewTransition name="page">
          <main id="main" className="flex-1">
            {children}
          </main>
        </ViewTransition>

        <footer className="mt-32 border-t border-rule">
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
                <Link
                  key={href}
                  href={href}
                  className="label transition-colors duration-300 hover:text-ink"
                >
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
