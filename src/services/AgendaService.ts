// src/services/AgendaService.ts

import { api } from './api';
import type { AgendaRequest, AgendaResponse } from '../types/agenda';
import type { User } from '../types/user';
import type { Page } from '../models/Venda';

export const AgendaService = {
  /**
   * GET /agendas
   * filtro: "HOJE" | "MES" | undefined (todos)
   */
  listarAgendas: async (
    filtro?: string,
    page = 0,
    size = 20
  ): Promise<Page<AgendaResponse>> => {
    const response = await api.get('/agendas', {
      params: {
        ...(filtro ? { filtro } : {}),
        page,
        size,
      },
    });
    return response.data;
  },

  /** GET /agendas/{id} */
  buscarAgendaPorId: async (id: number): Promise<AgendaResponse> => {
    const response = await api.get(`/agendas/${id}`);
    return response.data;
  },

  /** POST /agendas */
  criarAgenda: async (data: AgendaRequest): Promise<AgendaResponse> => {
    const response = await api.post('/agendas', data);
    return response.data;
  },

  /** PUT /agendas/{id} */
  atualizarAgenda: async (
    id: number,
    data: AgendaRequest
  ): Promise<AgendaResponse> => {
    const response = await api.put(`/agendas/${id}`, data);
    return response.data;
  },

  /** DELETE /agendas/{id} */
  deletarAgenda: async (id: number): Promise<void> => {
    await api.delete(`/agendas/${id}`);
  },

  /**
   * GET /users/all
   * Filtra por username e/ou name
   */
  buscarUsuarios: async (
    username?: string,
    name?: string,
    page = 0,
    size = 10
  ): Promise<Page<User>> => {
    const response = await api.get('/users/all', {
      params: {
        ...(username ? { username } : {}),
        ...(name ? { name } : {}),
        page,
        size,
      },
    });
    return response.data;
  },
};
