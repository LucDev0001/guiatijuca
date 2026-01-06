export function renderHelpModal() {
  return `
    <div class="fixed inset-0 bg-black/60 z-[3000] flex items-center justify-center p-4 backdrop-blur-sm hidden" id="helpModal" role="dialog" aria-modal="true" aria-labelledby="helpTitle">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-fade-in">
        <button id="closeHelp" class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition" aria-label="Fechar Ajuda">✕</button>
        <h2 id="helpTitle" class="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
          <span>❓</span> Central de Ajuda
        </h2>
        <ul class="space-y-4 text-gray-600">
          <li class="flex items-start gap-3">
            <span class="bg-blue-100 text-blue-800 p-2 rounded-lg text-xl"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>
            <div>
              <strong class="block text-gray-800">Busca Inteligente</strong>
              <span class="text-sm">Digite o nome do local, categoria (ex: pizza) ou endereço.</span>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <span class="bg-yellow-100 text-yellow-800 p-2 rounded-lg text-xl"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg></span>
            <div>
              <strong class="block text-gray-800">Salvos</strong>
              <span class="text-sm">Clique no ícone de marcador nos detalhes do local para salvar seus favoritos.</span>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <span class="bg-purple-100 text-purple-800 p-2 rounded-lg text-xl"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></span>
            <div>
              <strong class="block text-gray-800">Guia IA</strong>
              <span class="text-sm">Converse com nossa Inteligência Artificial para dicas personalizadas do bairro.</span>
            </div>
          </li>
        </ul>
        <div class="mt-8 pt-4 border-t text-center text-xs text-gray-400">
          Guia Digital da Tijuca © 2026
        </div>
      </div>
    </div>
  `;
}
