import type { Quote } from '@/types';

export const mockQuotes: Quote[] = [
  {
    id: 'q1',
    clientId: 'c1',
    clientName: '林小雨',
    type: 'avatar',
    typeLabel: '头像约稿',
    title: '生日头像约稿',
    items: [
      { id: 'qi1', name: '头像设计', description: '半身头像，含简单背景', price: 800 },
      { id: 'qi2', name: '上色', description: '平涂上色', price: 300 },
      { id: 'qi3', name: '修改次数', description: '含2次免费修改', price: 0 }
    ],
    totalAmount: 1100,
    deposit: 550,
    finalPayment: 550,
    depositRatio: 50,
    licenseType: 'personal',
    licenseDesc: '个人使用，可做头像、朋友圈展示，不可商用',
    revisionTimes: 2,
    deliveryDays: 7,
    status: 'accepted',
    createdAt: '2026-06-01',
    expiresAt: '2026-06-15'
  },
  {
    id: 'q2',
    clientId: 'c2',
    clientName: '星辰游戏公司',
    type: 'commercial',
    typeLabel: '商稿插画',
    title: '游戏角色立绘',
    items: [
      { id: 'qi4', name: '角色设计', description: '原创角色设计，三视图', price: 8000 },
      { id: 'qi5', name: '精细立绘', description: '厚涂风格，含背景', price: 6000 },
      { id: 'qi6', name: '商用授权', description: '游戏内使用授权', price: 5000 }
    ],
    totalAmount: 19000,
    deposit: 9500,
    finalPayment: 9500,
    depositRatio: 50,
    licenseType: 'commercial',
    licenseDesc: '游戏内商用授权，含宣传素材使用，期限2年',
    revisionTimes: 3,
    deliveryDays: 30,
    status: 'accepted',
    createdAt: '2026-05-10',
    expiresAt: '2026-06-10'
  },
  {
    id: 'q3',
    clientId: 'c4',
    clientName: '悦读出版社',
    type: 'cover',
    typeLabel: '封面设计',
    title: '小说封面设计',
    items: [
      { id: 'qi7', name: '封面设计', description: '书籍封面，含 spine 和封底', price: 3500 },
      { id: 'qi8', name: '内页插画', description: '2张内页黑白插画', price: 2000 }
    ],
    totalAmount: 5500,
    deposit: 2750,
    finalPayment: 2750,
    depositRatio: 50,
    licenseType: 'commercial',
    licenseDesc: '书籍出版使用，首印10000册',
    revisionTimes: 2,
    deliveryDays: 20,
    status: 'sent',
    createdAt: '2026-06-10',
    expiresAt: '2026-06-25'
  },
  {
    id: 'q4',
    clientId: 'c3',
    clientName: '张小明',
    type: 'avatar',
    typeLabel: '头像约稿',
    title: '情侣头像',
    items: [
      { id: 'qi9', name: '头像设计', description: 'Q版情侣头像2个', price: 600 }
    ],
    totalAmount: 600,
    deposit: 300,
    finalPayment: 300,
    depositRatio: 50,
    licenseType: 'personal',
    licenseDesc: '个人使用，情侣头像',
    revisionTimes: 1,
    deliveryDays: 5,
    status: 'draft',
    createdAt: '2026-06-15',
    expiresAt: '2026-06-30'
  },
  {
    id: 'q5',
    clientId: 'c6',
    clientName: '小红书博主-小美',
    type: 'illustration',
    typeLabel: '插画创作',
    title: '月度插画配图',
    items: [
      { id: 'qi10', name: '系列插画', description: '4张配图，用于小红书笔记', price: 2800 }
    ],
    totalAmount: 2800,
    deposit: 1400,
    finalPayment: 1400,
    depositRatio: 50,
    licenseType: 'commercial',
    licenseDesc: '社交媒体使用，需署名',
    revisionTimes: 2,
    deliveryDays: 15,
    status: 'sent',
    createdAt: '2026-06-12',
    expiresAt: '2026-06-27'
  },
  {
    id: 'q6',
    clientId: 'c8',
    clientName: '咖啡连锁品牌',
    type: 'commercial',
    typeLabel: '商稿插画',
    title: '品牌系列插画',
    items: [
      { id: 'qi11', name: '主视觉插画', description: '品牌主视觉1张', price: 8000 },
      { id: 'qi12', name: '系列插画', description: '4张系列场景插画', price: 12000 },
      { id: 'qi13', name: '独家授权', description: '1年独家使用权', price: 5000 }
    ],
    totalAmount: 25000,
    deposit: 12500,
    finalPayment: 12500,
    depositRatio: 50,
    licenseType: 'exclusive',
    licenseDesc: '独家授权1年，全渠道使用',
    revisionTimes: 3,
    deliveryDays: 45,
    status: 'accepted',
    createdAt: '2026-05-20',
    expiresAt: '2026-06-20'
  }
];
