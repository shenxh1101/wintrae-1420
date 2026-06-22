import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Client } from '@/types';
import { formatMoney } from '@/utils';
import styles from './index.module.scss';

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  const handleClick = () => {
    console.log('[ClientCard] 点击客户:', client.name);
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/client-detail/index?id=${client.id}`
      });
    }
  };

  return (
    <View className={styles.clientCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <Image
          className={styles.avatar}
          src={client.avatar}
          mode="aspectFill"
          onError={(e) => console.error('[ClientCard] 图片加载失败:', e)}
        />
        <View className={styles.clientInfo}>
          <Text className={styles.clientName}>{client.name}</Text>
          <View className={styles.tags}>
            {client.tags.slice(0, 3).map((tag, index) => (
              <Text key={index} className={styles.tag}>{tag}</Text>
            ))}
          </View>
        </View>
        <View className={styles.stats}>
          <Text className={styles.statValue}>{client.totalProjects}</Text>
          <Text className={styles.statLabel}>合作</Text>
        </View>
      </View>
      <View className={styles.cardBody}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>偏好风格</Text>
          <Text className={styles.infoValue}>{client.preferredStyle}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>预算范围</Text>
          <Text className={styles.infoValue}>{client.budgetRange}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>累计收入</Text>
          <Text className={classnames(styles.infoValue, styles.revenue)}>
            {formatMoney(client.totalRevenue)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ClientCard;
