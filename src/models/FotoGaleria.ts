// src/models/FotoGaleria.ts

// ---------------------------------------------------------------------------
// Resumos embutidos nos retornos da API
// ---------------------------------------------------------------------------

export interface ServicoResumoGaleria {
  id: number;
  nome: string;
}

export interface ClienteResumoGaleria {
  id: string;
  name: string;
  username: string;
}

// ---------------------------------------------------------------------------
// Entidade principal
// ---------------------------------------------------------------------------

export interface FotoGaleria {
  id: number | string;
  titulo: string;
  imagemUrl: string;
  servico: ServicoResumoGaleria;
  cliente?: ClienteResumoGaleria | null;
}

// ---------------------------------------------------------------------------
// DTO de envio (os @RequestPart "dados" do Spring Boot)
// ---------------------------------------------------------------------------

export interface FotoGaleriaRequest {
  titulo: string;
  servicoId: number;
  clienteId?: string | null;
}

// ---------------------------------------------------------------------------
// Paginação genérica – reaproveitada do modelo Venda
// Re-exportamos o tipo Page de Venda para uso em FotoGaleria
// ---------------------------------------------------------------------------

export type { Page as PageResponse } from './Venda';
