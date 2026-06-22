import { create } from 'zustand';
import type { Client, Quote, Project, MaterialFile, Transaction, FinanceStats } from '@/types';

interface AppState {
  clients: Client[];
  quotes: Quote[];
  projects: Project[];
  materials: MaterialFile[];
  transactions: Transaction[];
  searchKeyword: string;

  setClients: (clients: Client[]) => void;
  setQuotes: (quotes: Quote[]) => void;
  setProjects: (projects: Project[]) => void;
  setMaterials: (materials: MaterialFile[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setSearchKeyword: (keyword: string) => void;

  addClient: (client: Client) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  addQuote: (quote: Quote) => void;
  updateQuote: (id: string, quote: Partial<Quote>) => void;

  getClientById: (id: string) => Client | undefined;
  getProjectById: (id: string) => Project | undefined;
  getQuoteById: (id: string) => Quote | undefined;
  getProjectsByClientId: (clientId: string) => Project[];
  getQuotesByClientId: (clientId: string) => Quote[];
  getMaterialsByProjectId: (projectId: string) => MaterialFile[];
  getFinanceStats: () => FinanceStats;
  searchAll: (keyword: string) => { clients: Client[]; projects: Project[]; quotes: Quote[] };
}

export const useAppStore = create<AppState>((set, get) => ({
  clients: [],
  quotes: [],
  projects: [],
  materials: [],
  transactions: [],
  searchKeyword: '',

  setClients: (clients) => set({ clients }),
  setQuotes: (quotes) => set({ quotes }),
  setProjects: (projects) => set({ projects }),
  setMaterials: (materials) => set({ materials }),
  setTransactions: (transactions) => set({ transactions }),
  setSearchKeyword: (searchKeyword) => set({ searchKeyword }),

  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  updateClient: (id, client) => set((state) => ({
    clients: state.clients.map(c => c.id === id ? { ...c, ...client } : c)
  })),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, project) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...project } : p)
  })),
  addQuote: (quote) => set((state) => ({ quotes: [...state.quotes, quote] })),
  updateQuote: (id, quote) => set((state) => ({
    quotes: state.quotes.map(q => q.id === id ? { ...q, ...quote } : q)
  })),

  getClientById: (id) => get().clients.find(c => c.id === id),
  getProjectById: (id) => get().projects.find(p => p.id === id),
  getQuoteById: (id) => get().quotes.find(q => q.id === id),
  getProjectsByClientId: (clientId) => get().projects.filter(p => p.clientId === clientId),
  getQuotesByClientId: (clientId) => get().quotes.filter(q => q.clientId === clientId),
  getMaterialsByProjectId: (projectId) => get().materials.filter(m => m.projectId === projectId),

  getFinanceStats: () => {
    const state = get();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = state.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const pendingReceivable = state.projects
      .filter(p => p.status !== 'cancelled' && p.paymentStatus !== 'paid')
      .reduce((sum, p) => {
        const remaining = p.depositReceived
          ? (p.finalPaymentReceived ? 0 : p.totalAmount * 0.5)
          : p.totalAmount;
        return sum + remaining;
      }, 0);

    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthTrans = state.transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      });
      monthlyData.push({
        month: monthStr,
        income: monthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expense: monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      });
    }

    return {
      monthlyIncome,
      monthlyExpense,
      pendingReceivable,
      totalClients: state.clients.length,
      totalProjects: state.projects.length,
      monthlyData
    };
  },

  searchAll: (keyword) => {
    const state = get();
    const kw = keyword.toLowerCase();
    return {
      clients: state.clients.filter(c =>
        c.name.toLowerCase().includes(kw) || c.phone.includes(kw)
      ),
      projects: state.projects.filter(p =>
        p.title.toLowerCase().includes(kw) || p.clientName.toLowerCase().includes(kw)
      ),
      quotes: state.quotes.filter(q =>
        q.title.toLowerCase().includes(kw) || q.clientName.toLowerCase().includes(kw)
      )
    };
  }
}));
