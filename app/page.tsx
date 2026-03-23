'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import AlunosModule from '@/components/AlunosModule';
import FinanceiroModule from '@/components/FinanceiroModule';
import PlanosModule from '@/components/PlanosModule';
import TreinosModule from '@/components/TreinosModule';
import AvaliacaoModule from '@/components/AvaliacaoModule';
import AnamneseModule from '@/components/AnamneseModule';
import RelatoriosModule from '@/components/RelatoriosModule';
import ConfiguracoesModule from '@/components/ConfiguracoesModule';
import { motion, AnimatePresence } from 'motion/react';

export default function Page() {
  const [activeTab, setActiveTab] = useState('home');

  const getTitle = () => {
    switch (activeTab) {
      case 'home': return 'Painel de Controle';
      case 'alunos': return 'Gestão de Alunos';
      case 'financeiro': return 'Gestão Financeira';
      case 'planos': return 'Gestão de Planos';
      case 'treinos': return 'Gestão de Treinos';
      case 'anamnese': return 'Anamnese Nutricional';
      case 'avaliacao': return 'Avaliação Física';
      case 'relatorios': return 'Relatórios e Estatísticas';
      case 'configuracoes': return 'Configurações do Sistema';
      default: return 'Painel de Controle';
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-black">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title={getTitle()} />
        
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full"
            >
              {activeTab === 'home' && <Dashboard />}
              {activeTab === 'alunos' && <AlunosModule />}
              {activeTab === 'financeiro' && <FinanceiroModule />}
              {activeTab === 'planos' && <PlanosModule />}
              {activeTab === 'treinos' && <TreinosModule />}
              {activeTab === 'avaliacao' && <AvaliacaoModule />}
              {activeTab === 'anamnese' && <AnamneseModule />}
              {activeTab === 'relatorios' && <RelatoriosModule />}
              {activeTab === 'configuracoes' && <ConfiguracoesModule />}
              
              {/* Módulos ainda em desenvolvimento */}
              {[''].includes(activeTab) && (
                <div className="p-8 flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto border border-zinc-800">
                      <span className="text-4xl">🚧</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Módulo em Desenvolvimento</h3>
                    <p className="text-zinc-500 max-w-md mx-auto">
                      Estamos desenvolvendo as funcionalidades do sistema para esta nova interface web. 
                      Em breve o módulo de <span className="text-orange-500 font-bold">{getTitle()}</span> estará disponível.
                    </p>
                    <button 
                      onClick={() => setActiveTab('home')}
                      className="px-6 py-3 bg-orange-500 text-black font-bold rounded-2xl hover:bg-orange-600 transition-all active:scale-95"
                    >
                      Voltar ao Início
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
