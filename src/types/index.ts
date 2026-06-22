export type ProjectStatus = 'pending' | 'draft' | 'lineart' | 'coloring' | 'revision' | 'delivered' | 'cancelled';

export type QuoteType = 'avatar' | 'cover' | 'commercial' | 'illustration' | 'other';

export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'paid';

export type LicenseType = 'personal' | 'commercial' | 'exclusive' | 'custom';

export type TransactionType = 'income' | 'expense';

export interface Client {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  wechat?: string;
  socialMedia?: string;
  preferredStyle: string;
  budgetRange: string;
  tags: string[];
  notes: string;
  totalProjects: number;
  totalRevenue: number;
  createdAt: string;
}

export interface QuoteItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Quote {
  id: string;
  clientId: string;
  clientName: string;
  type: QuoteType;
  typeLabel: string;
  title: string;
  items: QuoteItem[];
  totalAmount: number;
  deposit: number;
  finalPayment: number;
  depositRatio: number;
  licenseType: LicenseType;
  licenseDesc: string;
  revisionTimes: number;
  deliveryDays: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: string;
  expiresAt: string;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  deadline: string;
  completedAt?: string;
  description: string;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  quoteId?: string;
  title: string;
  description: string;
  type: QuoteType;
  typeLabel: string;
  status: ProjectStatus;
  statusLabel: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  depositReceived: boolean;
  finalPaymentReceived: boolean;
  milestones: ProjectMilestone[];
  currentMilestone: number;
  revisionCount: number;
  maxRevisions: number;
  startDate: string;
  deadline: string;
  createdAt: string;
}

export interface MaterialFile {
  id: string;
  projectId: string;
  projectTitle: string;
  type: 'reference' | 'work' | 'delivery';
  typeLabel: string;
  name: string;
  url: string;
  version: string;
  revisionMark?: string;
  description: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  projectId?: string;
  projectTitle?: string;
  clientId?: string;
  clientName?: string;
  category: string;
  description: string;
  date: string;
}

export interface FinanceStats {
  monthlyIncome: number;
  monthlyExpense: number;
  pendingReceivable: number;
  totalClients: number;
  totalProjects: number;
  monthlyData: { month: string; income: number; expense: number }[];
}
