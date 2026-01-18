import type { CategoriaServico } from "../enums/CategoriaServico";

export class Servico { 
  id: number; 
  nome: string; 
  categoriaServico: CategoriaServico;
  preco: number;
  descricao: string;
  duracaoInMin: number;
  ativo: boolean;

  constructor(
    id: number,
    nome: string,
    categoriaServico: CategoriaServico,
    preco: number,
    descricao: string,
    duracaoInMin: number,
    ativo: boolean
  ) {
    this.id = id;
    this.nome = nome;
    this.categoriaServico = categoriaServico;
    this.preco = preco;
    this.descricao = descricao;
    this.duracaoInMin = duracaoInMin; 
    this.ativo = ativo;
  }

  static fromJson(json: any): Servico {
    return new Servico(
      json.id,
      json.nome,
      json.categoriaServico, // Certifique-se que o valor no JSON corresponde ao Enum
      json.preco,
      json.descricao,
      json.duracaoInMin,
      json.ativo
    );
  }


  toJSON(): object {
    return {
      id: this.id,
      nome: this.nome,
      categoriaServico: this.categoriaServico,
      preco: this.preco,
      descricao: this.descricao,
      duracaoInMin: this.duracaoInMin,
      ativo: this.ativo,
    };
  }
}