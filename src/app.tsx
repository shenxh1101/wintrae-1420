import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import './app.scss';
import { useAppStore } from '@/store/useAppStore';
import { mockClients } from '@/data/clients';
import { mockQuotes } from '@/data/quotes';
import { mockProjects } from '@/data/projects';
import { mockMaterials } from '@/data/materials';
import { mockTransactions } from '@/data/finance';

function App(props) {
  const setClients = useAppStore((state) => state.setClients);
  const setQuotes = useAppStore((state) => state.setQuotes);
  const setProjects = useAppStore((state) => state.setProjects);
  const setMaterials = useAppStore((state) => state.setMaterials);
  const setTransactions = useAppStore((state) => state.setTransactions);

  useEffect(() => {
    console.log('[App] 初始化 Mock 数据');
    setClients(mockClients);
    setQuotes(mockQuotes);
    setProjects(mockProjects);
    setMaterials(mockMaterials);
    setTransactions(mockTransactions);
  }, [setClients, setQuotes, setProjects, setMaterials, setTransactions]);

  useDidShow(() => {
    console.log('[App] 小程序显示');
  });

  useDidHide(() => {
    console.log('[App] 小程序隐藏');
  });

  return props.children;
}

export default App;
