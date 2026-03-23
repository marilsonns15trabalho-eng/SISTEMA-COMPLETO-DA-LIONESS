'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Activity, 
  Plus, 
  Loader2,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  User,
  Scale,
  Ruler
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Avaliacao {
  id: string;
  aluno_id: string;
  data: string;
  peso: number;
  altura: number;
  
  // Perímetros
  ombro?: number;
  torax?: number;
  braco_direito?: number;
  braco_esquerdo?: number;
  antebraco_direito?: number;
  antebraco_esquerdo?: number;
  cintura?: number;
  abdome?: number;
  quadril?: number;
  coxa_direita?: number;
  coxa_esquerda?: number;
  panturrilha_direita?: number;
  panturrilha_esquerda?: number;

  // Dobras Cutâneas
  tricipital?: number;
  subescapular?: number;
  peitoral?: number;
  axilar_media?: number;
  supra_iliaca?: number;
  abdominal?: number;
  coxa?: number;
  panturrilha?: number;

  // Dados de Saúde
  pressao_arterial_sistolica?: number;
  pressao_arterial_diastolica?: number;
  frequencia_cardiaca_repouso?: number;
  
  observacoes?: string;
  
  // Resultados (calculados)
  imc?: number;
  percentual_gordura?: number;
  massa_gorda?: number;
  massa_magra?: number;
  
  created_at: string;
  alunos?: { nome: string };
}

export default function AvaliacaoModule() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAvaliacao, setEditingAvaliacao] = useState<Avaliacao | null>(null);
  const [newAvaliacao, setNewAvaliacao] = useState<Partial<Avaliacao>>({
    aluno_id: '',
    data: new Date().toISOString().split('T')[0],
  });
  const [alunosList, setAlunosList] = useState<{id: string, nome: string}[]>([]);
  
  // Estados para o seletor de aluno no formulário
  const [alunoSearch, setAlunoSearch] = useState('');
  const [showAlunoDropdown, setShowAlunoDropdown] = useState(false);

  // Estados para filtros de visualização
  const [filterAluno, setFilterAluno] = useState('');
  const [filterDataInicio, setFilterDataInicio] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');

  useEffect(() => {
    const fetchAvaliacoes = async () => {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select(`
          *,
          alunos (
            nome
          )
        `)
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao buscar avaliações:', error);
      } else {
        setAvaliacoes(data || []);
      }
      setLoading(false);
    };

    const fetchAlunosList = async () => {
      const { data } = await supabase.from('alunos').select('id, nome').order('nome');
      setAlunosList(data || []);
    };

    fetchAvaliacoes();
    fetchAlunosList();
  }, []);

  // Cálculos automáticos
  useEffect(() => {
    setNewAvaliacao(prev => {
      const updates: Partial<Avaliacao> = {};
      
      // IMC
      if (prev.peso && prev.altura && prev.altura > 0) {
        const imc = prev.peso / (prev.altura * prev.altura);
        updates.imc = parseFloat(imc.toFixed(2));
      } else {
        updates.imc = undefined;
      }

      // Massa Gorda e Magra
      if (prev.peso && prev.percentual_gordura !== undefined && !isNaN(prev.percentual_gordura)) {
        const massaGorda = prev.peso * (prev.percentual_gordura / 100);
        const massaMagra = prev.peso - massaGorda;
        updates.massa_gorda = parseFloat(massaGorda.toFixed(2));
        updates.massa_magra = parseFloat(massaMagra.toFixed(2));
      } else {
        updates.massa_gorda = undefined;
        updates.massa_magra = undefined;
      }

      // Só atualiza se houver mudanças para evitar loop infinito
      if (
        updates.imc !== prev.imc || 
        updates.massa_gorda !== prev.massa_gorda || 
        updates.massa_magra !== prev.massa_magra
      ) {
        return { ...prev, ...updates };
      }
      
      return prev;
    });
  }, [newAvaliacao.peso, newAvaliacao.altura, newAvaliacao.percentual_gordura]);

  const handleEdit = (avaliacao: Avaliacao) => {
    setEditingAvaliacao(avaliacao);
    setNewAvaliacao(avaliacao);
    setAlunoSearch(avaliacao.alunos?.nome || '');
    setShowAddModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const mockUserId = '00000000-0000-0000-0000-000000000000';

    try {
      if (editingAvaliacao) {
        // Editar
        const { error } = await supabase
          .from('avaliacoes')
          .update({
            ...newAvaliacao,
            user_id: mockUserId
          })
          .eq('id', editingAvaliacao.id);
        if (error) throw error;
      } else {
        // Adicionar
        const { error } = await supabase
          .from('avaliacoes')
          .insert([{
            ...newAvaliacao,
            user_id: mockUserId
          }]);
        if (error) throw error;
      }
      
      setShowAddModal(false);
      setEditingAvaliacao(null);
      setNewAvaliacao({ aluno_id: '', data: new Date().toISOString().split('T')[0] });
      setAlunoSearch('');
      
      const { data } = await supabase.from('avaliacoes').select(`*, alunos(nome)`).order('data', { ascending: false });
      setAvaliacoes(data || []);
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
    }
  };

  // Filtros de visualização
  const filteredAvaliacoes = avaliacoes.filter(a => {
    const matchAluno = filterAluno ? (a.alunos?.nome || '').toLowerCase().includes(filterAluno.toLowerCase()) : true;
    const matchInicio = filterDataInicio ? new Date(a.data) >= new Date(filterDataInicio) : true;
    const matchFim = filterDataFim ? new Date(a.data) <= new Date(filterDataFim) : true;
    return matchAluno && matchInicio && matchFim;
  });

  // Filtro para o seletor de aluno no modal
  const filteredAlunosList = alunosList.filter(a => 
    (a.nome || '').toLowerCase().includes((alunoSearch || '').toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 bg-black min-h-screen text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Avaliação Física</h2>
          <p className="text-zinc-500">Acompanhe a evolução corporal e os resultados dos seus alunos.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-purple-500/20"
        >
          <Plus size={20} />
          Nova Avaliação
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-purple-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome do aluno..." 
            value={filterAluno}
            onChange={(e) => setFilterAluno(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <input type="date" value={filterDataInicio} onChange={(e) => setFilterDataInicio(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all [color-scheme:dark]" />
          <input type="date" value={filterDataFim} onChange={(e) => setFilterDataFim(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all [color-scheme:dark]" />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="text-purple-500 animate-spin" size={40} />
            <p className="text-zinc-500 font-medium">Carregando avaliações...</p>
          </div>
        ) : filteredAvaliacoes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Aluno</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Data</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Peso / Altura</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">BF (%)</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredAvaliacoes.map((avaliacao) => (
                  <tr key={avaliacao.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-purple-400 transition-colors">{avaliacao.alunos?.nome}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Calendar size={14} className="text-zinc-500" />
                        {new Date(avaliacao.data).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm text-zinc-300">
                        <div className="flex items-center gap-2">
                          <Scale size={14} className="text-zinc-500" />
                          {avaliacao.peso} kg
                        </div>
                        <div className="flex items-center gap-2">
                          <Ruler size={14} className="text-zinc-500" />
                          {avaliacao.altura} m
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                        <Activity size={12} />
                        {avaliacao.percentual_gordura ? `${avaliacao.percentual_gordura}%` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEdit(avaliacao)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-purple-500 hover:text-white rounded-xl text-xs font-bold transition-all mr-2"
                      >
                        Editar
                      </button>
                      <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
              <Activity className="text-zinc-600" size={32} />
            </div>
            <h3 className="text-xl font-bold">Nenhuma avaliação cadastrada</h3>
            <p className="text-zinc-500">Registre a primeira avaliação física para acompanhar a evolução.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold mb-6">Nova Avaliação</h3>
              <form onSubmit={handleAdd} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Aluno *</label>
                      <input 
                        required 
                        type="text" 
                        value={alunoSearch}
                        onChange={(e) => {
                          setAlunoSearch(e.target.value);
                          setShowAlunoDropdown(true);
                        }}
                        onFocus={() => setShowAlunoDropdown(true)}
                        className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" 
                        placeholder="Digite ou selecione o aluno..."
                      />
                      <button 
                        type="button"
                        onClick={() => setShowAlunoDropdown(!showAlunoDropdown)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-purple-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {showAlunoDropdown && (
                        <div className="absolute z-10 w-full bg-zinc-900 border border-zinc-800 rounded-xl mt-1 max-h-48 overflow-y-auto shadow-2xl">
                          {filteredAlunosList.length > 0 ? (
                            filteredAlunosList.map(aluno => (
                              <div 
                                key={aluno.id}
                                onClick={() => {
                                  setNewAvaliacao({...newAvaliacao, aluno_id: aluno.id});
                                  setAlunoSearch(aluno.nome);
                                  setShowAlunoDropdown(false);
                                }}
                                className="px-4 py-2 hover:bg-purple-500/20 cursor-pointer text-sm text-white"
                              >
                                {aluno.nome}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-zinc-500">Nenhum aluno encontrado</div>
                          )}
                        </div>
                      )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Data da Avaliação *</label>
                    <input required type="date" value={newAvaliacao.data || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, data: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all [color-scheme:dark]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Peso (kg) *</label>
                    <input required type="number" step="0.1" value={newAvaliacao.peso || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, peso: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" placeholder="75.5" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Altura (m) *</label>
                    <input required type="number" step="0.01" value={newAvaliacao.altura || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, altura: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" placeholder="1.75" />
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <h4 className="text-lg font-bold mb-4 text-purple-500">Perímetros (cm)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Ombro</label>
                      <input type="number" step="0.1" value={newAvaliacao.ombro || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, ombro: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tórax</label>
                      <input type="number" step="0.1" value={newAvaliacao.torax || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, torax: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Cintura</label>
                      <input type="number" step="0.1" value={newAvaliacao.cintura || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, cintura: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Abdome</label>
                      <input type="number" step="0.1" value={newAvaliacao.abdome || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, abdome: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Quadril</label>
                      <input type="number" step="0.1" value={newAvaliacao.quadril || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, quadril: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Braço Dir.</label>
                      <input type="number" step="0.1" value={newAvaliacao.braco_direito || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, braco_direito: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Braço Esq.</label>
                      <input type="number" step="0.1" value={newAvaliacao.braco_esquerdo || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, braco_esquerdo: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Coxa Dir.</label>
                      <input type="number" step="0.1" value={newAvaliacao.coxa_direita || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, coxa_direita: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Coxa Esq.</label>
                      <input type="number" step="0.1" value={newAvaliacao.coxa_esquerda || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, coxa_esquerda: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Panturrilha Dir.</label>
                      <input type="number" step="0.1" value={newAvaliacao.panturrilha_direita || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, panturrilha_direita: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Panturrilha Esq.</label>
                      <input type="number" step="0.1" value={newAvaliacao.panturrilha_esquerda || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, panturrilha_esquerda: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <h4 className="text-lg font-bold mb-4 text-purple-500">Dobras Cutâneas (mm)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tricipital</label>
                      <input type="number" step="0.1" value={newAvaliacao.tricipital || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, tricipital: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Subescapular</label>
                      <input type="number" step="0.1" value={newAvaliacao.subescapular || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, subescapular: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Peitoral</label>
                      <input type="number" step="0.1" value={newAvaliacao.peitoral || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, peitoral: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Axilar Média</label>
                      <input type="number" step="0.1" value={newAvaliacao.axilar_media || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, axilar_media: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Supra-ilíaca</label>
                      <input type="number" step="0.1" value={newAvaliacao.supra_iliaca || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, supra_iliaca: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Abdominal</label>
                      <input type="number" step="0.1" value={newAvaliacao.abdominal || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, abdominal: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Coxa</label>
                      <input type="number" step="0.1" value={newAvaliacao.coxa || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, coxa: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Panturrilha</label>
                      <input type="number" step="0.1" value={newAvaliacao.panturrilha || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, panturrilha: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <h4 className="text-lg font-bold mb-4 text-purple-500">Dados de Saúde e Resultados</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">PA Sistólica</label>
                      <input type="number" value={newAvaliacao.pressao_arterial_sistolica || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, pressao_arterial_sistolica: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">PA Diastólica</label>
                      <input type="number" value={newAvaliacao.pressao_arterial_diastolica || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, pressao_arterial_diastolica: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">FC Repouso (bpm)</label>
                      <input type="number" value={newAvaliacao.frequencia_cardiaca_repouso || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, frequencia_cardiaca_repouso: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">% Gordura (BF)</label>
                      <input type="number" step="0.1" value={newAvaliacao.percentual_gordura || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, percentual_gordura: parseFloat(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">IMC</label>
                      <input type="number" readOnly value={newAvaliacao.imc || ''} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-zinc-400 cursor-not-allowed outline-none" placeholder="Calculado auto." />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Massa Gorda (kg)</label>
                      <input type="number" readOnly value={newAvaliacao.massa_gorda || ''} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-zinc-400 cursor-not-allowed outline-none" placeholder="Calculado auto." />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Massa Magra (kg)</label>
                      <input type="number" readOnly value={newAvaliacao.massa_magra || ''} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-zinc-400 cursor-not-allowed outline-none" placeholder="Calculado auto." />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Observações</label>
                  <textarea value={newAvaliacao.observacoes || ''} onChange={(e) => setNewAvaliacao({...newAvaliacao, observacoes: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all min-h-[100px]" placeholder="Observações gerais..."></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-500/20">Salvar Avaliação</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
