import { authService as firebase } from "./authService.firebase";
import { authService as local } from "./authService.local";

const USE_FIREBASE = false;

// Quando o firebase estiver funcionando, mudar para const USE_FIREBASE = true;

export const authService = USE_FIREBASE ? firebase : local;
