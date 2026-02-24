import { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Clock,
  DollarSign,
  Scissors,
  Sparkles,
  Palette,
  Feather,
  Smile,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  ServicoService,
  type ServicoRequestDTO,
  type ServicoFiltroDTO,
} from '../../services/ServicoService';
import { Servico } from '../../models/Servico';
import { CardServico } from '../../components/CardServico';
import type { ServiceFormData } from '../../components/CardServico';
import styles from './Servicos.module.css';
import { CategoriaServico } from '../../enums/CategoriaServico';

const CategoryMap: Record<string, { label: string; icon: any }> = {
  [CategoriaServico.CABELO]: { label: 'Cabelo', icon: Scissors },
  [CategoriaServico.UNHAS]: { label: 'Unhas', icon: Sparkles },
  [CategoriaServico.ESTETICA]: { label: 'Estética', icon: Feather },
  [CategoriaServico.MAQUIAGEM]: { label: 'Maquiagem', icon: Palette },
  [CategoriaServico.SOBRANCELHAS]: { label: 'Sobrancelhas', icon: Smile },
  [CategoriaServico.MASSAGEM]: { label: 'Massagem', icon: Feather },
  [CategoriaServico.DEPILACAO]: { label: 'Depilação', icon: Sparkles },
  [CategoriaServico.OUTRO]: { label: 'Outros', icon: Sparkles },
  DEFAULT: { label: 'Outros', icon: Sparkles },
};

export function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States for Edit/Menu Logic
  const [editingService, setEditingService] = useState<ServiceFormData | null>(
    null
  );
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  // Paginação
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  // Filtros
  const [filtros, setFiltros] = useState<ServicoFiltroDTO>({
    nome: '',
    categoria: undefined,
    ativo: undefined,
    precoMin: undefined,
    precoMax: undefined,
  });

  // For filters UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

  // Ref to close menu when clicking outside
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    carregarServicos(page);

    // Close menu on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [page, pageSize]);

  const carregarServicos = async (pageParam: number = page) => {
    try {
      setLoading(true);
      const filtroPayload: ServicoFiltroDTO = {
        ...filtros,
        page: pageParam,
        size: pageSize,
      };
      const data = await ServicoService.listarTodos(filtroPayload);
      setServicos(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error('Erro ao carregar serviços', error);
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
    carregarServicos(0);
  };

  const handleLimpar = () => {
    setFiltros({
      nome: '',
      categoria: undefined,
      ativo: undefined,
      precoMin: undefined,
      precoMax: undefined,
    });
    setSearchTerm('');
    setSelectedCategory('TODAS');
    setPage(0);
    ServicoService.listarTodos({ page: 0, size: pageSize }).then((data) => {
      setServicos(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    });
  };

  // --- ACTIONS ---

  const handleOpenCreateModal = () => {
    setEditingService(null); // Clear editing data
    setIsModalOpen(true);
  };

  const handleEditClick = (servico: Servico) => {
    // Convert API model to Form data structure
    const formData: ServiceFormData = {
      id: servico.id,
      name: servico.nome,
      categoriaServico: servico.categoriaServico, // Ensure Enum mapping is correct
      description: servico.descricao,
      price: servico.preco,
      duration: servico.duracaoInMin,
      commission: 30, // Mock value if not in API
      isActive: servico.ativo,
    };

    setEditingService(formData);
    setMenuOpenId(null); // Close menu
    setIsModalOpen(true); // Open modal
  };

  const handleDeleteClick = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await ServicoService.excluir(id);
        setMenuOpenId(null);
        carregarServicos(page); // Refresh list
      } catch (error) {
        alert('Erro ao excluir serviço.');
      }
    }
  };

  const handleSaveService = async (formData: ServiceFormData) => {
    try {
      const dto: ServicoRequestDTO = {
        nome: formData.name,
        categoriaServico: formData.categoriaServico,
        preco: formData.price,
        descricao: formData.description,
        duracaoInMin: formData.duration,
        ativo: formData.isActive,
      };

      if (formData.id) {
        // UPDATE
        await ServicoService.atualizar(formData.id, dto);
      } else {
        // CREATE
        await ServicoService.criar(dto);
      }

      await carregarServicos(page);
      setIsModalOpen(false);
    } catch (error) {
      alert('Erro ao salvar serviço.');
    }
  };

  // --- FILTER & RENDER LOGIC ---

  const filteredList = servicos; // Já filtrado pelo backend

  const groupedServices = filteredList.reduce(
    (acc, servico) => {
      const cat = servico.categoriaServico || 'OUTRO';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(servico);
      return acc;
    },
    {} as Record<string, Servico[]>
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Serviços</h1>
          <p className={styles.subtitle}>
            {totalElements} serviços cadastrados
          </p>
        </div>
        <button className={styles.btnNew} onClick={handleOpenCreateModal}>
          <Plus size={20} />
          Novo Serviço
        </button>
      </div>

      {/* Filtros Expandidos */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            name="nome"
            placeholder="Buscar serviços..."
            className={styles.searchInput}
            value={filtros.nome || ''}
            onChange={handleInputChange}
          />
        </div>

        <div className={styles.filterGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Categoria</label>
            <select
              name="categoria"
              className={styles.filterSelect}
              value={filtros.categoria || ''}
              onChange={handleInputChange}
            >
              <option value="">Todas</option>
              {Object.keys(CategoryMap).map(
                (key) =>
                  key !== 'DEFAULT' && (
                    <option key={key} value={key}>
                      {CategoryMap[key].label}
                    </option>
                  )
              )}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select
              name="ativo"
              className={styles.filterSelect}
              value={filtros.ativo?.toString() || ''}
              onChange={handleInputChange}
            >
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
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
        <p className={styles.loadingText}>Carregando serviços...</p>
      ) : (
        <div className={styles.contentArea}>
          {Object.entries(groupedServices).map(([categoryKey, items]) => {
            const catInfo = CategoryMap[categoryKey] || CategoryMap['DEFAULT'];
            const CatIcon = catInfo.icon;

            return (
              <div key={categoryKey} className={styles.categorySection}>
                <div className={styles.categoryHeader}>
                  <div className={styles.catTitleGroup}>
                    <CatIcon size={24} className={styles.catIcon} />
                    <h2>{catInfo.label}</h2>
                  </div>
                  <span className={styles.badge}>{items.length}</span>
                </div>

                <div className={styles.grid}>
                  {items.map((servico) => (
                    <div key={servico.id} className={styles.card}>
                      <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>{servico.nome}</h3>

                        {/* MENU ACTIONS */}
                        <div className={styles.menuWrapper}>
                          <button
                            className={styles.moreBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(
                                menuOpenId === servico.id ? null : servico.id
                              );
                            }}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {/* DROPDOWN MENU */}
                          {menuOpenId === servico.id && (
                            <div className={styles.dropdownMenu} ref={menuRef}>
                              <button
                                onClick={() => handleEditClick(servico)}
                                className={styles.menuItem}
                              >
                                <Pencil size={16} /> Editar
                              </button>
                              <button
                                onClick={() => handleDeleteClick(servico.id)}
                                className={`${styles.menuItem} ${styles.menuDelete}`}
                              >
                                <Trash2 size={16} /> Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className={styles.cardDesc}>
                        {servico.descricao || 'Sem descrição definida.'}
                      </p>

                      <div className={styles.cardFooter}>
                        <div className={styles.infoRow}>
                          <Clock size={16} className={styles.infoIcon} />
                          <span>{servico.duracaoInMin} min</span>
                        </div>
                        <div className={`${styles.infoRow} ${styles.priceRow}`}>
                          <DollarSign size={16} className={styles.priceIcon} />
                          <span>{formatCurrency(servico.preco)}</span>
                        </div>
                      </div>

                      <div className={styles.commissionTag}>Comissão: 30%</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredList.length === 0 && (
            <div className={styles.emptyState}>Nenhum serviço encontrado.</div>
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
        <CardServico
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveService}
          initialData={editingService} // PASS DATA FOR EDIT
        />
      )}
    </div>
  );
}
