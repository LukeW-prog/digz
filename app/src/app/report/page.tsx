import type { Metadata } from 'next'
import { ReportForm } from './report-form'

export const metadata: Metadata = {
  title: 'Report a listing',
  description: 'Tell us about a listing that is a scam, discriminatory, unsafe or gone.',
}

export default async function ReportPage(props: PageProps<'/report'>) {
  const params = await props.searchParams
  const listingId = typeof params.listing === 'string' ? params.listing : undefined

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Report a listing</h1>
      <p className="mt-3 text-soft">
        We read every report and act on them daily. If a report says someone is
        unsafe or that money has been taken, we take the listing down first and
        look into it afterwards.
      </p>

      <div className="panel mt-6 border-danger bg-danger-wash p-4">
        <h2 className="font-semibold">If you are in danger, call 999 or 112</h2>
        <p className="mt-1 text-sm">
          For fraud, contact An Garda Síochána directly as well as us. We cannot
          recover money and they may be able to.
        </p>
      </div>

      <div className="mt-8">
        <ReportForm listingId={listingId} />
      </div>

      <p className="mt-6 text-sm text-soft">
        We will tell you what we decided and why, if you leave an email address.
        If we take a listing down, the host is told why and can appeal.
      </p>
    </div>
  )
}
