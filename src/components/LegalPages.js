export function renderTermsPage(app) {
  app.innerHTML = `
    <div class="h-full bg-gray-50 py-10 px-4 overflow-y-auto">
      <div class="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <a href="#home" class="text-blue-900 font-bold mb-6 inline-block hover:underline">&larr; Voltar para Home</a>
        <h1 class="text-3xl font-bold text-blue-900 mb-6">Termos de Uso</h1>
        <div class="prose text-gray-700 space-y-4 text-sm md:text-base">
          <p><strong>Última atualização: Janeiro de 2026</strong></p>
          <p>Bem-vindo ao Guia Digital da Tijuca. Ao acessar e utilizar este site, você aceita e concorda em estar vinculado aos termos e disposições deste acordo.</p>
          
          <h3 class="text-xl font-bold text-blue-900 mt-4">1. O Serviço</h3>
          <p>O Guia Digital da Tijuca é uma plataforma de catálogo online que conecta moradores a comércios e prestadores de serviços locais no bairro da Tijuca, Rio de Janeiro. Atuamos apenas como intermediários na divulgação de informações.</p>

          <h3 class="text-xl font-bold text-blue-900 mt-4">2. Isenção de Responsabilidade</h3>
          <p>O Guia Digital da Tijuca <strong>não se responsabiliza</strong> por:</p>
          <ul class="list-disc pl-5">
            <li>Qualidade, segurança ou legalidade dos serviços prestados pelos anunciantes.</li>
            <li>Veracidade das informações cadastradas pelos usuários (embora nos esforcemos para verificar denúncias).</li>
            <li>Transações financeiras, entregas ou acordos firmados entre usuários e estabelecimentos.</li>
          </ul>

          <h3 class="text-xl font-bold text-blue-900 mt-4">3. Cadastro e Conteúdo</h3>
          <p>Ao cadastrar seu negócio, você declara que todas as informações fornecidas são verdadeiras e que possui as licenças necessárias para operar (se aplicável). Reservamo-nos o direito de remover cadastros suspeitos, ofensivos, duplicados ou que violem as leis brasileiras.</p>

          <h3 class="text-xl font-bold text-blue-900 mt-4">4. Foro</h3>
          <p>Fica eleito o foro da Comarca da Capital do Estado do Rio de Janeiro para dirimir quaisquer dúvidas decorrentes destes termos.</p>
        </div>
      </div>
    </div>
  `;
}

export function renderPrivacyPage(app) {
  app.innerHTML = `
    <div class="h-full bg-gray-50 py-10 px-4 overflow-y-auto">
      <div class="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <a href="#home" class="text-blue-900 font-bold mb-6 inline-block hover:underline">&larr; Voltar para Home</a>
        <h1 class="text-3xl font-bold text-blue-900 mb-6">Política de Privacidade</h1>
        <div class="prose text-gray-700 space-y-4 text-sm md:text-base">
          <p>Em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>, explicamos com transparência como tratamos seus dados.</p>

          <h3 class="text-xl font-bold text-blue-900 mt-4">1. Coleta de Dados</h3>
          <p>Coletamos informações que você nos fornece diretamente ao se cadastrar, tais como:</p>
          <ul class="list-disc pl-5">
            <li>Dados de Identificação: Nome, Email.</li>
            <li>Dados Comerciais: Nome da Empresa, Endereço, Telefone (WhatsApp), CNPJ (opcional).</li>
          </ul>

          <h3 class="text-xl font-bold text-blue-900 mt-4">2. Finalidade do Tratamento</h3>
          <p>Seus dados são utilizados estritamente para:</p>
          <ul class="list-disc pl-5">
            <li>Exibir seu negócio no mapa público para outros usuários (Publicidade).</li>
            <li>Permitir que clientes entrem em contato via WhatsApp.</li>
            <li>Autenticação e segurança da sua conta no sistema.</li>
          </ul>

          <h3 class="text-xl font-bold text-blue-900 mt-4">3. Compartilhamento Público</h3>
          <p>Ao se cadastrar como "Empresa" ou "Autônomo", você consente que as informações do seu perfil comercial (Nome, Endereço, WhatsApp, Categoria) sejam tornadas públicas no site para que clientes possam encontrá-lo. Dados sensíveis de login (senha) nunca são compartilhados.</p>

          <h3 class="text-xl font-bold text-blue-900 mt-4">4. Seus Direitos</h3>
          <p>Você pode solicitar a exclusão, correção ou portabilidade dos seus dados a qualquer momento entrando em contato conosco ou excluindo seu perfil através da plataforma.</p>
        </div>
      </div>
    </div>
  `;
}
