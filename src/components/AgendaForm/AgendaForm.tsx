// src/components/AgendaForm/AgendaForm.tsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, Save, ArrowLeft, Loader2, Search } from 'lucide-react';
import styles from './AgendaForm.module.css';
import { AgendaService } from '../../services/AgendaService';
import { ServicoService } from '../../services/ServicoService';
import type { ServicoResumo } from '../../types/agenda';
import type { User } from '../../types/user';
import { StatusAgenda } from '../../types/agenda';

// ---------------------------------------------------------------------------
// Zod Schema
// ---------------------------------------------------------------------------

const agendaSchema = z.object({
  username: z.string().min(1, 'Selecione um cliente'),
  servicos: z.array(z.number()).min(1, 'Selecione pelo menos um serviço'),
  dataHoraInicio: z.string().min(1, 'Informe a data e hora'),
  status: z.enum(['AGENDADO', 'FINALIZADO', 'CANCELADO']),
  observacoes: z.string(),
});

type AgendaFormValues = z.infer<typeof agendaSchema>;

// ---------------------------------------------------------------------------
// Utilitário: formata datetime-local → ISO 8601 com segundos
// ---------------------------------------------------------------------------

function toIso(datetimeLocal: string): string {
  // Input retorna "YYYY-MM-DDTHH:mm" — adicionamos ":ss"
  if (!datetimeLocal) return '';
  return datetimeLocal.length === 16 ? `${datetimeLocal}:00` : datetimeLocal;
}

/** Converte ISO (ou variante) para o formato aceito pelo input datetime-local */
function fromIso(iso: string): string {
  if (!iso) return '';
  // Remove segundos e frações se existirem: "2025-01-15T14:30:00" → "2025-01-15T14:30"
  return iso.slice(0, 16);
}

// ---------------------------------------------------------------------------
// Hook de debounce
// ---------------------------------------------------------------------------

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function AgendaForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  // --- States de dados auxiliares ---
  const [servicos, setServicos] = useState<ServicoResumo[]>([]);
  const [loadingPage, setLoadingPage] = useState(isEdit);

  // --- States da busca de usuário ---
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState<User[]>([]);
  const [selectedUserLabel, setSelectedUserLabel] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(userQuery, 350);

  // --- RHF ---
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AgendaFormValues>({
    resolver: zodResolver(agendaSchema),
    defaultValues: {
      username: '',
      servicos: [],
      dataHoraInicio: '',
      status: 'AGENDADO',
      observacoes: '',
    },
  });

  const selectedIds = watch('servicos');

  // --- Carrega serviços e agenda (modo edição) ---
  useEffect(() => {
    const init = async () => {
      try {
        const servicosPage = await ServicoService.listarTodos({ size: 200 });
        setServicos(
          servicosPage.content.map((s) => ({
            id: s.id,
            nome: s.nome,
            preco: s.preco ?? 0,
            duracaoInMin: s.duracaoInMin ?? 0,
            categoria: String(s.categoriaServico ?? ''),
          }))
        );

        if (isEdit && id) {
          const agenda = await AgendaService.buscarAgendaPorId(Number(id));
          reset({
            username: agenda.user.username,
            servicos: agenda.servicos.map((s) => s.id),
            dataHoraInicio: fromIso(agenda.dataHoraInicio),
            status: agenda.status as AgendaFormValues['status'],
            observacoes: agenda.observacoes ?? '',
          });
          setSelectedUserLabel(
            `${agenda.user.name} (@${agenda.user.username})`
          );
          setUserQuery(`${agenda.user.name} (@${agenda.user.username})`);
        }
      } finally {
        setLoadingPage(false);
      }
    };
    init();
  }, [id, isEdit, reset]);

  // --- Busca usuários com debounce ---
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery === selectedUserLabel) {
      setUserResults([]);
      return;
    }
    const search = async () => {
      try {
        setLoadingUsers(true);
        const result = await AgendaService.buscarUsuarios(
          undefined,
          debouncedQuery,
          0,
          8
        );
        setUserResults(result.content);
        setShowDropdown(result.content.length > 0);
      } catch {
        setUserResults([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    search();
  }, [debouncedQuery, selectedUserLabel]);

  // --- Fecha dropdown ao clicar fora ---
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectUser = useCallback(
    (user: User) => {
      const label = `${user.name} (@${user.username})`;
      setValue('username', user.username, { shouldValidate: true });
      setUserQuery(label);
      setSelectedUserLabel(label);
      setShowDropdown(false);
      setUserResults([]);
    },
    [setValue]
  );

  // --- Toggle de serviço no array ---
  const toggleServico = useCallback(
    (servicoId: number) => {
      const current = selectedIds ?? [];
      const next = current.includes(servicoId)
        ? current.filter((x) => x !== servicoId)
        : [...current, servicoId];
      setValue('servicos', next, { shouldValidate: true });
    },
    [selectedIds, setValue]
  );

  // --- Submit ---
  const onSubmit = async (values: AgendaFormValues) => {
    console.log('Submitting', values);
    const payload = {
      ...values,
      dataHoraInicio: toIso(values.dataHoraInicio),
    };

    if (isEdit && id) {
      await AgendaService.atualizarAgenda(Number(id), payload);
    } else {
      await AgendaService.criarAgenda(payload);
    }
    navigate('/agendamentos');
  };

  if (loadingPage) {
    return (
      <div className={styles.loading}>
        <Loader2 size={28} className={styles.spinner} />
        Carregando...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.btnBack}
          onClick={() => navigate('/agendamentos')}
        >
          <ArrowLeft size={18} />
        </button>
        <div className={styles.titleGroup}>
          <CalendarDays size={22} className={styles.titleIcon} />
          <h1 className={styles.title}>
            {isEdit ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h1>
        </div>
      </div>

      {/* Formulário */}
      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* ---- Busca de Usuário ---- */}
        <div className={styles.field} ref={dropdownRef}>
          <label className={styles.label}>Cliente *</label>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              className={`${styles.input} ${styles.searchInput} ${errors.username ? styles.inputError : ''}`}
              type="text"
              placeholder="Busque por nome ou usuário..."
              value={userQuery}
              onChange={(e) => {
                setUserQuery(e.target.value);
                if (e.target.value !== selectedUserLabel) {
                  setValue('username', '', { shouldValidate: false });
                  setSelectedUserLabel('');
                }
                setShowDropdown(false);
              }}
              autoComplete="off"
            />
            {loadingUsers && (
              <Loader2 size={14} className={styles.inputLoader} />
            )}
          </div>

          {/* Hidden field controlado pelo RHF */}
          <input type="hidden" {...register('username')} />

          {showDropdown && (
            <ul className={styles.dropdown}>
              {userResults.map((u) => (
                <li
                  key={u.id}
                  className={styles.dropdownItem}
                  onMouseDown={() => handleSelectUser(u)}
                >
                  <span className={styles.dropdownName}>{u.name}</span>
                  <span className={styles.dropdownUsername}>@{u.username}</span>
                </li>
              ))}
            </ul>
          )}

          {errors.username && (
            <p className={styles.error}>{errors.username.message}</p>
          )}
        </div>

        {/* ---- Data e Hora ---- */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="dataHoraInicio">
            Data e Hora *
          </label>
          <input
            id="dataHoraInicio"
            type="datetime-local"
            className={`${styles.input} ${errors.dataHoraInicio ? styles.inputError : ''}`}
            {...register('dataHoraInicio')}
          />
          {errors.dataHoraInicio && (
            <p className={styles.error}>{errors.dataHoraInicio.message}</p>
          )}
        </div>

        {/* ---- Status ---- */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="status">
            Status *
          </label>
          <select
            id="status"
            className={`${styles.select} ${errors.status ? styles.inputError : ''}`}
            {...register('status')}
          >
            {Object.values(StatusAgenda).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className={styles.error}>{errors.status.message}</p>
          )}
        </div>

        {/* ---- Serviços ---- */}
        <div className={styles.field}>
          <label className={styles.label}>Serviços *</label>
          <Controller
            control={control}
            name="servicos"
            render={() => (
              <div className={styles.checkboxGrid}>
                {servicos.map((s) => {
                  const checked = selectedIds?.includes(s.id) ?? false;
                  return (
                    <label
                      key={s.id}
                      className={`${styles.checkboxCard} ${checked ? styles.checkboxCardChecked : ''}`}
                    >
                      <input
                        type="checkbox"
                        className={styles.checkboxHidden}
                        checked={checked}
                        onChange={() => toggleServico(s.id)}
                      />
                      <span className={styles.checkboxName}>{s.nome}</span>
                      <span className={styles.checkboxMeta}>
                        {s.duracaoInMin} min &nbsp;·&nbsp;
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(s.preco)}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          />
          {errors.servicos && (
            <p className={styles.error}>{errors.servicos.message}</p>
          )}
        </div>

        {/* ---- Observações ---- */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="observacoes">
            Observações
          </label>
          <textarea
            id="observacoes"
            rows={3}
            className={styles.textarea}
            placeholder="Observações adicionais..."
            {...register('observacoes')}
          />
        </div>

        {/* ---- Botões ---- */}
        <div className={styles.formFooter}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={() => navigate('/agendamentos')}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.btnSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />
                Salvar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
