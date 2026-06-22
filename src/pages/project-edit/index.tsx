import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Input, Textarea, Picker, Switch, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import dayjs from 'dayjs';
import { useAppStore } from '@/store/useAppStore';
import type { Project, ProjectMilestone, QuoteType, PaymentStatus } from '@/types';
import { formatDate, generateId, getQuoteTypeLabel, getStatusLabel } from '@/utils';
import styles from './index.module.scss';

const QUOTE_TYPES: QuoteType[] = ['avatar', 'cover', 'commercial', 'illustration', 'other'];
const MILESTONE_TEMPLATES = [
  { name: '草稿', description: '完成角色草稿，确定构图和姿势' },
  { name: '线稿', description: '精细线稿，确认后不可改构图' },
  { name: '上色', description: '平涂上色，确定配色方案' },
  { name: '修改', description: '根据反馈调整细节' },
  { name: '交付', description: '发送源文件，确认收尾款' }
];

const generateMilestones = (startDate: string): ProjectMilestone[] => {
  return MILESTONE_TEMPLATES.map((tpl, index) => ({
    id: generateId(),
    name: tpl.name,
    status: 'pending' as const,
    deadline: dayjs(startDate).add((index + 1) * 3, 'day').format('YYYY-MM-DD'),
    description: tpl.description,
    revisionCount: 0,
    attachedFileIds: []
  }));
};

const ProjectEditPage: React.FC = () => {
  const router = useRouter();
  const projectId = router.params.id as string | undefined;
  const initialClientId = router.params.clientId as string | undefined;
  const isEdit = !!projectId;

  const clients = useAppStore((state) => state.clients);
  const addProject = useAppStore((state) => state.addProject);
  const updateProject = useAppStore((state) => state.updateProject);
  const getProjectById = useAppStore((state) => state.getProjectById);
  const getClientById = useAppStore((state) => state.getClientById);

  const existingProject = useMemo(() => {
    return projectId ? getProjectById(projectId) : undefined;
  }, [projectId, getProjectById]);

  const [clientId, setClientId] = useState<string>(initialClientId || existingProject?.clientId || '');
  const [title, setTitle] = useState<string>(existingProject?.title || '');
  const [description, setDescription] = useState<string>(existingProject?.description || '');
  const [type, setType] = useState<QuoteType>(existingProject?.type || 'avatar');
  const [totalAmount, setTotalAmount] = useState<string>(existingProject?.totalAmount?.toString() || '');
  const [maxRevisions, setMaxRevisions] = useState<string>(existingProject?.maxRevisions?.toString() || '3');
  const [startDate, setStartDate] = useState<string>(
    existingProject?.startDate || dayjs().format('YYYY-MM-DD')
  );
  const [deadline, setDeadline] = useState<string>(
    existingProject?.deadline || dayjs().add(15, 'day').format('YYYY-MM-DD')
  );
  const [depositReceived, setDepositReceived] = useState<boolean>(existingProject?.depositReceived || false);
  const [finalPaymentReceived, setFinalPaymentReceived] = useState<boolean>(existingProject?.finalPaymentReceived || false);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(
    existingProject?.milestones || generateMilestones(dayjs().format('YYYY-MM-DD'))
  );

  useEffect(() => {
    if (!isEdit && startDate) {
      setMilestones(generateMilestones(startDate));
      setDeadline(dayjs(startDate).add(15, 'day').format('YYYY-MM-DD'));
    }
  }, [startDate, isEdit]);

  useDidShow(() => {
    console.log('[ProjectEditPage] 页面显示，模式:', isEdit ? '编辑' : '新建', '项目ID:', projectId);
  });

  const clientPickerOptions = useMemo(() => {
    return clients.map((c) => c.name);
  }, [clients]);

  const clientPickerIndex = useMemo(() => {
    const idx = clients.findIndex((c) => c.id === clientId);
    return idx >= 0 ? idx : 0;
  }, [clients, clientId]);

  const quoteTypeOptions = useMemo(() => {
    return QUOTE_TYPES.map((t) => getQuoteTypeLabel(t));
  }, []);

  const quoteTypeIndex = useMemo(() => {
    return QUOTE_TYPES.indexOf(type);
  }, [type]);

  const handleClientChange = (e) => {
    const idx = e.detail.value;
    if (clients[idx]) {
      setClientId(clients[idx].id);
    }
  };

  const handleTypeChange = (e) => {
    const idx = e.detail.value;
    setType(QUOTE_TYPES[idx]);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.detail.value);
  };

  const handleDeadlineChange = (e) => {
    setDeadline(e.detail.value);
  };

  const getPaymentStatus = (): PaymentStatus => {
    if (depositReceived && finalPaymentReceived) return 'paid';
    if (depositReceived) return 'deposit_paid';
    return 'unpaid';
  };

  const handleSubmit = () => {
    if (!clientId) {
      Taro.showToast({ title: '请选择客户', icon: 'none' });
      return;
    }
    if (!title.trim()) {
      Taro.showToast({ title: '请输入项目标题', icon: 'none' });
      return;
    }
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      Taro.showToast({ title: '请输入正确的项目金额', icon: 'none' });
      return;
    }

    const client = getClientById(clientId);
    if (!client) {
      Taro.showToast({ title: '客户不存在', icon: 'none' });
      return;
    }

    const paymentStatus = getPaymentStatus();

    if (isEdit && existingProject) {
      updateProject(projectId!, {
        clientId,
        clientName: client.name,
        clientAvatar: client.avatar,
        title: title.trim(),
        description: description.trim(),
        type,
        typeLabel: getQuoteTypeLabel(type),
        totalAmount: parseFloat(totalAmount),
        maxRevisions: parseInt(maxRevisions) || 3,
        startDate,
        deadline,
        depositReceived,
        finalPaymentReceived,
        paymentStatus,
        milestones
      });
      Taro.showToast({ title: '项目更新成功', icon: 'success' });
    } else {
      const newProject: Project = {
        id: generateId(),
        clientId,
        clientName: client.name,
        clientAvatar: client.avatar,
        title: title.trim(),
        description: description.trim(),
        type,
        typeLabel: getQuoteTypeLabel(type),
        status: 'pending',
        statusLabel: getStatusLabel('pending'),
        totalAmount: parseFloat(totalAmount),
        paymentStatus,
        depositReceived,
        finalPaymentReceived,
        milestones,
        currentMilestone: 0,
        revisionCount: 0,
        maxRevisions: parseInt(maxRevisions) || 3,
        startDate,
        deadline,
        createdAt: dayjs().format('YYYY-MM-DD')
      };
      addProject(newProject);
      Taro.showToast({ title: '项目创建成功', icon: 'success' });
    }

    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.formCard}>
        <Text className={styles.cardTitle}>基本信息</Text>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            客户<Text className={styles.required}>*</Text>
          </Text>
          {clients.length > 0 ? (
            <Picker
              mode="selector"
              range={clientPickerOptions}
              value={clientPickerIndex}
              onChange={handleClientChange}
            >
              <View className={styles.pickerBox}>
                <Text
                  className={`${styles.pickerText} ${!clientId ? styles.pickerPlaceholder : ''}`}
                >
                  {clientId ? getClientById(clientId)?.name : '请选择客户'}
                </Text>
                <Text className={styles.pickerArrow}>›</Text>
              </View>
            </Picker>
          ) : (
            <View className={styles.pickerBox}>
              <Text className={styles.pickerPlaceholder}>暂无客户，请先添加客户</Text>
            </View>
          )}
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            项目标题<Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={styles.formInput}
            placeholder="请输入项目标题"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>项目描述</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="请输入项目描述"
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            项目类型<Text className={styles.required}>*</Text>
          </Text>
          <Picker
            mode="selector"
            range={quoteTypeOptions}
            value={quoteTypeIndex}
            onChange={handleTypeChange}
          >
            <View className={styles.pickerBox}>
              <Text className={styles.pickerText}>{getQuoteTypeLabel(type)}</Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            项目总金额<Text className={styles.required}>*</Text>
          </Text>
          <Input
            className={styles.formInput}
            type="digit"
            placeholder="请输入项目总金额"
            value={totalAmount}
            onInput={(e) => setTotalAmount(e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>修改次数上限</Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder="默认3次"
            value={maxRevisions}
            onInput={(e) => setMaxRevisions(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.cardTitle}>时间安排</Text>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>开始日期</Text>
          <Picker mode="date" value={startDate} onChange={handleStartDateChange}>
            <View className={styles.pickerBox}>
              <Text className={styles.pickerText}>{formatDate(startDate)}</Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>截止日期</Text>
          <Picker mode="date" value={deadline} onChange={handleDeadlineChange}>
            <View className={styles.pickerBox}>
              <Text className={styles.pickerText}>{formatDate(deadline)}</Text>
              <Text className={styles.pickerArrow}>›</Text>
            </View>
          </Picker>
        </View>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.cardTitle}>付款状态</Text>

        <View className={styles.switchRow}>
          <Text className={styles.switchLabel}>定金已收</Text>
          <Switch
            checked={depositReceived}
            onChange={(e) => setDepositReceived(e.detail.value)}
            color="#8B5CF6"
          />
        </View>

        <View className={styles.switchRow}>
          <Text className={styles.switchLabel}>尾款已收</Text>
          <Switch
            checked={finalPaymentReceived}
            onChange={(e) => setFinalPaymentReceived(e.detail.value)}
            color="#8B5CF6"
          />
        </View>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.cardTitle}>里程碑预览</Text>
        <View className={styles.milestonesPreview}>
          {milestones.map((milestone, index) => (
            <View key={milestone.id} className={styles.milestoneItem}>
              <View className={styles.milestoneIndex}>{index + 1}</View>
              <View className={styles.milestoneInfo}>
                <Text className={styles.milestoneName}>{milestone.name}</Text>
                <Text className={styles.milestoneMeta}>
                  截止：{formatDate(milestone.deadline)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.submitBar}>
        <Button className={styles.cancelBtn} onClick={handleCancel}>
          取消
        </Button>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          {isEdit ? '保存修改' : '创建项目'}
        </Button>
      </View>
    </View>
  );
};

export default ProjectEditPage;
