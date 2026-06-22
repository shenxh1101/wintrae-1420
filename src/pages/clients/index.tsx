import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import ClientCard from '@/components/ClientCard';
import SearchBar from '@/components/SearchBar';
import { formatMoney } from '@/utils';
import type { Client } from '@/types';
import styles from './index.module.scss';

const ClientsPage: React.FC = () => {
  const clients = useAppStore((state) => state.clients);
  const [searchKeyword, setSearchKeyword] = useState('');

  useDidShow(() => {
    console.log('[ClientsPage] 页面显示');
  });

  const filteredClients = useMemo(() => {
    if (!searchKeyword) return clients;
    const kw = searchKeyword.toLowerCase();
    return clients.filter((c: Client) =>
      c.name.toLowerCase().includes(kw) ||
      c.phone.includes(kw) ||
      c.tags.some(t => t.toLowerCase().includes(kw))
    );
  }, [clients, searchKeyword]);

  const totalRevenue = useMemo(() => {
    return clients.reduce((sum: number, c: Client) => sum + c.totalRevenue, 0);
  }, [clients]);

  const handleAddClient = () => {
    console.log('[ClientsPage] 新建客户');
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>客户管理</Text>
        <Text className={styles.pageSubtitle}>管理你的客户资源与偏好</Text>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{clients.length}</Text>
          <Text className={styles.statLabel}>客户总数</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{formatMoney(totalRevenue)}</Text>
          <Text className={styles.statLabel}>累计收入</Text>
        </View>
      </View>

      <SearchBar
        placeholder="搜索客户名称、电话、标签..."
        onSearch={(kw) => setSearchKeyword(kw)}
      />

      <ScrollView scrollY className={styles.clientsList}>
        {filteredClients.length > 0 ? (
          filteredClients.map((client: Client) => (
            <ClientCard key={client.id} client={client} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>👥</Text>
            <Text className={styles.emptyText}>暂无客户</Text>
          </View>
        )}
      </ScrollView>

      <Button className={styles.fabButton} onClick={handleAddClient}>
        <Text className={styles.fabIcon}>+</Text>
      </Button>
    </View>
  );
};

export default ClientsPage;
