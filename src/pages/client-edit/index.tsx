import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Image, Input, Textarea, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classNames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { generateId } from '@/utils';
import type { Client } from '@/types';
import styles from './index.module.scss';

const ClientEditPage: React.FC = () => {
  const router = useRouter();
  const clientId = router.params.id as string | undefined;
  const isEditMode = !!clientId;

  const getClientById = useAppStore((state) => state.getClientById);
  const addClient = useAppStore((state) => state.addClient);
  const updateClient = useAppStore((state) => state.updateClient);

  const existingClient = useMemo(() => {
    if (isEditMode && clientId) {
      return getClientById(clientId);
    }
    return undefined;
  }, [isEditMode, clientId, getClientById]);

  const randomAvatar = useMemo(() => {
    const seed = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/${seed}/200/200`;
  }, []);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [wechat, setWechat] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [preferredStyle, setPreferredStyle] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [avatar, setAvatar] = useState(randomAvatar);

  useEffect(() => {
    if (existingClient) {
      setName(existingClient.name);
      setPhone(existingClient.phone);
      setEmail(existingClient.email);
      setWechat(existingClient.wechat || '');
      setSocialMedia(existingClient.socialMedia || '');
      setPreferredStyle(existingClient.preferredStyle);
      setBudgetRange(existingClient.budgetRange);
      setTagsInput(existingClient.tags.join(', '));
      setNotes(existingClient.notes);
      setAvatar(existingClient.avatar);
    }
  }, [existingClient]);

  useDidShow(() => {
    console.log('[ClientEditPage] 页面显示，模式:', isEditMode ? '编辑' : '新建', '客户ID:', clientId);
  });

  const refreshAvatar = () => {
    const seed = Math.floor(Math.random() * 1000);
    setAvatar(`https://picsum.photos/seed/${seed}/200/200`);
  };

  const parseTags = (input: string): string[] => {
    return input
      .split(/[,，]/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Taro.showToast({
        title: '请输入客户姓名',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    const tags = parseTags(tagsInput);

    if (isEditMode && clientId) {
      updateClient(clientId, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        wechat: wechat.trim() || undefined,
        socialMedia: socialMedia.trim() || undefined,
        preferredStyle: preferredStyle.trim(),
        budgetRange: budgetRange.trim(),
        tags,
        notes: notes.trim(),
        avatar
      });

      Taro.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500
      });
    } else {
      const newClient: Client = {
        id: generateId(),
        name: name.trim(),
        avatar,
        phone: phone.trim(),
        email: email.trim(),
        wechat: wechat.trim() || undefined,
        socialMedia: socialMedia.trim() || undefined,
        preferredStyle: preferredStyle.trim(),
        budgetRange: budgetRange.trim(),
        tags,
        notes: notes.trim(),
        totalProjects: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString()
      };

      addClient(newClient);

      Taro.showToast({
        title: '创建成功',
        icon: 'success',
        duration: 1500
      });
    }

    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.headerSection}>
        <View className={styles.avatarWrap} onClick={refreshAvatar}>
          <Image
            className={styles.avatar}
            src={avatar}
            mode="aspectFill"
          />
          <View className={styles.avatarHint}>
            <Text>🔄</Text>
          </View>
        </View>
        <Text className={styles.headerTitle}>{isEditMode ? '编辑客户' : '新建客户'}</Text>
        <Text className={styles.headerSubtitle}>点击头像可随机更换</Text>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>基本信息</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.formLabelRequired}>*</Text>
            姓名
          </Text>
          <Input
            className={styles.formInput}
            placeholder="请输入客户姓名"
            value={name}
            onInput={(e) => setName(e.detail.value)}
            maxlength={50}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>电话</Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder="请输入电话号码"
            value={phone}
            onInput={(e) => setPhone(e.detail.value)}
            maxlength={20}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>邮箱</Text>
          <Input
            className={styles.formInput}
            type="text"
            placeholder="请输入邮箱地址"
            value={email}
            onInput={(e) => setEmail(e.detail.value)}
            maxlength={100}
          />
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>社交账号</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>微信</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入微信号"
            value={wechat}
            onInput={(e) => setWechat(e.detail.value)}
            maxlength={50}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>社交媒体</Text>
          <Input
            className={styles.formInput}
            placeholder="微博/抖音/B站等"
            value={socialMedia}
            onInput={(e) => setSocialMedia(e.detail.value)}
            maxlength={100}
          />
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.cardTitle}>客户偏好</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>偏好风格</Text>
          <Input
            className={styles.formInput}
            placeholder="如：日系、Q版、写实等"
            value={preferredStyle}
            onInput={(e) => setPreferredStyle(e.detail.value)}
            maxlength={50}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>预算范围</Text>
          <Input
            className={styles.formInput}
            placeholder="如：500-1000元"
            value={budgetRange}
            onInput={(e) => setBudgetRange(e.detail.value)}
            maxlength={50}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            标签
            <Text className={styles.tagHint}>（逗号分隔）</Text>
          </Text>
          <Input
            className={styles.formInput}
            placeholder="如：老客户,优质,加急"
            value={tagsInput}
            onInput={(e) => setTagsInput(e.detail.value)}
            maxlength={200}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>备注</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="请输入备注信息"
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
            maxlength={500}
            autoHeight={false}
          />
        </View>
      </View>

      <View className={styles.saveButtonWrap}>
        <Button
          className={classNames(styles.saveButton)}
          onClick={handleSave}
        >
          保存
        </Button>
      </View>
    </View>
  );
};

export default ClientEditPage;
