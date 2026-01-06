export function initCookieBanner() {
  const consent = localStorage.getItem("tijuca_cookie_consent");
  if (consent) return;

  const banner = document.createElement("div");
  banner.id = "cookieBanner";
  banner.className =
    "fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-[3000] flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg border-t border-gray-700 animate-fade-in-up";
  banner.innerHTML = `
      <div class="text-sm text-center md:text-left">
        <p>
          🍪 Utilizamos cookies para melhorar sua experiência e personalizar conteúdo. 
          Ao continuar navegando, você concorda com nossa 
          <a href="#politica" class="underline text-yellow-400 hover:text-yellow-300">Política de Privacidade</a>.
        </p>
      </div>
      <div class="flex gap-2">
        <button id="acceptCookies" class="bg-yellow-400 text-blue-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-300 transition text-sm whitespace-nowrap">
          Aceitar e Fechar
        </button>
      </div>
    `;

  document.body.appendChild(banner);

  document.getElementById("acceptCookies").onclick = () => {
    localStorage.setItem("tijuca_cookie_consent", "true");
    banner.remove();
  };
}
