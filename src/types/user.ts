// src/types/user.ts

export interface User {
  id: string;
  name: string;
  username: string;
  telefone: string;
}

/** Versão resumida embutida nos retornos de AgendaResponse */
export interface UserResumo {
  id: string;
  name: string;
  username: string;
}
