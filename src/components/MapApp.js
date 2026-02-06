import L from "leaflet";
import { db, auth } from "../config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { renderHelpModal } from "./HelpPage"; // Importação da ajuda (será criada)

// Configuração do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

let leafletMap;
let markersLayer = L.layerGroup();
let alertsLayer = L.layerGroup();

// Estado Global dos Dados
let todosLocais = [];
let filtroAtual = "todos";
let locaisSalvos = JSON.parse(localStorage.getItem("tijuca_saved") || "[]");
let historicoBusca = JSON.parse(localStorage.getItem("tijuca_recents") || "[]");
let isDarkMode = localStorage.getItem("tijuca_theme") === "dark";

// ==================
// Configuração Gemini (Vite + Browser)
// ==================
let genAI, model;

if (import.meta.env.VITE_GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });
} else {
  console.warn("⚠️ VITE_GEMINI_API_KEY não definida");
}

export function renderMapApp(app, currentUser) {
  // Reseta estado ao renderizar
  todosLocais = [];
  filtroAtual = "todos";
  // Recarrega salvos do storage
  locaisSalvos = JSON.parse(localStorage.getItem("tijuca_saved") || "[]");

  app.innerHTML = `
  <div class="relative h-full w-full overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors duration-300" id="mainContainer">
    
    <!-- MAPA (Fundo) -->
    <div id="map" class="absolute inset-0 z-0"></div>

    <!-- SIDEBAR (Menu Lateral Estilo Google) -->
    <aside id="sidebar" class="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-2xl z-[1002] flex flex-col transition-transform duration-300 transform -translate-x-full md:translate-x-0 md:w-16 md:hover:w-64 group border-r border-gray-200 dark:border-gray-700" aria-label="Menu Principal">
      
      <!-- Hambúrguer / Logo -->
      <a href="#home" class="p-4 flex items-center justify-start md:justify-center md:group-hover:justify-start border-b border-gray-100 dark:border-gray-700 h-16" title="Página Inicial">
         <div class="min-w-[2rem] text-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-900 dark:text-blue-400 mx-auto"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg></div>
         <span class="ml-4 font-bold text-blue-900 dark:text-blue-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">TIJUCA<span class="text-yellow-500">GUIA</span></span>
      </a>

      <!-- Ícones de Navegação -->
      <nav class="flex-1 py-4 flex flex-col gap-2">
        <button id="btnRecents" class="flex items-center p-3 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-400 transition w-full" title="Recentes">
           <div class="min-w-[3rem] text-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
           <span class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap font-medium">Recentes</span>
        </button>
        
        <button id="btnSaved" class="flex items-center p-3 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-blue-900 dark:hover:text-blue-400 transition w-full" title="Salvos">
           <div class="min-w-[3rem] text-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg></div>
           <span class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap font-medium">Salvos</span>
        </button>

        <button id="btnIA" class="flex items-center p-3 hover:bg-purple-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-purple-900 dark:hover:text-purple-400 transition w-full" title="Guia IA">
           <div class="min-w-[3rem] text-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></div>
           <span class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap font-medium">Guia IA</span>
        </button>
      </nav>

      <!-- Rodapé Sidebar -->
      <div class="border-t border-gray-100 dark:border-gray-700 py-2">
        <button id="btnTheme" class="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition w-full" title="Tema">
           <div class="min-w-[3rem] text-center"><span id="themeIcon">🌙</span></div>
           <span class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-sm">Tema</span>
        </button>

        <button id="btnHelp" class="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition w-full" title="Ajuda">
           <div class="min-w-[3rem] text-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
           <span class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-sm">Ajuda</span>
        </button>
        
        <button id="btnProfile" class="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition w-full" title="Perfil">
           <div class="min-w-[3rem] text-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
           <span class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-sm truncate pr-2">
             ${currentUser ? "Meu Perfil" : "Entrar / Cadastrar"}
           </span>
        </button>
      </div>
    </aside>

    <!-- Overlay para fechar sidebar no mobile -->
    <div id="sidebar-overlay" class="fixed inset-0 bg-black/30 z-[1001] hidden md:hidden"></div>

    <!-- BARRA DE BUSCA FLUTUANTE -->
    <div class="absolute top-4 left-4 right-4 md:left-20 md:w-96 z-[1000] flex flex-col gap-2 transition-all duration-300">
      
      <!-- Input Estilo Google -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center p-1 border border-gray-200 dark:border-gray-700">
        <button id="menuToggle" class="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition md:hidden" aria-label="Abrir menu">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <input type="text" id="inputBusca" placeholder="Buscar na Tijuca..." 
               class="flex-1 p-3 outline-none text-gray-700 dark:text-gray-200 bg-transparent" aria-label="Buscar local">
        <button id="btnBusca" class="p-3 text-blue-900 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition" aria-label="Pesquisar">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>
        <!-- Botão de Voz -->
        <button id="btnVoice" class="p-3 text-gray-500 dark:text-gray-400 hover:text-blue-900 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition" aria-label="Pesquisa por voz">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
        </button>
      </div>

      <!-- Filtros (Chips) -->
      <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
         <button class="filter-btn bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap transition" data-tipo="todos">Todos</button>
         <button class="filter-btn bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap transition" data-tipo="loja">Comércio</button>
         <button class="filter-btn bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap transition" data-tipo="autonomo">Autônomos</button>
      </div>

      <!-- Painel de Resultados (Aparece ao digitar) -->
      <div id="resultados" class="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 max-h-[60vh] overflow-y-auto hidden">
        <!-- Resultados injetados aqui -->
      </div>
    </div>

    <!-- PAINEL LATERAL (Gaveta para Recentes, Salvos, Chat) -->
    <div id="drawerPanel" class="absolute left-0 md:left-16 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-2xl z-[1003] md:z-[1001] transform -translate-x-full transition-transform duration-300 flex flex-col border-r border-gray-200 dark:border-gray-700">
      <div class="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-blue-900 dark:bg-gray-900 text-white">
        <h3 id="drawerTitle" class="font-bold text-lg">Título</h3>
        <button id="closeDrawer" class="text-white hover:bg-blue-800 p-1 rounded">✕</button>
      </div>
      <div id="drawerContent" class="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <!-- Conteúdo Dinâmico -->
      </div>
    </div>

    <!-- PAINEL DE DETALHES (Card Deslizante) -->
    <div id="detailPanel" class="fixed inset-x-0 bottom-0 h-[50%] md:absolute md:inset-y-0 md:left-16 md:right-auto md:w-96 md:h-full bg-white dark:bg-gray-800 shadow-2xl z-[1005] rounded-t-3xl md:rounded-none transform translate-y-full md:-translate-x-full transition-transform duration-300 flex flex-col border-r border-gray-200 dark:border-gray-700">
       <!-- Cabeçalho com Botão Fechar -->
       <div class="relative h-32 bg-blue-900 dark:bg-gray-900 flex-shrink-0 flex items-end p-4">
          <button id="closeDetail" class="absolute top-4 right-4 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition z-10 backdrop-blur-sm">✕</button>
          <div class="text-white w-full">
             <h2 id="detailName" class="text-2xl font-bold leading-tight truncate pr-8">Nome do Local</h2>
             <p id="detailCategory" class="text-sm opacity-90 font-medium bg-white/20 dark:bg-gray-700 inline-block px-2 py-0.5 rounded mt-1">Categoria</p>
             
             <!-- Botões de Rota -->
             <div class="flex gap-2 mt-3">
                <button onclick="window.abrirRota('walking')" class="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded flex items-center gap-1">🚶 A pé</button>
                <button onclick="window.abrirRota('driving')" class="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded flex items-center gap-1">🚗 Carro</button>
                <button onclick="window.abrirRota('two_wheeler')" class="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 rounded flex items-center gap-1">🏍️ Moto</button>
             </div>
          </div>
       </div>
       
       <!-- Ações Rápidas -->
       <div class="flex justify-around p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button id="btnActionCall" class="flex flex-col items-center gap-1 text-blue-900 dark:text-blue-400 text-xs font-bold hover:opacity-80 transition">
             <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center text-lg border border-blue-100 dark:border-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></div>
             Ligar
          </button>
          <button id="btnActionZap" class="flex flex-col items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold hover:opacity-80 transition">
             <div class="w-10 h-10 rounded-full bg-green-50 dark:bg-gray-700 flex items-center justify-center text-lg border border-green-100 dark:border-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></div>
             WhatsApp
          </button>
          <button id="btnActionShare" class="flex flex-col items-center gap-1 text-blue-900 dark:text-blue-400 text-xs font-bold hover:opacity-80 transition">
             <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center text-lg border border-blue-100 dark:border-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg></div>
             Partilhar
          </button>
          <button id="btnActionSave" class="flex flex-col items-center gap-1 text-blue-900 dark:text-blue-400 text-xs font-bold hover:opacity-80 transition">
             <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-gray-700 flex items-center justify-center text-lg border border-blue-100 dark:border-gray-600" id="iconActionSave"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg></div>
             <span id="txtActionSave">Salvar</span>
          </button>
          <button id="btnActionCheckin" class="flex flex-col items-center gap-1 text-purple-600 dark:text-purple-400 text-xs font-bold hover:opacity-80 transition">
             <div class="w-10 h-10 rounded-full bg-purple-50 dark:bg-gray-700 flex items-center justify-center text-lg border border-purple-100 dark:border-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>
             Check-in
          </button>
       </div>

       <!-- Conteúdo Rolável -->
       <div class="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50 dark:bg-gray-900">
          <!-- Informações -->
          <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3 text-sm text-gray-600 dark:text-gray-300">
             <p class="flex items-start gap-3"><span class="text-lg min-w-[1.5rem] text-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span> <span id="detailAddress" class="font-medium text-gray-800 dark:text-gray-200">Endereço</span></p>
             <p class="flex items-start gap-3"><span class="text-lg min-w-[1.5rem] text-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></span> <span id="detailHours">Horário não informado</span></p>
             <p class="flex items-start gap-3"><span class="text-lg min-w-[1.5rem] text-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg></span> <span id="detailPayment">Pagamento não informado</span></p>
             <div class="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-400 italic" id="detailDesc">Descrição...</div>
          </div>

          <!-- Estatísticas de Visitas -->
          <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
             <h3 class="font-bold text-gray-800 dark:text-gray-200 mb-3 text-sm uppercase">Popularidade (Visitas)</h3>
             <div class="flex items-end gap-2 h-24" id="visitsChart">
                <!-- Barras geradas via JS -->
             </div>
          </div>

          <!-- Seção de Avaliações -->
          <div id="ratingsSection"></div>
       </div>
    </div>

    <!-- Chat IA (Container Escondido para uso no Drawer) -->
    <div id="chatTemplate" class="hidden">
      <div class="flex flex-col h-full">
        <div id="chatMessages" class="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
          <div class="flex justify-between items-center mb-2">
             <span class="text-xs text-gray-400 uppercase font-bold">Histórico</span>
             <button class="btnClearChat text-xs text-red-400 hover:text-red-600 underline">Limpar</button>
          </div>
          <div class="bg-white dark:bg-gray-800 p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 welcome-msg">
            <p class="text-blue-900 font-bold text-xs mb-1">🤖 Guia da Tijuca</p>
            <p class="text-gray-600 dark:text-gray-300">Olá! Sou sua IA local. Posso sugerir lugares cadastrados aqui no site ou tirar dúvidas sobre a Tijuca!</p>
          </div>
        </div>
        <div class="p-2 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2">
          <input type="text" id="chatInput" placeholder="Pergunte algo..." class="flex-1 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white">
          <button id="btnSendChat" class="bg-blue-900 text-white p-2 rounded-lg hover:bg-blue-800" aria-label="Enviar mensagem">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Botões Flutuantes (Direita) -->
    <div class="absolute top-36 md:top-4 right-4 z-[500] flex flex-col gap-2">
        <button id="btnGeo" class="bg-white p-3 rounded-full shadow-xl text-blue-900 hover:bg-blue-50" title="Minha Localização">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </button>
        
        ${
          currentUser
            ? `
        <button id="btnAddAlert" class="bg-red-600 text-white p-3 rounded-full shadow-xl hover:bg-red-700 animate-bounce-slow" title="Criar Alerta">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </button>
        `
            : ""
        }
    </div>

    <!-- Modal Criar Alerta -->
    <div id="alertModal" class="fixed inset-0 bg-black/50 z-[2000] hidden flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Criar Alerta na sua Localização</h3>
            <div class="grid grid-cols-3 gap-2 mb-4">
                <button class="alert-type-btn p-3 border dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 flex flex-col items-center gap-1" data-type="acidente">
                    <span class="text-2xl">🚨</span>
                    <span class="text-xs font-bold text-red-600">Acidente</span>
                </button>
                <button class="alert-type-btn p-3 border dark:border-gray-600 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-700 flex flex-col items-center gap-1" data-type="obra">
                    <span class="text-2xl">🚧</span>
                    <span class="text-xs font-bold text-orange-600">Obra</span>
                </button>
                <button class="alert-type-btn p-3 border dark:border-gray-600 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 flex flex-col items-center gap-1" data-type="dica">
                    <span class="text-2xl">🥟</span>
                    <span class="text-xs font-bold text-green-600">Dica</span>
                </button>
            </div>
            <input type="text" id="alertDesc" placeholder="Descreva brevemente (ex: Buraco na pista)" class="w-full p-2 border dark:border-gray-600 rounded mb-4 text-sm dark:bg-gray-700 dark:text-white">
            <div class="flex gap-2">
                <button id="cancelAlert" class="flex-1 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Cancelar</button>
                <button id="confirmAlert" class="flex-1 py-2 bg-blue-900 text-white rounded font-bold">Publicar</button>
            </div>
        </div>
    </div>
  </div>
  `;

  initMap();

  // Injeta o modal de ajuda no final do body
  if (!document.getElementById("helpModal")) {
    document.body.insertAdjacentHTML("beforeend", renderHelpModal());
  }
  setupMapEvents(currentUser);

  // Carrega dados imediatamente
  carregarDadosIniciais();
  carregarAlertas();
  applyTheme();
}

function initMap() {
  // Evita reinicialização do mapa se ele já existir
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }

  const tijucaCoords = [-22.9242, -43.2325];
  leafletMap = L.map("map", { zoomControl: false }).setView(tijucaCoords, 15);

  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  L.tileLayer(tileUrl, {
    attribution: "&copy; OpenStreetMap &copy; CARTO",
    subdomains: "abcd",
    maxZoom: 20,
  }).addTo(leafletMap);
  markersLayer.addTo(leafletMap);
  alertsLayer.addTo(leafletMap);
  L.control.zoom({ position: "bottomright" }).addTo(leafletMap);
}

function setupMapEvents(currentUser) {
  const btnLogout = document.getElementById("btnLogout");
  const drawerPanel = document.getElementById("drawerPanel");
  const drawerTitle = document.getElementById("drawerTitle");
  const drawerContent = document.getElementById("drawerContent");
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  const menuToggle = document.getElementById("menuToggle");
  const btnVoice = document.getElementById("btnVoice");
  const btnTheme = document.getElementById("btnTheme");

  if (btnLogout) btnLogout.onclick = () => signOut(auth);

  document.querySelector("#btnBusca").onclick = buscar;

  // Busca em tempo real ao digitar
  document.querySelector("#inputBusca").addEventListener("input", () => {
    aplicarFiltros();
    const resDiv = document.getElementById("resultados");
    const val = document.querySelector("#inputBusca").value.trim();
    if (val.length > 0) {
      resDiv.classList.remove("hidden");
    } else {
      resDiv.classList.add("hidden");
    }
  });

  // Pesquisa por Voz
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";

    btnVoice.onclick = () => {
      btnVoice.classList.add("text-red-600", "animate-pulse");
      recognition.start();
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.querySelector("#inputBusca").value = transcript;
      aplicarFiltros();
      btnVoice.classList.remove("text-red-600", "animate-pulse");
    };
    recognition.onend = () =>
      btnVoice.classList.remove("text-red-600", "animate-pulse");
  } else {
    btnVoice.style.display = "none";
  }

  // Eventos dos Botões de Filtro
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.onclick = (e) => {
      filtroAtual = e.target.dataset.tipo;
      // Atualiza visual dos botões
      document.querySelectorAll(".filter-btn").forEach((b) => {
        b.className =
          b.dataset.tipo === filtroAtual // Lógica de classe ativa/inativa
            ? "filter-btn bg-blue-900 text-white border border-blue-900 px-4 py-1.5 rounded-full text-sm font-medium shadow-md transition transform scale-105"
            : "filter-btn bg-white text-gray-700 border border-gray-200 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm hover:bg-gray-50 whitespace-nowrap transition";
      });
      aplicarFiltros();
    };
  });

  // Botão Tema
  btnTheme.onclick = () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem("tijuca_theme", isDarkMode ? "dark" : "light");
    applyTheme();
    initMap(); // Re-inicia o mapa para trocar o tile layer
  };

  document.getElementById("btnGeo").onclick = () => {
    if (!leafletMap) return;
    leafletMap.locate({ setView: true, maxZoom: 16 });
    leafletMap.on("locationfound", (e) => {
      L.marker(e.latlng)
        .addTo(leafletMap)
        .bindPopup("Você está aqui!")
        .openPopup();
    });
  };

  // --- Lógica de Alertas (Crowdsourcing) ---
  const btnAddAlert = document.getElementById("btnAddAlert");
  const alertModal = document.getElementById("alertModal");
  let selectedAlertType = null;

  if (btnAddAlert) {
    btnAddAlert.onclick = () => {
      if (!navigator.geolocation) return alert("Geolocalização necessária.");
      alertModal.classList.remove("hidden");
    };

    document.querySelectorAll(".alert-type-btn").forEach((btn) => {
      btn.onclick = (e) => {
        document
          .querySelectorAll(".alert-type-btn")
          .forEach((b) =>
            b.classList.remove(
              "bg-gray-100",
              "dark:bg-gray-700",
              "border-blue-500",
            ),
          );
        e.currentTarget.classList.add(
          "bg-gray-100",
          "dark:bg-gray-700",
          "border-blue-500",
        );
        selectedAlertType = e.currentTarget.dataset.type;
      };
    });

    document.getElementById("cancelAlert").onclick = () =>
      alertModal.classList.add("hidden");

    document.getElementById("confirmAlert").onclick = () => {
      if (!selectedAlertType) return alert("Selecione um tipo.");
      const desc = document.getElementById("alertDesc").value;

      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await addDoc(collection(db, "alertas"), {
            tipo: selectedAlertType,
            descricao: desc,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            criadoPor: currentUser.uid,
            dataCriacao: serverTimestamp(),
            expiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
          });
          alert("Alerta criado no mapa!");
          alertModal.classList.add("hidden");
          carregarAlertas();
        } catch (e) {
          console.error(e);
          alert("Erro ao criar alerta.");
        }
      });
    };
  }

  // --- Lógica da Sidebar Mobile ---
  menuToggle.onclick = () => {
    sidebar.classList.remove("-translate-x-full");
    sidebarOverlay.classList.remove("hidden");
  };

  const closeMobileSidebar = () => {
    sidebar.classList.add("-translate-x-full");
    sidebarOverlay.classList.add("hidden");
  };

  sidebarOverlay.onclick = closeMobileSidebar;

  // --- Lógica da Sidebar e Drawer ---
  const openDrawer = (title, contentHTML) => {
    drawerTitle.innerText = title;
    drawerContent.innerHTML = contentHTML;
    drawerPanel.classList.remove("-translate-x-full");
  };

  const closeDrawer = () => {
    drawerPanel.classList.add("-translate-x-full");
  };

  document.getElementById("closeDrawer").onclick = closeDrawer;

  // Botão Recentes
  document.getElementById("btnRecents").onclick = () => {
    closeMobileSidebar();
    const lista =
      historicoBusca.length > 0
        ? historicoBusca
            .map(
              (item) => `
            <div class="flex justify-between items-center p-2 border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer group">
              <span class="flex-1" onclick="document.getElementById('inputBusca').value='${item}'; aplicarFiltros();">${item}</span>
              <button onclick="window.removeRecent('${item}')" class="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 transition" title="Remover">✕</button>
            </div>
          `,
            )
            .join("")
        : '<p class="text-gray-500 text-center mt-4">Nenhuma busca recente.</p>';
    openDrawer("Buscas Recentes", lista);
  };

  // Botão Salvos
  document.getElementById("btnSaved").onclick = () => {
    closeMobileSidebar();
    const lista =
      locaisSalvos.length > 0
        ? locaisSalvos
            .map((id) => {
              const local = todosLocais.find((l) => l.nome === id); // Simplificação: usando nome como ID por enquanto
              return local
                ? `<div class="p-3 border dark:border-gray-700 rounded mb-2 bg-white dark:bg-gray-800 shadow-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700" onclick="window.focarNoMapa(${local.lat}, ${local.lng})">
                 <div class="font-bold text-blue-900 dark:text-blue-400">${local.nome}</div>
                 <div class="text-xs text-gray-500 dark:text-gray-400">${local.categoria}</div>
               </div>`
                : "";
            })
            .join("")
        : '<p class="text-gray-500 text-center mt-4">Nenhum local salvo.</p>';
    openDrawer("Meus Locais Salvos", lista);
  };

  // Botão IA
  document.getElementById("btnIA").onclick = () => {
    closeMobileSidebar();
    const chatHTML = document.getElementById("chatTemplate").innerHTML;
    openDrawer("Guia IA da Tijuca", chatHTML);
    // Reatribui eventos do chat pois o HTML foi clonado
    setupChatEvents();
  };

  // Botão Ajuda
  document.getElementById("btnHelp").onclick = () => {
    closeMobileSidebar();
    document.getElementById("helpModal").classList.remove("hidden");
  };

  // Fechar Ajuda
  const closeHelpBtn = document.getElementById("closeHelp");
  if (closeHelpBtn) {
    closeHelpBtn.onclick = () =>
      document.getElementById("helpModal").classList.add("hidden");
  }

  // Botão Perfil
  document.getElementById("btnProfile").onclick = () => {
    closeMobileSidebar();
    if (currentUser) {
      window.location.hash = "#perfil";
    } else {
      window.location.hash = "#login";
    }
  };

  // --- Lógica do Painel de Detalhes ---
  const detailPanel = document.getElementById("detailPanel");
  const closeDetailBtn = document.getElementById("closeDetail");

  closeDetailBtn.onclick = () => {
    detailPanel.classList.add("translate-y-full", "md:-translate-x-full");
  };

  // Função Global para Abrir Detalhes
  window.abrirDetalhes = async (id) => {
    const local = todosLocais.find((l) => l.id === id);
    if (!local) return;
    window.localAtual = local; // Salva contexto para rota

    // 1. Popula Dados Básicos
    document.getElementById("detailName").innerText = local.nome;
    document.getElementById("detailCategory").innerText = local.categoria;
    document.getElementById("detailAddress").innerText = local.endereco;
    document.getElementById("detailHours").innerText =
      local.horario || "Horário não informado";
    document.getElementById("detailPayment").innerText =
      local.pagamento || "Consulte formas de pagamento";
    document.getElementById("detailDesc").innerText =
      local.descricao || "Sem descrição disponível.";

    // Média de Avaliação (Placeholder inicial)
    const avgRating = local.mediaAvaliacao || 0;
    const totalReviews = local.totalAvaliacoes || 0;
    document.getElementById("detailName").innerHTML = `${
      local.nome
    } <span class="text-yellow-400 text-lg ml-2">★ ${
      avgRating > 0 ? avgRating.toFixed(1) : "New"
    }</span>`;

    // 2. Configura Botões de Ação
    document.getElementById("btnActionCall").onclick = () =>
      window.open(`tel:${local.whatsapp}`, "_self");
    document.getElementById("btnActionZap").onclick = () =>
      window.open(`https://wa.me/55${local.whatsapp}`, "_blank");

    document.getElementById("btnActionShare").onclick = () => {
      if (navigator.share) {
        navigator
          .share({
            title: local.nome,
            text: `Confira ${local.nome} no Guia da Tijuca!`,
            url: window.location.href,
          })
          .catch(console.error);
      } else {
        alert("Compartilhamento não suportado neste navegador.");
      }
    };

    const btnSave = document.getElementById("btnActionSave");
    const updateSaveBtn = () => {
      const isSaved = locaisSalvos.includes(local.nome);
      document.getElementById("iconActionSave").innerHTML = isSaved
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
      document.getElementById("txtActionSave").innerText = isSaved
        ? "Salvo"
        : "Salvar";
      document.getElementById("iconActionSave").className = isSaved
        ? "w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg border border-green-200"
        : "w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-lg border border-blue-100";
    };
    updateSaveBtn();
    btnSave.onclick = () => {
      window.toggleSave(local.nome);
      updateSaveBtn();
    };

    // Botão Check-in
    document.getElementById("btnActionCheckin").onclick = async () => {
      if (!currentUser) {
        alert("Faça login para fazer check-in e ganhar pontos!");
        window.location.hash = "#login";
        return;
      }
      try {
        // Incrementa visitas no local
        const localRef = doc(db, "estabelecimentos", id);
        await updateDoc(localRef, {
          visitas: increment(1),
        });

        // Dá pontos ao usuário
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          pontos: increment(10),
        });

        alert("Check-in realizado! Você ganhou 10 pontos 🎉");
        // Atualiza localmente para refletir no gráfico
        local.visitas = (local.visitas || 0) + 1;
        renderVisitsChart(local.visitas);
      } catch (e) {
        console.error(e);
        alert("Erro ao fazer check-in. Tente novamente.");
      }
    };

    // Renderiza Gráfico de Visitas
    renderVisitsChart(local.visitas || 0);

    // 3. Renderiza Seção de Avaliações
    const ratingsSection = document.getElementById("ratingsSection");
    ratingsSection.innerHTML = `
        <h3 class="font-bold text-lg text-blue-900 dark:text-blue-400 mb-3 flex justify-between items-center">
            Avaliações <span class="text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full" id="reviewCount">Carregando...</span>
        </h3>
        
        ${
          currentUser
            ? `
        <div class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-blue-100 dark:border-gray-700 shadow-sm">
            <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Sua Avaliação</p>
            <div class="flex gap-2 mb-3 text-2xl cursor-pointer text-gray-300" id="starRating">
                <span data-val="1" class="hover:text-yellow-400 transition">★</span>
                <span data-val="2" class="hover:text-yellow-400 transition">★</span>
                <span data-val="3" class="hover:text-yellow-400 transition">★</span>
                <span data-val="4" class="hover:text-yellow-400 transition">★</span>
                <span data-val="5" class="hover:text-yellow-400 transition">★</span>
            </div>
            <textarea id="ratingComment" class="w-full p-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-900 bg-gray-50 dark:bg-gray-700 dark:text-white" placeholder="Conte sua experiência..." rows="2"></textarea>
            <button id="btnSubmitRating" class="w-full bg-blue-900 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-800 transition shadow-md">Enviar Avaliação</button>
        </div>`
            : `
        <div class="mb-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-xl text-center border border-blue-100 dark:border-gray-600">
            <p class="text-sm text-blue-800 dark:text-blue-300 mb-2">Faça login para avaliar este local.</p>
            <a href="#login" class="inline-block bg-blue-900 text-white px-4 py-2 rounded-lg text-xs font-bold">Entrar</a>
        </div>`
        }
        
        <div id="reviewsList" class="space-y-4"></div>
    `;

    // Lógica de Estrelas (Se logado)
    let currentRating = 0;
    if (currentUser) {
      document.querySelectorAll("#starRating span").forEach((star) => {
        star.onclick = (e) => {
          currentRating = parseInt(e.target.dataset.val);
          document.querySelectorAll("#starRating span").forEach((s, i) => {
            s.style.color = i < currentRating ? "#facc15" : "#d1d5db";
          });
        };
      });

      document.getElementById("btnSubmitRating").onclick = async () => {
        if (currentRating === 0)
          return alert("Selecione uma nota de 1 a 5 estrelas.");
        const comment = document.getElementById("ratingComment").value;
        try {
          await addDoc(collection(db, `estabelecimentos/${id}/reviews`), {
            userId: currentUser.uid,
            userName: currentUser.displayName || "Usuário",
            rating: currentRating,
            comment: comment,
            date: serverTimestamp(),
          });

          // Atualiza média do local
          const localRef = doc(db, "estabelecimentos", id);
          const newTotal = (local.totalAvaliacoes || 0) + 1;
          const newAvg =
            ((local.mediaAvaliacao || 0) * (local.totalAvaliacoes || 0) +
              currentRating) /
            newTotal;

          await updateDoc(localRef, {
            mediaAvaliacao: newAvg,
            totalAvaliacoes: newTotal,
          });

          alert("Avaliação enviada!");
          loadReviews(id); // Recarrega lista
        } catch (e) {
          console.error(e);
          alert("Erro ao enviar avaliação.");
        }
      };
    }

    // Carregar Avaliações
    loadReviews(id);

    // 4. Mostra o Painel e Foca no Mapa
    detailPanel.classList.remove("translate-y-full", "md:-translate-x-full");
    window.focarNoMapa(local.lat, local.lng, false); // false = não abrir popup padrão
  };

  function renderVisitsChart(totalVisits) {
    const chart = document.getElementById("visitsChart");
    // Simula dados semanais baseados no total (apenas visual para MVP)
    const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
    const data = days.map(() =>
      Math.floor(Math.random() * (totalVisits > 0 ? totalVisits : 5)),
    );

    chart.innerHTML = data
      .map(
        (val, i) => `
          <div class="flex-1 flex flex-col justify-end items-center group">
              <div class="w-full bg-blue-200 rounded-t hover:bg-blue-400 transition-all relative" style="height: ${Math.max(
                10,
                val * 5,
              )}%">
                  <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-1 rounded opacity-0 group-hover:opacity-100 transition">${val}</span>
              </div>
              <span class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">${
                days[i]
              }</span>
          </div>
      `,
      )
      .join("");
  }

  async function loadReviews(localId) {
    const list = document.getElementById("reviewsList");
    const countBadge = document.getElementById("reviewCount");
    list.innerHTML =
      '<div class="text-center py-4 text-gray-400 text-sm">Carregando...</div>';

    try {
      const q = query(
        collection(db, `estabelecimentos/${localId}/reviews`),
        orderBy("date", "desc"),
      );
      const snap = await getDocs(q);

      countBadge.innerText = `${snap.size} opiniões`;
      list.innerHTML = "";

      if (snap.empty) {
        list.innerHTML =
          '<div class="text-center py-4 text-gray-400 text-sm italic">Seja o primeiro a avaliar!</div>';
        return;
      }

      snap.forEach((doc) => {
        const r = doc.data();
        const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
        list.innerHTML += `
                  <div class="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
                      <div class="flex justify-between items-start mb-1">
                          <span class="font-bold text-sm text-gray-800 dark:text-gray-200">${r.userName}</span>
                          <span class="text-yellow-400 text-xs tracking-widest">${stars}</span>
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">${r.comment}</p>
                  </div>
              `;
      });
    } catch (e) {
      console.error(e);
      list.innerHTML =
        '<div class="text-red-400 text-xs">Erro ao carregar avaliações.</div>';
    }
  }
}

// Função para abrir rota externa
window.abrirRota = (mode) => {
  if (!window.localAtual) return;
  const { lat, lng } = window.localAtual;
  // Google Maps URL Scheme
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode}`,
    "_blank",
  );
};

// Função para configurar eventos do chat (chamada ao abrir o drawer)
function setupChatEvents() {
  const chatInput = document.getElementById("chatInput"); // O ID pode duplicar se não cuidar, mas no drawer é único visível
  const btnSendChat = document.getElementById("btnSendChat");
  const chatMessages = document.getElementById("chatMessages");
  const btnClear = document.querySelector(".btnClearChat"); // Class para evitar conflito

  if (!chatInput || !btnSendChat) return; // Proteção

  // 1. Carregar contexto do Firestore (Locais cadastrados)
  let locaisContexto = "";
  // (Otimização: usa a variável global todosLocais já carregada)
  if (todosLocais.length > 0) {
    const locais = todosLocais
      .map((d) => `${d.nome} (${d.categoria})`)
      .join(", ");
    locaisContexto = `Locais cadastrados no nosso guia que você DEVE recomendar se perguntarem: ${locais}.`;
  }

  // 2. Botão Limpar Conversa
  if (btnClear) {
    btnClear.onclick = () => {
      chatMessages.innerHTML = `
        <div class="flex justify-between items-center mb-2"><span class="text-xs text-gray-400 uppercase font-bold">Histórico</span><button class="btnClearChat text-xs text-red-400 hover:text-red-600 underline">Limpar</button></div>
        <div class="bg-white dark:bg-gray-800 p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 welcome-msg"><p class="text-blue-900 font-bold text-xs mb-1">🤖 Guia da Tijuca</p><p class="text-gray-600 dark:text-gray-300">Conversa reiniciada! Como posso ajudar?</p></div>
      `;
      setupChatEvents(); // Re-bind
    };
  }

  // Chat Logic
  const enviarMensagem = async () => {
    const texto = chatInput.value.trim();
    if (!texto) return;

    chatMessages.insertAdjacentHTML(
      "beforeend",
      `<div class="flex justify-end"><div class="bg-blue-100 p-3 rounded-lg rounded-tr-none text-blue-900 max-w-[85%] shadow-sm">${texto}</div></div>`,
    );
    chatInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const loadingId = "loading-" + Date.now();
    chatMessages.insertAdjacentHTML(
      "beforeend",
      `<div id="${loadingId}" class="text-xs text-gray-400 animate-pulse ml-2">Digitando...</div>`,
    );

    try {
      if (!model) throw new Error("IA não configurada");
      const prompt = `Você é um guia local da Tijuca (RJ). ${locaisContexto} Responda de forma curta (máx 3 frases). Pergunta: "${texto}"`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const loader = document.getElementById(loadingId);
      if (loader) loader.remove();

      chatMessages.insertAdjacentHTML(
        "beforeend",
        `<div class="bg-white dark:bg-gray-800 p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 max-w-[90%]"><p class="text-blue-900 font-bold text-xs mb-1">🤖 Guia da Tijuca</p><p class="text-gray-700 dark:text-gray-300">${text}</p></div>`,
      );
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
      console.error(error);
      const loader = document.getElementById(loadingId);
      if (loader) loader.remove();
      chatMessages.insertAdjacentHTML(
        "beforeend",
        `<div class="text-red-500 text-xs ml-2">Erro na IA: ${
          error.message.includes("404")
            ? "Modelo não encontrado. Verifique se a API 'Generative Language' está ativada no Google Cloud."
            : error.message
        }</div>`,
      );
    }
  };

  btnSendChat.onclick = enviarMensagem;
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") enviarMensagem();
  });
}

// Função para aplicar tema
function applyTheme() {
  const html = document.documentElement;
  const themeIcon = document.getElementById("themeIcon");

  if (isDarkMode) {
    html.classList.add("dark");
    if (themeIcon) themeIcon.innerText = "☀️";
  } else {
    html.classList.remove("dark");
    if (themeIcon) themeIcon.innerText = "🌙";
  }
}

// Função para buscar dados do Firestore uma única vez
async function carregarDadosIniciais() {
  try {
    const querySnapshot = await getDocs(collection(db, "estabelecimentos"));
    todosLocais = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    aplicarFiltros(); // Renderiza tudo inicialmente
  } catch (error) {
    console.error("Erro ao carregar locais:", error);
    document.querySelector("#resultados").innerHTML =
      '<div class="text-red-500 text-center text-sm p-4">Erro ao carregar dados.</div>';
  }
}

// Função para carregar alertas
async function carregarAlertas() {
  // Listener em tempo real para alertas (Simulação de Push)
  onSnapshot(
    query(collection(db, "alertas"), orderBy("dataCriacao", "desc")),
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          // Verifica se é recente (menos de 1 min) para notificar
          if (Date.now() - data.dataCriacao?.toMillis() < 60000) {
            if (Notification.permission === "granted") {
              new Notification(`Novo Alerta: ${data.tipo.toUpperCase()}`, {
                body: data.descricao,
              });
            } else if (Notification.permission !== "denied") {
              Notification.requestPermission();
            }
          }
        }
      });

      // Atualiza mapa
      updateAlertsMap(snapshot.docs);
    },
  );
}

function updateAlertsMap(docs) {
  alertsLayer.clearLayers();
  docs.forEach((doc) => {
    const d = doc.data();
    // Verifica expiração (simples, no front)
    if (d.expiraEm && d.expiraEm.toDate() < new Date()) return;

    let iconEmoji = "📍";
    let colorClass = "bg-blue-500";

    if (d.tipo === "acidente") {
      iconEmoji = "🚨";
      colorClass = "bg-red-500";
    } else if (d.tipo === "obra") {
      iconEmoji = "🚧";
      colorClass = "bg-orange-500";
    } else if (d.tipo === "dica") {
      iconEmoji = "🥟";
      colorClass = "bg-green-500";
    } else if (d.tipo === "transito") {
      iconEmoji = "⚠️";
      colorClass = "bg-yellow-600";
    } else if (d.tipo === "seguranca") {
      iconEmoji = "👮";
      colorClass = "bg-blue-900";
    } else if (d.tipo === "chuva") {
      iconEmoji = "🌧️";
      colorClass = "bg-blue-400";
    } else if (d.tipo === "evento") {
      iconEmoji = "🎉";
      colorClass = "bg-pink-500";
    }

    let borderClass = "border-2 border-white";
    if (d.oficial) {
      colorClass = "bg-purple-700"; // Cor de destaque para Admin
      borderClass = "border-4 border-yellow-400"; // Borda dourada
    }

    const icon = L.divIcon({
      className: "custom-div-icon",
      html: `<div class="${colorClass} w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-lg ${borderClass} animate-pulse">${iconEmoji}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([d.lat, d.lng], { icon })
      .addTo(alertsLayer)
      .bindPopup(
        `${
          d.oficial
            ? '<span class="text-xs font-bold bg-purple-100 text-purple-800 px-1 rounded border border-purple-200">OFICIAL</span><br>'
            : ""
        }<b>${iconEmoji} ${d.tipo.toUpperCase()}</b><br>${
          d.descricao
        }<br><small class="text-gray-400">Expira em 24h</small>`,
      );
  });
}

// Função unificada de filtro e renderização (Local)
function aplicarFiltros() {
  const termo = document
    .querySelector("#inputBusca")
    .value.toLowerCase()
    .trim();

  // Salva no histórico se tiver termo
  if (termo && !historicoBusca.includes(termo)) {
    historicoBusca.unshift(termo);
    if (historicoBusca.length > 5) historicoBusca.pop();
    localStorage.setItem("tijuca_recents", JSON.stringify(historicoBusca));
  }

  const resultadosDiv = document.querySelector("#resultados");

  markersLayer.clearLayers();

  // Filtra por Texto E por Tipo
  const filtrados = todosLocais.filter((local) => {
    const matchTexto =
      !termo ||
      local.nome.toLowerCase().includes(termo) ||
      (local.tags && local.tags.some((t) => t.toLowerCase().includes(termo)));
    const matchTipo = filtroAtual === "todos" || local.tipo === filtroAtual;
    return matchTexto && matchTipo;
  });

  resultadosDiv.innerHTML = "";

  if (filtrados.length === 0) {
    resultadosDiv.innerHTML = `<div class="text-center p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"><p class="text-2xl mb-2">😕</p><p class="text-gray-600 dark:text-gray-400 font-medium">Nada encontrado.</p></div>`;
  } else {
    const bounds = L.latLngBounds();
    filtrados.forEach((d) => {
      const iconDisplay = d.icone || (d.tipo === "loja" ? "🏪" : "🛠️");
      const isSaved = locaisSalvos.includes(d.nome); // Verifica se está salvo

      // Label ao lado do pin (Tooltip)
      const marker = L.marker([d.lat, d.lng], {
        title: d.nome,
      }).bindTooltip(d.nome, {
        permanent: false, // Só mostra no hover ou pode mudar para true se quiser sempre visível
        direction: "top",
        className:
          "bg-white border border-gray-200 text-xs font-bold px-2 py-1 rounded shadow-sm text-blue-900",
      });

      // Evento de clique no marcador para abrir o painel
      marker.on("click", () => {
        window.abrirDetalhes(d.id);
      });

      markersLayer.addLayer(marker);
      bounds.extend([d.lat, d.lng]);

      resultadosDiv.innerHTML += `
        <div class="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition cursor-pointer group last:border-0" onclick="window.abrirDetalhes('${d.id}')">
          <div class="flex justify-between items-start">
             <h3 class="font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-900 dark:group-hover:text-blue-400 text-sm">${iconDisplay} ${d.nome}</h3>
             <span class="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded uppercase">${d.categoria}</span>
          </div>
          <p class="text-gray-500 dark:text-gray-400 text-xs mt-1">${d.endereco}</p>
        </div>
      `;
    });

    // Só ajusta o zoom se houver resultados e não for a carga inicial (opcional, mas bom para UX)
    if (filtrados.length > 0) {
      leafletMap.fitBounds(bounds, { padding: [50, 50] });
    }
  }
}

// Mantém compatibilidade com o botão de busca antigo, se necessário
async function buscar() {
  aplicarFiltros();
}

// Função Global para Remover Recente
window.removeRecent = (termo) => {
  historicoBusca = historicoBusca.filter((item) => item !== termo);
  localStorage.setItem("tijuca_recents", JSON.stringify(historicoBusca));
  document.getElementById("btnRecents").click(); // Reabre o drawer para atualizar a lista
};

// Função Global para Salvar/Remover
window.toggleSave = (nomeLocal) => {
  if (locaisSalvos.includes(nomeLocal)) {
    locaisSalvos = locaisSalvos.filter((item) => item !== nomeLocal);
  } else {
    locaisSalvos.push(nomeLocal);
  }
  localStorage.setItem("tijuca_saved", JSON.stringify(locaisSalvos));
  aplicarFiltros(); // Re-renderiza para atualizar o texto do botão no popup
};

window.focarNoMapa = (lat, lng, openPopup = true) => {
  leafletMap.flyTo([lat, lng], 18, { animate: true, duration: 1.5 });
  if (window.innerWidth < 768)
    document.getElementById("map").scrollIntoView({ behavior: "smooth" });
};
