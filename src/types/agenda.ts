// src/types/agenda.ts

import type { UserResumo } from './user';

// ---------------------------------------------------------------------------
// Enums / Unions
// ---------------------------------------------------------------------------

export const StatusAgenda = {
  AGENDADO: 'AGENDADO',
  FINALIZADO: 'FINALIZADO',
  CANCELADO: 'CANCELADO',
} as const;

export type StatusAgenda = (typeof StatusAgenda)[keyof typeof StatusAgenda];

// ---------------------------------------------------------------------------
// Serviço Resumo
// ---------------------------------------------------------------------------

export interface ServicoResumo {
  id: number;
  nome: string;
  preco: number;
  duracaoInMin: number;
  categoria: string;
}

// ---------------------------------------------------------------------------
// Request / Response
// ---------------------------------------------------------------------------

export interface AgendaRequest {
  username: string;
  servicos: number[];
  dataHoraInicio: string; // ISO 8601: YYYY-MM-DDTHH:mm:ss
  status: StatusAgenda;
  observacoes: string;
}

export interface AgendaResponse {
  id: number;
  dataHoraInicio: string;
  status: string;
  observacoes: string;
  duracaoTotal: number;
  user: UserResumo;
  servicos: ServicoResumo[];
}
