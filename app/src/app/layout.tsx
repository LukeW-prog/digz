import type { Metadata } from 'next'
import Link from 'next/link'
import { Geist } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
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
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-text"
        >
          Skip to content
        </a>

        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Digs
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/safety" className="hover:underline">
                Staying safe
              </Link>
              <Link href="/host/new" className="btn-secondary !px-3 !py-1.5 !text-sm">
                List a room
              </Link>
            </nav>
          </div>
        </header>

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="mt-16 border-t border-border bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted">
            <p className="mb-3 max-w-2xl">
              Digs is a noticeboard. We do not inspect properties, we are not
              party to any agreement between a host and a student, and{' '}
              <strong className="text-text">we never ask you for money</strong>.
              Anyone asking you to pay Digs is not us.
            </p>
            <nav className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/safety" className="hover:underline">
                Staying safe
              </Link>
              <Link href="/what-digs-is" className="hover:underline">
                What digs is
              </Link>
              <Link href="/report" className="hover:underline">
                Report a listing
              </Link>
              <Link href="/terms" className="hover:underline">
                Terms
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  )
}
