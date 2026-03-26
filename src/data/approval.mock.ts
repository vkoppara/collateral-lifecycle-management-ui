export type ApprovalStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'

export type ApprovalStage =
  | 'Documentation'
  | 'Valuation'
  | 'Legal'
  | 'Final Approval'

export type RiskLevel = 'Low' | 'Medium' | 'High'

export type ApprovalCase = {
  id: string
  customerName: string
  collateralType: string
  collateralValue: number
  loanAmount: number
  status: ApprovalStatus
  stage: ApprovalStage
  riskLevel: RiskLevel
  createdAt: string
}

export const approvalCases: ApprovalCase[] = [
  {
    id: 'APR-1001',
    customerName: 'Apex Metals Pvt Ltd',
    collateralType: 'Property',
    collateralValue: 84500000,
    loanAmount: 51000000,
    status: 'Under Review',
    stage: 'Legal',
    riskLevel: 'Medium',
    createdAt: '2026-03-11T09:15:00.000Z',
  },
  {
    id: 'APR-1002',
    customerName: 'Nova Logistics',
    collateralType: 'Vehicle',
    collateralValue: 19200000,
    loanAmount: 12400000,
    status: 'Submitted',
    stage: 'Documentation',
    riskLevel: 'Low',
    createdAt: '2026-03-12T10:40:00.000Z',
  },
  {
    id: 'APR-1003',
    customerName: 'Bluewave Exports',
    collateralType: 'Property',
    collateralValue: 127000000,
    loanAmount: 88000000,
    status: 'Under Review',
    stage: 'Valuation',
    riskLevel: 'High',
    createdAt: '2026-03-10T08:05:00.000Z',
  },
  {
    id: 'APR-1004',
    customerName: 'Sunrise Agro Foods',
    collateralType: 'Insurance',
    collateralValue: 22500000,
    loanAmount: 10800000,
    status: 'Approved',
    stage: 'Final Approval',
    riskLevel: 'Low',
    createdAt: '2026-03-07T11:20:00.000Z',
  },
  {
    id: 'APR-1005',
    customerName: 'Prime Infra Projects',
    collateralType: 'Plant/Machinery',
    collateralValue: 56400000,
    loanAmount: 37600000,
    status: 'Rejected',
    stage: 'Legal',
    riskLevel: 'High',
    createdAt: '2026-03-09T13:55:00.000Z',
  },
  {
    id: 'APR-1006',
    customerName: 'Vertex Retail Group',
    collateralType: 'Securities',
    collateralValue: 31100000,
    loanAmount: 19800000,
    status: 'Under Review',
    stage: 'Documentation',
    riskLevel: 'Medium',
    createdAt: '2026-03-13T07:45:00.000Z',
  },
  {
    id: 'APR-1007',
    customerName: 'Zenith Textiles',
    collateralType: 'Property',
    collateralValue: 93400000,
    loanAmount: 52100000,
    status: 'Approved',
    stage: 'Final Approval',
    riskLevel: 'Low',
    createdAt: '2026-03-06T14:10:00.000Z',
  },
  {
    id: 'APR-1008',
    customerName: 'Orbit Healthcare',
    collateralType: 'Vehicle',
    collateralValue: 17800000,
    loanAmount: 13900000,
    status: 'Under Review',
    stage: 'Valuation',
    riskLevel: 'Medium',
    createdAt: '2026-03-14T09:30:00.000Z',
  },
  {
    id: 'APR-1009',
    customerName: 'Clearline Electronics',
    collateralType: 'Plant/Machinery',
    collateralValue: 47800000,
    loanAmount: 34000000,
    status: 'Submitted',
    stage: 'Documentation',
    riskLevel: 'Medium',
    createdAt: '2026-03-15T12:25:00.000Z',
  },
  {
    id: 'APR-1010',
    customerName: 'Harbor Marine Services',
    collateralType: 'Insurance',
    collateralValue: 28600000,
    loanAmount: 12100000,
    status: 'Rejected',
    stage: 'Final Approval',
    riskLevel: 'High',
    createdAt: '2026-03-08T15:50:00.000Z',
  },
]
