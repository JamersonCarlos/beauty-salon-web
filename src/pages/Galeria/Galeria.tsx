import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Images,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Search,
} from 'lucide-react';
import {
  FotoGaleriaService,
  type GaleriaFiltroDTO,
} from '../../services/fotoGaleriaService';
import { ServicoService } from '../../services/ServicoService';
import { GaleriaUpload } from '../../components/GaleriaUpload';
import type { FotoGaleria } from '../../models/FotoGaleria';
import type { Servico } from '../../models/Servico';
import styles from './Galeria.module.css';

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function Galeria() {
  // --- Dados ---
  const [fotos, setFotos] = useState<FotoGaleria[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);

  // --- UI ---
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<
    number | string | null
  >(null);

  // --- Paginação ---
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 18;

  // --- Filtros ---
  const [filtroServicoId, setFiltroServicoId] = useState<string>('');
  const [filtrosAplicados, setFiltrosAplicados] = useState<GaleriaFiltroDTO>(
    {}
  );

  // ---------------------------------------------------------------------------
  // Carregamento inicial dos selects
  // ---------------------------------------------------------------------------
  useEffect(() => {
    ServicoService.listarTodos({ ativo: true, size: 100 }).then((p) =>
      setServicos(p.content)
    );
  }, []);

  // ---------------------------------------------------------------------------
  // Busca fotos da galeria
  // ---------------------------------------------------------------------------
  const carregarFotos = useCallback(
    async (pageParam: number, filtros: GaleriaFiltroDTO) => {
      try {
        setLoading(true);
        const data = await FotoGaleriaService.listar({
          ...filtros,
          page: pageParam,
          size: PAGE_SIZE,
        });
        setFotos(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (error) {
        console.error('Erro ao carregar galeria', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    carregarFotos(page, filtrosAplicados);
  }, [page, filtrosAplicados, carregarFotos]);

  // ---------------------------------------------------------------------------
  // Handlers – Filtro
  // ---------------------------------------------------------------------------
  const handleBuscar = () => {
    const filtros: GaleriaFiltroDTO = {};
    if (filtroServicoId) filtros.servicoId = Number(filtroServicoId);
    setFiltrosAplicados(filtros);
    setPage(0);
  };

  const handleLimparFiltros = () => {
    setFiltroServicoId('');
    setFiltrosAplicados({});
    setPage(0);
  };

  const temFiltroAtivo = Object.keys(filtrosAplicados).length > 0;

  // ---------------------------------------------------------------------------
  // Handlers – Delete
  // ---------------------------------------------------------------------------
  const handleConfirmDelete = async () => {
    if (confirmDeleteId === null) return;
    try {
      await FotoGaleriaService.excluir(confirmDeleteId);
      setConfirmDeleteId(null);
      carregarFotos(page, filtrosAplicados);
    } catch (error) {
      console.error('Erro ao excluir foto', error);
    }
  };

  // ---------------------------------------------------------------------------
  // Handlers – Upload modal
  // ---------------------------------------------------------------------------
  const handleUploadSuccess = () => {
    setIsModalOpen(false);
    setPage(0);
    carregarFotos(0, filtrosAplicados);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className={styles.container}>
      {/* ── Cabeçalho ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Galeria de Fotos</h1>
          <p className={styles.subtitle}>
            {totalElements > 0
              ? `${totalElements} foto${totalElements > 1 ? 's' : ''} no portfólio`
              : 'Portfólio do salão'}
          </p>
        </div>
        <button className={styles.btnNew} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Nova Foto
        </button>
      </div>

      {/* ── Barra de filtros ── */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <Filter size={16} className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={filtroServicoId}
            onChange={(e) => setFiltroServicoId(e.target.value)}
          >
            <option value="">Todos os serviços</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>

        <button className={styles.btnBuscar} onClick={handleBuscar}>
          <Search size={16} />
          Filtrar
        </button>

        {temFiltroAtivo && (
          <button className={styles.btnLimpar} onClick={handleLimparFiltros}>
            <X size={16} />
            Limpar
          </button>
        )}
      </div>

      {/* ── Conteúdo ── */}
      {loading ? (
        <div className={styles.emptyState}>
          <div className={styles.spinner} />
          <p>Carregando galeria…</p>
        </div>
      ) : fotos.length === 0 ? (
        <div className={styles.emptyState}>
          <Images size={56} className={styles.emptyIcon} />
          <p className={styles.emptyText}>Nenhuma foto encontrada.</p>
          <p className={styles.emptyHint}>
            Clique em "Nova Foto" para adicionar ao portfólio.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {fotos.map((foto) => (
            <div key={foto.id} className={styles.card}>
              {/* Imagem */}
              <div className={styles.cardImageWrapper}>
                <img
                  src={foto.imagemUrl}
                  alt={foto.titulo}
                  className={styles.cardImage}
                  loading="lazy"
                />
                {/* Overlay com botão de deletar */}
                <div className={styles.cardOverlay}>
                  <button
                    className={styles.btnDelete}
                    onClick={() => setConfirmDeleteId(foto.id)}
                    aria-label={`Excluir foto: ${foto.titulo}`}
                    title="Excluir foto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Informações */}
              <div className={styles.cardInfo}>
                <p className={styles.cardTitle}>{foto.titulo}</p>
                {foto.servico && (
                  <span className={styles.badgeServico}>
                    {foto.servico.nome}
                  </span>
                )}
                {foto.cliente && (
                  <span className={styles.badgeCliente}>
                    {foto.cliente.name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Paginação ── */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Página anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <span className={styles.pageInfo}>
            Página {page + 1} de {totalPages}
          </span>

          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            aria-label="Próxima página"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ── Modal de Upload ── */}
      {isModalOpen && (
        <GaleriaUpload
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* ── Confirmação de exclusão ── */}
      {confirmDeleteId !== null && (
        <div
          className={styles.confirmOverlay}
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.confirmTitle}>Excluir foto?</h3>
            <p className={styles.confirmText}>
              Esta ação não pode ser desfeita. A imagem será removida
              permanentemente do portfólio.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.btnConfirmCancel}
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancelar
              </button>
              <button
                className={styles.btnConfirmDelete}
                onClick={handleConfirmDelete}
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
