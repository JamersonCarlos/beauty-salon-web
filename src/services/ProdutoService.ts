import { api } from './api';
import { Produto } from '../models/Produto';
import type { CategoriaProduto } from '../enums/CategoriaProduto';
import type { Page } from '../models/Venda';

// DTO para envio de dados (Create/Update) - Sem ID
export interface ProdutoRequestDTO {
  nome: string;
  categoria: CategoriaProduto | string;
  marca: string;
  codigo: string;
  descricao: string;
  precoCusto: number;
  precoVenda: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  disponivel: boolean;
}

export interface ProdutoFiltroDTO {
  nome?: string;
  categoria?: CategoriaProduto | string;
  disponivel?: boolean;
  precoMin?: number;
  precoMax?: number;
  page?: number;
  size?: number;
}

export const ProdutoService = {
  // --- CREATE (POST) ---
  criar: async (dados: ProdutoRequestDTO): Promise<Produto> => {
    const response = await api.post('/produtos', dados);
    return Produto.fromJson(response.data);
  },

  // --- READ ALL (GET) - Paginado com filtros ---
  listarTodos: async (
    filtros: ProdutoFiltroDTO = {}
  ): Promise<Page<Produto>> => {
    const params = new URLSearchParams();
    if (filtros.nome) params.append('nome', filtros.nome);
    if (filtros.categoria !== undefined)
      params.append('categoria', filtros.categoria.toString());
    if (filtros.disponivel !== undefined)
      params.append('disponivel', filtros.disponivel.toString());
    if (filtros.precoMin !== undefined)
      params.append('precoMin', filtros.precoMin.toString());
    if (filtros.precoMax !== undefined)
      params.append('precoMax', filtros.precoMax.toString());
    if (filtros.page !== undefined)
      params.append('page', filtros.page.toString());
    if (filtros.size !== undefined)
      params.append('size', filtros.size.toString());

    const response = await api.get(`/produtos?${params.toString()}`);
    const pageData = response.data;
    return {
      ...pageData,
      content: pageData.content.map((item: any) => Produto.fromJson(item)),
    };
  },

  // --- READ BY ID (GET) ---
  // Nota: UUID no Java vira string no TypeScript
  buscarPorId: async (id: string): Promise<Produto> => {
    const response = await api.get(`/produtos/${id}`);
    return Produto.fromJson(response.data);
  },

  // --- UPDATE (PUT) ---
  atualizar: async (id: string, dados: ProdutoRequestDTO): Promise<Produto> => {
    const response = await api.put(`/produtos/${id}`, dados);
    return Produto.fromJson(response.data);
  },

  // --- DELETE (DELETE) ---
  excluir: async (id: string): Promise<void> => {
    await api.delete(`/produtos/${id}`);
  },

  // --- PATCH STATUS (Alternar Disponibilidade) ---
  alternarDisponibilidade: async (id: string): Promise<void> => {
    // A rota no controller é @PatchMapping("/{id}/disponibilidade")
    await api.patch(`/produtos/${id}/disponibilidade`);
  },
};
