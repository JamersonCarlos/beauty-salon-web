import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Upload, ImagePlus, Loader2, Search } from 'lucide-react';
import { FotoGaleriaService } from '../../services/fotoGaleriaService';
import { ServicoService } from '../../services/ServicoService';
import { AgendaService } from '../../services/AgendaService';
import type { FotoGaleriaRequest } from '../../models/FotoGaleria';
import type { Servico } from '../../models/Servico';
import type { User } from '../../types/user';
import styles from './GaleriaUpload.module.css';

// ---------------------------------------------------------------------------
// Hook de debounce (igual ao AgendaForm)
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
// Props
// ---------------------------------------------------------------------------

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function GaleriaUpload({ onClose, onSuccess }: Props) {
  // --- Form state ---
  const [titulo, setTitulo] = useState('');
  const [servicoId, setServicoId] = useState<number | ''>('');
  const [clienteId, setClienteId] = useState<string>('');
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // --- Data for selects ---
  const [servicos, setServicos] = useState<Servico[]>([]);

  // --- UI state ---
  const [loading, setLoading] = useState(false);
  const [loadingServicos, setLoadingServicos] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // --- Busca de cliente (mesmo padrão do AgendaForm) ---
  const [clienteQuery, setClienteQuery] = useState('');
  const [clienteResults, setClienteResults] = useState<User[]>([]);
  const [selectedClienteLabel, setSelectedClienteLabel] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const clienteDropdownRef = useRef<HTMLDivElement>(null);
  const debouncedClienteQuery = useDebounce(clienteQuery, 350);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Carrega serviços ao montar ---
  useEffect(() => {
    setLoadingServicos(true);
    ServicoService.listarTodos({ ativo: true, size: 100 })
      .then((p) => setServicos(p.content))
      .catch(() => setErro('Erro ao carregar serviços.'))
      .finally(() => setLoadingServicos(false));
  }, []);

  // --- Busca clientes com debounce ---
  useEffect(() => {
    if (
      !debouncedClienteQuery ||
      debouncedClienteQuery === selectedClienteLabel
    ) {
      setClienteResults([]);
      return;
    }
    setLoadingClientes(true);
    AgendaService.buscarUsuarios(undefined, debouncedClienteQuery, 0, 8)
      .then((result) => {
        setClienteResults(result.content);
        setShowClienteDropdown(result.content.length > 0);
      })
      .catch(() => setClienteResults([]))
      .finally(() => setLoadingClientes(false));
  }, [debouncedClienteQuery, selectedClienteLabel]);

  // --- Fecha dropdown ao clicar fora ---
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        clienteDropdownRef.current &&
        !clienteDropdownRef.current.contains(e.target as Node)
      ) {
        setShowClienteDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectCliente = useCallback((user: User) => {
    const label = `${user.name} (@${user.username})`;
    setClienteId(user.id);
    setClienteQuery(label);
    setSelectedClienteLabel(label);
    setShowClienteDropdown(false);
    setClienteResults([]);
  }, []);

  // --- Gera preview local ao selecionar arquivo ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImagemFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  // --- Drag & drop ---
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file && file.type.startsWith('image/')) {
      setImagemFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!imagemFile) {
      setErro('Selecione uma imagem para o upload.');
      return;
    }
    if (!titulo.trim()) {
      setErro('Informe um título para a foto.');
      return;
    }
    if (servicoId === '') {
      setErro('Selecione um serviço relacionado.');
      return;
    }

    const dados: FotoGaleriaRequest = {
      titulo: titulo.trim(),
      servicoId: servicoId as number,
      clienteId: clienteId || null,
    };

    try {
      setLoading(true);
      await FotoGaleriaService.upload(dados, imagemFile);
      onSuccess();
    } catch {
      setErro('Erro ao fazer upload da foto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
      >
        {/* Cabeçalho */}
        <div className={styles.header}>
          <div>
            <h2 id="upload-modal-title" className={styles.title}>
              Nova Foto
            </h2>
            <p className={styles.subtitle}>Adicione uma foto ao portfólio</p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Área de upload / preview */}
          <div
            className={`${styles.dropzone} ${preview ? styles.dropzoneWithPreview : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === 'Enter' && fileInputRef.current?.click()
            }
            aria-label="Área de upload de imagem"
          >
            {preview ? (
              <img
                src={preview}
                alt="Pré-visualização"
                className={styles.previewImg}
              />
            ) : (
              <div className={styles.dropzoneContent}>
                <ImagePlus size={40} className={styles.dropzoneIcon} />
                <p className={styles.dropzoneText}>
                  Clique ou arraste uma imagem aqui
                </p>
                <span className={styles.dropzoneHint}>
                  JPG, PNG, WEBP · Máx. 10 MB
                </span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            onChange={handleFileChange}
            aria-label="Selecionar imagem"
          />

          {/* Título */}
          <div className={styles.field}>
            <label htmlFor="galeria-titulo" className={styles.label}>
              Título <span className={styles.required}>*</span>
            </label>
            <input
              id="galeria-titulo"
              type="text"
              className={styles.input}
              placeholder="Ex: Hidratação profunda com brilho intenso"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={120}
              required
            />
          </div>

          {/* Serviço */}
          <div className={styles.field}>
            <label htmlFor="galeria-servico" className={styles.label}>
              Serviço relacionado <span className={styles.required}>*</span>
            </label>
            <select
              id="galeria-servico"
              className={styles.select}
              value={servicoId}
              onChange={(e) =>
                setServicoId(
                  e.target.value === '' ? '' : Number(e.target.value)
                )
              }
              disabled={loadingServicos}
              required
            >
              <option value="">
                {loadingServicos ? 'Carregando...' : '— Selecione um serviço —'}
              </option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Cliente (opcional) – busca com debounce */}
          <div className={styles.field} ref={clienteDropdownRef}>
            <label className={styles.label}>
              Cliente <span className={styles.optional}>(opcional)</span>
            </label>
            <div className={styles.searchWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                className={`${styles.input} ${styles.searchInput}`}
                placeholder="Busque por nome da cliente…"
                value={clienteQuery}
                onChange={(e) => {
                  setClienteQuery(e.target.value);
                  if (e.target.value !== selectedClienteLabel) {
                    setClienteId('');
                    setSelectedClienteLabel('');
                  }
                  setShowClienteDropdown(false);
                }}
                autoComplete="off"
              />
              {loadingClientes && (
                <Loader2 size={14} className={styles.inputLoader} />
              )}
            </div>

            {showClienteDropdown && (
              <ul className={styles.dropdown}>
                {clienteResults.map((u) => (
                  <li
                    key={u.id}
                    className={styles.dropdownItem}
                    onMouseDown={() => handleSelectCliente(u)}
                  >
                    <span className={styles.dropdownName}>{u.name}</span>
                    <span className={styles.dropdownUsername}>
                      @{u.username}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Mensagem de erro */}
          {erro && <p className={styles.erroMsg}>{erro}</p>}

          {/* Ações */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnSave}
              disabled={loading || !imagemFile}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className={styles.spinIcon} />
                  Enviando…
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Publicar Foto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
