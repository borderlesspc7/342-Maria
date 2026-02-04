// authService.ts
import { authService as firebase } from "./authService.firebase";
import { authService as local } from "./authService.local";
import type { LoginCredentials, RegisterCredentials, User } from "../types/user";

// Interface comum para ambos os serviços
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<User>;
  register(credentials: RegisterCredentials): Promise<User>;
  logOut(): Promise<void>;
  observeAuthState(callback: (user: User | null) => void): () => void;
  changePassword?(currentPassword: string, newPassword: string): Promise<void>; // opcional
}

// ✅ Usa Firebase Auth como backend real de autenticação
const USE_FIREBASE = true;

// Seleciona o serviço ativo
export const authService: IAuthService = USE_FIREBASE ? firebase : local;
