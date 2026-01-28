import styles from './ModalRecibo.module.css';
import { type ReciboResponseDTO } from '../../models/Venda';

interface Props {
  data: ReciboResponseDTO;
  onClose: () => void;
}

export function ModalRecibo({ data, onClose }: Props) {
  const formatMoney = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Recibo de Venda</div>
            <small style={{ color: '#666' }}>
              {new Date(data.data).toLocaleString()}
            </small>
          </div>
          <span
            className={`${styles.status} ${data.status === 'CANCELADA' ? styles.statusCancelada : styles.statusConcluida}`}
          >
            {data.status}
          </span>
        </div>

        <div className={styles.content}>
          {/* Itens */}
          <div style={{ marginBottom: 15 }}>
            {data.itens.map((item, idx) => (
              <div key={idx} className={styles.row}>
                <span>
                  {item.quantidade}x {item.nome}
                </span>
                <span>{formatMoney(item.precoUnitario)}</span>
              </div>
            ))}
          </div>

          <div className={styles.divider} />

          {/* Totais */}
          <div className={styles.row}>
            <span>Subtotal:</span>
            <span>{formatMoney(data.totalBruto)}</span>
          </div>
          {data.desconto > 0 && (
            <div className={styles.row} style={{ color: 'green' }}>
              <span>Desconto:</span>
              <span>- {formatMoney(data.desconto)}</span>
            </div>
          )}

          <div className={styles.totalRow}>
            <span>Total:</span>
            <span>{formatMoney(data.totalPagar)}</span>
          </div>

          <div className={styles.divider} />

          <div style={{ fontSize: '0.9rem' }}>
            <strong>Pagamento:</strong> {data.formaPagamento}
          </div>
          {data.observacoes && (
            <div
              style={{
                fontSize: '0.9rem',
                marginTop: 8,
                fontStyle: 'italic',
                color: '#666',
              }}
            >
              " {data.observacoes} "
            </div>
          )}
        </div>

        <button className={styles.closeBtn} onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
