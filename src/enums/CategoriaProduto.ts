export const CategoriaProduto = {
  CAPILAR: 'CAPILAR',
  PELE: 'PELE',
  UNHAS: 'UNHAS',
  MAQUIAGEM: 'MAQUIAGEM',
  ACESSORIOS: 'ACESSORIOS',
  OUTROS: 'OUTROS',
};

export type CategoriaProduto =
  (typeof CategoriaProduto)[keyof typeof CategoriaProduto];

export const CATEGORIA_PRODUTO_OPTIONS = [
  { value: CategoriaProduto.CAPILAR, label: 'Capilar' },
  { value: CategoriaProduto.PELE, label: 'Pele' },
  { value: CategoriaProduto.UNHAS, label: 'Unhas' },
  { value: CategoriaProduto.MAQUIAGEM, label: 'Maquiagem' },
  { value: CategoriaProduto.ACESSORIOS, label: 'Acessórios' },
  { value: CategoriaProduto.OUTROS, label: 'Outros' },
];
