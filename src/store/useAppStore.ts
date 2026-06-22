import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { Client, Quote, Project, MaterialFile, Transaction, FinanceStats, ProjectMilestone } from '@/types';

const STORAGE_KEY = 'illustrator_app_data';

interface AppState {
  clients: Client[];
  quotes: Quote[];
  projects: Project[];
  materials: MaterialFile[];
  transactions: Transaction[];
  searchKeyword: string;
  isInitialized: boolean;

  initializeFromStorage: () => void;
  persistToStorage: () => void;

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
  addMaterial: (material: MaterialFile) => void;
  updateMaterial: (id: string, material: Partial<MaterialFile>) => void;
  addTransaction: (transaction: Transaction) => void;
  updateMilestone: (projectId: string, milestoneId: string, milestone: Partial<ProjectMilestone>) => void;
  attachMaterialToMilestone: (projectId: string, milestoneId: string, materialId: string) => void;

  getClientById: (id: string) => Client | undefined;
  getProjectById: (id: string) => Project | undefined;
  getQuoteById: (id: string) => Quote | undefined;
  getProjectsByClientId: (clientId: string) => Project[];
  getQuotesByClientId: (clientId: string) => Quote[];
  getMaterialsByProjectId: (projectId: string) => MaterialFile[];
  getFinanceStats: () => FinanceStats;
  searchAll: (keyword: string) => { clients: Client[]; projects: Project[]; quotes: Quote[] };
}

const doPersist = (state: Partial<AppState>) => {
  if (!state.isInitialized) return;
  try {
    const data = {
      clients: state.clients || [],
      quotes: state.quotes || [],
      projects: state.projects || [],
      materials: state.materials || [],
      transactions: state.transactions || []
    };
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('[Store] 持久化失败:', e);
  }
};

export const useAppStore = create<AppState>((set, get) => ({
  clients: [],
  quotes: [],
  projects: [],
  materials: [],
  transactions: [],
  searchKeyword: '',
  isInitialized: false,

  initializeFromStorage: () => {
    try {
      const stored = Taro.getStorageSync(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        set({
          clients: data.clients || [],
          quotes: data.quotes || [],
          projects: data.projects || [],
          materials: data.materials || [],
          transactions: data.transactions || [],
          isInitialized: true
        });
        console.log('[Store] 从本地存储加载数据成功');
      } else {
        set({ isInitialized: true });
        console.log('[Store] 无本地存储数据，使用空状态');
      }
    } catch (e) {
      console.error('[Store] 从本地存储加载失败:', e);
      set({ isInitialized: true });
    }
  },

  persistToStorage: () => {
    const s = get();
    doPersist(s);
  },

  setClients: (clients) => {
    const newState = { clients };
    set(newState);
    doPersist({ ...get(), ...newState });
  },
  setQuotes: (quotes) => {
    const newState = { quotes };
    set(newState);
    doPersist({ ...get(), ...newState });
  },
  setProjects: (projects) => {
    const newState = { projects };
    set(newState);
    doPersist({ ...get(), ...newState });
  },
  setMaterials: (materials) => {
    const newState = { materials };
    set(newState);
    doPersist({ ...get(), ...newState });
  },
  setTransactions: (transactions) => {
    const newState = { transactions };
    set(newState);
    doPersist({ ...get(), ...newState });
  },
  setSearchKeyword: (searchKeyword) => set({ searchKeyword }),

  addClient: (client) => {
    set((state) => ({ clients: [...state.clients, client] }));
    doPersist(get());
  },
  updateClient: (id, client) => {
    set((state) => ({
      clients: state.clients.map(c => c.id === id ? { ...c, ...client } : c)
    }));
    doPersist(get());
  },
  addProject: (project) => {
    set((state) => ({ projects: [...state.projects, project] }));
    doPersist(get());
  },
  updateProject: (id, project) => {
    set((state) => ({
      projects: state.projects.map(p => p.id === id ? { ...p, ...project } : p)
    }));
    doPersist(get());
  },
  addQuote: (quote) => {
    set((state) => ({ quotes: [...state.quotes, quote] }));
    doPersist(get());
  },
  updateQuote: (id, quote) => {
    set((state) => ({
      quotes: state.quotes.map(q => q.id === id ? { ...q, ...quote } : q)
    }));
    doPersist(get());
  },
  addMaterial: (material) => {
    set((state) => ({ materials: [...state.materials, material] }));
    doPersist(get());
  },
  updateMaterial: (id, material) => {
    set((state) => ({
      materials: state.materials.map(m => m.id === id ? { ...m, ...material } : m)
    }));
    doPersist(get());
  },
  addTransaction: (transaction) => {
    set((state) => ({ transactions: [...state.transactions, transaction] }));
    doPersist(get());
  },
  updateMilestone: (projectId, milestoneId, milestoneUpdate) => {
    set((state) => ({
      projects: state.projects.map(p => {
        if (p.id !== projectId) return p;
        const updatedMilestones = p.milestones.map(m =>
          m.id === milestoneId ? { ...m, ...milestoneUpdate } : m
        );
        const completedCount = updatedMilestones.filter(m => m.status === 'completed').length;
        const currentMilestone = Math.min(completedCount, updatedMilestones.length - 1);
        let newStatus = p.status;
        let newStatusLabel = p.statusLabel;
        if (completedCount === 0) { newStatus = 'pending'; newStatusLabel = '待开始'; }
        else if (completedCount === 1) { newStatus = 'draft'; newStatusLabel = '草稿阶段'; }
        else if (completedCount === 2) { newStatus = 'lineart'; newStatusLabel = '线稿阶段'; }
        else if (completedCount === 3) { newStatus = 'coloring'; newStatusLabel = '上色阶段'; }
        else if (completedCount === 4) { newStatus = 'revision'; newStatusLabel = '修改阶段'; }
        else if (completedCount >= 5) { newStatus = 'delivered'; newStatusLabel = '已交付'; }
        return {
          ...p,
          milestones: updatedMilestones,
          currentMilestone,
          status: newStatus,
          statusLabel: newStatusLabel
        };
      })
    }));
    doPersist(get());
  },
  attachMaterialToMilestone: (projectId, milestoneId, materialId) => {
    set((state) => ({
      projects: state.projects.map(p => {
        if (p.id !== projectId) return p;
        const updatedMilestones = p.milestones.map(m => {
          if (m.id !== milestoneId) return m;
          const existingIds = m.attachedFileIds || [];
          if (existingIds.includes(materialId)) return m;
          return {
            ...m,
            attachedFileIds: [...existingIds, materialId],
            revisionCount: (m.revisionCount || 0) + 1
          };
        });
        const totalRevisionCount = updatedMilestones.reduce((sum, m) => sum + (m.revisionCount || 0), 0);
        return {
          ...p,
          milestones: updatedMilestones,
          revisionCount: totalRevisionCount
        };
      })
    }));
    doPersist(get());
  },

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
      const monthStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
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
    const clients = state.clients.filter(c =>
      c.name.toLowerCase().includes(kw) || c.phone.includes(kw)
    );
    const projects = state.projects.filter(p =>
      p.title.toLowerCase().includes(kw) || p.clientName.toLowerCase().includes(kw)
    );
    const quotes = state.quotes.filter(q =>
      q.title.toLowerCase().includes(kw) || q.clientName.toLowerCase().includes(kw)
    );
    return { clients, projects, quotes };
  }
}));
