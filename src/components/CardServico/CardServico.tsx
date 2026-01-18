import React, { useState, useEffect } from 'react';
import {
  X,
  Scissors,
  DollarSign,
  Clock,
  Percent,
  ChevronDown,
} from 'lucide-react';
import styles from '../../styles/StylesCard.module.css';
import {
  CATEGORIA_OPTIONS,
  CategoriaServico,
} from '../../enums/CategoriaServico';

// Interface dos dados
export interface ServiceFormData {
  id?: number; // Optional ID for update
  name: string;
  categoriaServico: CategoriaServico;
  description: string;
  price: number;
  duration: number;
  commission: number;
  isActive: boolean;
}

interface CardServicoProps {
  onClose: () => void;
  onSave: (data: ServiceFormData) => void;
  initialData?: ServiceFormData | null; // New prop for editing
}

export function CardServico({
  onClose,
  onSave,
  initialData,
}: CardServicoProps) {
  const isEditing = !!initialData; // Boolean flag to check mode

  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    categoriaServico: CategoriaServico.OUTRO,
    description: '',
    price: 0,
    duration: 60,
    commission: 30,
    isActive: true,
  });

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'price' || name === 'duration' || name === 'commission'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const toggleActive = () => {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <Scissors
              className={styles.iconTitle}
              size={20}
              strokeWidth={1.5}
            />
            {/* Dynamic Title */}
            <h2>{isEditing ? 'Editar Serviço' : 'Novo Serviço'}</h2>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <X size={22} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className={styles.formBody}>
          {/* Name */}
          <div className={styles.inputGroup}>
            <label htmlFor="name">Nome do Serviço *</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Ex: Corte Feminino"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          {/* Category */}
          <div className={styles.inputGroup}>
            <label htmlFor="categoriaServico">Categoria *</label>
            <div className={styles.selectWrapper}>
              <select
                name="categoriaServico"
                id="categoriaServico"
                value={formData.categoriaServico}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="" disabled hidden>
                  Selecione a categoria
                </option>
                {CATEGORIA_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className={styles.selectArrow} size={18} />
            </div>
          </div>

          {/* Description */}
          <div className={styles.inputGroup}>
            <label htmlFor="description">Descrição</label>
            <textarea
              name="description"
              id="description"
              placeholder="Descreva o serviço..."
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              rows={3}
            />
          </div>

          {/* Price & Duration */}
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="price">Preço (R$) *</label>
              <div className={styles.inputWithIcon}>
                <DollarSign size={16} className={styles.fieldIcon} />
                <input
                  type="number"
                  name="price"
                  id="price"
                  placeholder="0,00"
                  value={formData.price || ''}
                  onChange={handleChange}
                  className={styles.inputIconPadding}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="duration">Duração (min) *</label>
              <div className={styles.inputWithIcon}>
                <Clock size={16} className={styles.fieldIcon} />
                <input
                  type="number"
                  name="duration"
                  id="duration"
                  placeholder="60"
                  value={formData.duration || ''}
                  onChange={handleChange}
                  className={styles.inputIconPadding}
                  required
                />
              </div>
            </div>
          </div>

          {/* Commission */}
          <div className={styles.inputGroup}>
            <label htmlFor="commission">Comissão do Profissional (%)</label>
            <div className={styles.inputWithIcon}>
              <Percent size={16} className={styles.fieldIcon} />
              <input
                type="number"
                name="commission"
                id="commission"
                placeholder="30"
                value={formData.commission || ''}
                onChange={handleChange}
                className={styles.inputIconPadding}
              />
            </div>
          </div>

          {/* Toggle Switch */}
          <div className={styles.switchContainer} onClick={toggleActive}>
            <div className={styles.switchText}>
              <span className={styles.switchLabel}>Serviço Ativo</span>
              <span className={styles.switchDesc}>
                Disponível para agendamento
              </span>
            </div>
            <div
              className={`${styles.toggle} ${formData.isActive ? styles.active : ''}`}
            >
              <div className={styles.toggleCircle}></div>
            </div>
          </div>

          {/* FOOTER */}
          <div className={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.btnCancel}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.btnSave}>
              {/* Dynamic Button Text */}
              {isEditing ? 'Salvar Alterações' : 'Criar Serviço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
