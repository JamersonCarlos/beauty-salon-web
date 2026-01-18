import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, // Ícone de caixa (Box)
  DollarSign, 
  Hash, // Ícone para SKU/Código
  AlertTriangle, // Ícone para estoque mínimo
  ChevronDown 
} from 'lucide-react';
import styles from '../../styles/StylesCard.module.css';
import { CategoriaProduto, CATEGORIA_PRODUTO_OPTIONS } from '../../enums/CategoriaProduto';

// Interface que espelha o Request DTO do Java
export interface ProdutoFormData {
  id?: string;
  nome: string;
  categoria: CategoriaProduto;
  marca: string;
  codigo: string;
  descricao: string;
  precoCusto: number;
  precoVenda: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  disponivel: boolean;
}

interface CardProdutoProps {
  onClose: () => void;
  onSave: (data: ProdutoFormData) => void;
  initialData?: ProdutoFormData | null;
}

export function CardProduto({ onClose, onSave, initialData }: CardProdutoProps) {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState<ProdutoFormData>({
    nome: '',
    categoria: CategoriaProduto.OUTROS,
    marca: '',
    codigo: '',
    descricao: '',
    precoCusto: 0,
    precoVenda: 0,
    quantidadeEstoque: 0,
    estoqueMinimo: 5, // Valor padrão conforme a imagem sugeria
    disponivel: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: 
        name.includes('preco') || name.includes('stoque') 
          ? parseFloat(value) || 0 
          : value,
    }));
  };

  const toggleDisponivel = () => {
    setFormData((prev) => ({ ...prev, disponivel: !prev.disponivel }));
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
            <Package className={styles.iconTitle} size={22} strokeWidth={1.5} />
            <h2>{isEditing ? 'Editar Produto' : 'Novo Produto'}</h2>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className={styles.formBody}>
          
          {/* Nome */}
          <div className={styles.inputGroup}>
            <label htmlFor="nome">Nome do Produto *</label>
            <input
              type="text"
              name="nome"
              id="nome"
              placeholder="Ex: Shampoo Hidratante 300ml"
              value={formData.nome}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          {/* Linha: Marca e Categoria */}
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="marca">Marca</label>
              <input
                type="text"
                name="marca"
                id="marca"
                placeholder="Ex: L'Oréal"
                value={formData.marca}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="categoria">Categoria</label>
              <div className={styles.selectWrapper}>
                <select
                  name="categoria"
                  id="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="" disabled hidden>Selecione</option>
                  {CATEGORIA_PRODUTO_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className={styles.selectArrow} size={18} />
              </div>
            </div>
          </div>

          {/* Código / SKU */}
          <div className={styles.inputGroup}>
            <label htmlFor="codigo">Código/SKU</label>
            <div className={styles.inputWrapper}>
              <Hash size={16} className={styles.fieldIcon} />
              <input
                type="text"
                name="codigo"
                id="codigo"
                placeholder="SKU001"
                value={formData.codigo}
                onChange={handleChange}
                className={`${styles.input} ${styles.inputWithIcon}`}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className={styles.inputGroup}>
            <label htmlFor="descricao">Descrição</label>
            <textarea
              name="descricao"
              id="descricao"
              placeholder="Descrição do produto..."
              value={formData.descricao}
              onChange={handleChange}
              className={styles.textarea}
              rows={2}
            />
          </div>

          {/* Linha: Preços */}
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="precoCusto">Preço de Custo</label>
              <div className={styles.inputWrapper}>
                <DollarSign size={16} className={styles.fieldIcon} />
                <input
                  type="number"
                  name="precoCusto"
                  id="precoCusto"
                  placeholder="0,00"
                  step="0.01"
                  value={formData.precoCusto || ''}
                  onChange={handleChange}
                  className={`${styles.input} ${styles.inputWithIcon}`}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="precoVenda">Preço de Venda *</label>
              <div className={styles.inputWrapper}>
                <DollarSign size={16} className={styles.fieldIcon} />
                <input
                  type="number"
                  name="precoVenda"
                  id="precoVenda"
                  placeholder="0,00"
                  step="0.01"
                  value={formData.precoVenda || ''}
                  onChange={handleChange}
                  className={`${styles.input} ${styles.inputWithIcon}`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Linha: Estoque */}
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="quantidadeEstoque">Quantidade em Estoque *</label>
              <input
                type="number"
                name="quantidadeEstoque"
                id="quantidadeEstoque"
                placeholder="0"
                value={formData.quantidadeEstoque || ''}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="estoqueMinimo" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                 <AlertTriangle size={12} color="#F59E0B" /> Estoque Mínimo
              </label>
              <input
                type="number"
                name="estoqueMinimo"
                id="estoqueMinimo"
                placeholder="5"
                value={formData.estoqueMinimo || ''}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          {/* Toggle Switch */}
          <div className={styles.switchContainer} onClick={toggleDisponivel}>
            <div className={styles.switchText}>
              <span className={styles.switchLabel}>Disponível para Venda</span>
              <span className={styles.switchDesc}>Exibir nas opções de venda</span>
            </div>
            <div className={`${styles.toggle} ${formData.disponivel ? styles.active : ''}`}>
              <div className={styles.toggleCircle}></div>
            </div>
          </div>

        </form>

        {/* FOOTER */}
        <div className={styles.footer}>
          <button type="button" onClick={onClose} className={styles.btnCancel}>
            Cancelar
          </button>
          <button type="submit" onClick={handleSubmit} className={styles.btnSave}>
            Salvar Produto
          </button>
        </div>

      </div>
    </div>
  );
}