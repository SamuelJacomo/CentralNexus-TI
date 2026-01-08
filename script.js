import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, onValue, update, remove, push } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

// --- CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyD3ar5aDgXTSt1pNo-Bm5YrP0TfLi2IpQY",
    authDomain: "nexusstart-670d7.firebaseapp.com",
    databaseURL: "https://nexusstart-670d7-default-rtdb.firebaseio.com",
    projectId: "nexusstart-670d7",
    storageBucket: "nexusstart-670d7.firebasestorage.app",
    messagingSenderId: "917352175296",
    appId: "1:917352175296:web:45c09a8f9173b7a064bf25",
    measurementId: "G-2RX9VZX98D"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- VARIÁVEIS GLOBAIS ---
let tickets = [];
let ativos = [];

// --- 1. NAVEGAÇÃO ---
window.changeTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    const target = document.getElementById(tabId);
    if(target) target.classList.add('active');
    
    // Atualiza o botão da sidebar
    const btnAtivo = document.querySelector(`button[onclick*="${tabId}"]`) || document.getElementById(`btn-tab-${tabId}`);
    if(btnAtivo) btnAtivo.classList.add('active');

    if (tabId === 'chamados') renderTickets();
    if (tabId === 'ativos') renderAtivos();
    updateDashboard();
}

// --- 2. GESTÃO DE TICKETS (CHAMADOS) ---
function renderTickets() {
    const feed = document.getElementById('ticket-feed');
    if (!feed) return;
    feed.innerHTML = '';

    tickets.forEach((t) => {
        const priorityColor = t.priority === 'Crítica' ? '#ef4444' : (t.priority === 'Média' ? '#f59e0b' : '#10b981');
        const opacity = t.status === 'Concluído' ? '0.6' : '1';

        const card = document.createElement('div');
        card.className = 'ticket-card';
        card.style.cssText = `border-left: 4px solid ${priorityColor}; opacity: ${opacity};`;
        
        card.innerHTML = `
            <div class="ticket-header">
                <span>#${t.id} - <strong>${t.status}</strong></span>
                <span style="color: var(--accent); font-weight: bold;">👤 Solicitante: ${t.user || 'Não informado'}</span>
            </div>
            <h4 style="margin: 10px 0;">${t.subject || 'Sem Assunto'}</h4>
            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin: 10px 0;">
                <p style="font-size: 0.85rem; margin: 0;"><strong>Local/Equipamento:</strong> ${t.asset || '-'}</p>
                <p style="font-size: 0.85rem; margin: 8px 0 0 0; color: var(--text-muted);">${t.desc || 'Sem descrição adicional.'}</p>
            </div>
            <div class="ticket-actions">
                ${t.status === 'Aberto' ? `<button onclick="updateTicketStatus('${t.fbKey}', 'Em Andamento')" class="btn-step">Atender</button>` : ''}
                ${t.status === 'Em Andamento' ? `<button onclick="updateTicketStatus('${t.fbKey}', 'Concluído')" class="btn-step conclui">Finalizar</button>` : ''}
                <button onclick="removerTicket('${t.fbKey}')" class="btn-trash">🗑️</button>
            </div>
        `;
        feed.appendChild(card);
    });
}

// Ouvinte de Tickets
onValue(ref(db, 'tickets/'), (snapshot) => {
    const data = snapshot.val();
    tickets = [];
    if (data) {
        Object.keys(data).forEach(key => {
            tickets.push({ ...data[key], fbKey: key });
        });
        tickets.reverse();
    }
    renderTickets();
    updateDashboard();
});

// Tornar funções de Tickets globais para o HTML
window.updateTicketStatus = (fbKey, newStatus) => update(ref(db, `tickets/${fbKey}`), { status: newStatus });
window.removerTicket = (fbKey) => confirm("Excluir chamado?") && remove(ref(db, `tickets/${fbKey}`));

// --- 3. GESTÃO DE ATIVOS ---
function renderAtivos() {
    const tbody = document.getElementById('asset-list-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    ativos.forEach((a) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" data-key="${a.fbKey}"></td>
            <td><span class="status-badge ${a.status.toLowerCase()}">${a.status}</span></td>
            <td>${a.name}</td>
            <td>${a.model}</td>
            <td>${a.user}</td>
            <td>${a.dept}</td>
            <td><button onclick="removerAtivo('${a.fbKey}')" class="btn-trash">🗑️</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Ouvinte de Ativos
onValue(ref(db, 'ativos/'), (snapshot) => {
    const data = snapshot.val();
    ativos = [];
    if (data) {
        Object.keys(data).forEach(key => {
            ativos.push({ ...data[key], fbKey: key });
        });
    }
    renderAtivos();
    updateDashboard();
});

// Funções globais de Ativos
window.removerAtivo = (fbKey) => confirm("Remover este ativo?") && remove(ref(db, `ativos/${fbKey}`));

// --- 4. FORMULÁRIOS ---
document.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Novo Ticket
    if (e.target.id === 'ticket-form') {
        const newTicket = {
            id: Math.floor(1000 + Math.random() * 9000),
            subject: document.getElementById('ticket-subject').value,
            user: document.getElementById('ticket-user').value,
            asset: document.getElementById('ticket-asset-link').value,
            priority: document.getElementById('ticket-priority').value,
            desc: document.getElementById('ticket-desc').value,
            status: 'Aberto',
            date: new Date().toLocaleString()
        };
        push(ref(db, 'tickets/'), newTicket);
        e.target.reset();
    }

    // Novo Ativo
    if (e.target.id === 'asset-form') {
        const newAsset = {
            name: document.getElementById('asset-name').value,
            model: document.getElementById('asset-model').value,
            sn: document.getElementById('asset-sn').value,
            date: document.getElementById('asset-date').value,
            dept: document.getElementById('asset-dept').value,
            user: document.getElementById('asset-user').value,
            status: document.getElementById('asset-status').value
        };
        push(ref(db, 'ativos/'), newAsset);
        e.target.reset();
    }
});

// --- 5. DASHBOARD ---
function updateDashboard() {
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };
    
    setVal('count-tickets-aberto', tickets.filter(t => t.status === 'Aberto').length);
    setVal('count-tickets-progresso', tickets.filter(t => t.status === 'Em Andamento').length);
    setVal('count-tickets-concluido', tickets.filter(t => t.status === 'Concluído').length);
    
    setVal('count-ativos', ativos.length);
    setVal('count-online', ativos.filter(a => a.status === 'Operacional').length);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Configura os botões da sidebar manualmente devido ao escopo de módulo
    document.getElementById('btn-tab-dashboard')?.addEventListener('click', () => window.changeTab('dashboard'));
    document.getElementById('btn-tab-ativos')?.addEventListener('click', () => window.changeTab('ativos'));
    document.getElementById('btn-tab-chamados')?.addEventListener('click', () => window.changeTab('chamados'));
});