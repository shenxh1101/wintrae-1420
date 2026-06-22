import React, { useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import { formatMoney, formatDate } from '@/utils';
import ProjectCard from '@/components/ProjectCard';
import styles from './index.module.scss';

const ClientDetailPage: React.FC = () => {
  const router = useRouter();
  const clientId = router.params.id as string;
  const getClientById = useAppStore((state) => state.getClientById);
  const getProjectsByClientId = useAppStore((state) => state.getProjectsByClientId);
  const getQuotesByClientId = useAppStore((state) => state.getQuotesByClientId);

  const client = useMemo(() => getClientById(clientId), [clientId, getClientById]);
  const projects = useMemo(() => getProjectsByClientId(clientId), [clientId, getProjectsByClientId]);
  const quotes = useMemo(() => getQuotesByClientId(clientId), [clientId, getQuotesByClientId]);

  useDidShow(() => {
    console.log('[ClientDetailPage] 页面显示，客户ID:', clientId);
  });

  if (!client) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>👤</Text>
          <Text className={styles.emptyText}>客户不存在</Text>
        </View>
      </View>
    );
  }

  const handleCall = () => {
    console.log('[ClientDetailPage] 拨打电话:', client.phone);
  };

  const handleMessage = () => {
    console.log('[ClientDetailPage] 发送消息');
  };

  const handleNewQuote = () => {
    console.log('[ClientDetailPage] 新建报价，客户ID:', clientId);
    Taro.navigateTo({
      url: `/pages/quote-edit/index?clientId=${clientId}`
    });
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.headerSection}>
        <Image
          className={styles.clientAvatar}
          src={client.avatar}
          mode="aspectFill"
          onError={(e) => console.error('[ClientDetailPage] 图片加载失败:', e)}
        />
        <Text className={styles.clientName}>{client.name}</Text>
        <View className={styles.clientTags}>
          {client.tags.map((tag, index) => (
            <Text key={index} className={styles.clientTag}>{tag}</Text>
          ))}
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{projects.length}</Text>
            <Text className={styles.statLabel}>合作项目</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{quotes.length}</Text>
            <Text className={styles.statLabel}>报价单数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatMoney(client.totalRevenue)}</Text>
            <Text className={styles.statLabel}>累计收入</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>联系方式</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>电话</Text>
          <Text className={styles.infoValue}>{client.phone}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>邮箱</Text>
          <Text className={styles.infoValue}>{client.email}</Text>
        </View>
        {client.wechat && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>微信</Text>
            <Text className={styles.infoValue}>{client.wechat}</Text>
          </View>
        )}
        {client.socialMedia && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>社交媒体</Text>
            <Text className={styles.infoValue}>{client.socialMedia}</Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>客户偏好</Text>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>偏好风格</Text>
          <Text className={styles.infoValue}>{client.preferredStyle}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>预算范围</Text>
          <Text className={styles.infoValue}>{client.budgetRange}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>备注</Text>
          <Text className={styles.infoValue}>{client.notes}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>添加时间</Text>
          <Text className={styles.infoValue}>{formatDate(client.createdAt)}</Text>
        </View>
      </View>

      {projects.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>关联项目</Text>
          {projects.slice(0, 3).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </View>
      )}

      <View className={styles.actionButtons}>
        <Button className={`${styles.actionBtn} ${styles.btnSecondary}`} onClick={handleCall}>
          拨打电话
        </Button>
        <Button className={`${styles.actionBtn} ${styles.btnPrimary}`} onClick={handleNewQuote}>
          新建报价
        </Button>
      </View>
    </View>
  );
};

export default ClientDetailPage;
