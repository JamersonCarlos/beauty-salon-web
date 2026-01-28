// Substituição do enum por Objeto as const
export const FormaPagamento = {
  DINHEIRO: 'DINHEIRO',
  CARTAO_CREDITO: 'CARTAO_CREDITO',
  CARTAO_DEBITO: 'CARTAO_DEBITO',
  PIX: 'PIX',
  FIADO: 'FIADO',
} as const;

// Cria um tipo extraindo os valores do objeto acima
// Isso equivale a: 'DINHEIRO' | 'CARTAO_CREDITO' | ...
export type FormaPagamento =
  (typeof FormaPagamento)[keyof typeof FormaPagamento];

export interface ItemVendaRequestDTO {
  produtoId?: string;
  servicoId?: number;
  quantidade: number;
}

export interface VendaRequestDTO {
  desconto: number;
  itens: ItemVendaRequestDTO[];
  formaPagamento: FormaPagamento; // Novo campo obrigatório
  observacoes?: string; // Novo campo opcional
}

export type StatusVenda = 'CONCLUIDA' | 'CANCELADA';

export interface VendaResponseDTO {
  id: string;
  dataVenda: string;
  valorTotal: number;
  desconto: number;
  formaPagamento: FormaPagamento; // ou string se preferir não tipar estritamente
  observacoes?: string;
  status: StatusVenda; // Novo campo vital para a lógica dos botões
}
// ... interfaces existentes (VendaRequestDTO, etc)

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Índice da página atual (começa em 0)
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Interface para os filtros passados na URL
export interface VendaFiltroDTO {
  dataInicio?: string; // yyyy-MM-dd
  dataFim?: string; // yyyy-MM-dd
  valorMin?: number;
  valorMax?: number;
  status?: StatusVenda;
  page?: number;
  size?: number;
}

export interface ReciboItemDTO {
  nome: string;
  tipo: string;
  quantidade: number;
  precoUnitario: number;
}

export interface ReciboResponseDTO {
  idVenda: string;
  data: string;
  status: 'CONCLUIDA' | 'CANCELADA';
  itens: ReciboItemDTO[];
  totalBruto: number;
  desconto: number;
  totalPagar: number;
  formaPagamento: string;
  observacoes?: string;
}
