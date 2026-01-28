import { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  ShoppingBag,
  Smartphone,
  Banknote,
  CreditCard,
  ScanBarcode, // Ícone novo para indicar leitura de código
} from 'lucide-react';
import styles from './CardVenda.module.css';
import { ProdutoService } from '../../services/ProdutoService';
import { ServicoService } from '../../services/ServicoService';
import { Produto } from '../../models/Produto';
import { Servico } from '../../models/Servico';
import {
  type VendaRequestDTO,
  type ItemVendaRequestDTO,
  FormaPagamento,
} from '../../models/Venda';

interface CardVendaProps {
  onClose: () => void;
  onSave: (venda: VendaRequestDTO) => Promise<void>;
}

interface ItemCarrinho {
  tempId: string;
  tipo: 'PRODUTO' | 'SERVICO';
  nome: string;
  precoUnitario: number;
  quantidade: number;
  idOriginal: string | number;
}

export function CardVenda({ onClose, onSave }: CardVendaProps) {
  // --- Estados de Dados ---
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);

  // --- Estados do Formulário de Itens ---
  const [tipoSelecionado, setTipoSelecionado] = useState<'PRODUTO' | 'SERVICO'>(
    'SERVICO'
  );
  const [itemSelecionadoId, setItemSelecionadoId] = useState<string>('');

  // NOVO: Estado para o input de código
  const [codigoBusca, setCodigoBusca] = useState<string>('');

  // --- Estados da Venda ---
  const [itensCarrinho, setItensCarrinho] = useState<ItemCarrinho[]>([]);
  const [desconto, setDesconto] = useState<string>('');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | null>(
    null
  );
  const [observacoes, setObservacoes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      ProdutoService.listarTodos(),
      ServicoService.listarTodos(),
    ]).then(([prodData, servData]) => {
      setProdutos(prodData);
      setServicos(servData);
    });
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);

  // --- Lógica de Busca por Código ---
  const handleBuscaCodigo = (val: string) => {
    setCodigoBusca(val);

    if (!val) return; // Se vazio, não faz nada (mantém seleção atual ou nenhuma)

    // Normaliza para comparação (case insensitive)
    const termo = val.trim().toLowerCase();

    if (tipoSelecionado === 'PRODUTO') {
      // Tenta achar produto pelo campo 'codigo' (se existir) ou 'id'
      // Assumindo que seu objeto Produto tem um campo 'codigo'. Se não tiver, use apenas id ou nome.
      const prod = produtos.find(
        (p) => (p.codigo && p.codigo.toLowerCase() === termo) || p.id === val // ID geralmente é case sensitive se for UUID
      );

      if (prod && prod.id) {
        setItemSelecionadoId(prod.id);
      }
    } else {
      // Para serviços, geralmente busca pelo ID numérico
      const serv = servicos.find((s) => String(s.id) === termo);
      if (serv && serv.id) {
        setItemSelecionadoId(String(serv.id));
      }
    }
  };

  const handleAddItem = () => {
    if (!itemSelecionadoId) return;

    let novoItem: ItemCarrinho | null = null;
    const tempId = Math.random().toString(36).substr(2, 9);

    if (tipoSelecionado === 'PRODUTO') {
      const prod = produtos.find((p) => p.id === itemSelecionadoId);
      if (prod) {
        novoItem = {
          tempId,
          tipo: 'PRODUTO',
          nome: prod.nome,
          precoUnitario: prod.precoVenda,
          quantidade: 1,
          idOriginal: prod.id!,
        };
      }
    } else {
      const serv = servicos.find((s) => String(s.id) === itemSelecionadoId);
      if (serv) {
        novoItem = {
          tempId,
          tipo: 'SERVICO',
          nome: serv.nome,
          precoUnitario: serv.preco,
          quantidade: 1,
          idOriginal: serv.id!,
        };
      }
    }

    if (novoItem) {
      setItensCarrinho([...itensCarrinho, novoItem]);
      // Resetar campos após adicionar
      setItemSelecionadoId('');
      setCodigoBusca('');
    }
  };

  const handleRemoveItem = (tempId: string) => {
    setItensCarrinho(itensCarrinho.filter((i) => i.tempId !== tempId));
  };

  const subtotal = itensCarrinho.reduce(
    (acc, item) => acc + item.precoUnitario * item.quantidade,
    0
  );
  const valorDesconto = Number(desconto) || 0;
  const totalFinal = subtotal - valorDesconto;

  const handleSubmit = async () => {
    if (itensCarrinho.length === 0) {
      alert('Adicione pelo menos um item.');
      return;
    }
    if (!formaPagamento) {
      alert('Selecione uma forma de pagamento.');
      return;
    }

    setLoading(true);
    try {
      const itensDTO: ItemVendaRequestDTO[] = itensCarrinho.map((item) => ({
        quantidade: item.quantidade,
        produtoId:
          item.tipo === 'PRODUTO' ? (item.idOriginal as string) : undefined,
        servicoId:
          item.tipo === 'SERVICO' ? (item.idOriginal as number) : undefined,
      }));

      const payload: VendaRequestDTO = {
        desconto: valorDesconto,
        itens: itensDTO,
        formaPagamento: formaPagamento,
        observacoes: observacoes,
      };

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao registrar venda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <ShoppingBag size={20} color="#bb8d6a" />
            <span>Nova Venda</span>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Cliente */}
          <div style={{ marginBottom: 20 }}>
            <label className={styles.sectionLabel}>Cliente</label>
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: 6,
                padding: 10,
                color: '#666',
                background: '#f9f9f9',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Selecione o cliente (opcional)</span>
            </div>
          </div>

          {/* Adicionar Itens */}
          <div style={{ marginBottom: 10 }}>
            <label className={styles.sectionLabel}>Adicionar Itens</label>
            <div className={styles.addItemRow}>
              {/* Tipo */}
              <select
                className={styles.selectType}
                value={tipoSelecionado}
                onChange={(e) => {
                  setTipoSelecionado(e.target.value as any);
                  setItemSelecionadoId('');
                  setCodigoBusca('');
                }}
              >
                <option value="SERVICO">Serviço</option>
                <option value="PRODUTO">Produto</option>
              </select>

              {/* NOVO: Campo de Código */}
              <div style={{ position: 'relative' }}>
                {/* Ícone opcional dentro ou perto do input */}
                <input
                  type="text"
                  className={styles.inputCode}
                  placeholder="Cód/ID"
                  value={codigoBusca}
                  onChange={(e) => handleBuscaCodigo(e.target.value)}
                  // Se quiser adicionar ao pressionar Enter:
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && itemSelecionadoId) {
                      handleAddItem();
                    }
                  }}
                />
              </div>

              {/* Select de Itens (atualiza automaticamente ao digitar código válido) */}
              <select
                className={styles.selectItem}
                value={itemSelecionadoId}
                onChange={(e) => {
                  setItemSelecionadoId(e.target.value);
                  // Opcional: Se selecionar manualmente, limpa o código busca para não confundir
                  if (codigoBusca) setCodigoBusca('');
                }}
              >
                <option value="">Selecione...</option>
                {tipoSelecionado === 'SERVICO'
                  ? servicos.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome} ({formatCurrency(s.preco)})
                      </option>
                    ))
                  : produtos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} - {p.codigo ? `[${p.codigo}] ` : ''} (
                        {formatCurrency(p.precoVenda)})
                      </option>
                    ))}
              </select>

              <button
                className={styles.btnAdd}
                onClick={handleAddItem}
                disabled={!itemSelecionadoId}
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Lista de Itens no Carrinho */}
          {itensCarrinho.length > 0 && (
            <div className={styles.itemsList}>
              {itensCarrinho.map((item) => (
                <div key={item.tempId} className={styles.itemRow}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500 }}>{item.nome}</span>
                  </div>
                  <span style={{ marginRight: 15 }}>
                    {formatCurrency(item.precoUnitario)}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(item.tempId)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: '#E57373',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Seção Financeira (Totais) */}
          <div style={{ marginTop: 20 }}>
            <div className={styles.financialRow}>
              <span style={{ color: '#666' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>
                {formatCurrency(subtotal)}
              </span>
            </div>

            <div className={styles.financialRow}>
              <span style={{ color: '#666' }}>Desconto</span>
              <div className={styles.inputDiscountWrapper}>
                <span className={styles.currencySymbol}>$</span>
                <input
                  type="number"
                  className={styles.inputDiscount}
                  placeholder="0.00"
                  value={desconto}
                  onChange={(e) => setDesconto(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.financialRow} style={{ marginTop: 10 }}>
              <span className={styles.labelTotal}>Total</span>
              <span className={styles.valueTotal}>
                {formatCurrency(totalFinal < 0 ? 0 : totalFinal)}
              </span>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div style={{ marginTop: 20 }}>
            <label className={styles.sectionLabel}>Forma de Pagamento</label>
            <div className={styles.paymentGrid}>
              <button
                className={`${styles.paymentOption} ${formaPagamento === FormaPagamento.PIX ? styles.selected : ''}`}
                onClick={() => setFormaPagamento(FormaPagamento.PIX)}
              >
                <Smartphone size={18} /> PIX
              </button>

              <button
                className={`${styles.paymentOption} ${formaPagamento === FormaPagamento.DINHEIRO ? styles.selected : ''}`}
                onClick={() => setFormaPagamento(FormaPagamento.DINHEIRO)}
              >
                <Banknote size={18} /> Dinheiro
              </button>

              <button
                className={`${styles.paymentOption} ${formaPagamento === FormaPagamento.CARTAO_CREDITO ? styles.selected : ''}`}
                onClick={() => setFormaPagamento(FormaPagamento.CARTAO_CREDITO)}
              >
                <CreditCard size={18} /> Crédito
              </button>

              <button
                className={`${styles.paymentOption} ${formaPagamento === FormaPagamento.CARTAO_DEBITO ? styles.selected : ''}`}
                onClick={() => setFormaPagamento(FormaPagamento.CARTAO_DEBITO)}
              >
                <CreditCard size={18} /> Débito
              </button>
            </div>
          </div>

          {/* Observações */}
          <div style={{ marginTop: 10 }}>
            <label className={styles.sectionLabel}>Observações</label>
            <textarea
              className={styles.obsArea}
              placeholder="Observações da venda..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            className={styles.btnCancel}
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className={styles.btnFinish}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Processando...' : 'Finalizar Venda'}
          </button>
        </div>
      </div>
    </div>
  );
}
