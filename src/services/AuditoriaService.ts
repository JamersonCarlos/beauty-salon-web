import { api } from './api';
import type { LogFiltroDTO, LogOperacao } from '../models/LogOperacao';
import type { Page } from '../models/Venda';

export const AuditoriaService = {
  listar: async (filtros: LogFiltroDTO = {}): Promise<Page<LogOperacao>> => {
    const params = new URLSearchParams();

    if (filtros.entidade) params.append('entidade', filtros.entidade);
    if (filtros.acao) params.append('acao', filtros.acao);
    if (filtros.username) params.append('username', filtros.username);
    if (filtros.ipOrigem) params.append('ipOrigem', filtros.ipOrigem);
    if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
    if (filtros.page !== undefined)
      params.append('page', filtros.page.toString());
    if (filtros.size !== undefined)
      params.append('size', filtros.size.toString());
    if (filtros.sort) params.append('sort', filtros.sort);
    if (filtros.direction) params.append('direction', filtros.direction);

    const response = await api.get(`/logs?${params.toString()}`);
    return response.data;
  },
};
