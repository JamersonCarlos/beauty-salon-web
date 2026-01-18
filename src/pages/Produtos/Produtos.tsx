import { useEffect, useState } from 'react';
import { Plus, Search, Package, AlertTriangle, Trash2 } from 'lucide-react';
import {
  ProdutoService,
  type ProdutoRequestDTO,
} from '../../services/ProdutoService';
import { Produto } from '../../models/Produto';
import {
  CardProduto,
  type ProdutoFormData,
} from '../../components/CardProduto';
import styles from './Produtos.module.css';

export function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<ProdutoFormData | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      const data = await ProdutoService.listarTodos();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredList = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.marca?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValorEstoque = produtos.reduce(
    (acc, p) => acc + p.precoCusto * p.quantidadeEstoque,
    0
  );
  const produtosEstoqueBaixo = produtos.filter(
    (p) => p.quantidadeEstoque <= p.estoqueMinimo
  ).length;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);

  const handleOpenCreate = () => {
    setEditingProduto(null);
    setIsModalOpen(true);
  };

  const handleEdit = (produto: Produto) => {
    const formData: ProdutoFormData = {
      id: produto.id,
      nome: produto.nome,
      categoria: produto.categoria,
      marca: produto.marca,
      codigo: produto.codigo,
      descricao: produto.descricao,
      precoCusto: produto.precoCusto,
      precoVenda: produto.precoVenda,
      quantidadeEstoque: produto.quantidadeEstoque,
      estoqueMinimo: produto.estoqueMinimo,
      disponivel: produto.disponivel,
    };
    setEditingProduto(formData);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: ProdutoFormData) => {
    try {
      const dto: ProdutoRequestDTO = {
        nome: formData.nome,
        categoria: formData.categoria,
        marca: formData.marca,
        codigo: formData.codigo,
        descricao: formData.descricao,
        precoCusto: formData.precoCusto,
        precoVenda: formData.precoVenda,
        quantidadeEstoque: formData.quantidadeEstoque,
        estoqueMinimo: formData.estoqueMinimo,
        disponivel: formData.disponivel,
      };

      if (formData.id) {
        await ProdutoService.atualizar(formData.id, dto);
      } else {
        await ProdutoService.criar(dto);
      }

      await carregarProdutos();
      setIsModalOpen(false);
    } catch (error) {
      alert('Erro ao salvar produto.');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Deseja excluir este produto?')) {
      try {
        await ProdutoService.excluir(id);
        carregarProdutos();
      } catch (err) {
        alert('Erro ao excluir');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Estoque de Produtos</h1>
          <p className={styles.subtitle}>
            {produtos.length} produtos • Valor total:{' '}
            {formatCurrency(totalValorEstoque)}
          </p>
        </div>
        <button className={styles.btnNew} onClick={handleOpenCreate}>
          <Plus size={20} /> Novo Produto
        </button>
      </div>

      {produtosEstoqueBaixo > 0 && (
        <div className={styles.stockAlert}>
          <AlertTriangle size={20} />
          <span className={styles.alertText}>
            <strong>{produtosEstoqueBaixo} produtos</strong> com estoque baixo
            ou zerado.
          </span>
        </div>
      )}

      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, marca ou código..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#999' }}>
          Carregando estoque...
        </p>
      ) : (
        <div className={styles.tableContainer}>
          {/* Cabeçalho da Tabela - COM 7 COLUNAS */}
          <div className={styles.tableHeader}>
            <span>Produto</span>
            <span>Categoria</span>
            <span>Código</span> {/* Coluna Nova */}
            <span>Custo</span>
            <span>Venda</span>
            <span>Estoque</span>
            <span></span>
          </div>

          {/* Linhas */}
          {filteredList.map((produto) => (
            <div
              key={produto.id}
              className={styles.tableRow}
              onClick={() => handleEdit(produto)}
            >
              {/* 1. Produto */}
              <div className={styles.productCell}>
                <div className={styles.productIconBox}>
                  <Package size={20} strokeWidth={1.5} />
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{produto.nome}</span>
                  <span className={styles.productBrand}>
                    {produto.marca || 'Genérico'}
                  </span>
                </div>
              </div>

              {/* 2. Categoria */}
              <div>
                <span className={styles.categoryBadge}>
                  {produto.categoria}
                </span>
              </div>

              {/* 3. Código (NOVO) */}
              <div>
                <span className={styles.productCode}>
                  {produto.codigo || '-'}
                </span>
              </div>

              {/* 4. Custo */}
              <span className={styles.priceCost}>
                {formatCurrency(produto.precoCusto)}
              </span>

              {/* 5. Venda */}
              <span className={styles.priceSale}>
                {formatCurrency(produto.precoVenda)}
              </span>

              {/* 6. Estoque */}
              <div>
                <span
                  className={`
                  ${styles.stockBadge} 
                  ${
                    produto.quantidadeEstoque <= 0
                      ? styles.stockCritical
                      : produto.quantidadeEstoque <= produto.estoqueMinimo
                        ? styles.stockLow
                        : styles.stockNormal
                  }
                `}
                >
                  {produto.quantidadeEstoque} un.
                </span>
              </div>

              {/* 7. Ações */}
              <div className={styles.actionBtn}>
                <button
                  onClick={(e) => handleDelete(e, produto.id!)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#E57373',
                  }}
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {filteredList.length === 0 && (
            <div
              style={{ padding: '40px', textAlign: 'center', color: '#999' }}
            >
              Nenhum produto encontrado no estoque.
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <CardProduto
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={editingProduto}
        />
      )}
    </div>
  );
}
