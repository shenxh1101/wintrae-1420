import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { formatMoney } from '@/utils';
import styles from './index.module.scss';

interface FinanceStatCardProps {
  title: string;
  value: number;
  type?: 'income' | 'expense' | 'amount' | 'count';
  icon?: string;
  trend?: number;
}

const FinanceStatCard: React.FC<FinanceStatCardProps> = ({
  title,
  value,
  type = 'amount',
  icon = '💰',
  trend
}) => {
  const getTypeClass = () => {
    switch (type) {
      case 'income': return styles.typeIncome;
      case 'expense': return styles.typeExpense;
      case 'amount': return styles.typeAmount;
      case 'count': return styles.typeCount;
      default: return styles.typeAmount;
    }
  };

  const formatValue = () => {
    if (type === 'count') {
      return value.toString();
    }
    return formatMoney(value);
  };

  return (
    <View className={classnames(styles.statCard, getTypeClass())}>
      <View className={styles.cardHeader}>
        <Text className={styles.cardIcon}>{icon}</Text>
        {trend !== undefined && (
          <View className={classnames(styles.trend, trend >= 0 ? styles.trendUp : styles.trendDown)}>
            <Text className={styles.trendText}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text className={styles.cardTitle}>{title}</Text>
      <Text className={styles.cardValue}>{formatValue()}</Text>
    </View>
  );
};

export default FinanceStatCard;
