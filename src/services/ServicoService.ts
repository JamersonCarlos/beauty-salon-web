import { api } from './api';
import { Servico } from '../models/Servico';
import type { CategoriaServico } from '../enums/CategoriaServico';
import type { Page } from '../models/Venda';

// DTO para envio de dados (Create/Update) - Sem ID
export interface ServicoRequestDTO {
  nome: string;
  categoriaServico: CategoriaServico | string; // String para facilitar o bind do select
  preco: number;
  descricao: string;
  duracaoInMin: number;
  ativo: boolean;
}

export interface ServicoFiltroDTO {
  nome?: string;
  categoria?: CategoriaServico | string;
  ativo?: boolean;
  precoMin?: number;
  precoMax?: number;
  page?: number;
  size?: number;
}

export const ServicoService = {
  // --- CREATE (POST) ---
  criar: async (dados: ServicoRequestDTO): Promise<Servico> => {
    const response = await api.post('/servicos', dados);
    return Servico.fromJson(response.data);
  },

  // --- READ ALL (GET) - Paginado com filtros ---
  listarTodos: async (
    filtros: ServicoFiltroDTO = {}
  ): Promise<Page<Servico>> => {
    const params = new URLSearchParams();
    if (filtros.nome) params.append('nome', filtros.nome);
    if (filtros.categoria !== undefined)
      params.append('categoria', filtros.categoria.toString());
    if (filtros.ativo !== undefined)
      params.append('ativo', filtros.ativo.toString());
    if (filtros.precoMin !== undefined)
      params.append('precoMin', filtros.precoMin.toString());
    if (filtros.precoMax !== undefined)
      params.append('precoMax', filtros.precoMax.toString());
    if (filtros.page !== undefined)
      params.append('page', filtros.page.toString());
    if (filtros.size !== undefined)
      params.append('size', filtros.size.toString());

    const response = await api.get(`/servicos?${params.toString()}`);
    const pageData = response.data;
    return {
      ...pageData,
      content: pageData.content.map((item: any) => Servico.fromJson(item)),
    };
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
