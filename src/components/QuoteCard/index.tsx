import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Quote } from '@/types';
import { formatMoney, formatDate, getLicenseLabel } from '@/utils';
import styles from './index.module.scss';

interface QuoteCardProps {
  quote: Quote;
  onClick?: () => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onClick }) => {
  const getStatusClass = () => {
    switch (quote.status) {
      case 'draft': return styles.statusDraft;
      case 'sent': return styles.statusSent;
      case 'accepted': return styles.statusAccepted;
      case 'rejected': return styles.statusRejected;
      default: return styles.statusDraft;
    }
  };

  const getStatusText = () => {
    switch (quote.status) {
      case 'draft': return '草稿';
      case 'sent': return '已发送';
      case 'accepted': return '已接受';
      case 'rejected': return '已拒绝';
      default: return '草稿';
    }
  };

  const handleClick = () => {
    console.log('[QuoteCard] 点击报价:', quote.title);
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/quote-detail/index?id=${quote.id}`
      });
    }
  };

  return (
    <View className={styles.quoteCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.headerLeft}>
          <View className={classnames(styles.typeIcon, `type-${quote.type}`)}>
            <Text className={styles.typeEmoji}>
              {quote.type === 'avatar' ? '👤' : quote.type === 'cover' ? '📖' : quote.type === 'commercial' ? '💼' : quote.type === 'illustration' ? '🎨' : '✨'}
            </Text>
          </View>
          <View className={styles.headerInfo}>
            <Text className={styles.quoteTitle}>{quote.title}</Text>
            <Text className={styles.clientName}>{quote.clientName} · {quote.typeLabel}</Text>
          </View>
        </View>
        <View className={classnames(styles.statusBadge, getStatusClass())}>
          <Text className={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <View className={styles.cardBody}>
        <View className={styles.priceSection}>
          <Text className={styles.priceLabel}>报价总额</Text>
          <Text className={styles.priceValue}>{formatMoney(quote.totalAmount)}</Text>
        </View>

        <View className={styles.detailsGrid}>
          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>定金</Text>
            <Text className={styles.detailValue}>{formatMoney(quote.deposit)}</Text>
          </View>
          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>尾款</Text>
            <Text className={styles.detailValue}>{formatMoney(quote.finalPayment)}</Text>
          </View>
          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>修改次数</Text>
            <Text className={styles.detailValue}>{quote.revisionTimes}次</Text>
          </View>
          <View className={styles.detailItem}>
            <Text className={styles.detailLabel}>交付周期</Text>
            <Text className={styles.detailValue}>{quote.deliveryDays}天</Text>
          </View>
        </View>

        <View className={styles.licenseSection}>
          <Text className={styles.licenseLabel}>授权范围</Text>
          <Text className={styles.licenseValue}>{getLicenseLabel(quote.licenseType)}</Text>
        </View>
      </View>

      <View className={styles.cardFooter}>
        <Text className={styles.dateText}>创建于 {formatDate(quote.createdAt)}</Text>
        <Text className={styles.expireText}>有效期至 {formatDate(quote.expiresAt)}</Text>
      </View>
    </View>
  );
};

export default QuoteCard;
