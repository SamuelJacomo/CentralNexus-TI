<img width="1024" height="1024" alt="Gemini_Generated_Image_8qjmbt8qjmbt8qjm" src="https://github.com/user-attachments/assets/94a9c482-a4ba-4938-a679-c3577225fc8b" />


⚡ TechNexus | Cloud Support System
O TechNexus é um ecossistema de gerenciamento de chamados técnicos em tempo real. O projeto simula uma interface de terminal de alta tecnologia e utiliza uma arquitetura baseada em nuvem para conectar usuários e administradores instantaneamente.
🚀 Funcionalidades Principais
Painel Admin (Kanban): Gestão visual de chamados dividida por status (Aberto, Em Andamento, Concluído).

Portal do Cliente: Interface leve e otimizada para dispositivos móveis para abertura de chamados via link ou QR Code.

Sincronização Cloud: Integração com Firebase Realtime Database, permitindo que chamados abertos no celular apareçam instantaneamente no desktop sem recarregar a página.

Persistência de Dados: Todos os registros são salvos na nuvem, garantindo que o histórico não seja perdido ao fechar o navegador.

🛠️ Tecnologias Utilizadas
Frontend: HTML5, CSS3 (Variáveis CSS, Flexbox, Grid), JavaScript (ES6+).

Backend & Database: Firebase (Realtime Database).

Ícones: Lucide Icons.

Tipografia: JetBrains Mono (Google Fonts).

📂ESTRUTURA DO PROJETO
├── index.html          # Painel Administrativo (Dashboard)
├── portal.html         # Portal de abertura de chamados para o usuário
├── script.js           # Lógica do painel admin e integração Firebase
├── style.css           # Estilização principal (Dark/Terminal UI)
└── style-cliente.css   # Estilização focada na experiência do usuário mobile


⚙️ Como o sistema funciona?
O Usuário acessa o portal.html (geralmente via QR Code no local do suporte).

Ao enviar o formulário, os dados são validados e enviados para uma coleção tickets no Firebase.

O Admin, que mantém o index.html aberto, recebe um gatilho automático via onValue (WebSocket).

O sistema renderiza dinamicamente o novo card na coluna "Aguardando".

O Admin pode avançar o status do ticket apenas clicando no card, o que atualiza o banco de dados global.

🌟 Destaque Técnico
O maior diferencial deste projeto foi a transição do armazenamento local (localStorage) para uma arquitetura Serverless. 
Isso permitiu resolver o problema de silos de dados, criando uma aplicação verdadeiramente colaborativa e multi-dispositivo.

📋 Como rodar este projeto
Clone o repositório.

Certifique-se de configurar suas chaves do Firebase no index.html e portal.html.

Utilize o Live Server ou suba para o GitHub Pages










