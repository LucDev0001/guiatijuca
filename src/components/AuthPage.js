import { auth } from "../config/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export function renderAuthPage(app, currentUser, startRegister = false) {
  // Se já estiver logado, redireciona para o perfil
  if (currentUser) {
    window.location.hash = "#perfil";
    return;
  }

  const isRegisterMode = startRegister;

  app.innerHTML = `
      <div class="h-full w-full bg-gray-100 overflow-y-auto">
        <div class="min-h-full flex items-center justify-center p-4">
          <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transition-all duration-300">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-blue-900">${
              isRegisterMode ? "Criar Conta" : "Bem-vindo de volta"
            }</h2>
            <p class="text-gray-500 text-sm">${
              isRegisterMode
                ? "Preencha os dados para começar."
                : "Faça login para gerenciar seu perfil."
            }</p>
          </div>

          <button id="btnGoogle" class="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition mb-4">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5">
            ${isRegisterMode ? "Cadastrar com Google" : "Entrar com Google"}
          </button>

          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
            <div class="relative flex justify-center text-sm"><span class="px-2 bg-white text-gray-500">Ou email</span></div>
          </div>

          <form id="authForm" class="space-y-4">
            <input type="email" id="email" placeholder="Seu email" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none" required>
            <input type="password" id="password" placeholder="Sua senha" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-900 outline-none" required>
            <button type="submit" class="w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition shadow-lg">
              ${isRegisterMode ? "Cadastrar" : "Entrar"}
            </button>
          </form>
          
          <div class="mt-6 text-center text-sm">
            <p class="text-gray-600">
              ${isRegisterMode ? "Já tem uma conta?" : "Não tem uma conta?"}
              <button id="toggleAuth" class="text-blue-900 font-bold hover:underline ml-1">
                ${isRegisterMode ? "Fazer Login" : "Cadastre-se"}
              </button>
            </p>
          </div>

          <p class="mt-4 text-center text-xs text-gray-400"><a href="#home" class="underline">Voltar para Home</a></p>
        </div>
      </div>
      </div>
    `;

  // Event Listeners
  document.getElementById("toggleAuth").onclick = () => {
    window.location.hash = isRegisterMode ? "#login" : "#cadastro";
  };

  document.getElementById("btnGoogle").onclick = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      window.location.hash = "#perfil";
    } catch (error) {
      alert("Erro no login Google: " + error.message);
    }
  };

  document.getElementById("authForm").onsubmit = async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const email = emailInput.value;
    const pass = passwordInput.value;

    // Reset visual validation
    emailInput.classList.remove("border-red-500");
    passwordInput.classList.remove("border-red-500");

    // Visual Validation Logic
    let isValid = true;
    if (!email) {
      emailInput.classList.add("border-red-500");
      isValid = false;
    }
    if (!pass) {
      passwordInput.classList.add("border-red-500");
      isValid = false;
    }

    if (!isValid) return;

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, email, pass);
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
      }
      window.location.hash = "#perfil";
    } catch (error) {
      console.error(error);
      let msg = error.message;
      if (error.code === "auth/weak-password")
        msg = "A senha deve ter pelo menos 6 caracteres.";
      if (error.code === "auth/email-already-in-use")
        msg = "Este email já está em uso.";
      if (error.code === "auth/invalid-credential")
        msg = "Email ou senha incorretos.";
      alert("Erro: " + msg);
    }
  };
}
