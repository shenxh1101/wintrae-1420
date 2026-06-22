import dayjs from 'dayjs';

export const formatDate = (date: string, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

export const formatMoney = (amount: number): string => {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待开始',
    draft: '草稿阶段',
    lineart: '线稿阶段',
    coloring: '上色阶段',
    revision: '修改阶段',
    delivered: '已交付',
    cancelled: '已取消'
  };
  return statusMap[status] || status;
};

export const getQuoteTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    avatar: '头像约稿',
    cover: '封面设计',
    commercial: '商稿插画',
    illustration: '插画创作',
    other: '其他类型'
  };
  return typeMap[type] || type;
};

export const getLicenseLabel = (type: string): string => {
  const licenseMap: Record<string, string> = {
    personal: '个人使用授权',
    commercial: '商用授权',
    exclusive: '独家授权',
    custom: '自定义授权'
  };
  return licenseMap[type] || type;
};

export const getDaysRemaining = (deadline: string): number => {
  const now = dayjs();
  const end = dayjs(deadline);
  return end.diff(now, 'day');
};

export const isOverdue = (deadline: string): boolean => {
  return getDaysRemaining(deadline) < 0;
};

export const calculateProgress = (milestones: { status: string }[]): number => {
  if (!milestones || milestones.length === 0) return 0;
  const completed = milestones.filter(m => m.status === 'completed').length;
  return Math.round((completed / milestones.length) * 100);
};
