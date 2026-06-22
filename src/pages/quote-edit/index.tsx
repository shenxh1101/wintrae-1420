import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea, Button, Slider, Picker } from '@tarojs/components';
import { useRouter, Taro } from '@tarojs/taro';
import cn from 'classnames';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/useAppStore';
import { formatMoney, generateId, getQuoteTypeLabel, getLicenseLabel } from '@/utils';
import type { QuoteType, LicenseType, QuoteItem, Quote } from '@/types';
import styles from './index.module.scss';

const QUOTE_TYPES: QuoteType[] = ['avatar', 'cover', 'commercial', 'illustration', 'other'];
const LICENSE_TYPES: LicenseType[] = ['personal', 'commercial', 'exclusive', 'custom'];

const QuoteEditPage: React.FC = () => {
  const router = useRouter();
  const { id, clientId } = router.params;

  const clients = useAppStore((state) => state.clients);
  const getClientById = useAppStore((state) => state.getClientById);
  const getQuoteById = useAppStore((state) => state.getQuoteById);
  const addQuote = useAppStore((state) => state.addQuote);
  const updateQuote = useAppStore((state) => state.updateQuote);

  const isEdit = !!id;

  const existingQuote = useMemo(() => {
    if (!id) return null;
    return getQuoteById(id);
  }, [id, getQuoteById]);

  const [formClientId, setFormClientId] = useState<string>(clientId || existingQuote?.clientId || '');
  const [quoteType, setQuoteType] = useState<QuoteType>(existingQuote?.type || 'avatar');
  const [title, setTitle] = useState<string>(existingQuote?.title || '');
  const [items, setItems] = useState<QuoteItem[]>(
    existingQuote?.items?.length > 0
      ? existingQuote.items
      : [{ id: generateId(), name: '', description: '', price: 0 }]
  );
  const [depositRatio, setDepositRatio] = useState<number>(existingQuote?.depositRatio ?? 50);
  const [licenseType, setLicenseType] = useState<LicenseType>(existingQuote?.licenseType || 'personal');
  const [revisionTimes, setRevisionTimes] = useState<string>(String(existingQuote?.revisionTimes ?? 3));
  const [deliveryDays, setDeliveryDays] = useState<string>(String(existingQuote?.deliveryDays ?? 7));
  const [validDays, setValidDays] = useState<string>('30');

  const clientOptions = useMemo(() => {
    return clients.map((c) => c.name);
  }, [clients]);

  const selectedClient = useMemo(() => {
    if (formClientId) {
      return getClientById(formClientId);
    }
    return undefined;
  }, [formClientId, getClientById]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }, [items]);

  const deposit = useMemo(() => {
    return Math.round(totalAmount * depositRatio) / 100;
  }, [totalAmount, depositRatio]);

  const finalPayment = useMemo(() => {
    return totalAmount - deposit;
  }, [totalAmount, deposit]);

  const handleClientChange = (e) => {
    const index = e.detail.value;
    const client = clients[index];
    if (client) {
      setFormClientId(client.id);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { id: generateId(), name: '', description: '', price: 0 }]);
  };

  const handleRemoveItem = (itemId: string) => {
    if (items.length <= 1) {
      Taro.showToast({ title: '至少保留一个项目', icon: 'none' });
      return;
    }
    setItems(items.filter((item) => item.id !== itemId));
  };

  const handleItemChange = (itemId: string, field: keyof QuoteItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          if (field === 'price') {
            return { ...item, [field]: Number(value) || 0 };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSave = () => {
    if (!formClientId) {
      Taro.showToast({ title: '请选择客户', icon: 'none' });
      return;
    }
    if (!title.trim()) {
      Taro.showToast({ title: '请输入报价标题', icon: 'none' });
      return;
    }
    if (items.some((item) => !item.name.trim())) {
      Taro.showToast({ title: '请填写所有项目名称', icon: 'none' });
      return;
    }

    const client = getClientById(formClientId);
    if (!client) {
      Taro.showToast({ title: '客户信息异常', icon: 'none' });
      return;
    }

    const validItems = items.map((item) => ({
      ...item,
      price: Number(item.price) || 0
    }));

    const calculatedTotal = validItems.reduce((sum, item) => sum + item.price, 0);
    const calculatedDeposit = Math.round(calculatedTotal * depositRatio) / 100;

    const quoteData: Omit<Quote, 'id' | 'createdAt'> = {
      clientId: formClientId,
      clientName: client.name,
      type: quoteType,
      typeLabel: getQuoteTypeLabel(quoteType),
      title: title.trim(),
      items: validItems,
      totalAmount: calculatedTotal,
      deposit: calculatedDeposit,
      finalPayment: calculatedTotal - calculatedDeposit,
      depositRatio,
      licenseType,
      licenseDesc: getLicenseLabel(licenseType),
      revisionTimes: Number(revisionTimes) || 0,
      deliveryDays: Number(deliveryDays) || 0,
      status: 'draft',
      expiresAt: dayjs().add(Number(validDays) || 30, 'day').toISOString()
    };

    if (isEdit && id) {
      updateQuote(id, quoteData);
    } else {
      addQuote({
        ...quoteData,
        id: generateId(),
        createdAt: dayjs().toISOString()
      });
    }

    Taro.showToast({ title: isEdit ? '更新成功' : '创建成功', icon: 'success' });

    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.summaryCard}>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>项目总数</Text>
          <Text className={styles.summaryValue}>{items.length} 项</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>定金 ({depositRatio}%)</Text>
          <Text className={styles.summaryValue}>{formatMoney(deposit)}</Text>
        </View>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>尾款</Text>
          <Text className={styles.summaryValue}>{formatMoney(finalPayment)}</Text>
        </View>
        <View className={styles.summaryDivider} />
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>报价总额</Text>
          <Text className={styles.summaryTotal}>{formatMoney(totalAmount)}</Text>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>基本信息</Text>
        <View className={styles.card}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.formLabelRequired}>*</Text>
              客户
            </Text>
            {clientId ? (
              <View className={styles.formDisabled}>
                <Text>{selectedClient?.name || '未知客户'}</Text>
              </View>
            ) : (
              <Picker
                mode="selector"
                range={clientOptions}
                value={clients.findIndex((c) => c.id === formClientId)}
                onChange={handleClientChange}
              >
                <View className={styles.formInput}>
                  {selectedClient?.name || '请选择客户'}
                </View>
              </Picker>
            )}
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.formLabelRequired}>*</Text>
              报价类型
            </Text>
            <View className={styles.typeSelector}>
              {QUOTE_TYPES.map((type) => (
                <View
                  key={type}
                  className={cn(styles.typeButton, {
                    [styles.active]: quoteType === type
                  })}
                  onClick={() => setQuoteType(type)}
                >
                  <Text>{getQuoteTypeLabel(type)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.formLabelRequired}>*</Text>
              报价标题
            </Text>
            <Input
              className={styles.formInput}
              placeholder="请输入报价标题"
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
            />
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <View className={styles.itemsHeader}>
          <Text className={`${styles.sectionTitle} ${styles.sectionTitleNoMargin}`}>报价项目明细</Text>
          <View className={styles.addItemButton} onClick={handleAddItem}>
            <Text>+ 添加项目</Text>
          </View>
        </View>
        <View className={`${styles.card} ${styles.cardPlain}`}>
          {items.map((item, index) => (
            <View key={item.id} className={styles.itemCard}>
              <View className={styles.itemHeader}>
                <Text className={styles.itemIndex}>项目 {index + 1}</Text>
                <View
                  className={styles.removeItemButton}
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Text>×</Text>
                </View>
              </View>
              <View className={styles.itemInputRow}>
                <Text className={styles.itemInputLabel}>项目名称</Text>
                <Input
                  className={styles.itemInput}
                  placeholder="请输入项目名称"
                  value={item.name}
                  onInput={(e) => handleItemChange(item.id, 'name', e.detail.value)}
                />
              </View>
              <View className={styles.itemInputRow}>
                <Text className={styles.itemInputLabel}>项目描述</Text>
                <Textarea
                  className={styles.itemInput}
                  placeholder="请输入项目描述（可选）"
                  value={item.description}
                  onInput={(e) => handleItemChange(item.id, 'description', e.detail.value)}
                />
              </View>
              <View className={styles.itemInputRow}>
                <Text className={styles.itemInputLabel}>单价（元）</Text>
                <Input
                  className={styles.itemInput}
                  type="digit"
                  placeholder="请输入单价"
                  value={String(item.price)}
                  onInput={(e) => handleItemChange(item.id, 'price', e.detail.value)}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>金额与授权</Text>
        <View className={styles.card}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>定金比例</Text>
            <View className={styles.ratioRow}>
              <Slider
                className={styles.ratioSlider}
                min={0}
                max={100}
                step={5}
                value={depositRatio}
                activeColor="#8B5CF6"
                backgroundColor="#E5E7EB"
                blockColor="#8B5CF6"
                blockSize={24}
                onChange={(e) => setDepositRatio(e.detail.value)}
              />
              <Text className={styles.ratioValue}>{depositRatio}%</Text>
            </View>
            <View className={styles.ratioHintRow}>
              <Text className={styles.ratioHintText}>定金: {formatMoney(deposit)}</Text>
              <Text className={styles.ratioHintText}>尾款: {formatMoney(finalPayment)}</Text>
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>授权范围</Text>
            <View className={styles.licenseSelector}>
              {LICENSE_TYPES.map((type) => (
                <View
                  key={type}
                  className={cn(styles.licenseButton, {
                    [styles.active]: licenseType === type
                  })}
                  onClick={() => setLicenseType(type)}
                >
                  <Text>{getLicenseLabel(type)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>交付条款</Text>
        <View className={styles.card}>
          <View className={styles.rowInputGroup}>
            <View className={styles.rowInputItem}>
              <Text className={styles.formLabel}>修改次数</Text>
              <Input
                className={styles.formInput}
                type="number"
                placeholder="修改次数"
                value={revisionTimes}
                onInput={(e) => setRevisionTimes(e.detail.value)}
              />
            </View>
            <View className={styles.rowInputItem}>
              <Text className={styles.formLabel}>交付周期（天）</Text>
              <Input
                className={styles.formInput}
                type="number"
                placeholder="天数"
                value={deliveryDays}
                onInput={(e) => setDeliveryDays(e.detail.value)}
              />
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>有效期（天）</Text>
            <Input
              className={styles.formInput}
              type="number"
              placeholder="报价有效天数"
              value={validDays}
              onInput={(e) => setValidDays(e.detail.value)}
            />
          </View>
        </View>
      </View>

      <View className={styles.footerBar}>
        <Button className={styles.cancelButton} onClick={handleCancel}>
          <Text>取消</Text>
        </Button>
        <Button className={styles.saveButton} onClick={handleSave}>
          <Text>{isEdit ? '保存修改' : '创建报价'}</Text>
        </Button>
      </View>
    </View>
  );
};

export default QuoteEditPage;
