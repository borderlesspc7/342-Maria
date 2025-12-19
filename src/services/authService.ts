import { auth, db } from "../lib/firebaseconfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type Unsubscribe,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import type {
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types/user";
import getFirebaseErrorMessage from "../components/ui/ErrorMessage";

interface firebaseError {
  code?: string;
  message?: string;
}

export const authService = {
  async logOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as string | firebaseError);
      throw new Error(message);
    }
  },

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredentials.user;
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        throw new Error("Usuário não encontrado");
      }

      const userData = userDoc.data() as User;
      const updateUserData = {
        ...userData,
        lastLogin: new Date(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), updateUserData);

      return updateUserData;
    } catch (error) {
      const message = getFirebaseErrorMessage(error as string | firebaseError);
      throw new Error(message);
    }
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      if (!credentials.email || !credentials.password || !credentials.name) {
        throw new Error("Todos os campos são obrigatórios");
      }

      if (credentials.password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      const firebaseUser = userCredential.user;

      const newUser: User = {
        uid: firebaseUser.uid,
        name: credentials.name,
        email: credentials.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: credentials.role || "user",
      };

      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      return newUser;
    } catch (error) {
      const message = getFirebaseErrorMessage(error as string | firebaseError);
      throw new Error(message);
    }
  },

  observeAuthState(callback: (user: User | null) => void): Unsubscribe {
    try {
      return onAuthStateChanged(auth, async (firebaseUser) => {
        console.log(
          "🔄 Auth state changed:",
          firebaseUser ? firebaseUser.uid : "null"
        );

        if (firebaseUser) {
          // Usuário está logado, busca dados completos no Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data() as User;
              console.log("✅ Usuário autenticado:", userData);
              callback(userData);
            } else {
              console.log("❌ Usuário não encontrado no Firestore");
              callback(null); // Usuário não encontrado no Firestore
            }
          } catch (error) {
            console.error("❌ Erro ao buscar dados do usuário:", error);
            callback(null);
          }
        } else {
          // Usuário não está logado
          console.log("🚪 Usuário deslogado");
          callback(null);
        }
      });
    } catch (error) {
      throw new Error("Erro ao observar estado de autenticação: " + error);
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      if (!email) {
        throw new Error("Email é obrigatório");
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        throw new Error("E-mail inválido");
      }

      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const message = getFirebaseErrorMessage(error as string | firebaseError);
      throw new Error(message);
    }
  },
};
