import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import styles from './Login.module.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      alert('Verifique suas credenciais');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      {/* Círculos decorativos de fundo */}
      <div className={styles.circleDecorationTop}></div>
      <div className={styles.circleDecorationBottom}></div>

      <div className={styles.loginContainer}>
        <div className={styles.logoArea}>
          <div className={styles.logoCircle}>
            {/* Ícone agora em Rose Gold */}
            <Scissors size={32} color="#4A3B32" strokeWidth={1.2} />
          </div>
          <h1 className={styles.brandName}>Belle Salon</h1>
        </div>

        <div className={styles.loginCard}>
          <div className={styles.headerText}>
            <h2>Bem-vinda</h2>
            <p>Gerencie sua beleza e seus agendamentos</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Login</label>
              <input
                className={styles.input}
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@salao.com"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Senha</label>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className={styles.forgotPass}>
              <a href="#">Esqueci minha senha</a>
            </div>

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={loading}
            >
              {loading ? 'Acessando...' : 'Entrar no Sistema'}
            </button>
          </form>
        </div>

        <p className={styles.footerText}>© 2026 Belle Salon System</p>
      </div>
    </div>
  );
}
