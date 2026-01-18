import { api } from './api';
import { Produto } from '../models/Produto'; // Certifique-se que o caminho está correto
import type { CategoriaProduto } from '../enums/CategoriaProduto';

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

export const ProdutoService = {
  
  // --- CREATE (POST) ---
  criar: async (dados: ProdutoRequestDTO): Promise<Produto> => {
    const response = await api.post('/produtos', dados);
    return Produto.fromJson(response.data);
  },

  // --- READ ALL (GET) ---
  listarTodos: async (): Promise<Produto[]> => {
    const response = await api.get('/produtos');
    // Mapeia o array de JSON para array de instâncias da classe Produto
    return response.data.map((item: any) => Produto.fromJson(item));
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
  }
};