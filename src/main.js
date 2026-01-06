import "./styles/index.css";
import "leaflet/dist/leaflet.css";
import { auth } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { popularBanco } from "./populate";
import { renderLandingPage } from "./components/LandingPage";
import { renderAuthPage } from "./components/AuthPage";
import { renderProfilePage } from "./components/ProfilePage";
import { renderMapApp } from "./components/MapApp";
import { renderAccessibilityWidget } from "./components/AccessibilityWidget";
import { renderTermsPage, renderPrivacyPage } from "./components/LegalPages";
import { initDonationCard } from "./components/DonationCard";
import { initCookieBanner } from "./components/CookieBanner";

const app = document.querySelector("#app");
let currentUser = null;
window.popularBanco = popularBanco;

// --- SISTEMA DE ROTEAMENTO SIMPLES ---
function render() {
  const path = window.location.hash || "#home";

  switch (path) {
    case "#home":
      renderLandingPage(app);
      break;
    case "#mapa":
      renderMapApp(app, currentUser);
      break;
    case "#login":
      renderAuthPage(app, currentUser, false);
      break;
    case "#cadastro":
      renderProfilePage(app, currentUser);
      break;
    case "#perfil":
      if (currentUser) {
        renderProfilePage(app, currentUser);
      } else {
        // Redireciona para login se não estiver autenticado
        window.location.hash = "#login";
      }
      break;
    case "#termos":
      renderTermsPage(app);
      break;
    case "#politica":
      renderPrivacyPage(app);
      break;
    default:
      renderLandingPage(app);
  }
}

window.addEventListener("hashchange", render);
// --- INICIALIZAÇÃO GERAL ---
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  render(); // Atualiza a tela sempre que o status do login mudar
});

// Inicia o card de doação
initDonationCard();

// Inicia o banner de cookies
initCookieBanner();
