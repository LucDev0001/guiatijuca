import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
let db;
let auth;

if (!firebaseConfig.apiKey) {
  console.error(
    "ERRO CRÍTICO: Chave de API do Firebase não encontrada. Verifique se o arquivo .env foi criado na raiz do projeto e reinicie o servidor."
  );
} else {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    // Garante que a autenticação persista mesmo fechando o navegador
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Erro ao definir persistência:", error);
    });
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
  }
}

export { app, db, auth };
