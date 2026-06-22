import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import FinanceStatCard from '@/components/FinanceStatCard';
import SearchBar from '@/components/SearchBar';
import { formatMoney, formatDate } from '@/utils';
import type { Transaction } from '@/types';
import styles from './index.module.scss';

const FinancePage: React.FC = () => {
  const transactions = useAppStore((state) => state.transactions);
  const getFinanceStats = useAppStore((state) => state.getFinanceStats);

  const stats = useMemo(() => getFinanceStats(), [getFinanceStats]);

  useDidShow(() => {
    console.log('[FinancePage] 页面显示');
  });

  const maxAmount = useMemo(() => {
    if (!stats.monthlyData.length) return 1;
    return Math.max(...stats.monthlyData.map(d => Math.max(d.income, d.expense, 1)));
  }, [stats.monthlyData]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const getTransIcon = (type: string, category: string) => {
    if (type === 'income') {
      if (category.includes('定金')) return '💰';
      if (category.includes('尾款')) return '💵';
      return '📥';
    }
    if (category.includes('软件')) return '💻';
    if (category.includes('学习')) return '📚';
    if (category.includes('硬件')) return '🖱️';
    return '📤';
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>收支统计</Text>
        <Text className={styles.pageSubtitle}>一目了然的财务状况</Text>
      </View>

      <SearchBar placeholder="搜索交易记录..." />

      <View className={styles.statsGrid}>
        <FinanceStatCard
          title="本月收入"
          value={stats.monthlyIncome}
          type="income"
          icon="📈"
          trend={12}
        />
        <FinanceStatCard
          title="本月支出"
          value={stats.monthlyExpense}
          type="expense"
          icon="📉"
          trend={-5}
        />
        <FinanceStatCard
          title="待收款"
          value={stats.pendingReceivable}
          type="amount"
          icon="⏳"
        />
        <FinanceStatCard
          title="项目总数"
          value={stats.totalProjects}
          type="count"
          icon="📋"
        />
      </View>

      <View className={styles.chartCard}>
        <View className={styles.chartHeader}>
          <Text className={styles.chartTitle}>近6个月收支趋势</Text>
        </View>
        <View className={styles.chartBars}>
          {stats.monthlyData.map((item, index) => (
            <View key={index} className={styles.barGroup}>
              <View className={styles.barsContainer}>
                <View
                  className={classnames(styles.bar, styles.barIncome)}
                  style={{ height: `${(item.income / maxAmount) * 100}%` }}
                />
                <View
                  className={classnames(styles.bar, styles.barExpense)}
                  style={{ height: `${(item.expense / maxAmount) * 100}%` }}
                />
              </View>
              <Text className={styles.barLabel}>{item.month.slice(-2)}</Text>
            </View>
          ))}
        </View>
        <View className={styles.legend}>
          <View className={styles.legendItem}>
            <View className={classnames(styles.legendDot, styles.legendIncome)} />
            <Text className={styles.legendText}>收入</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={classnames(styles.legendDot, styles.legendExpense)} />
            <Text className={styles.legendText}>支出</Text>
          </View>
        </View>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>最近交易</Text>
        <Text className={styles.seeAllBtn}>查看全部</Text>
      </View>

      <ScrollView scrollY className={styles.transactionsList}>
        {recentTransactions.length > 0 ? (
          recentTransactions.map((trans: Transaction) => (
            <View key={trans.id} className={styles.transactionItem}>
              <View className={classnames(styles.transIcon, trans.type === 'income' ? styles.transIncome : styles.transExpense)}>
                <Text>{getTransIcon(trans.type, trans.category)}</Text>
              </View>
              <View className={styles.transInfo}>
                <Text className={styles.transTitle}>{trans.category}</Text>
                <Text className={styles.transDesc}>
                  {trans.clientName ? `${trans.clientName} · ` : ''}{trans.description}
                </Text>
              </View>
              <View className={styles.transAmount}>
                <Text className={classnames(styles.amountValue, trans.type === 'income' ? styles.income : styles.expense)}>
                  {trans.type === 'income' ? '+' : '-'}{formatMoney(trans.amount)}
                </Text>
                <Text className={styles.amountDate}>{formatDate(trans.date)}</Text>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>💳</Text>
            <Text className={styles.emptyText}>暂无交易记录</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default FinancePage;
