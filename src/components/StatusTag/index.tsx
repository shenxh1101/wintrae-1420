import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatusTagProps {
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | string;
  text: string;
  size?: 'sm' | 'md';
}

const StatusTag: React.FC<StatusTagProps> = ({ status, text, size = 'md' }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'pending':
      case 'draft':
        return styles.tagPending;
      case 'in_progress':
      case 'lineart':
      case 'coloring':
      case 'revision':
        return styles.tagProgress;
      case 'completed':
      case 'delivered':
        return styles.tagDone;
      case 'cancelled':
        return styles.tagCancel;
      default:
        return styles.tagPending;
    }
  };

  return (
    <View className={classnames(styles.statusTag, getStatusClass(), size === 'sm' && styles.tagSm)}>
      <Text className={styles.tagText}>{text}</Text>
    </View>
  );
};

export default StatusTag;
