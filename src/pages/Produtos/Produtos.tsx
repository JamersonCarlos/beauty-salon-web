import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react';
import {
  ProdutoService,
  type ProdutoRequestDTO,
  type ProdutoFiltroDTO,
} from '../../services/ProdutoService';
import { Produto } from '../../models/Produto';
import {
  CardProduto,
  type ProdutoFormData,
} from '../../components/CardProduto';
import { CategoriaProduto } from '../../enums/CategoriaProduto';
import styles from './Produtos.module.css';

export function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<ProdutoFormData | null>(
    null
  );

  // Paginação
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  // Filtros
  const [filtros, setFiltros] = useState<ProdutoFiltroDTO>({
    nome: '',
    categoria: undefined,
    disponivel: undefined,
    precoMin: undefined,
    precoMax: undefined,
  });

  useEffect(() => {
    carregarProdutos(page);
  }, [page, pageSize]);

  const carregarProdutos = async (pageParam: number = page) => {
    try {
      setLoading(true);
      const filtroPayload: ProdutoFiltroDTO = {
        ...filtros,
        page: pageParam,
        size: pageSize,
      };
      const data = await ProdutoService.listarTodos(filtroPayload);
      setProdutos(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error('Erro ao carregar produtos', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : value,
    }));
  };

  const handleBuscar = () => {
    setPage(0);
    carregarProdutos(0);
  };

  const handleLimpar = () => {
    setFiltros({
      nome: '',
      categoria: undefined,
      disponivel: undefined,
      precoMin: undefined,
      precoMax: undefined,
    });
    setPage(0);
    ProdutoService.listarTodos({ page: 0, size: pageSize }).then((data) => {
      setProdutos(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    });
  };

  const filteredList = produtos;

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

      await carregarProdutos(page);
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
        carregarProdutos(page);
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
            {totalElements} produtos • Valor total:{' '}
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
            name="nome"
            placeholder="Buscar por nome..."
            className={styles.searchInput}
            value={filtros.nome || ''}
            onChange={handleInputChange}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Categoria</label>
          <select
            name="categoria"
            className={styles.filterSelect}
            value={filtros.categoria || ''}
            onChange={handleInputChange}
          >
            <option value="">Todas</option>
            {Object.values(CategoriaProduto).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Disponível</label>
          <select
            name="disponivel"
            className={styles.filterSelect}
            value={filtros.disponivel?.toString() || ''}
            onChange={handleInputChange}
          >
            <option value="">Todos</option>
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Preço Min</label>
          <input
            type="number"
            name="precoMin"
            placeholder="0,00"
            className={styles.filterInput}
            value={filtros.precoMin || ''}
            onChange={handleInputChange}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Preço Max</label>
          <input
            type="number"
            name="precoMax"
            placeholder="0,00"
            className={styles.filterInput}
            value={filtros.precoMax || ''}
            onChange={handleInputChange}
          />
        </div>

        <div className={styles.filterActions}>
          <button className={styles.btnClear} onClick={handleLimpar}>
            <X size={16} /> Limpar
          </button>
          <button className={styles.btnSearch} onClick={handleBuscar}>
            <Search size={16} /> Buscar
          </button>
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

      {/* Paginação */}
      {!loading && filteredList.length > 0 && (
        <div className={styles.paginationBar}>
          <div className={styles.paginationControls}>
            <button
              className={styles.paginationBtn}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              title="Página Anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <span className={styles.pageInfo}>
              Página {page + 1} de {totalPages || 1}
            </span>

            <button
              className={styles.paginationBtn}
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
              title="Próxima Página"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className={styles.pageSizeSelector}>
            <label>Itens por página:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
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
