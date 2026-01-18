// src/services/api.ts

import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // Importante para os Cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // SE O ERRO FOR 401 (Não autorizado)
    if (error.response?.status === 401) {
      // --- CORREÇÃO DO LOOP INFINITO AQUI ---
      // Se a requisição que falhou foi a de 'logout' OU a de 'validate',
      // NÓS NÃO QUEREMOS que ele tente redirecionar novamente, pois gera loop.
      // Apenas rejeitamos o erro e deixamos o AuthContext lidar com isso.
      if (
        originalRequest.url.includes('/auth/logout') ||
        originalRequest.url.includes('/auth/validate') // <--- ADICIONE ESSA LINHA
      ) {
        return Promise.reject(error);
      }
      // ---------------------------------------

      // Para qualquer outro erro 401 durante o uso normal do app, forçamos o logout.
      try {
        // Tenta avisar o backend para limpar o cookie
        await api.post('/auth/logout');
      } catch (logoutError) {
        // Ignora erro no logout
      } finally {
        // Redireciona para a tela de login
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
