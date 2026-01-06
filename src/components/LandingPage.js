export function renderLandingPage(app) {
  app.innerHTML = `
    <div class="h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white overflow-y-auto flex flex-col">
      <nav class="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <h1 class="font-bold text-2xl italic tracking-tighter">TIJUCA<span class="text-yellow-400">GUIA</span></h1>
        <div class="space-x-4">
          <a href="#login" class="text-sm font-bold hover:text-yellow-400 transition">Sou Empresa</a>
          <a href="#mapa" class="bg-yellow-400 text-blue-900 px-6 py-2 rounded-full font-bold hover:bg-yellow-300 transition shadow-lg">Acessar Guia</a>
        </div>
      </nav>

      <header class="text-center mt-20 px-4 max-w-4xl mx-auto flex-grow">
        <h2 class="text-5xl md:text-6xl font-black mb-6 leading-tight">O bairro inteiro na <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">palma da sua mão.</span></h2>
        <p class="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">Encontre serviços, comércios e profissionais autônomos na Tijuca. Do Saens Peña ao Uruguai, conectamos vizinhos.</p>
        
        <div class="flex flex-col md:flex-row gap-4 justify-center mb-20">
          <a href="#mapa" class="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold text-lg shadow-xl hover:scale-105 transition flex items-center justify-center gap-2">
            <span>🗺️ Explorar Mapa</span>
          </a>
          <a href="#cadastro" class="border-2 border-yellow-400 text-yellow-400 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 hover:text-blue-900 transition">
            Cadastrar Empresa
          </a>
        </div>
      </header>

      <section class="bg-white text-blue-900 py-20 px-4 rounded-t-[3rem] shadow-2xl relative z-10">
        <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <div class="p-6 hover:bg-gray-50 rounded-xl transition duration-300">
            <div class="text-4xl mb-4 flex justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-900"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.15 1.207-.6 1.207-.6 1.364-2.715 2.715-4.89 6.688-2.653.943-1.028 1.364-2.49 1.207-4.08C15.706 7.65 14 6 14 6h-4l-5 5v4z"></path><path d="M12 6V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-3"></path></svg></div>
            <h3 class="text-xl font-bold mb-2">Rápido e Local</h3>
            <p class="text-gray-600">Focado exclusivamente na Tijuca. Resultados relevantes perto de você.</p>
          </div>
          <div class="p-6 hover:bg-gray-50 rounded-xl transition duration-300">
            <div class="text-4xl mb-4 flex justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-900"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
            <h3 class="text-xl font-bold mb-2">Apoie o Bairro</h3>
            <p class="text-gray-600">Conecte-se com pequenos empreendedores e autônomos da região.</p>
          </div>
          <div class="p-6 hover:bg-gray-50 rounded-xl transition duration-300">
            <div class="text-4xl mb-4 flex justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-900"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg></div>
            <h3 class="text-xl font-bold mb-2">100% Mobile</h3>
            <p class="text-gray-600">Feito para usar na rua, leve e direto ao ponto.</p>
          </div>
        </div>
      </section>
      
      <footer class="bg-white text-gray-700 pt-10 pb-5 border-t border-gray-200">
        <div class="container mx-auto px-6 text-center md:text-left">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="mx-auto md:mx-0">
              <a href="#" class="text-2xl font-bold text-blue-900 flex items-center gap-2 mb-2 justify-center md:justify-start italic tracking-tighter">
                TIJUCA<span class="text-yellow-400">GUIA</span>
              </a>
              <p class="text-gray-500 text-sm">
                A solução completa para conectar a Tijuca.
              </p>
            </div>

            <div>
              <h6 class="uppercase font-bold mb-3 text-blue-900">Navegação</h6>
              <p class="mb-2">
                <a href="#mapa" class="text-gray-600 hover:text-blue-900 hover:underline transition">Mapa</a>
              </p>
              <p class="mb-2">
                <a href="#login" class="text-gray-600 hover:text-blue-900 hover:underline transition">Sou Empresa</a>
              </p>
              <p class="mb-2">
                <a href="#login" class="text-gray-600 hover:text-blue-900 hover:underline transition">Login</a>
              </p>
            </div>

            <div>
              <h6 class="uppercase font-bold mb-3 text-blue-900">Jurídico</h6>
              <p class="mb-2">
                <a class="text-gray-600 hover:text-blue-900 hover:underline transition" href="#termos">Termos de Uso</a>
              </p>
              <p class="mb-2">
                <a class="text-gray-600 hover:text-blue-900 hover:underline transition" href="#politica">Política de Privacidade</a>
              </p>
            </div>
          </div>
        </div>

        <div class="text-center p-4 mt-8 border-t border-gray-100">
          <p class="text-sm text-gray-500">
            © <span>2026</span> Copyright:
            <a class="font-semibold text-blue-900" href="#">Guia Digital da Tijuca</a>
            | Desenvolvido por
            <strong>
              <a href="https://lucianodevfrontend.netlify.app/" target="_blank" class="text-gray-700 hover:text-blue-900 hover:underline">@santoscodes</a>
            </strong>
          </p>
        </div>
      </footer>
    </div>
  `;
}
