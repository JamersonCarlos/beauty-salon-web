import { useState, useEffect } from 'react';
import {
  Plus,
  ShoppingBag,
  FileText,
  Ban,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Filter,
} from 'lucide-react';
import styles from './Vendas.module.css';
import { CardVenda } from '../../components/CardVenda';
import { ModalRecibo } from '../../components/ModalRecibo/ModalRecibo';
import { VendaService } from '../../services/VendaService';
import {
  type VendaRequestDTO,
  type VendaResponseDTO,
  type ReciboResponseDTO,
  type VendaFiltroDTO, // Importando DTO de filtro
} from '../../models/Venda';

export function Vendas() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reciboSelecionado, setReciboSelecionado] =
    useState<ReciboResponseDTO | null>(null);

  // --- Estados de Dados e Paginação ---
  const [vendas, setVendas] = useState<VendaResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // --- Estado dos Filtros ---
  const [filtros, setFiltros] = useState<VendaFiltroDTO>({
    dataInicio: '',
    dataFim: '',
    valorMin: undefined,
    valorMax: undefined,
    status: undefined,
  });

  // Carrega vendas ao montar ou trocar de página
  useEffect(() => {
    carregarVendas(page);
  }, [page]);

  // Função centralizada de carregamento
  // Aceita pageParam opcional para quando resetamos a página manualmente
  const carregarVendas = async (pageParam: number = page) => {
    try {
      setLoading(true);

      const filtroPayload: VendaFiltroDTO = {
        ...filtros,
        page: pageParam,
        size: pageSize,
      };

      const data = await VendaService.listarVendas(filtroPayload);

      setVendas(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Erro ao carregar vendas', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers de Filtro ---

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : value, // Se vazio, undefined para não enviar na URL
    }));
  };

  const handleBuscar = () => {
    setPage(0); // Volta para 1ª página
    carregarVendas(0); // Força busca imediata na página 0
  };

  const handleLimpar = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      valorMin: undefined,
      valorMax: undefined,
      status: undefined,
    });
    setPage(0);
    // Pequeno timeout ou chamar direto passando o objeto vazio para garantir limpeza imediata
    VendaService.listarVendas({ page: 0, size: pageSize }).then((data) => {
      setVendas(data.content);
      setTotalPages(data.totalPages);
    });
  };

  // --- Handlers de Ação (Criar, Cancelar, Recibo) ---

  const handleCreateSale = async (vendaRequest: VendaRequestDTO) => {
    try {
      await VendaService.registrarVenda(vendaRequest);
      setPage(0);
      handleLimpar(); // Opcional: limpar filtros ao criar nova venda para vê-la na lista
    } catch (error) {
      alert('Erro ao criar venda');
    }
  };

  const handleVerRecibo = async (id: string) => {
    try {
      const dadosRecibo = await VendaService.obterRecibo(id);
      setReciboSelecionado(dadosRecibo);
    } catch (error) {
      alert('Erro ao carregar recibo');
    }
  };

  const handleCancelar = async (venda: VendaResponseDTO) => {
    if (venda.status === 'CANCELADA') return;
    if (confirm('Tem certeza que deseja cancelar esta venda?')) {
      try {
        await VendaService.cancelarVenda(venda.id);
        carregarVendas(page); // Recarrega mantendo página e filtros atuais
        alert('Venda cancelada com sucesso!');
      } catch (error) {
        alert('Erro ao cancelar venda');
      }
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Vendas</h1>
          <p className={styles.subtitle}>Gerenciamento e histórico</p>
        </div>
        <button
          className={styles.headerBtn}
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={20} /> Nova Venda
        </button>
      </div>

      {/* --- ÁREA DE FILTROS --- */}
      <div className={styles.filterBar}>
        <div className={styles.filterHeader}>
          <Filter size={16} /> Filtros de Pesquisa
        </div>

        <div className={styles.filterGrid}>
          {/* Data Início */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Data Início</label>
            <input
              type="date"
              name="dataInicio"
              className={styles.filterInput}
              value={filtros.dataInicio || ''}
              onChange={handleInputChange}
            />
          </div>

          {/* Data Fim */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Data Fim</label>
            <input
              type="date"
              name="dataFim"
              className={styles.filterInput}
              value={filtros.dataFim || ''}
              onChange={handleInputChange}
            />
          </div>

          {/* Status */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select
              name="status"
              className={styles.filterSelect}
              value={filtros.status || ''}
              onChange={handleInputChange}
            >
              <option value="">Todos</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          {/* Valor Min */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Valor Min (R$)</label>
            <input
              type="number"
              name="valorMin"
              placeholder="0,00"
              className={styles.filterInput}
              value={filtros.valorMin || ''}
              onChange={handleInputChange}
            />
          </div>

          {/* Valor Max */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Valor Max (R$)</label>
            <input
              type="number"
              name="valorMax"
              placeholder="0,00"
              className={styles.filterInput}
              value={filtros.valorMax || ''}
              onChange={handleInputChange}
            />
          </div>
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

      {/* --- LISTA DE VENDAS --- */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#666', marginTop: 40 }}>
          Carregando vendas...
        </p>
      ) : vendas.length === 0 ? (
        <div className={styles.emptyStateContainer}>
          <div className={styles.iconCircle}>
            <ShoppingBag size={32} color="#bb8d6a" strokeWidth={1.5} />
          </div>
          <h2 className={styles.emptyStateTitle}>
            Nenhum resultado encontrado
          </h2>
          <p className={styles.emptyStateText}>
            Tente ajustar os filtros ou registre uma nova venda.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.salesList}>
            {vendas.map((venda) => {
              const isCancelada = venda.status === 'CANCELADA';
              return (
                <div key={venda.id} className={styles.saleCard}>
                  {/* Cabeçalho */}
                  <div className={styles.cardHeader}>
                    <div className={styles.dateInfo}>
                      <span className={styles.dateText}>
                        {new Date(venda.dataVenda).toLocaleDateString()} às{' '}
                        {new Date(venda.dataVenda).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className={styles.idText}>
                        #{venda.id.substring(0, 8)}
                      </span>
                    </div>
                    <span
                      className={`${styles.statusBadge} ${isCancelada ? styles.statusCancelada : styles.statusConcluida}`}
                    >
                      {isCancelada ? 'Cancelada' : 'Concluída'}
                    </span>
                  </div>

                  {/* Corpo */}
                  <div className={styles.cardBody}>
                    <div className={styles.paymentInfo}>
                      <CreditCard size={16} />
                      <span>
                        {venda.formaPagamento
                          ? venda.formaPagamento.replace('_', ' ')
                          : '-'}
                      </span>
                    </div>
                    <div className={styles.valuesInfo}>
                      <div className={styles.totalValue}>
                        {formatCurrency(venda.valorTotal)}
                      </div>
                      {venda.desconto > 0 && (
                        <div className={styles.discountValue}>
                          - {formatCurrency(venda.desconto)} desc.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rodapé */}
                  <div className={styles.cardFooter}>
                    <button
                      className={styles.btnAction}
                      onClick={() => handleVerRecibo(venda.id)}
                    >
                      <FileText size={16} /> Recibo
                    </button>
                    <button
                      className={`${styles.btnAction} ${isCancelada ? styles.btnDisabled : styles.btnCancel}`}
                      onClick={() => handleCancelar(venda)}
                      disabled={isCancelada}
                    >
                      <Ban size={16} /> {isCancelada ? 'Cancelado' : 'Cancelar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BARRA DE PAGINAÇÃO */}
          <div className={styles.paginationBar}>
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
        </>
      )}

      {isCreateModalOpen && (
        <CardVenda
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateSale}
        />
      )}
      {reciboSelecionado && (
        <ModalRecibo
          data={reciboSelecionado}
          onClose={() => setReciboSelecionado(null)}
        />
      )}
    </div>
  );
}
