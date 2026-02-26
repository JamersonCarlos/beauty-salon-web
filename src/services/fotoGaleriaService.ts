// src/services/fotoGaleriaService.ts

import { api } from './api';
import type { FotoGaleria, FotoGaleriaRequest } from '../models/FotoGaleria';
import type { Page } from '../models/Venda';

// ---------------------------------------------------------------------------
// DTOs de filtro
// ---------------------------------------------------------------------------

export interface GaleriaFiltroDTO {
  servicoId?: number;
  clienteId?: string;
  page?: number;
  size?: number;
}

// ---------------------------------------------------------------------------
// Serviço
// ---------------------------------------------------------------------------

export const FotoGaleriaService = {
  /**
   * GET /galeria
   * Listagem paginada com filtros opcionais.
   */
  listar: async (
    filtros: GaleriaFiltroDTO = {}
  ): Promise<Page<FotoGaleria>> => {
    const params: Record<string, string> = {};

    if (filtros.servicoId !== undefined)
      params.servicoId = filtros.servicoId.toString();
    if (filtros.clienteId !== undefined) params.clienteId = filtros.clienteId;
    if (filtros.page !== undefined) params.page = filtros.page.toString();
    if (filtros.size !== undefined) params.size = filtros.size.toString();

    const response = await api.get('/galeria', { params });
    return response.data;
  },

  /**
   * POST /galeria   (multipart/form-data)
   *
   * O Spring Boot espera dois @RequestPart:
   *   - "dados"  → string JSON com { titulo, servicoId, clienteId }
   *   - "imagem" → arquivo físico (File)
   *
   * IMPORTANTE: não definir Content-Type manualmente aqui;
   * o axios detecta FormData e adiciona o boundary correto automaticamente.
   * Contudo, a instância global tem 'Content-Type: application/json',
   * portanto sobrescrevemos explicitamente para multipart/form-data.
   */
  upload: async (
    dados: FotoGaleriaRequest,
    imagem: File
  ): Promise<FotoGaleria> => {
    const formData = new FormData();

    // @RequestPart("dados") – string JSON, não Blob com type
    formData.append('dados', JSON.stringify(dados));

    // @RequestPart("imagem") – arquivo físico
    formData.append('imagem', imagem, imagem.name);

    const response = await api.post('/galeria', formData, {
      headers: {
        // Sobrescreve o header padrão para que o axios gere o boundary correto
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * DELETE /galeria/{id}
   */
  excluir: async (id: number | string): Promise<void> => {
    await api.delete(`/galeria/${id}`);
  },
};
