export function initDonationCard() {
  // Verifica se já doou ou fechou recentemente (opcional, aqui faremos simples por sessão/tempo)
  const showCard = () => {
    if (document.getElementById("donationCard")) return;

    const card = document.createElement("div");
    card.id = "donationCard";
    card.className =
      "fixed bottom-20 right-4 z-[2000] bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-yellow-400 max-w-xs animate-fade-in-up transform transition-all duration-500";
    card.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-bold text-blue-900 dark:text-blue-400 text-sm">☕ Apoie o Guia!</h3>
        <button id="closeDonation" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
      </div>
      <p class="text-xs text-gray-600 dark:text-gray-300 mb-3">
        Mantemos este projeto com carinho. Se ele te ajudou, considere doar um cafezinho via Pix.
      </p>
      <div class="bg-gray-100 dark:bg-gray-700 p-2 rounded flex items-center justify-between gap-2">
        <code class="text-xs font-mono text-gray-800 dark:text-gray-200 truncate select-all">55003035000176</code>
        <button id="copyPix" class="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded font-bold transition">
          Copiar
        </button>
      </div>
      <p id="copyFeedback" class="text-[10px] text-green-600 mt-1 hidden text-center font-bold">Chave copiada! Obrigado! ❤️</p>
    `;

    document.body.appendChild(card);

    // Eventos
    document.getElementById("closeDonation").onclick = () => {
      card.remove();
      // Reaparece em 5 minutos (exemplo)
      setTimeout(showCard, 300000);
    };

    document.getElementById("copyPix").onclick = () => {
      navigator.clipboard.writeText("55003035000176");
      const feedback = document.getElementById("copyFeedback");
      feedback.classList.remove("hidden");
      setTimeout(() => {
        feedback.classList.add("hidden");
      }, 3000);
    };
  };

  // Aparece pela primeira vez após 10 segundos
  setTimeout(showCard, 10000);
}
