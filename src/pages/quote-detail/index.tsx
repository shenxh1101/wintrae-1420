import React from 'react';
import { View, Text } from '@tarojs/components';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';

const QuoteDetailPage: React.FC = () => {
  useDidShow(() => {
    console.log('[QuoteDetailPage] 页面显示');
  });

  return (
    <View className={styles.pageContainer}>
      <View className={styles.placeholderContainer}>
        <Text className={styles.placeholderIcon}>📄</Text>
        <Text className={styles.placeholderTitle}>报价详情</Text>
        <Text className={styles.placeholderDesc}>
          报价详情功能正在开发中，敬请期待！
        </Text>
      </View>
    </View>
  );
};

export default QuoteDetailPage;
