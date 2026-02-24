import type { Page } from './Venda';

export type AcaoLog = 'CREATE' | 'UPDATE' | 'DELETE' | 'READ';

export interface LogOperacao {
  id: string; // UUID
  entidade: string;
  acao: AcaoLog;
  username: string;
  dataHora: string; // ISO 8601 LocalDateTime
  tempoExecucao?: number; // ms
  detalhes?: string; // JSON string
  ipOrigem?: string;
  userAgent?: string;
}

export interface LogFiltroDTO {
  entidade?: string;
  acao?: AcaoLog | string;
  username?: string;
  ipOrigem?: string;
  dataInicio?: string; // ISO 8601 com hora: yyyy-MM-ddTHH:mm:ss
  dataFim?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export type { Page };
