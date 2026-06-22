import React from 'react';
import { View, Text } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';

const ProjectDetailPage: React.FC = () => {
  useDidShow(() => {
    console.log('[ProjectDetailPage] 页面显示');
  });

  return (
    <View className={styles.pageContainer}>
      <View className={styles.placeholderContainer}>
        <Text className={styles.placeholderIcon}>📋</Text>
        <Text className={styles.placeholderTitle}>项目详情</Text>
        <Text className={styles.placeholderDesc}>
          项目详情功能正在开发中，敬请期待！
        </Text>
      </View>
    </View>
  );
};

export default ProjectDetailPage;
