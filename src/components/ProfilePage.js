import { db, auth } from "../config/firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";

export async function renderProfilePage(app, currentUser) {
  let userPoints = 0;
  if (currentUser) {
    const userSnap = await getDoc(doc(db, "users", currentUser.uid));
    if (userSnap.exists()) {
      userPoints = userSnap.data().pontos || 0;
    }
  }

  app.innerHTML = `
    <div class="h-full bg-gray-50 py-6 px-4 sm:py-10 overflow-y-auto">
      <div class="max-w-2xl mx-auto bg-white p-5 sm:p-8 rounded-xl shadow-lg mb-20 relative">
        <button id="btnCloseProfile" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold p-2">✕</button>
        
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-2xl font-bold text-blue-900">Seu Perfil</h2>
                <p class="text-sm text-gray-500">Gerencie suas informações.</p>
            </div>
            ${
              currentUser
                ? `
            <div class="text-center bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-100">
                <span class="block text-2xl font-bold text-yellow-600">${userPoints}</span>
                <span class="text-xs text-yellow-700 font-bold uppercase">Pontos</span>
            </div>`
                : ""
            }
        </div>

        <form id="profileForm" class="space-y-6">
          
          <!-- Campos de Acesso (Apenas se não estiver logado) -->
          ${
            !currentUser
              ? `
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 class="font-bold text-blue-900 mb-3">1. Dados de Acesso</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Seu Email *</label>
                <input type="email" id="email" required class="w-full p-3 border rounded bg-white" placeholder="exemplo@email.com">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Crie uma Senha *</label>
                <input type="password" id="password" required class="w-full p-3 border rounded bg-white" placeholder="Mínimo 6 caracteres" minlength="6">
              </div>
            </div>
          </div>
          `
              : ""
          }
          
          <!-- 1. Seleção de Tipo de Usuário -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <label class="cursor-pointer">
              <input type="radio" name="tipoPerfil" value="comum" class="peer sr-only" checked>
              <div class="p-2 border-2 rounded-lg text-center peer-checked:border-blue-900 peer-checked:bg-blue-50 hover:bg-gray-50 transition h-full flex flex-col justify-center items-center">
                <span class="text-2xl mb-1"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></span>
                <span class="text-xs font-bold mt-1">Pessoa Comum</span>
              </div>
            </label>
            <label class="cursor-pointer">
              <input type="radio" name="tipoPerfil" value="autonomo" class="peer sr-only">
              <div class="p-2 border-2 rounded-lg text-center peer-checked:border-blue-900 peer-checked:bg-blue-50 hover:bg-gray-50 transition h-full flex flex-col justify-center items-center">
                <span class="text-2xl mb-1"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg></span>
                <span class="text-xs font-bold mt-1">Autônomo</span>
              </div>
            </label>
            <label class="cursor-pointer">
              <input type="radio" name="tipoPerfil" value="empresa" class="peer sr-only">
              <div class="p-2 border-2 rounded-lg text-center peer-checked:border-blue-900 peer-checked:bg-blue-50 hover:bg-gray-50 transition h-full flex flex-col justify-center items-center">
                <span class="text-2xl mb-1"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18v-8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"></path><path d="M9 10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"></path><path d="M12 2a7 7 0 0 0-7 7v4h14v-4a7 7 0 0 0-7-7z"></path></svg></span>
                <span class="text-xs font-bold mt-1">Empresa</span>
              </div>
            </label>
          </div>

          <!-- Campos Básicos -->
          <div>
            <label id="lblNome" class="block text-sm font-bold text-gray-700 mb-1">Seu Nome *</label>
            <input type="text" id="nome" required class="w-full p-3 border rounded bg-gray-50" value="${
              currentUser ? currentUser.displayName || "" : ""
            }">
          </div>

          <!-- Campos Específicos -->
          <div id="businessFields" class="hidden space-y-4 border-t pt-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Descrição Curta / Slogan *</label>
              <input type="text" id="descricao" placeholder="Ex: O melhor bolo da Tijuca" class="w-full p-3 border rounded bg-gray-50">
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">CNPJ (Opcional)</label>
                <input type="text" id="cnpj" placeholder="00.000.000/0000-00" class="w-full p-3 border rounded bg-gray-50">
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Instagram</label>
                <input type="text" id="instagram" placeholder="@seu_perfil" class="w-full p-3 border rounded bg-gray-50">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Categoria *</label>
                <select id="categoria" class="w-full p-3 border rounded bg-gray-50">
                  <option>Alimentação</option>
                  <option>Serviços</option>
                  <option>Saúde</option>
                  <option>Automotivo</option>
                  <option>Pets</option>
                  <option>Beleza</option>
                  <option>Educação</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">WhatsApp *</label>
                <input type="tel" id="whatsapp" placeholder="(21) 99999-9999" class="w-full p-3 border rounded bg-gray-50" maxlength="15">
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Horário de Funcionamento</label>
              <input type="text" id="horario" placeholder="Ex: Seg a Sex 09h às 18h" class="w-full p-3 border rounded bg-gray-50">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="delivery" class="w-5 h-5 text-blue-900 rounded">
                <span class="text-sm font-bold text-gray-700">Faz Delivery / Entrega?</span>
              </label>
              
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Formas de Pagamento</label>
                <input type="text" id="pagamento" placeholder="Ex: Pix, Cartão, Dinheiro" class="w-full p-2 border rounded bg-white text-sm">
              </div>
            </div>

            <div>
              <label id="lblEndereco" class="block text-sm font-bold text-gray-700 mb-1">Endereço *</label>
              <div class="flex gap-2">
                <input type="text" id="endereco" class="w-full p-3 border rounded bg-gray-50" placeholder="Rua, Número, Bairro">
                <button type="button" id="btnUseLocation" class="bg-blue-100 text-blue-900 px-4 rounded hover:bg-blue-200 transition font-bold flex items-center justify-center" title="Usar minha localização"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path><circle cx="12" cy="10" r="3"></circle></svg></button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Tags (separadas por vírgula)</label>
              <input type="text" id="tags" placeholder="Ex: pizza, entrega, barato, 24h" class="w-full p-3 border rounded bg-gray-50">
            </div>

            <!-- Seletor de Ícones -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Escolha um Ícone para o Mapa:</label>
              <div class="grid grid-cols-4 sm:grid-cols-6 gap-2" id="iconGrid"></div>
              <input type="hidden" id="selectedIcon" value="📍">
            </div>
          </div>

          <div class="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 mt-4 hidden" id="termosContainer">
            <p class="font-bold mb-2">⚠️ Termos de Responsabilidade</p>
            <p class="mb-2">Declaro que as informações do meu negócio são verdadeiras.</p>
            <label class="flex items-center gap-2 mt-4 cursor-pointer">
              <input type="checkbox" id="termos" class="w-5 h-5 text-blue-900 rounded">
              <span class="font-bold">Li e aceito os <a href="#termos" target="_blank" class="text-blue-700 underline">Termos de Uso</a>.</span>
            </label>
          </div>

          <button type="submit" class="w-full bg-blue-900 text-white font-bold py-4 rounded-lg hover:bg-blue-800 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
            Salvar Perfil
          </button>
          
          ${
            currentUser
              ? `
            <button type="button" id="btnLogoutProfile" class="w-full border border-red-200 text-red-600 font-bold py-3 rounded-lg hover:bg-red-50 transition mt-4">
              Sair da Conta
            </button>
          `
              : ""
          }

          ${
            !currentUser
              ? `
            <p class="text-center text-sm text-gray-500 mt-4">
              Já tem conta? <a href="#login" class="text-blue-900 font-bold hover:underline">Fazer Login</a>
            </p>
          `
              : ""
          }
        </form>
      </div>
    </div>
  `;

  // Eventos de Navegação
  document.getElementById("btnCloseProfile").onclick = () => {
    window.location.hash = "#mapa";
  };

  const btnLogout = document.getElementById("btnLogoutProfile");
  if (btnLogout) {
    btnLogout.onclick = () =>
      signOut(auth).then(() => (window.location.hash = "#home"));
  }

  // Lógica da Tela
  const radios = document.getElementsByName("tipoPerfil");
  const businessFields = document.getElementById("businessFields");
  const termosContainer = document.getElementById("termosContainer");
  const lblNome = document.getElementById("lblNome");
  const lblEndereco = document.getElementById("lblEndereco");
  const inputEndereco = document.getElementById("endereco");
  const iconGrid = document.getElementById("iconGrid");
  const selectedIconInput = document.getElementById("selectedIcon");

  const icons = [
    "🍕",
    "🍔",
    "🍣",
    "🍺",
    "☕",
    "💊",
    "🔧",
    "🚗",
    "💇",
    "💅",
    "🏋️",
    "🐶",
    "🐱",
    "🎓",
    "📚",
    "💻",
    "🎨",
    "👗",
    "🛒",
    "🏥",
    "🦷",
    "🏠",
    "🔑",
    "🚲",
  ];

  iconGrid.innerHTML = icons
    .map(
      (icon) => `
    <div class="cursor-pointer text-2xl p-2 border rounded hover:bg-blue-50 text-center icon-option" onclick="window.selectIcon('${icon}')">
      ${icon}
    </div>
  `
    )
    .join("");

  window.selectIcon = (icon) => {
    selectedIconInput.value = icon;
    document
      .querySelectorAll(".icon-option")
      .forEach((el) => el.classList.remove("bg-blue-200", "border-blue-500"));
    event.currentTarget.classList.add("bg-blue-200", "border-blue-500");
  };

  radios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === "comum") {
        businessFields.classList.add("hidden");
        termosContainer.classList.add("hidden");
        lblNome.innerText = "Seu Nome *";
      } else {
        businessFields.classList.remove("hidden");
        termosContainer.classList.remove("hidden");
      }

      if (val === "autonomo") {
        lblNome.innerText = "Nome do Profissional *";
        lblEndereco.innerText = "Local de Atendimento ou Base *";
        inputEndereco.placeholder = "Ex: Atendo em domicílio na Tijuca";
      } else if (val === "empresa") {
        lblNome.innerText = "Nome da Empresa *";
        lblEndereco.innerText = "Endereço Completo *";
        inputEndereco.placeholder = "Rua, Número, Bairro, CEP";
      }
    });
  });

  // Formatação automática do WhatsApp
  const whatsappInput = document.getElementById("whatsapp");
  whatsappInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 10) {
      value = `${value.slice(0, 10)}-${value.slice(10)}`;
    }
    e.target.value = value;
  });

  // Geolocalização para Endereço
  const btnUseLocation = document.getElementById("btnUseLocation");
  btnUseLocation.onclick = () => {
    if (!navigator.geolocation) return alert("Geolocalização não suportada.");

    const originalText = btnUseLocation.innerText;
    btnUseLocation.innerText = "⌛";
    btnUseLocation.disabled = true;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.address) {
            const road = data.address.road || "";
            const number = data.address.house_number || "";
            const suburb =
              data.address.suburb || data.address.neighbourhood || "";
            document.getElementById(
              "endereco"
            ).value = `${road}, ${number}, ${suburb}`;
          }
        } catch (e) {
          console.error(e);
          alert("Erro ao buscar endereço.");
        } finally {
          btnUseLocation.innerText = originalText;
          btnUseLocation.disabled = false;
        }
      },
      () => {
        alert("Permissão negada.");
        btnUseLocation.innerText = originalText;
        btnUseLocation.disabled = false;
      }
    );
  };

  // Função de Geocoding (Nominatim OpenStreetMap)
  const geocodeAddress = async (address) => {
    try {
      // Adiciona contexto da Tijuca para melhorar precisão
      const query = `${address}, Tijuca, Rio de Janeiro`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (error) {
      console.error("Erro no geocoding:", error);
    }
    return null;
  };

  document.getElementById("profileForm").onsubmit = async (e) => {
    e.preventDefault();

    // Captura valores antes de qualquer operação async (que pode limpar o DOM)
    const nomeVal = document.getElementById("nome").value;
    const descricaoVal = document.getElementById("descricao").value;
    const categoriaVal = document.getElementById("categoria").value;
    const cnpjVal = document.getElementById("cnpj").value;
    const instagramVal = document.getElementById("instagram").value;
    const horarioVal = document.getElementById("horario").value;
    const deliveryVal = document.getElementById("delivery").checked;
    const pagamentoVal = document.getElementById("pagamento").value;
    const selectedIconVal = document.getElementById("selectedIcon").value;
    const tagsVal = document.getElementById("tags").value;
    const termosChecked = document.getElementById("termos").checked;

    // Captura dados de auth se existirem
    const emailInput = document.getElementById("email");
    const passInput = document.getElementById("password");
    const emailVal = emailInput ? emailInput.value : null;
    const passVal = passInput ? passInput.value : null;

    const tipoPerfil = document.querySelector(
      'input[name="tipoPerfil"]:checked'
    ).value;

    // Feedback visual de carregamento
    const btnSubmit = e.target.querySelector("button[type='submit']");
    const originalText = btnSubmit.innerText;
    btnSubmit.innerText = "Salvando...";
    btnSubmit.disabled = true;

    try {
      // 1. Cria usuário se não existir
      let user = currentUser;
      if (!user) {
        btnSubmit.innerText = "Criando conta...";
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          emailVal,
          passVal
        );
        user = userCredential.user;
      }

      // Validação de Duplicidade (Nome da Empresa)
      if (tipoPerfil !== "comum") {
        const q = query(
          collection(db, "estabelecimentos"),
          where("nome", "==", nomeVal)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          throw new Error(
            "Já existe um estabelecimento cadastrado com este nome. Por favor, verifique ou use outro nome."
          );
        }
      }

      // 2. Salva dados do perfil
      if (tipoPerfil === "comum") {
        await setDoc(doc(db, "users", user.uid), {
          nome: nomeVal,
          tipo: "comum",
          email: user.email,
        });
      } else {
        if (!termosChecked) {
          alert("Você precisa aceitar os termos.");
          btnSubmit.innerText = originalText;
          btnSubmit.disabled = false;
          return;
        }

        const whatsappRaw = document
          .getElementById("whatsapp")
          .value.replace(/\D/g, "");
        if (whatsappRaw.length !== 11) {
          alert("O WhatsApp deve ter 11 dígitos (DDD + 9 números).");
          btnSubmit.innerText = originalText;
          btnSubmit.disabled = false;
          return;
        }

        const endereco = document.getElementById("endereco").value;
        let coords = { lat: -22.9242, lng: -43.2325 }; // Fallback (Saens Peña)

        // Tenta converter endereço em coordenadas
        btnSubmit.innerText = "Localizando no mapa...";
        const geoResult = await geocodeAddress(endereco);

        if (geoResult) {
          coords = geoResult;
        } else {
          // Se falhar, usa fallback com leve variação aleatória
          coords.lat += Math.random() * 0.002 - 0.001;
          coords.lng += Math.random() * 0.002 - 0.001;
          alert(
            "Não conseguimos achar o endereço exato. Usaremos uma localização aproximada na Tijuca."
          );
        }

        const dados = {
          tipo: tipoPerfil,
          nome: nomeVal,
          descricao: descricaoVal,
          categoria: categoriaVal,
          whatsapp: whatsappRaw, // Salva apenas números
          endereco: endereco,
          cnpj: cnpjVal,
          instagram: instagramVal,
          horario: horarioVal,
          delivery: deliveryVal,
          pagamento: pagamentoVal,
          icone: selectedIconVal,
          tags: tagsVal.split(",").map((t) => t.trim()),
          criadoPor: user.uid,
          dataCriacao: new Date(),
          lat: coords.lat,
          lng: coords.lng,
        };

        await addDoc(collection(db, "estabelecimentos"), dados);
        await setDoc(doc(db, "users", user.uid), {
          nome: dados.nome,
          tipo: tipoPerfil,
          isMerchant: true,
        });
      }

      alert("Perfil salvo com sucesso!");
      window.location.hash = "#mapa";
    } catch (error) {
      console.error(error);
      let msg = error.message;
      if (error.code === "auth/email-already-in-use")
        msg = "Este email já está cadastrado.";
      if (error.code === "auth/weak-password") msg = "A senha é muito fraca.";
      alert("Erro: " + msg);
      btnSubmit.innerText = originalText;
      btnSubmit.disabled = false;
    }
  };
}
