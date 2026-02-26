import { useEffect, useState } from 'react';
import {
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { AuditoriaService } from '../../services/AuditoriaService';
import type { LogFiltroDTO, LogOperacao } from '../../models/LogOperacao';
import styles from './Auditoria.module.css';

const ACOES = ['CREATE', 'UPDATE', 'DELETE', 'READ'] as const;

const ACAO_LABELS: Record<string, string> = {
  CREATE: 'Criação',
  UPDATE: 'Atualização',
  DELETE: 'Exclusão',
  READ: 'Leitura',
};

function acaoBadgeClass(acao: string, s: Record<string, string>) {
  const map: Record<string, string> = {
    CREATE: s.acaoCREATE,
    UPDATE: s.acaoUPDATE,
    DELETE: s.acaoDELETE,
    READ: s.acaoREAD,
  };
  return `${s.acaoBadge} ${map[acao] ?? ''}`;
}

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    return (
      d.toLocaleDateString('pt-BR') +
      ' ' +
      d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
  } catch {
    return iso;
  }
}

function formatTempo(ms?: number) {
  if (ms === undefined || ms === null) return '-';
  return `${ms} ms`;
}

function tempoClass(ms?: number, s?: Record<string, string>) {
  if (!ms || !s) return '';
  if (ms < 200) return s.tempoRapido;
  if (ms < 1000) return s.tempoMedio;
  return s.tempoLento;
}

function prettyJson(raw?: string) {
  if (!raw) return '-';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function Auditoria() {
  const [logs, setLogs] = useState<LogOperacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [filtros, setFiltros] = useState<LogFiltroDTO>({
    entidade: '',
    acao: '',
    username: '',
    ipOrigem: '',
    dataInicio: '',
    dataFim: '',
  });

  const [logDetalhes, setLogDetalhes] = useState<LogOperacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregarLogs = async (pageParam = page) => {
    try {
      setLoading(true);
      setErro(null);
      const data = await AuditoriaService.listar({
        ...filtros,
        page: pageParam,
        size: pageSize,
        sort: 'dataHora',
        direction: 'desc',
      });
      setLogs(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
    } catch (err) {
      console.error('Erro ao carregar logs de auditoria', err);
      setErro(
        'Não foi possível carregar os logs. Verifique a conexão com o servidor.'
      );
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLogs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

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
    carregarLogs(0);
  };

  const handleLimpar = () => {
    const limpo: LogFiltroDTO = {
      entidade: '',
      acao: '',
      username: '',
      ipOrigem: '',
      dataInicio: '',
      dataFim: '',
    };
    setFiltros(limpo);
    setPage(0);
    carregarLogs(0);
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Auditoria</h1>
          <p className={styles.subtitle}>
            {totalElements.toLocaleString('pt-BR')} registros de operações
          </p>
        </div>
        <ShieldCheck
          size={36}
          strokeWidth={1.5}
          color="var(--wood-medium, #8d6e63)"
        />
      </div>

      {/* FILTROS */}
      <div className={styles.filterBar}>
        <div className={styles.filterHeader}>
          <Filter size={16} /> Filtros de Pesquisa
        </div>

        <div className={styles.filterGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Entidade</label>
            <input
              type="text"
              name="entidade"
              placeholder="Ex: Produto, Servico"
              className={styles.filterInput}
              value={filtros.entidade || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Ação</label>
            <select
              name="acao"
              className={styles.filterSelect}
              value={filtros.acao || ''}
              onChange={handleInputChange}
            >
              <option value="">Todas</option>
              {ACOES.map((a) => (
                <option key={a} value={a}>
                  {ACAO_LABELS[a]}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Usuário</label>
            <input
              type="text"
              name="username"
              placeholder="Ex: admin"
              className={styles.filterInput}
              value={filtros.username || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>IP de Origem</label>
            <input
              type="text"
              name="ipOrigem"
              placeholder="Ex: 192.168.1.1"
              className={styles.filterInput}
              value={filtros.ipOrigem || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Data/Hora Início</label>
            <input
              type="datetime-local"
              name="dataInicio"
              className={styles.filterInput}
              value={filtros.dataInicio || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Data/Hora Fim</label>
            <input
              type="datetime-local"
              name="dataFim"
              className={styles.filterInput}
              value={filtros.dataFim || ''}
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

      {/* TABELA */}
      {erro && (
        <div className={styles.erroState}>
          <p>{erro}</p>
          <button
            className={styles.btnSearch}
            onClick={() => carregarLogs(page)}
          >
            <Search size={16} /> Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <p className={styles.loadingText}>Carregando logs...</p>
      ) : erro ? null : logs.length === 0 ? (
        <div className={styles.emptyState}>
          <ShieldCheck size={48} strokeWidth={1} color="#ccc" />
          <p>Nenhum log encontrado para os filtros aplicados.</p>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <span>Entidade</span>
              <span>Ação</span>
              <span>Usuário</span>
              <span>IP Origem</span>
              <span>Data / Hora</span>
              <span>Tempo</span>
              <span></span>
            </div>

            {logs.map((log) => (
              <div
                key={log.id}
                className={styles.tableRow}
                onClick={() => setLogDetalhes(log)}
              >
                <div className={styles.entidadeCell}>
                  <span className={styles.entidadeNome}>{log.entidade}</span>
                  <span className={styles.entidadeId}>{log.id}</span>
                </div>

                <div>
                  <span className={acaoBadgeClass(log.acao, styles)}>
                    {ACAO_LABELS[log.acao] ?? log.acao}
                  </span>
                </div>

                <span className={styles.usernameCell}>{log.username}</span>

                <span className={styles.ipCell}>{log.ipOrigem || '-'}</span>

                <span className={styles.dataCell}>
                  {formatDateTime(log.dataHora)}
                </span>

                <span
                  className={`${styles.tempoCell} ${tempoClass(log.tempoExecucao, styles)}`}
                >
                  {formatTempo(log.tempoExecucao)}
                </span>

                <div>
                  <button
                    className={styles.btnDetalhes}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLogDetalhes(log);
                    }}
                    title="Ver detalhes"
                  >
                    <FileText size={14} /> Ver
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINAÇÃO */}
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
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* MODAL DE DETALHES */}
      {logDetalhes && (
        <div
          className={styles.modalOverlay}
          onClick={() => setLogDetalhes(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Detalhes do Log</h2>
              <button
                className={styles.modalClose}
                onClick={() => setLogDetalhes(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalInfoGrid}>
              <div className={styles.modalInfoItem}>
                <span className={styles.modalInfoLabel}>ID</span>
                <span
                  className={styles.modalInfoValue}
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                >
                  {logDetalhes.id}
                </span>
              </div>
              <div className={styles.modalInfoItem}>
                <span className={styles.modalInfoLabel}>Entidade</span>
                <span className={styles.modalInfoValue}>
                  {logDetalhes.entidade}
                </span>
              </div>
              <div className={styles.modalInfoItem}>
                <span className={styles.modalInfoLabel}>Ação</span>
                <span>
                  <span className={acaoBadgeClass(logDetalhes.acao, styles)}>
                    {ACAO_LABELS[logDetalhes.acao] ?? logDetalhes.acao}
                  </span>
                </span>
              </div>
              <div className={styles.modalInfoItem}>
                <span className={styles.modalInfoLabel}>Usuário</span>
                <span className={styles.modalInfoValue}>
                  {logDetalhes.username}
                </span>
              </div>
              <div className={styles.modalInfoItem}>
                <span className={styles.modalInfoLabel}>Data / Hora</span>
                <span className={styles.modalInfoValue}>
                  {formatDateTime(logDetalhes.dataHora)}
                </span>
              </div>
              <div className={styles.modalInfoItem}>
                <span className={styles.modalInfoLabel}>Tempo de Execução</span>
                <span
                  className={`${styles.modalInfoValue} ${tempoClass(logDetalhes.tempoExecucao, styles)}`}
                >
                  {formatTempo(logDetalhes.tempoExecucao)}
                </span>
              </div>
              <div className={styles.modalInfoItem}>
                <span className={styles.modalInfoLabel}>IP de Origem</span>
                <span
                  className={styles.modalInfoValue}
                  style={{ fontFamily: 'monospace' }}
                >
                  {logDetalhes.ipOrigem || '-'}
                </span>
              </div>
              <div className={styles.modalInfoItem}>
                <span className={styles.modalInfoLabel}>User Agent</span>
                <span
                  className={styles.modalInfoValue}
                  style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}
                >
                  {logDetalhes.userAgent || '-'}
                </span>
              </div>
            </div>

            {logDetalhes.detalhes && (
              <div>
                <p className={styles.modalJsonTitle}>Detalhes (JSON)</p>
                <pre className={styles.modalJson}>
                  {prettyJson(logDetalhes.detalhes)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
