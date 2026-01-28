import { api } from './api'; // Sua instância do Axios
import { type Page, type ReciboResponseDTO, type VendaFiltroDTO, type VendaRequestDTO, type VendaResponseDTO } from '../models/Venda';

export const VendaService = {
  registrarVenda: async (venda: VendaRequestDTO): Promise<VendaResponseDTO> => {
    const response = await api.post('/vendas', venda);
    return response.data;
  },

  cancelarVenda: async (id: string): Promise<void> => {
    await api.put(`/vendas/${id}/cancelar`);
  },

  listarVendas: async (filtros: VendaFiltroDTO = {}): Promise<Page<VendaResponseDTO>> => {
    const params = new URLSearchParams();

    // Adiciona parâmetros apenas se existirem
    if (filtros.page !== undefined) params.append('page', filtros.page.toString());
    if (filtros.size !== undefined) params.append('size', filtros.size.toString());
    if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
    if (filtros.valorMin) params.append('valorMin', filtros.valorMin.toString());
    if (filtros.valorMax) params.append('valorMax', filtros.valorMax.toString());
    if (filtros.status) params.append('status', filtros.status);

    // Backend já tem default sort, mas se quiser forçar:
    // params.append('sort', 'dataVenda,desc');

    const response = await api.get(`/vendas?${params.toString()}`);
    return response.data;
  },

  obterRecibo: async (id: string): Promise<ReciboResponseDTO> => {
    const response = await api.get(`/vendas/${id}/recibo`);
    return response.data;
  }
};
