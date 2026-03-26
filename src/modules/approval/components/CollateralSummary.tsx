import { Card } from '@/components/ui'

type CollateralSummaryProps = {
  collateralType?: string
  valueInr?: string
  owner?: string
  linkedLoanAccount?: string
  exposureAmount?: string
}

function CollateralSummary({
  collateralType = 'Property',
  valueInr = '₹8,45,00,000',
  owner = 'Apex Metals Pvt Ltd',
  linkedLoanAccount = 'LN-00928417',
  exposureAmount = '₹5,10,00,000',
}: CollateralSummaryProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col lg:flex-row">
        <div className="border-b border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-5 text-white lg:w-[34%] lg:border-b-0 lg:border-r">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
            Collateral Value
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{valueInr}</p>
          <p className="mt-2 text-sm text-slate-300">Exposure: {exposureAmount}</p>
        </div>

        <div className="grid flex-1 gap-3 px-6 py-5 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <p className="text-xs text-slate-500">Collateral Type</p>
            <p className="text-sm font-medium text-slate-900">{collateralType}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <p className="text-xs text-slate-500">Owner</p>
            <p className="text-sm font-medium text-slate-900">{owner}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 sm:col-span-2">
            <p className="text-xs text-slate-500">Linked Loan Account</p>
            <p className="text-sm font-medium text-slate-900">{linkedLoanAccount}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

export { CollateralSummary }
