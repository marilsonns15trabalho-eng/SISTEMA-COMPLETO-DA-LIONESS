'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  FileText,
  Activity,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

export default function RelatoriosModule() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    receitas: 0,
    despesas: 0,
    saldo: 0,
    inadimplentes: 0,
    totalAlunos: 0,
    alunosAtivos: 0,
    alunosInativos: 0,
    novosAlunos: 0,
    anamnesesPendentes: 0,
    avaliacoesPendentes: 0
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Buscar alunos
        const { data: alunos } = await supabase.from('alunos').select('*');
        const totalAlunos = alunos?.length || 0;
        const alunosAtivos = alunos?.filter(a => a.status === 'ativo').length || 0;
        const alunosInativos = totalAlunos - alunosAtivos;
        
        // Novos alunos no mês atual
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const novosAlunos = alunos?.filter(a => {
          const d = new Date(a.created_at);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length || 0;

        // Buscar pagamentos
        const { data: pagamentos } = await supabase.from('pagamentos').select('*');
        const pagamentosMes = pagamentos?.filter(p => {
          const d = new Date(p.data_pagamento);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }) || [];
        
        const receitas = pagamentosMes
          .filter(p => p.status === 'pago')
          .reduce((acc, curr) => acc + (curr.valor || 0), 0);
          
        const inadimplentes = pagamentos?.filter(p => p.status === 'vencido').length || 0;

        // Buscar despesas
        const { data: despesas } = await supabase.from('despesas').select('*');
        const despesasMes = despesas?.filter(d => {
          const date = new Date(d.data_despesa);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }) || [];
        
        const totalDespesas = despesasMes.reduce((acc, curr) => acc + (curr.valor || 0), 0);

        setMetrics({
          receitas,
          despesas: totalDespesas,
          saldo: receitas - totalDespesas,
          inadimplentes,
          totalAlunos,
          alunosAtivos,
          alunosInativos,
          novosAlunos,
          anamnesesPendentes: 0, // Implementar lógica real se necessário
          avaliacoesPendentes: 0 // Implementar lógica real se necessário
        });
      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-black min-h-screen text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios Mensais</h2>
          <p className="text-zinc-500">Acompanhe as métricas e o desempenho do seu estúdio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Financeiro */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Receitas do Mês</p>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(metrics.receitas)}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Despesas do Mês</p>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(metrics.despesas)}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Saldo Líquido</p>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(metrics.saldo)}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Total de Alunos</p>
              <h3 className="text-2xl font-bold text-white">{metrics.totalAlunos}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detalhes Alunos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="text-orange-500" />
            Métricas de Alunos
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-black rounded-2xl border border-zinc-800">
              <span className="text-zinc-400">Alunos Ativos</span>
              <span className="font-bold text-emerald-500">{metrics.alunosAtivos}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-black rounded-2xl border border-zinc-800">
              <span className="text-zinc-400">Alunos Inativos</span>
              <span className="font-bold text-red-500">{metrics.alunosInativos}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-black rounded-2xl border border-zinc-800">
              <span className="text-zinc-400">Novos Alunos (Mês)</span>
              <span className="font-bold text-blue-500">+{metrics.novosAlunos}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-black rounded-2xl border border-zinc-800">
              <span className="text-zinc-400">Inadimplentes</span>
              <span className="font-bold text-orange-500">{metrics.inadimplentes}</span>
            </div>
          </div>
        </div>

        {/* Documentações e Pendências */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="text-orange-500" />
            Documentações
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-black rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <FileText className="text-zinc-500" size={20} />
                <span className="text-zinc-400">Anamneses Pendentes</span>
              </div>
              <span className="font-bold text-white">{metrics.anamnesesPendentes}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-black rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <Activity className="text-zinc-500" size={20} />
                <span className="text-zinc-400">Avaliações Pendentes</span>
              </div>
              <span className="font-bold text-white">{metrics.avaliacoesPendentes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
