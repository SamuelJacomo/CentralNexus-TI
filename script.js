// Inicialização de Ícones
lucide.createIcons();

// Referências globais para facilitar o uso das funções do Firebase que injetamos no HTML
const getDbRef = () => window.dbRef(window.db, 'tickets');

// Navegação entre abas
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
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

// --- LOGICA FIREBASE ---

// Criar Chamado no Firebase
function createAdminTicket() {
    const user = document.getElementById('adm-user').value;
    const subject = document.getElementById('adm-subject').value;
    const desc = document.getElementById('adm-desc').value;
    const category = document.getElementById('adm-category').value;
    const prio = document.getElementById('adm-prio').value;

    if (!user || !subject) return alert("Preencha o solicitante e o assunto!");

    const newTicket = {
        id: "TKT-" + Math.floor(1000 + Math.random() * 9000),
        user, 
        subject, 
        desc, 
        category, 
        prio,
        status: 'aberto',
        timestamp: Date.now() // Útil para ordenar por data
    };

    // Salva na nuvem
    window.dbPush(getDbRef(), newTicket);
    closeModal();
}

// Avançar Status no Firebase
function advanceTicket(fbKey, currentStatus) {
    let nextStatus = '';
    if (currentStatus === 'aberto') nextStatus = 'andamento';
    else if (currentStatus === 'andamento') nextStatus = 'concluido';
    else return; // Já está concluído

    const specificRef = window.dbRef(window.db, `tickets/${fbKey}`);
    window.dbUpdate(specificRef, { status: nextStatus });
}

// Deletar do Firebase
function deleteTicket(fbKey) {
    if(confirm("Remover permanentemente do registro na nuvem?")) {
        const specificRef = window.dbRef(window.db, `tickets/${fbKey}`);
        window.dbRemove(specificRef);
    }
}

// Renderização Geral (Escutando o Firebase)
function renderAll(ticketsFromFirebase) {
    const lists = {
        aberto: document.getElementById('list-aberto'),
        andamento: document.getElementById('list-andamento'),
        concluido: document.getElementById('list-concluido')
    };

    // Limpa listas e tabela
    Object.values(lists).forEach(l => l.innerHTML = '');
    const tbody = document.getElementById('tbody-historico');
    if (tbody) tbody.innerHTML = '';

    let stats = { aberto: 0, andamento: 0, concluido: 0 };

    ticketsFromFirebase.forEach(t => {
        stats[t.status]++;

        // HTML do Card - Note que passamos t.fbKey (o ID único do Firebase)
        const cardHTML = `
            <div class="card" onclick="advanceTicket('${t.fbKey}', '${t.status}')" title="Descrição: ${t.desc || 'Sem detalhes'}">
                <span class="card-id">#${t.id}</span>
                <div class="card-subject">${t.subject}</div>
                <div class="card-user">> ${t.user} | ${t.category}</div>
                ${t.desc ? `<div class="card-desc-preview">${t.desc}</div>` : ''}
            </div>
        `;

        if (lists[t.status]) lists[t.status].innerHTML += cardHTML;

        // Tabela de Histórico
        if (t.status === 'concluido' && tbody) {
            tbody.innerHTML += `
                <tr>
                    <td>#${t.id}</td>
                    <td>${t.user}</td>
                    <td>${t.subject}</td>
                    <td>${t.category}</td>
                    <td><button class="btn-del" onclick="deleteTicket('${t.fbKey}')">EXCLUIR</button></td>
                </tr>
            `;
        }
    });

    // Atualiza contadores
    document.getElementById('count-aberto').innerText = stats.aberto;
    document.getElementById('count-andamento').innerText = stats.andamento;
    document.getElementById('count-concluido').innerText = stats.concluido;
    document.getElementById('count-total').innerText = ticketsFromFirebase.length;
    
    lucide.createIcons();
}

// INICIALIZAÇÃO: Ouve o Firebase assim que a página carrega
window.addEventListener('load', () => {
    // Pequeno delay para garantir que o Firebase injetado no HTML carregou
    setTimeout(() => {
        window.dbOnValue(getDbRef(), (snapshot) => {
            const data = snapshot.val();
            // Transforma o objeto do Firebase em um array que o JS entende
            const ticketsArray = data ? Object.keys(data).map(key => ({
                fbKey: key, 
                ...data[key]
            })) : [];
            
            renderAll(ticketsArray);
        });
    }, 500);
});