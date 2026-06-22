import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import QuoteCard from '@/components/QuoteCard';
import SearchBar from '@/components/SearchBar';
import type { Quote } from '@/types';
import styles from './index.module.scss';

const QuotesPage: React.FC = () => {
  const quotes = useAppStore((state) => state.quotes);
  const [activeType, setActiveType] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');

  useDidShow(() => {
    console.log('[QuotesPage] 页面显示');
  });

  const types = useMemo(() => [
    { key: 'all', label: '全部', icon: '📋' },
    { key: 'avatar', label: '头像', icon: '👤' },
    { key: 'cover', label: '封面', icon: '📖' },
    { key: 'commercial', label: '商稿', icon: '💼' },
    { key: 'illustration', label: '插画', icon: '🎨' },
    { key: 'other', label: '其他', icon: '✨' }
  ], []);

  const statusFilters = useMemo(() => [
    { key: 'all', label: '全部' },
    { key: 'draft', label: '草稿' },
    { key: 'sent', label: '已发送' },
    { key: 'accepted', label: '已接受' },
    { key: 'rejected', label: '已拒绝' }
  ], []);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q: Quote) => {
      const typeMatch = activeType === 'all' || q.type === activeType;
      const statusMatch = activeStatus === 'all' || q.status === activeStatus;
      return typeMatch && statusMatch;
    });
  }, [quotes, activeType, activeStatus]);

  const handleAddQuote = () => {
    console.log('[QuotesPage] 新建报价');
    Taro.navigateTo({ url: '/pages/quote-edit/index' });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>报价管理</Text>
        <Text className={styles.pageSubtitle}>按类型快速生成专业报价</Text>
      </View>

      <ScrollView scrollX className={styles.typeSelector}>
        {types.map((type) => (
          <View
            key={type.key}
            className={classnames(styles.typeCard, activeType === type.key && styles.active)}
            onClick={() => setActiveType(type.key)}
          >
            <Text className={styles.typeIcon}>{type.icon}</Text>
            <Text className={styles.typeLabel}>{type.label}</Text>
          </View>
        ))}
      </ScrollView>

      <SearchBar placeholder="搜索报价名称或客户..." />

      <ScrollView scrollX className={styles.filterTabs}>
        {statusFilters.map((filter) => (
          <View
            key={filter.key}
            className={classnames(styles.filterTab, activeStatus === filter.key && styles.active)}
            onClick={() => setActiveStatus(filter.key)}
          >
            <Text>{filter.label}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY className={styles.quotesList}>
        {filteredQuotes.length > 0 ? (
          filteredQuotes.map((quote: Quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📄</Text>
            <Text className={styles.emptyText}>暂无报价单</Text>
          </View>
        )}
      </ScrollView>

      <Button className={styles.fabButton} onClick={handleAddQuote}>
        <Text className={styles.fabIcon}>+</Text>
      </Button>
    </View>
  );
};

export default QuotesPage;
