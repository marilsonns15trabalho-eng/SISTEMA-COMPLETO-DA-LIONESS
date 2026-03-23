'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Dumbbell, 
  Plus, 
  Loader2,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Exercicio {
  nome: string;
  grupo_muscular?: string;
  series: number;
  repeticoes: string;
  carga?: string;
  descanso?: string;
  observacoes?: string;
}

interface Treino {
  id: string;
  aluno_id: string;
  nome: string;
  objetivo?: string;
  nivel?: string;
  duracao_minutos?: number;
  descricao?: string;
  exercicios?: Exercicio[];
  ativo?: boolean;
  created_at: string;
  alunos?: { nome: string }; // Join
}

export default function TreinosModule() {
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTreino, setNewTreino] = useState<Partial<Treino>>({
    aluno_id: '',
    nome: '',
    objetivo: '',
    nivel: 'Iniciante',
    duracao_minutos: 60,
    exercicios: [],
    descricao: '',
    ativo: true
  });
  const [alunosList, setAlunosList] = useState<{id: string, nome: string}[]>([]);

  useEffect(() => {
    const fetchTreinos = async () => {
      // Buscar treinos com o nome do aluno (join)
      const { data, error } = await supabase
        .from('treinos')
        .select(`
          *,
          alunos (
            nome
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar treinos:', error);
      } else {
        setTreinos(data || []);
      }
      setLoading(false);
    };

    const fetchAlunosList = async () => {
      const { data } = await supabase.from('alunos').select('id, nome').order('nome');
      setAlunosList(data || []);
    };

    fetchTreinos();
    fetchAlunosList();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const mockUserId = '00000000-0000-0000-0000-000000000000';

    try {
      const { error } = await supabase
        .from('treinos')
        .insert([{
          ...newTreino,
          user_id: mockUserId
        }]);
      
      if (error) throw error;
      
      setShowAddModal(false);
      setNewTreino({ aluno_id: '', nome: '', descricao: '', ativo: true, duracao_minutos: 60, exercicios: [] });
      
      // Recarregar
      const { data } = await supabase.from('treinos').select(`*, alunos(nome)`).order('created_at', { ascending: false });
      setTreinos(data || []);
    } catch (error) {
      console.error('Erro ao cadastrar treino:', error);
    }
  };

  const filteredTreinos = treinos.filter(t => 
    (t.nome || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (t.alunos?.nome || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 bg-black min-h-screen text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Treinos</h2>
          <p className="text-zinc-500">Crie fichas de treinamento e acompanhe a evolução dos alunos.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          Novo Treino
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome do treino ou aluno..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
          <Filter size={20} />
          Filtros
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="text-blue-500 animate-spin" size={40} />
            <p className="text-zinc-500 font-medium">Carregando treinos...</p>
          </div>
        ) : filteredTreinos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Nome do Treino</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Aluno</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Data de Criação</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredTreinos.map((treino) => (
                  <tr key={treino.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                          <Dumbbell size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{treino.nome}</p>
                          <p className="text-xs text-zinc-500 line-clamp-1 max-w-xs">{treino.descricao || 'Sem descrição'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <User size={14} className="text-zinc-500" />
                        {treino.alunos?.nome || 'Aluno não encontrado'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <Calendar size={14} className="text-zinc-600" />
                        {new Date(treino.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-4 py-2 bg-zinc-800 hover:bg-blue-500 hover:text-white rounded-xl text-xs font-bold transition-all mr-2">
                        Ver Ficha
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
              <Dumbbell className="text-zinc-600" size={32} />
            </div>
            <h3 className="text-xl font-bold">Nenhum treino cadastrado</h3>
            <p className="text-zinc-500">Crie a primeira ficha de treinamento para seus alunos.</p>
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
              <h3 className="text-2xl font-bold mb-6">Nova Ficha de Treino</h3>
              <form onSubmit={handleAdd} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Aluno *</label>
                    <select required value={newTreino.aluno_id || ''} onChange={(e) => setNewTreino({...newTreino, aluno_id: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all">
                      <option value="" disabled>Selecione um aluno</option>
                      {alunosList.map(aluno => (
                        <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nome do Treino *</label>
                    <input required type="text" value={newTreino.nome || ''} onChange={(e) => setNewTreino({...newTreino, nome: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" placeholder="Ex: Treino A - Hipertrofia" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Objetivo</label>
                    <input type="text" value={newTreino.objetivo || ''} onChange={(e) => setNewTreino({...newTreino, objetivo: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" placeholder="Ex: Hipertrofia" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nível</label>
                    <select value={newTreino.nivel || 'Iniciante'} onChange={(e) => setNewTreino({...newTreino, nivel: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all">
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Duração (minutos)</label>
                    <input type="number" min="1" value={newTreino.duracao_minutos || 60} onChange={(e) => setNewTreino({...newTreino, duracao_minutos: parseInt(e.target.value)})} className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5 flex items-center gap-2 mt-6">
                    <input type="checkbox" id="ativo" checked={newTreino.ativo !== false} onChange={(e) => setNewTreino({...newTreino, ativo: e.target.checked})} className="w-5 h-5 rounded bg-black border-zinc-800 text-blue-500 focus:ring-blue-500/50" />
                    <label htmlFor="ativo" className="text-sm font-bold text-zinc-400 cursor-pointer">Treino Ativo</label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Descrição / Observações Gerais</label>
                  <textarea rows={3} value={newTreino.descricao || ''} onChange={(e) => setNewTreino({...newTreino, descricao: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none" placeholder="Foco na cadência, descanso de 60s..." />
                </div>

                <div className="border-t border-zinc-800 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-blue-500">Exercícios</h4>
                    <button 
                      type="button"
                      onClick={() => {
                        const exercicios = newTreino.exercicios || [];
                        setNewTreino({
                          ...newTreino, 
                          exercicios: [...exercicios, { nome: '', grupo_muscular: '', series: 3, repeticoes: '10-12', carga: '', descanso: '60s', observacoes: '' }]
                        });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl text-sm font-bold transition-all"
                    >
                      <Plus size={16} />
                      Adicionar Exercício
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(newTreino.exercicios || []).map((exercicio, index) => (
                      <div key={index} className="p-4 bg-black border border-zinc-800 rounded-2xl relative group">
                        <button 
                          type="button"
                          onClick={() => {
                            const exercicios = [...(newTreino.exercicios || [])];
                            exercicios.splice(index, 1);
                            setNewTreino({...newTreino, exercicios});
                          }}
                          className="absolute top-4 right-4 text-zinc-500 hover:text-red-500 transition-colors"
                        >
                          Remover
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-12">
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nome do Exercício *</label>
                            <input required type="text" value={exercicio.nome} onChange={(e) => {
                              const exercicios = [...(newTreino.exercicios || [])];
                              exercicios[index].nome = e.target.value;
                              setNewTreino({...newTreino, exercicios});
                            }} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" placeholder="Ex: Supino Reto" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Grupo Muscular</label>
                            <input type="text" value={exercicio.grupo_muscular || ''} onChange={(e) => {
                              const exercicios = [...(newTreino.exercicios || [])];
                              exercicios[index].grupo_muscular = e.target.value;
                              setNewTreino({...newTreino, exercicios});
                            }} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" placeholder="Ex: Peito" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Séries *</label>
                            <input required type="number" min="1" value={exercicio.series} onChange={(e) => {
                              const exercicios = [...(newTreino.exercicios || [])];
                              exercicios[index].series = parseInt(e.target.value);
                              setNewTreino({...newTreino, exercicios});
                            }} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Repetições *</label>
                            <input required type="text" value={exercicio.repeticoes} onChange={(e) => {
                              const exercicios = [...(newTreino.exercicios || [])];
                              exercicios[index].repeticoes = e.target.value;
                              setNewTreino({...newTreino, exercicios});
                            }} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" placeholder="Ex: 10-12 ou Até a falha" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Carga</label>
                            <input type="text" value={exercicio.carga || ''} onChange={(e) => {
                              const exercicios = [...(newTreino.exercicios || [])];
                              exercicios[index].carga = e.target.value;
                              setNewTreino({...newTreino, exercicios});
                            }} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" placeholder="Ex: 20kg" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Descanso</label>
                            <input type="text" value={exercicio.descanso || ''} onChange={(e) => {
                              const exercicios = [...(newTreino.exercicios || [])];
                              exercicios[index].descanso = e.target.value;
                              setNewTreino({...newTreino, exercicios});
                            }} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" placeholder="Ex: 60s" />
                          </div>
                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Observações</label>
                            <input type="text" value={exercicio.observacoes || ''} onChange={(e) => {
                              const exercicios = [...(newTreino.exercicios || [])];
                              exercicios[index].observacoes = e.target.value;
                              setNewTreino({...newTreino, exercicios});
                            }} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all" placeholder="Ex: Focar na excêntrica" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!newTreino.exercicios || newTreino.exercicios.length === 0) && (
                      <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                        Nenhum exercício adicionado. Clique no botão acima para adicionar.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20">Salvar Treino</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
