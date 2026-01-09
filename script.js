// Inicialização
lucide.createIcons();
let tickets = JSON.parse(localStorage.getItem('nexus_v2_db')) || [];

// Navegação entre abas
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
        renderAll();
    });
});

// Funções do Modal
function openModal() { document.getElementById('modal-admin').style.display = 'flex'; }
function closeModal() { 
    document.getElementById('modal-admin').style.display = 'none';
    clearForm();
}

function clearForm() {
    document.getElementById('adm-user').value = '';
    document.getElementById('adm-subject').value = '';
    document.getElementById('adm-desc').value = '';
}

// Criar Chamado
function createAdminTicket() {
    const user = document.getElementById('adm-user').value;
    const subject = document.getElementById('adm-subject').value;
    const desc = document.getElementById('adm-desc').value;
    const category = document.getElementById('adm-category').value;
    const prio = document.getElementById('adm-prio').value;

    if (!user || !subject) return alert("Preencha o solicitante e o assunto!");

    const newTicket = {
        id: "TKT-" + Math.floor(1000 + Math.random() * 9000),
        user, subject, desc, category, prio,
        status: 'aberto'
    };

    tickets.push(newTicket);
    save();
    closeModal();
    renderAll();
}

// Avançar Status
function advanceTicket(id) {
    const idx = tickets.findIndex(t => t.id === id);
    if (tickets[idx].status === 'aberto') tickets[idx].status = 'andamento';
    else if (tickets[idx].status === 'andamento') tickets[idx].status = 'concluido';
    
    save();
    renderAll();
}

// Deletar do Histórico
function deleteTicket(id) {
    if(confirm("Remover permanentemente do registro?")) {
        tickets = tickets.filter(t => t.id !== id);
        save();
        renderAll();
    }
}

function save() {
    localStorage.setItem('nexus_v2_db', JSON.stringify(tickets));
}

// Renderização Geral
function renderAll() {
    const lists = {
        aberto: document.getElementById('list-aberto'),
        andamento: document.getElementById('list-andamento'),
        concluido: document.getElementById('list-concluido')
    };

    // Limpa listas
    Object.values(lists).forEach(l => l.innerHTML = '');
    const tbody = document.getElementById('tbody-historico');
    tbody.innerHTML = '';

    let stats = { aberto: 0, andamento: 0, concluido: 0 };

    tickets.forEach(t => {
        stats[t.status]++;

        // HTML do Card
        const cardHTML = `
            <div class="card" onclick="advanceTicket('${t.id}')" title="Descrição: ${t.desc || 'Sem detalhes'}">
                <span class="card-id">#${t.id}</span>
                <div class="card-subject">${t.subject}</div>
                <div class="card-user">> ${t.user} | ${t.category}</div>
                ${t.desc ? `<div class="card-desc-preview">${t.desc.substring(0, 30)}...</div>` : ''}
            </div>
        `;

        if (lists[t.status]) lists[t.status].innerHTML += cardHTML;

        // Tabela de Histórico
        if (t.status === 'concluido') {
            tbody.innerHTML += `
                <tr>
                    <td>#${t.id}</td>
                    <td>${t.user}</td>
                    <td>${t.subject}</td>
                    <td>${t.category}</td>
                    <td><button class="btn-del" onclick="deleteTicket('${t.id}')">EXCLUIR</button></td>
                </tr>
            `;
        }
    });

    // Atualiza contadores
    document.getElementById('count-aberto').innerText = stats.aberto;
    document.getElementById('count-andamento').innerText = stats.andamento;
    document.getElementById('count-concluido').innerText = stats.concluido;
    document.getElementById('count-total').innerText = tickets.length;
    
    lucide.createIcons();
}

renderAll();