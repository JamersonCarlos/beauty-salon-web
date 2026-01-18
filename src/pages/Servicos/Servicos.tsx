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
} from 'lucide-react';
import {
  ServicoService,
  type ServicoRequestDTO,
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

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

  // Ref to close menu when clicking outside
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    carregarServicos();

    // Close menu on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const carregarServicos = async () => {
    try {
      setLoading(true);
      const data = await ServicoService.listarTodos();
      setServicos(data);
    } catch (error) {
      console.error('Erro ao carregar serviços', error);
    } finally {
      setLoading(false);
    }
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
        carregarServicos(); // Refresh list
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

      await carregarServicos();
      setIsModalOpen(false);
    } catch (error) {
      alert('Erro ao salvar serviço.');
    }
  };

  // --- FILTER & RENDER LOGIC ---

  const filteredList = servicos.filter((s) => {
    const matchesSearch = s.nome
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'TODAS' || s.categoriaServico === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            {servicos.length} serviços cadastrados
          </p>
        </div>
        <button className={styles.btnNew} onClick={handleOpenCreateModal}>
          <Plus size={20} />
          Novo Serviço
        </button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Buscar serviços..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.selectWrapper}>
          <Filter className={styles.filterIcon} size={18} />
          <select
            className={styles.categorySelect}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="TODAS">Todas categorias</option>
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
