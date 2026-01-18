import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { api } from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Importe a lib instalada

// Tipagem baseada no seu Java JWT
interface JwtPayload {
  sub: string; // ID do usuário
  scope: string; // Roles (ex: "ADMIN USER")
  iss: string;
  exp: number;
}

interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<void>; // Java usa username, não email
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para processar o Token JWT e definir estado
  const handleTokenProcessing = (token: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      // O Java retorna scopes separados por espaço (ex: "ADMIN USER")
      // Aqui pegamos o primeiro ou tratamos como string
      setIsAuthenticated(true);
      setUserRole(decoded.scope);
    } catch (error) {
      console.error('Token inválido', error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // IMPORTANTE: Como o cookie é HttpOnly, não podemos verificar se ele existe via JS.
        // Temos que tentar fazer uma requisição ao backend para validar.
        // Crie um endpoint no Java tipo @GetMapping("/auth/me") ou "/validate"

        // Exemplo: Tentando buscar dados do usuário logado
        // Se o cookie estiver lá e válido, vai dar 200 OK.
        // Se não, vai dar 401 e cair no catch.

        // Por enquanto, vou simular chamando o endpoint de validação que sugeri antes
        // Se você não tiver esse endpoint, precisará criar no Java.
        await api.get('/auth/validate');

        // Se passou, significa que o cookie é válido.
        // O ideal é que o endpoint /validate retornasse também as infos do usuário/role
        setIsAuthenticated(true);
        // setUserRole(...) -> O ideal é vir do endpoint /validate
      } catch (error) {
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, pass: string) => {
    try {
      // Enviando LoginRequest
      const response = await api.post<LoginResponse>('/auth/login', {
        username, // Ajustado para bater com seu LoginRequest Java
        password: pass,
      });

      // O cookie já foi setado automaticamente pelo navegador aqui!
      // Usamos o accessToken do corpo APENAS para atualizar o estado visual agora.
      handleTokenProcessing(response.data.accessToken);
    } catch (error) {
      console.error('Erro ao logar', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');

      setIsAuthenticated(false);
      setUserRole(null);

      // Se não tiver endpoint de logout no Java, o cookie continua lá até expirar
      // e o usuário pode acabar logando sozinho se der F5.
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro no logout', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userRole, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
