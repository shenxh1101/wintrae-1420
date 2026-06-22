import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import type { MaterialFile } from '@/types';
import { formatDateTime } from '@/utils';
import styles from './index.module.scss';

interface MaterialCardProps {
  material: MaterialFile;
  onClick?: () => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material, onClick }) => {
  const getTypeClass = () => {
    switch (material.type) {
      case 'reference': return styles.typeReference;
      case 'work': return styles.typeWork;
      case 'delivery': return styles.typeDelivery;
      default: return styles.typeReference;
    }
  };

  const handleClick = () => {
    console.log('[MaterialCard] 点击素材:', material.name);
    onClick?.();
  };

  return (
    <View className={styles.materialCard} onClick={handleClick}>
      <View className={styles.imageWrap}>
        <Image
          className={styles.materialImage}
          src={material.url}
          mode="aspectFill"
          onError={(e) => console.error('[MaterialCard] 图片加载失败:', e)}
        />
        <View className={classnames(styles.typeTag, getTypeClass())}>
          <Text className={styles.typeText}>{material.typeLabel}</Text>
        </View>
        {material.revisionMark && (
          <View className={styles.revisionTag}>
            <Text className={styles.revisionText}>{material.revisionMark}</Text>
          </View>
        )}
      </View>
      <View className={styles.infoSection}>
        <Text className={styles.materialName}>{material.name}</Text>
        <View className={styles.metaRow}>
          <Text className={styles.versionBadge}>{material.version}</Text>
          <Text className={styles.projectName}>{material.projectTitle}</Text>
        </View>
        <Text className={styles.dateText}>{formatDateTime(material.createdAt)}</Text>
      </View>
    </View>
  );
};

export default MaterialCard;
