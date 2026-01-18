import { CategoriaProduto } from "../enums/CategoriaProduto";

export class Produto {
  id?: string; // UUID vira string no front
  nome: string;
  categoria: CategoriaProduto;
  marca: string;
  codigo: string;
  descricao: string;
  precoCusto: number;
  precoVenda: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  disponivel: boolean;

  constructor(
    nome: string,
    categoria: CategoriaProduto,
    marca: string,
    codigo: string,
    descricao: string,
    precoCusto: number,
    precoVenda: number,
    quantidadeEstoque: number,
    estoqueMinimo: number,
    disponivel: boolean,
    id?: string
  ) {
    this.nome = nome;
    this.categoria = categoria;
    this.marca = marca;
    this.codigo = codigo;
    this.descricao = descricao;
    this.precoCusto = precoCusto;
    this.precoVenda = precoVenda;
    this.quantidadeEstoque = quantidadeEstoque;
    this.estoqueMinimo = estoqueMinimo;
    this.disponivel = disponivel;
    this.id = id;
  }

  // Converter JSON da API (Response) para Objeto Produto
  static fromJson(json: any): Produto {
    return new Produto(
      json.nome,
      json.categoria,
      json.marca,
      json.codigo,
      json.descricao,
      json.precoCusto || 0, // Request DTO pode não ter custo, mas response sim
      json.precoVenda,
      json.quantidadeEstoque,
      json.estoqueMinimo || 0,
      json.disponivel,
      json.id
    );
  }
}