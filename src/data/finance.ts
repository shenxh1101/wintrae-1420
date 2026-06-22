import type { Transaction } from '@/types';

export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    type: 'income',
    amount: 550,
    projectId: 'p1',
    projectTitle: '生日头像约稿',
    clientId: 'c1',
    clientName: '林小雨',
    category: '定金',
    description: '头像约稿定金50%',
    date: '2026-06-01'
  },
  {
    id: 't2',
    type: 'income',
    amount: 9500,
    projectId: 'p2',
    projectTitle: '游戏角色立绘',
    clientId: 'c2',
    clientName: '星辰游戏公司',
    category: '定金',
    description: '游戏立绘定金50%',
    date: '2026-05-10'
  },
  {
    id: 't3',
    type: 'income',
    amount: 3500,
    projectId: 'p4',
    projectTitle: '全家福画像',
    clientId: 'c5',
    clientName: '王大伟',
    category: '全款',
    description: '全家福全款',
    date: '2026-05-12'
  },
  {
    id: 't4',
    type: 'income',
    amount: 3500,
    projectId: 'p5',
    projectTitle: '像素角色设计',
    clientId: 'c7',
    clientName: '独立开发者-老李',
    category: '全款',
    description: '像素角色设计全款',
    date: '2026-05-19'
  },
  {
    id: 't5',
    type: 'income',
    amount: 12500,
    projectId: 'p3',
    projectTitle: '品牌系列插画',
    clientId: 'c8',
    clientName: '咖啡连锁品牌',
    category: '定金',
    description: '品牌插画定金50%',
    date: '2026-06-10'
  },
  {
    id: 't6',
    type: 'expense',
    amount: 299,
    category: '软件订阅',
    description: 'Procreate 年费订阅',
    date: '2026-06-01'
  },
  {
    id: 't7',
    type: 'expense',
    amount: 59,
    category: '工具耗材',
    description: '笔刷素材包',
    date: '2026-06-05'
  },
  {
    id: 't8',
    type: 'expense',
    amount: 1500,
    category: '学习培训',
    description: '插画大师课程',
    date: '2026-05-15'
  },
  {
    id: 't9',
    type: 'income',
    amount: 1800,
    clientId: 'c6',
    clientName: '小红书博主-小美',
    category: '定金',
    description: '月度配图定金',
    date: '2026-06-12'
  },
  {
    id: 't10',
    type: 'expense',
    amount: 120,
    category: '云存储',
    description: '百度网盘超级会员月费',
    date: '2026-06-15'
  },
  {
    id: 't11',
    type: 'income',
    amount: 2000,
    clientId: 'c4',
    clientName: '悦读出版社',
    category: '旧项目尾款',
    description: '上月封面设计尾款',
    date: '2026-06-08'
  },
  {
    id: 't12',
    type: 'expense',
    amount: 380,
    category: '硬件设备',
    description: '数位笔替换笔尖',
    date: '2026-05-25'
  }
];
