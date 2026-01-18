import { api } from './api';
import { Servico } from '../models/Servico'; // Ajuste o caminho conforme sua estrutura
import type { CategoriaServico } from '../enums/CategoriaServico';

// DTO para envio de dados (Create/Update) - Sem ID
export interface ServicoRequestDTO {
  nome: string;
  categoriaServico: CategoriaServico | string; // String para facilitar o bind do select
  preco: number;
  descricao: string;
  duracaoInMin: number;
  ativo: boolean;
}

export const ServicoService = {
  // --- CREATE (POST) ---
  criar: async (dados: ServicoRequestDTO): Promise<Servico> => {
    const response = await api.post('/servicos', dados);
    return Servico.fromJson(response.data);
  },

  // --- READ ALL (GET) ---
  listarTodos: async (): Promise<Servico[]> => {
    const response = await api.get('/servicos');
    // Mapeia o array de JSON para array de instâncias da classe Servico
    return response.data.map((item: any) => Servico.fromJson(item));
  },

  // --- READ BY ID (GET) ---
  buscarPorId: async (id: number): Promise<Servico> => {
    const response = await api.get(`/servicos/${id}`);
    return Servico.fromJson(response.data);
  },

  // --- UPDATE (PUT) ---
  atualizar: async (id: number, dados: ServicoRequestDTO): Promise<Servico> => {
    const response = await api.put(`/servicos/${id}`, dados);
    return Servico.fromJson(response.data);
  },

  // --- DELETE (DELETE) ---
  excluir: async (id: number): Promise<void> => {
    await api.delete(`/servicos/${id}`);
  },

  // --- PATCH STATUS (Ativar/Desativar) ---
  alternarStatus: async (id: number): Promise<void> => {
    await api.patch(`/servicos/${id}/status`);
  },
};
