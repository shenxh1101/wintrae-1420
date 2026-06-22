import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { formatMoney, formatDate, getQuoteTypeLabel, getLicenseLabel } from '@/utils';
import type { Quote } from '@/types';
import styles from './index.module.scss';

const QuoteDetailPage: React.FC = () => {
  const router = useRouter();
  const quoteId = router.params.id as string;

  const getQuoteById = useAppStore((state) => state.getQuoteById);
  const updateQuote = useAppStore((state) => state.updateQuote);
  const setQuotes = useAppStore((state) => state.setQuotes);
  const quotes = useAppStore((state) => state.quotes);

  const quote = useMemo(() => getQuoteById(quoteId), [quoteId, getQuoteById]);

  useDidShow(() => {
    console.log('[QuoteDetailPage] 页面显示，报价ID:', quoteId);
  });

  const getStatusClass = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return styles.statusDraft;
      case 'sent': return styles.statusSent;
      case 'accepted': return styles.statusAccepted;
      case 'rejected': return styles.statusRejected;
      default: return styles.statusDraft;
    }
  };

  const getStatusText = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'sent': return '已发送';
      case 'accepted': return '已接受';
      case 'rejected': return '已拒绝';
      default: return '草稿';
    }
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleEdit = () => {
    if (!quote) return;
    Taro.navigateTo({
      url: `/pages/quote-edit/index?id=${quote.id}`
    });
  };

  const handleDelete = () => {
    if (!quote) return;
    Taro.showModal({
      title: '删除报价',
      content: '确定要删除该报价吗？此操作无法撤销。',
      confirmText: '删除',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          const updatedQuotes = quotes.filter((q) => q.id !== quote.id);
          setQuotes(updatedQuotes);
          Taro.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 1500,
            success: () => {
              setTimeout(() => {
                Taro.navigateBack();
              }, 1500);
            }
          });
        }
      }
    });
  };

  const handleSend = () => {
    if (!quote) return;
    updateQuote(quote.id, { status: 'sent' });
    Taro.showToast({
      title: '已发送给客户',
      icon: 'success'
    });
  };

  const handleAccept = () => {
    if (!quote) return;
    Taro.showModal({
      title: '确认接受',
      content: '确定将该报价标记为已接受吗？',
      success: (res) => {
        if (res.confirm) {
          updateQuote(quote.id, { status: 'accepted' });
          Taro.showToast({
            title: '已更新状态',
            icon: 'success'
          });
        }
      }
    });
  };

  const handleReject = () => {
    if (!quote) return;
    Taro.showModal({
      title: '确认拒绝',
      content: '确定将该报价标记为已拒绝吗？',
      success: (res) => {
        if (res.confirm) {
          updateQuote(quote.id, { status: 'rejected' });
          Taro.showToast({
            title: '已更新状态',
            icon: 'success'
          });
        }
      }
    });
  };

  if (!quote) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📄</Text>
          <Text className={styles.emptyTitle}>找不到该报价</Text>
          <Text className={styles.emptyDesc}>
            该报价可能已被删除或不存在，请返回列表查看。
          </Text>
          <Button className={styles.emptyBtn} onClick={handleBack}>
            返回列表
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <ScrollView scrollY style={{ height: '100%' }}>
        <View className={styles.headerSection}>
          <Text className={styles.quoteTitle}>{quote.title}</Text>
          <Text className={styles.quoteClient}>客户：{quote.clientName}</Text>
          <View className={styles.tagRow}>
            <View className={styles.typeTag}>
              <Text className={styles.tagText}>{getQuoteTypeLabel(quote.type)}</Text>
            </View>
            <View className={classnames(styles.statusBadge, getStatusClass(quote.status))}>
              <Text className={styles.statusText}>{getStatusText(quote.status)}</Text>
            </View>
          </View>
        </View>

        <View className={styles.amountCard}>
          <View className={styles.amountMain}>
            <Text className={styles.amountLabel}>报价总额</Text>
            <Text className={styles.amountValue}>{formatMoney(quote.totalAmount)}</Text>
          </View>
          <View className={styles.amountDivider}>
            <View className={styles.amountItem}>
              <Text className={styles.amountItemLabel}>定金（{quote.depositRatio}%）</Text>
              <Text className={styles.amountItemValue}>{formatMoney(quote.deposit)}</Text>
            </View>
            <View className={styles.amountItem}>
              <Text className={styles.amountItemLabel}>尾款</Text>
              <Text className={styles.amountItemValue}>{formatMoney(quote.finalPayment)}</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>报价明细</Text>
          <View className={styles.itemList}>
            {quote.items.map((item) => (
              <View key={item.id} className={styles.itemRow}>
                <View className={styles.itemInfo}>
                  <Text className={styles.itemName}>{item.name}</Text>
                  <Text className={styles.itemDesc}>{item.description}</Text>
                </View>
                <Text className={styles.itemPrice}>{formatMoney(item.price)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>条款信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>授权范围</Text>
            <View className={styles.licenseTag}>
              <Text className={styles.tagText}>{getLicenseLabel(quote.licenseType)}</Text>
            </View>
          </View>
          {quote.licenseDesc && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>授权说明</Text>
              <Text className={styles.infoValueMulti}>{quote.licenseDesc}</Text>
            </View>
          )}
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>修改次数</Text>
            <Text className={styles.infoValue}>{quote.revisionTimes} 次</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>交付周期</Text>
            <Text className={styles.infoValue}>{quote.deliveryDays} 天</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>创建时间</Text>
            <Text className={styles.infoValue}>{formatDate(quote.createdAt)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>有效期至</Text>
            <Text className={styles.infoValue}>{formatDate(quote.expiresAt)}</Text>
          </View>

          <View className={styles.statusActions}>
            {quote.status === 'draft' && (
              <Button
                className={classnames(styles.statusBtn, styles.statusBtnSent)}
                onClick={handleSend}
              >
                标记为已发送
              </Button>
            )}
            {quote.status === 'sent' && (
              <>
                <Button
                  className={classnames(styles.statusBtn, styles.statusBtnAccepted)}
                  onClick={handleAccept}
                >
                  标记为已接受
                </Button>
                <Button
                  className={classnames(styles.statusBtn, styles.statusBtnRejected)}
                  onClick={handleReject}
                >
                  标记为已拒绝
                </Button>
              </>
            )}
            {(quote.status === 'accepted' || quote.status === 'rejected') && (
              <Button
                className={classnames(styles.statusBtn, styles.statusBtnSent)}
                onClick={handleSend}
              >
                重新发送
              </Button>
            )}
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Button
          className={classnames(styles.bottomBtn, styles.btnDanger)}
          onClick={handleDelete}
        >
          删除
        </Button>
        <Button
          className={classnames(styles.bottomBtn, styles.btnSecondary)}
          onClick={handleEdit}
        >
          编辑
        </Button>
        <Button
          className={classnames(styles.bottomBtn, styles.btnPrimary)}
          onClick={handleSend}
        >
          发送给客户
        </Button>
      </View>
    </View>
  );
};

export default QuoteDetailPage;
