export function renderAccessibilityWidget() {
  // Evita duplicar se já existir
  if (document.getElementById("accessibility-widget")) return;

  const widget = document.createElement("div");
  widget.id = "accessibility-widget";
  widget.className = "fixed bottom-4 left-4 z-[3000] flex flex-col gap-2";
  widget.innerHTML = `
    <button onclick="document.body.classList.toggle('high-contrast')" class="bg-black text-white p-3 rounded-full shadow-lg border-2 border-white font-bold" title="Alto Contraste">👁️</button>
    <button onclick="document.body.classList.toggle('large-text')" class="bg-blue-900 text-white p-3 rounded-full shadow-lg border-2 border-white font-bold" title="Aumentar Fonte">A+</button>
  `;
  document.body.appendChild(widget);
}
