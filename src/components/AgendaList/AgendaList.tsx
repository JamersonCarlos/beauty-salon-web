// src/components/AgendaList/AgendaList.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import styles from './AgendaList.module.css';
import { AgendaService } from '../../services/AgendaService';
import type { AgendaResponse } from '../../types/agenda';

type Filtro = '' | 'HOJE' | 'MES';

const FILTRO_LABELS: Record<Filtro, string> = {
  '': 'Todos',
  HOJE: 'Hoje',
  MES: 'Este Mês',
};

const STATUS_CLASS: Record<string, string> = {
  AGENDADO: styles.statusAgendado,
  FINALIZADO: styles.statusFinalizado,
  CANCELADO: styles.statusCancelado,
};

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function AgendaList() {
  const navigate = useNavigate();

  const [agendas, setAgendas] = useState<AgendaResponse[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const carregar = useCallback(
    async (pageParam: number, filtroParam: Filtro) => {
      try {
        setLoading(true);
        const data = await AgendaService.listarAgendas(
          filtroParam || undefined,
          pageParam,
          20
        );
        setAgendas(data.content);
        setTotalPages(data.totalPages);
      } catch {
        // erro silencioso — em produção use um toast
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    carregar(page, filtro);
  }, [page, filtro, carregar]);

  const handleFiltro = (novoFiltro: Filtro) => {
    setFiltro(novoFiltro);
    setPage(0);
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir este agendamento?')) return;
    try {
      setDeletingId(id);
      await AgendaService.deletarAgenda(id);
      await carregar(page, filtro);
    } catch {
      alert('Erro ao excluir agendamento.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <CalendarDays size={22} className={styles.titleIcon} />
          <h1 className={styles.title}>Agendamentos</h1>
        </div>

        <div className={styles.actions}>
          {/* Filtros */}
          <div className={styles.filtros}>
            {(Object.keys(FILTRO_LABELS) as Filtro[]).map((f) => (
              <button
                key={f}
                className={`${styles.filtroBtn} ${filtro === f ? styles.filtroAtivo : ''}`}
                onClick={() => handleFiltro(f)}
              >
                {FILTRO_LABELS[f]}
              </button>
            ))}
          </div>

          <button
            className={styles.btnNovo}
            onClick={() => navigate('/agendamentos/novo')}
          >
            <Plus size={16} />
            Novo
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.feedback}>Carregando...</div>
        ) : agendas.length === 0 ? (
          <div className={styles.feedback}>Nenhum agendamento encontrado.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Cliente</th>
                <th>Serviços</th>
                <th>Duração</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {agendas.map((agenda) => (
                <tr key={agenda.id}>
                  <td>{formatDateTime(agenda.dataHoraInicio)}</td>
                  <td>
                    <span className={styles.clienteName}>
                      {agenda.user.name}
                    </span>
                    <span className={styles.clienteUsername}>
                      @{agenda.user.username}
                    </span>
                  </td>
                  <td>
                    <div className={styles.servicosList}>
                      {agenda.servicos.map((s) => (
                        <span key={s.id} className={styles.servicoTag}>
                          {s.nome}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{agenda.duracaoTotal} min</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${STATUS_CLASS[agenda.status] ?? ''}`}
                    >
                      {agenda.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        className={styles.btnEdit}
                        title="Editar"
                        onClick={() =>
                          navigate(`/agendamentos/${agenda.id}/editar`)
                        }
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className={styles.btnDelete}
                        title="Excluir"
                        disabled={deletingId === agenda.id}
                        onClick={() => handleExcluir(agenda.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.pageInfo}>
            Página {page + 1} de {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
