'use client';

import React from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  UserPlus,
  CreditCard,
  Clock,
  BarChart3,
  Dumbbell
} from 'lucide-react';
import { motion } from 'motion/react';

const stats = [
  { label: 'Total de Alunos', value: '124', icon: Users, change: '+12%', trend: 'up' },
  { label: 'Receita Mensal', value: 'R$ 12.450', icon: DollarSign, change: '+8.4%', trend: 'up' },
  { label: 'Planos Ativos', value: '98', icon: TrendingUp, change: '+5%', trend: 'up' },
  { label: 'Aulas Hoje', value: '14', icon: Calendar, change: '-2', trend: 'down' },
];

const recentActivities = [
  { id: 1, user: 'Ana Paula', action: 'Pagamento realizado', time: 'Há 10 min', type: 'payment' },
  { id: 2, user: 'Carlos Eduardo', action: 'Novo aluno cadastrado', time: 'Há 45 min', type: 'new_user' },
  { id: 3, user: 'Juliana Lima', action: 'Treino atualizado', time: 'Há 2 horas', type: 'workout' },
  { id: 4, user: 'Ricardo Santos', action: 'Avaliação física concluída', time: 'Há 3 horas', type: 'evaluation' },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8 bg-black min-h-screen text-white">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-orange-500/50 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-zinc-800 rounded-2xl group-hover:bg-orange-500 transition-colors">
                <stat.icon size={24} className="text-orange-500 group-hover:text-black transition-colors" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.change}
                {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              </div>
            </div>
            <div>
              <p className="text-zinc-500 text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area (Placeholder) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold">Visão Geral de Receita</h3>
                <p className="text-zinc-500 text-sm">Acompanhamento dos últimos 6 meses</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-zinc-800 rounded-full text-xs font-semibold hover:bg-zinc-700 transition-colors">Mensal</button>
                <button className="px-4 py-2 bg-orange-500 text-black rounded-full text-xs font-semibold">Anual</button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center border-t border-zinc-800/50">
              <div className="text-center">
                <BarChart3 size={48} className="text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-600 font-mono text-sm uppercase tracking-widest">Gráfico de Evolução Financeira</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-black font-bold p-4 rounded-2xl transition-all active:scale-95">
              <UserPlus size={20} />
              <span>Novo Aluno</span>
            </button>
            <button className="flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold p-4 rounded-2xl transition-all active:scale-95">
              <CreditCard size={20} className="text-orange-500" />
              <span>Lançar Receita</span>
            </button>
            <button className="flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold p-4 rounded-2xl transition-all active:scale-95">
              <Dumbbell size={20} className="text-orange-500" />
              <span>Novo Treino</span>
            </button>
          </div>
        </div>

        {/* Sidebar Activities */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col h-full">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock size={20} className="text-orange-500" />
              Atividades Recentes
            </h3>
            <div className="space-y-6 flex-1">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-4 group cursor-pointer">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold group-hover:bg-orange-500 group-hover:text-black transition-colors">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${activity.type === 'payment' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                    </div>
                  </div>
                  <div className="flex-1 border-b border-zinc-800 pb-4 group-last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-white group-hover:text-orange-500 transition-colors">{activity.user}</p>
                      <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter">{activity.time}</span>
                    </div>
                    <p className="text-xs text-zinc-500">{activity.action}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
              Ver Todas as Atividades
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
