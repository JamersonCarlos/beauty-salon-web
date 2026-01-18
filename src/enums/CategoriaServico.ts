// src/enums/CategoriaServico.ts

// 1. Substitui o enum por um objeto 'as const' para evitar sintaxe de enum
export const CategoriaServico = {
  CABELO: 'CABELO',
  UNHAS: 'UNHAS',
  ESTETICA: 'ESTETICA',
  MAQUIAGEM: 'MAQUIAGEM',
  DEPILACAO: 'DEPILACAO',
  SOBRANCELHAS: 'SOBRANCELHAS',
  MASSAGEM: 'MASSAGEM',
  OUTRO: 'OUTRO',
} as const;

export type CategoriaServico =
  (typeof CategoriaServico)[keyof typeof CategoriaServico];

// 2. Um array auxiliar pronto para ser usado no <select> com .map()
// O 'value' deve ser igual ao do Java (MAIUSCULO) para o backend aceitar.
export const CATEGORIA_OPTIONS = [
  { value: CategoriaServico.CABELO, label: 'Cabelo' },
  { value: CategoriaServico.UNHAS, label: 'Unhas' },
  { value: CategoriaServico.ESTETICA, label: 'Estética' },
  { value: CategoriaServico.MAQUIAGEM, label: 'Maquiagem' },
  { value: CategoriaServico.DEPILACAO, label: 'Depilação' },
  { value: CategoriaServico.SOBRANCELHAS, label: 'Sobrancelhas' },
  { value: CategoriaServico.MASSAGEM, label: 'Massagem' },
  { value: CategoriaServico.OUTRO, label: 'Outro' },
];
