import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

// ATENÇÃO: Substitua as credenciais pelas chaves do seu projeto Supabase
const supabaseUrl = 'https://tsgbvhfdceyjbyfstjol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZ2J2aGZkY2V5amJ5ZnN0am9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NjY3MDEsImV4cCI6MjA5MDA0MjcwMX0.ucDetUUuVKyycACaNtzArQ8YpgybrRpQqYljYYiTgyI';
const supabase = createClient(supabaseUrl, supabaseKey);

// Globais
window.activeProcess = null; 
window.db_procs = []; 
window.db_arbitros = []; 
window.activeAudiencia = null;
window.chartFluxo = null; 
window.chartStatus = null;

// --- REDIMENSIONAMENTO DE LOGOTIPO (CANVAS) ---
document.getElementById('cam_logo').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width; let height = img.height;
            const MAX_WIDTH = 250; const MAX_HEIGHT = 100;
            if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                width = width * ratio; height = height * ratio;
            }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            localStorage.setItem('temp_logo', canvas.toDataURL(file.type));
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
});

// --- SISTEMA WHITE-LABEL ---
const aplicarIdentidadeVisual = () => {
    try {
        const conf = JSON.parse(localStorage.getItem('camara_config') || '{}');
        const nomeSistema = conf.nome || 'inovaSys';
        const logoSistema = conf.logo || 'logo-inovasys.png';
        
        document.querySelectorAll('.sys-name').forEach(el => el.innerText = nomeSistema);
        document.querySelectorAll('.sys-logo').forEach(el => {
            el.src = logoSistema; el.style.display = 'inline-block';
        });
    } catch(e) {}
};

// --- SISTEMA DE CONFIRMAÇÃO E TOAST ---
let confirmActionCallback = null;
window.showConfirm = (msg, callback) => { 
    document.getElementById('confirm-msg').innerText = msg; 
    confirmActionCallback = callback; 
    document.getElementById('modal-confirm').style.display = 'flex'; 
};
window.closeConfirm = () => document.getElementById('modal-confirm').style.display = 'none';
window.executeConfirm = () => { if(confirmActionCallback) confirmActionCallback(); window.closeConfirm(); };

let toastTimeout;
window.showToast = (msg, undoCallback = null) => {
    const t = document.getElementById('toast'); 
    t.innerHTML = `<span>${msg}</span>`;
    if (undoCallback) { 
        const btn = document.createElement('button'); 
        btn.innerText = 'Desfazer'; 
        btn.className = 'btn btn-secondary btn-sm'; 
        btn.style.marginLeft = '15px'; 
        btn.onclick = () => { undoCallback(); window.fecharToast(); }; 
        t.appendChild(btn); 
    }
    t.classList.add('show'); 
    clearTimeout(toastTimeout); 
    toastTimeout = setTimeout(window.fecharToast, 5000);
};
window.fecharToast = () => document.getElementById('toast').classList.remove('show');

// --- MÁSCARAS E PESQUISA ---
const Masks = {
    doc: v => v.length <= 11 ? v.replace(/\D/g,"").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4") : v.replace(/\D/g,"").replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,"$1.$2.$3/$4-$5"),
    money: v => "R$ " + (String(v).replace(/\D/g,"")/100).toLocaleString('pt-BR', {minimumFractionDigits: 2}),
    cleanMoney: v => parseFloat(v.replace(/[^\d,]/g,'').replace(',','.'))
};
document.body.addEventListener('input', (e) => { 
    if (e.target.getAttribute('data-mask')) {
        e.target.value = Masks[e.target.getAttribute('data-mask')](e.target.value); 
    }
});

document.getElementById('search-input').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = window.db_procs.filter(p => p.numero_processo.toLowerCase().includes(term) || p.requerente_nome.toLowerCase().includes(term) || p.requerido_nome.toLowerCase().includes(term));
    document.getElementById('lista-processos').innerHTML = filtered.map(p => `<tr><td onclick="openProc('${p.id}')" style="cursor:pointer"><span class="link-processo">${p.numero_processo}</span></td><td onclick="openProc('${p.id}')" style="cursor:pointer">${p.requerente_nome}</td><td onclick="openProc('${p.id}')" style="cursor:pointer">${p.requerido_nome}</td><td><span class="badge badge-status">${p.status}</span></td><td><button class="btn btn-danger btn-sm" onclick="excluirProcesso('${p.id}')">Excluir</button></td></tr>`).join('');
});

// --- NAVEGAÇÃO ---
window.mostrarMudarView = (moduleId) => { 
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active')); 
    document.getElementById(moduleId).classList.add('active'); 
};
window.switchTab = (tabId, el) => { 
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none'); 
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active')); 
    document.getElementById(tabId).style.display = 'block'; 
    el.classList.add('active'); 
};
window.showView = (id) => { 
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active')); 
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); 
    document.getElementById('view-'+id).classList.add('active'); 
    if(document.getElementById('nav-'+id)) document.getElementById('nav-'+id).classList.add('active'); 
    if(id === 'dash') window.carregarDashAnalytics(); 
};

// --- INICIALIZAÇÃO ---
const iniciarSistema = async (user) => {
    aplicarIdentidadeVisual();
    window.mostrarMudarView('module-app');
    try { 
        const { data: perfil } = await supabase.from('perfis').select('*').eq('id', user.id).maybeSingle(); 
        if (perfil) {
            if (perfil.tipo_usuario === 'admin') { 
                document.getElementById('nav-equipe').style.display = 'block'; 
                document.getElementById('nav-camara').style.display = 'block'; 
            } else if (perfil.tipo_usuario === 'arbitro') {
                document.getElementById('nav-novo').style.display = 'none';
                document.getElementById('nav-arbitros').style.display = 'none';
                document.getElementById('nav-equipe').style.display = 'none';
                document.getElementById('nav-camara').style.display = 'none';
                document.querySelector('.tab-financeiro-link').style.display = 'none';
                document.querySelector('.card-financeiro').style.display = 'none';
                document.getElementById('btn-exportar').style.display = 'none';
            }
        }
    } catch (err) {}
    await Promise.all([window.carregarProcessos(), window.carregarDashAnalytics(), window.carregarArbitros(), window.carregarEquipe()]);
};

aplicarIdentidadeVisual();
supabase.auth.getSession().then(({ data: { session } }) => { if (session) iniciarSistema(session.user); });
supabase.auth.onAuthStateChange((event, session) => { 
    if (event === 'SIGNED_IN' && session) iniciarSistema(session.user); 
    else if (event === 'SIGNED_OUT') window.mostrarMudarView('module-auth'); 
});

document.getElementById('login-form').addEventListener('submit', async (e) => { 
    e.preventDefault(); 
    const btn = document.getElementById('btn-login'); 
    btn.innerText = "Carregando..."; 
    const { error } = await supabase.auth.signInWithPassword({ email: e.target.email.value, password: e.target.password.value }); 
    if (error) { alert("Erro: " + error.message); btn.innerText = "Acessar Painel"; } 
});
document.getElementById('nav-logout').addEventListener('click', () => supabase.auth.signOut());

// --- CARREGAMENTO DE DADOS ---
window.carregarProcessos = async () => {
    const { data } = await supabase.from('processos').select('*').order('created_at', {ascending: false}); 
    window.db_procs = data || [];
    document.getElementById('lista-processos').innerHTML = window.db_procs.map(p => `<tr><td onclick="openProc('${p.id}')" style="cursor:pointer"><span class="link-processo">${p.numero_processo}</span></td><td onclick="openProc('${p.id}')" style="cursor:pointer">${p.requerente_nome}</td><td onclick="openProc('${p.id}')" style="cursor:pointer">${p.requerido_nome}</td><td><span class="badge badge-status">${p.status}</span></td><td><button class="btn btn-danger btn-sm" onclick="excluirProcesso('${p.id}')">Excluir</button></td></tr>`).join('');
};

window.carregarDashAnalytics = async () => {
    const { data: m } = await supabase.rpc('get_dashboard_metrics');
    if (m) {
        document.getElementById('dash-ativos').innerText = m.processos_ativos || 0;
        document.getElementById('dash-volume').innerText = Masks.money((m.volume_acordos*100).toString());
        document.getElementById('dash-recebido').innerText = Masks.money((m.total_recebido*100).toString());
        document.getElementById('dash-pendente').innerText = Masks.money((m.total_pendente*100).toString());
    }
    if(window.db_procs && window.db_procs.length > 0) {
        const ctxF = document.getElementById('chartFluxo').getContext('2d'); 
        const ctxS = document.getElementById('chartStatus').getContext('2d');
        if(window.chartFluxo) window.chartFluxo.destroy(); 
        if(window.chartStatus) window.chartStatus.destroy();
        
        window.chartFluxo = new Chart(ctxF, { type: 'bar', data: { labels: ['Valores Cadastrados'], datasets: [{ label: 'Vol. Processual (R$)', data: [window.db_procs.reduce((acc,p)=>acc+(p.valor_causa||0),0)], backgroundColor: '#0284c7' }] }, options: { maintainAspectRatio: false } });
        const stCount = window.db_procs.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {});
        window.chartStatus = new Chart(ctxS, { type: 'doughnut', data: { labels: Object.keys(stCount), datasets: [{ data: Object.values(stCount), backgroundColor: ['#10b981', '#f59e0b', '#0284c7', '#ef4444', '#64748b'] }] }, options: { maintainAspectRatio: false } });
    }
};

window.carregarArbitros = async () => {
    const { data } = await supabase.from('arbitros').select('*').order('nome'); 
    window.db_arbitros = data || [];
    document.getElementById('lista-arbitros').innerHTML = window.db_arbitros.map(a => `<tr><td>${a.nome}</td><td>${a.cpf}</td><td>${a.profissao || '-'}</td><td><button class="btn btn-danger btn-sm" onclick="excluirArbitro('${a.id}')">Excluir</button></td></tr>`).join('');
    document.getElementById('select-arbitro').innerHTML = '<option value="">Selecionar Árbitro...</option>' + window.db_arbitros.map(a => `<option value="${a.id}">${a.nome}</option>`).join('');
};

window.carregarEquipe = async () => {
    const { data } = await supabase.from('perfis').select('*').order('created_at', {ascending: false});
    if (data) document.getElementById('lista-equipe').innerHTML = data.map(e => `<tr><td>${e.nome || 'Usuário'}</td><td>${new Date(e.created_at).toLocaleDateString('pt-BR')}</td><td><span class="badge ${e.tipo_usuario === 'admin' ? 'badge-admin' : 'badge-status'}">${e.tipo_usuario}</span></td></tr>`).join('');
};

window.openProc = async (id) => {
    window.activeProcess = window.db_procs.find(p => p.id === id);
    document.getElementById('det-titulo').innerText = 'Processo ' + window.activeProcess.numero_processo;
    
    document.getElementById('edit_req_nome').value = window.activeProcess.requerente_nome || ''; 
    document.getElementById('edit_req_doc').value = Masks.doc(window.activeProcess.requerente_documento || ''); 
    document.getElementById('edit_req_end').value = window.activeProcess.requerente_endereco || '';
    document.getElementById('edit_def_nome').value = window.activeProcess.requerido_nome || ''; 
    document.getElementById('edit_def_doc').value = Masks.doc(window.activeProcess.requerido_documento || ''); 
    document.getElementById('edit_def_end').value = window.activeProcess.requerido_endereco || '';
    document.getElementById('edit_valor_causa').value = Masks.money((window.activeProcess.valor_causa * 100).toString() || ''); 
    document.getElementById('edit_fatos').value = window.activeProcess.resumo_fatos || '';
    document.getElementById('select-arbitro').value = window.activeProcess.arbitro_id || '';
    
    try {
        const { data: aud } = await supabase.from('audiencias').select('*').eq('processo_id', id).maybeSingle();
        window.activeAudiencia = aud || null; 
        document.getElementById('texto_ata').value = aud?.texto_ata || ''; 
        document.getElementById('texto_sentenca').value = aud?.texto_sentenca || '';
        
        const { data: acordo } = await supabase.from('acordos').select('id').eq('processo_id', id).maybeSingle();
        if(acordo) {
            const { data: parcs } = await supabase.from('parcelas').select('*').eq('acordo_id', acordo.id).order('numero_parcela');
            document.getElementById('lista-parcelas').innerHTML = (parcs || []).map(pa => `<tr><td>${pa.numero_parcela}</td><td>${new Date(pa.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td><td>R$ ${Number(pa.valor_parcela).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td><td><span class="badge badge-${pa.status.toLowerCase()}">${pa.status}</span></td><td>${pa.status === 'Pendente' ? `<button class="btn btn-success btn-sm" onclick="pagarParcela(${pa.id})">Baixar</button>` : `<button class="btn btn-primary btn-sm" onclick="visualizarRecibo(${pa.id}, ${pa.numero_parcela}, '${pa.valor_parcela}', '${pa.data_pagamento}')">Recibo</button>`}</td></tr>`).join('');
        } else document.getElementById('lista-parcelas').innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum acordo firmado.</td></tr>';

        await Promise.all([window.loadAnexos(), window.loadAndamento()]);
    } catch(e) {} 
    window.showView('detalhes');
};

window.loadAndamento = async () => {
    document.getElementById('proc_status').value = window.activeProcess.status;
    try {
        const { data: notifs } = await supabase.from('notificacoes').select('*').eq('processo_id', window.activeProcess.id).order('data_envio', {ascending: false});
        document.getElementById('lista-notificacoes').innerHTML = (notifs || []).map(n => `<tr><td>${n.tipo_comunicacao}</td><td>${n.destinatario}</td><td>${new Date(n.data_envio).toLocaleDateString('pt-BR')}</td><td>${n.status}</td><td>${n.observacoes || '-'}</td><td><button class="btn btn-danger btn-sm" onclick="excluirNotificacao(${n.id})">Excluir</button></td></tr>`).join('') || '<tr><td colspan="6" style="text-align:center;">Nenhuma comunicação registrada.</td></tr>';

        const { data: hist } = await supabase.from('historico_processos').select('*').eq('processo_id', window.activeProcess.id).order('data_movimentacao', {ascending: false});
        document.getElementById('lista-historico').innerHTML = (hist || []).map(h => `<tr><td>${new Date(h.data_movimentacao).toLocaleString('pt-BR')}</td><td>${h.descricao}</td><td>${h.status_anterior || '-'}</td><td><strong>${h.status_novo}</strong></td></tr>`).join('') || '<tr><td colspan="4" style="text-align:center;">Nenhuma movimentação registrada.</td></tr>';
    } catch(e) {}
};

window.loadAnexos = async () => {
    try {
        const { data } = await supabase.from('processos_anexos').select('*').eq('processo_id', window.activeProcess.id);
        document.getElementById('lista-anexos').innerHTML = (data || []).map(an => `<tr><td>${an.nome_arquivo}</td><td>${new Date(an.uploaded_at).toLocaleDateString('pt-BR')}</td><td><button class="btn btn-secondary btn-sm" onclick="downloadAnexo('${an.caminho_arquivo}')">Ver</button> <button class="btn btn-danger btn-sm" onclick="excluirAnexo(${an.id}, '${an.caminho_arquivo}')">Excluir</button></td></tr>`).join('') || '<tr><td colspan="3" style="text-align:center;">Nenhum arquivo anexado.</td></tr>';
    } catch(e) {}
};

// --- ATUALIZAÇÕES CRUD ---
document.getElementById('editar-processo-form').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const btn = document.getElementById('btn-salvar-processo');
    btn.innerText = "Salvando..."; btn.disabled = true;
    
    let vRaw = document.getElementById('edit_valor_causa').value.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    const v_causa = vRaw ? parseFloat(vRaw) : 0;
    
    const p = { 
        requerente_nome: document.getElementById('edit_req_nome').value, 
        requerente_documento: document.getElementById('edit_req_doc').value.replace(/\D/g, ""), 
        requerente_endereco: document.getElementById('edit_req_end').value, 
        requerido_nome: document.getElementById('edit_def_nome').value, 
        requerido_documento: document.getElementById('edit_def_doc').value.replace(/\D/g, ""), 
        requerido_endereco: document.getElementById('edit_def_end').value, 
        valor_causa: v_causa, 
        resumo_fatos: document.getElementById('edit_fatos').value 
    };
    
    const { error } = await supabase.from('processos').update(p).eq('id', window.activeProcess.id); 
    
    btn.innerText = "Salvar Alterações"; btn.disabled = false;
    
    if(error) {
        window.showToast("Erro: " + error.message);
    } else {
        window.showToast("Dados atualizados com sucesso!"); 
        await window.carregarProcessos(); 
        window.activeProcess = window.db_procs.find(x => x.id === window.activeProcess.id);
        
        // Sincroniza visualmente os campos caso tenha havido formatação
        document.getElementById('edit_req_doc').value = Masks.doc(p.requerente_documento);
        document.getElementById('edit_def_doc').value = Masks.doc(p.requerido_documento);
        document.getElementById('edit_valor_causa').value = Masks.money((p.valor_causa * 100).toString());
    }
});

window.atualizarStatusProcesso = async () => {
    const nv = document.getElementById('proc_status').value; 
    const old = window.activeProcess.status; 
    if(nv === old) return;
    
    const upd = async (s) => { 
        await supabase.from('processos').update({status: s}).eq('id', window.activeProcess.id); 
        window.activeProcess.status = s; 
        await window.carregarProcessos(); 
        window.loadAndamento(); 
    };
    await upd(nv); 
    window.showToast(`Status para "${nv}".`, async () => { await upd(old); window.showToast("Status restaurado."); });
};

// --- WEBHOOK E NOTIFICAÇÕES ---
document.getElementById('notificacao-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { processo_id: window.activeProcess.id, tipo_comunicacao: document.getElementById('not_tipo').value, destinatario: document.getElementById('not_dest').value, status: document.getElementById('not_status').value, observacoes: document.getElementById('not_obs').value };
    const { error } = await supabase.from('notificacoes').insert([payload]); 
    if(error) { alert(error.message); return; }
    
    window.showToast("Comunicação registrada!"); 
    document.getElementById('notificacao-form').reset(); 
    window.loadAndamento();
    
    try {
        const conf = JSON.parse(localStorage.getItem('camara_config') || '{}');
        if (conf.webhook_url) {
            const headers = { 'Content-Type': 'application/json' };
            if (conf.webhook_token) headers['Authorization'] = conf.webhook_token;
            fetch(conf.webhook_url, { method: 'POST', headers: headers, body: JSON.stringify({ evento: 'nova_notificacao', processo: window.activeProcess.numero_processo, notificacao: payload }) }).catch(err => console.warn('Erro Webhook:', err));
        }
    } catch(ex) { console.log('Sem webhook configurado.'); }
});

// --- DOCUMENTOS JURÍDICOS (MODELOS ADAPTADOS) ---
const mkEdit = (val, col) => `<span class="editable-field" contenteditable="true" data-col="${col}">${val || '_________________'}</span>`;

window.salvarEdicoesEmLinha = async () => {
    // Lista de colunas válidas no banco de dados para evitar erro 42703 (coluna inexistente)
    const colunasValidas = ['requerente_nome', 'requerente_documento', 'requerente_endereco', 'requerido_nome', 'requerido_documento', 'requerido_endereco', 'valor_causa', 'resumo_fatos'];
    let payload = {}; 
    
    document.querySelectorAll('#pdf-area .editable-field').forEach(s => {
        const colName = s.dataset.col;
        if(colunasValidas.includes(colName)) {
            let val = s.innerText.trim();
            if(colName === 'valor_causa') val = parseFloat(val.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
            if(colName === 'requerente_documento' || colName === 'requerido_documento') val = val.replace(/\D/g, "");
            payload[colName] = val;
        }
    });

    if (Object.keys(payload).length > 0) { 
        const { error } = await supabase.from('processos').update(payload).eq('id', window.activeProcess.id); 
        if(error) {
            window.showToast("Erro ao salvar: " + error.message);
            return;
        }
        Object.assign(window.activeProcess, payload); 
        window.showToast("Dados oficiais atualizados a partir do documento!"); 
        
        // Mantém a sincronia da interface de Dados
        document.getElementById('edit_req_nome').value = window.activeProcess.requerente_nome;
        document.getElementById('edit_valor_causa').value = Masks.money((window.activeProcess.valor_causa * 100).toString());
        
        window.carregarProcessos(); 
    } else {
        window.showToast("Preenchimento apenas visual. Nenhum dado de banco alterado.");
    }
};

window.visualizarDoc = (num, extraData = null) => {
    const cam = JSON.parse(localStorage.getItem('camara_config') || '{}'); 
    const p = window.activeProcess; 
    let arb = window.db_arbitros.find(a => a.id == p.arbitro_id);
    
    document.getElementById('p-logo').src = cam.logo || ''; 
    document.getElementById('p-logo').style.display = cam.logo ? 'inline-block' : 'none';
    document.getElementById('p-cam-nome').innerText = ''; 
    document.getElementById('p-cam-cnpj').innerText = '';
    
    let html = ""; 
    document.getElementById('btn-salvar-edicoes').style.display = 'block';

    let dia = new Date().getDate();
    let mes = new Date().toLocaleString('pt-BR', { month: 'long' });
    let ano = new Date().getFullYear();

    if(num === 1) {
        // Modelo 01 - Capa do Processo Fiel ao PDF Base
        html = `
        <div style="text-align:center; padding:20px; font-family: 'Times New Roman', serif;">
            <h3 style="margin-bottom:5px;">PROCEDIMENTO N° ${p.numero_processo}</h3>
            <h4 style="margin-top:0;">JUSTIÇA PRIVADA<br>${cam.nome || 'CÂMARA ARBITRAL'}</h4>
            <p style="font-weight:bold; margin-top:20px;">LEI 9.307/1996</p>
            <h3 style="margin-top:20px; text-transform:uppercase;">${cam.nome || 'CÂMARA DE ARBITRAGEM, MEDIAÇÃO E CONCILIAÇÃO'}</h3>
            <h4 style="margin-top:20px; text-decoration: underline;">AUTOS DE PROCESSO DE MEDIAÇÃO, CONCILIAÇÃO E ARBITRAGEM</h4>
            
            <div style="text-align:left; margin-top:50px; padding-left: 10%;">
                <p><strong>DEMANDANTE:</strong><br>${mkEdit(p.requerente_nome, 'requerente_nome')}</p>
                <p style="margin-top:20px;"><strong>DEMANDADO:</strong><br>${mkEdit(p.requerido_nome, 'requerido_nome')}</p>
                <p style="margin-top:20px;"><strong>DATA DA ENTRADA:</strong> ${new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
            </div>

            <div style="margin-top:50px; text-align:justify;">
                <h4 style="text-align:center;">AUTUAÇÃO</h4>
                <p>No dia ${dia} de ${mes} do ano de ${ano}, nesta cidade de ${mkEdit('_______', 'campo_livre_cidade')}, nesta ${cam.nome || 'CÂMARA DE ARBITRAGEM'}, fiz a presente autuação dos presentes autos.</p>
            </div>
        </div>`;
    }
    else if(num === 2) {
        // Modelo 02 - Termo de Apresentação Fiel ao PDF Base
        html = `
        <div style="font-family: 'Times New Roman', serif; text-align: justify; line-height: 1.6;">
            <div style="text-align:center; margin-bottom:20px;">
                <h3 style="margin:0; text-transform:uppercase;">${cam.nome || 'CÂMARA DE ARBITRAGEM, MEDIAÇÃO E CONCILIAÇÃO'}</h3>
                <p style="margin:0; font-size:12px;">CNPJ: ${cam.cnpj || '___.___.___/____-__'}</p>
                <p style="margin:0; font-size:12px;">Endereço: ${cam.endereco || '___________________________'} | Fone: ${cam.fone || '_____________'}</p>
            </div>

            <h4 style="text-align:center; text-decoration:underline;">TERMO DE APRESENTAÇÃO DO PEDIDO N° ${p.numero_processo}</h4>
            <p style="text-align:right;">${mkEdit('Local, Data.', 'campo_livre_local_data')}</p>

            <p>Eu, abaixo qualificado(a), na qualidade de Demandante, venho mui respeitosamente, requerer que seja objeto de Mediação, Conciliação e/ou Arbitragem, o litígio descrito abaixo, em face do demandado abaixo qualificado, pelos motivos de fato e de direito que passo a expor:</p>

            <h4 style="margin-bottom:5px;">DEMANDANTE</h4>
            <p style="margin-top:0;"><strong>Nome:</strong> ${mkEdit(p.requerente_nome, 'requerente_nome')}, <strong>CPF/CNPJ:</strong> ${mkEdit(Masks.doc(p.requerente_documento), 'requerente_documento')}, residente e domiciliado(a) à ${mkEdit(p.requerente_endereco, 'requerente_endereco')}.</p>

            <h4 style="margin-bottom:5px;">DEMANDADO</h4>
            <p style="margin-top:0;"><strong>Nome:</strong> ${mkEdit(p.requerido_nome, 'requerido_nome')}, <strong>CPF/CNPJ:</strong> ${mkEdit(Masks.doc(p.requerido_documento), 'requerido_documento')}, residente e domiciliado(a) à ${mkEdit(p.requerido_endereco, 'requerido_endereco')}.</p>

            <h4 style="margin-bottom:5px;">DESCRIÇÃO DO FATO, DO OBJETO E DO PEDIDO</h4>
            <p style="margin-top:0; white-space:pre-wrap;">${mkEdit(p.resumo_fatos, 'resumo_fatos')}</p>

            <p><strong>Valor da causa:</strong> ${mkEdit('R$ ' + Number(p.valor_causa).toLocaleString('pt-BR', {minimumFractionDigits: 2}), 'valor_causa')}</p>

            <p>Pelo acima exposto, assim requer, se digne essa ${cam.nome || 'Câmara'}, em NOTIFICAR o Demandado para administração e instauração do procedimento de MEDIAÇÃO, CONCILIAÇÃO E ARBITRAGEM; Caso o demandado compareça na audiência prévia a ser designada por essa Câmara, onde haverá tentativa de conciliação, que sendo infrutífera, restará às partes se posicionarem sobre o interesse quanto à instauração do procedimento arbitral na forma convencionada pelo Regimento Interno desta Câmara Arbitral e nos termos da Lei Federal nº 9.307/96. O Demandante assume, desde já, o compromisso de apresentar, quando solicitado, quaisquer documentos que esta venha a pedir e nos prazos estipulados, sob pena de ter cancelado esse procedimento.</p>

            <p><strong>AGENDADA PARA 1ª AUDIÊNCIA:</strong> ${mkEdit('__/__/____ às __:__', 'campo_livre_data_audiencia')}</p>

            <div style="margin-top:60px; text-align:center;">
                ___________________________________________________<br>
                <strong>${mkEdit(p.requerente_nome, 'requerente_nome')}</strong><br>
                Demandante
            </div>
        </div>`;
    }
    else if(num === 3) html = `<div style="font-family: 'Times New Roman', serif;"><h3>NOTIFICAÇÃO EXTRAJUDICIAL</h3><p>Prezado(a) ${mkEdit(p.requerido_nome, 'requerido_nome')}, fica notificado(a) sobre o processo nº ${p.numero_processo} movido por ${mkEdit(p.requerente_nome, 'requerente_nome')}.</p></div>`;
    else if(num === 4) { if(!arb) return alert("Vincule um árbitro primeiro."); html = `<div style="font-family: 'Times New Roman', serif;"><h3>PORTARIA DE NOMEAÇÃO N° ${p.numero_processo}</h3><p>O Presidente da ${cam.nome || 'Câmara'}, RESOLVE:</p><p>NOMEAR o Sr(a) <strong>${arb.nome}</strong> para atuar como Juiz Arbitral no processo.</p><div style="margin-top:60px; text-align:center;">_________________________________<br>Presidente</div></div>`; }
    else if(num === 5) { if(!arb) return alert("Vincule um árbitro primeiro."); html = `<div style="font-family: 'Times New Roman', serif;"><h3>TERMO DE COMPROMISSO DO ÁRBITRO</h3><p>O Sr(a) <strong>${arb.nome}</strong>, RG ${arb.rg || '-'}, CPF ${arb.cpf}, assume formalmente a função de Árbitro no Procedimento n° ${p.numero_processo}.</p><div style="margin-top:60px; text-align:center;">_________________________________<br>${arb.nome}<br>Árbitro</div></div>`; }
    else if(num === 6) { if(!arb) return alert("Vincule um árbitro primeiro."); html = `<div style="font-family: 'Times New Roman', serif;"><h3>TERMO DE COMPROMISSO ARBITRAL</h3><p>Pelo presente instrumento, ${mkEdit(p.requerente_nome, 'requerente_nome')} e ${mkEdit(p.requerido_nome, 'requerido_nome')} elegem a ${cam.nome || 'Câmara'} e o árbitro <strong>${arb.nome}</strong> para dirimir o litígio do processo ${p.numero_processo}.</p><div style="margin-top:60px; display:flex; justify-content:space-between; text-align:center;"><div>___________________________<br>Requerente</div><div>___________________________<br>Requerido</div></div></div>`; }
    else if(num === 7) { document.getElementById('btn-salvar-edicoes').style.display = 'none'; html = `<div style="font-family: 'Times New Roman', serif;"><h3>ATA DE AUDIÊNCIA N° ${p.numero_processo}</h3><p>Aos ${hoje}, realizou-se audiência referente ao processo.</p><h4>RELATO E TERMOS:</h4><p style="white-space: pre-wrap; text-align:justify;">${window.activeAudiencia?.texto_ata || 'Nenhum texto registrado na aba Instrução.'}</p><div style="margin-top:60px; text-align:center;">_________________________________<br>Árbitro / Partes</div></div>`; }
    else if(num === 8) { document.getElementById('btn-salvar-edicoes').style.display = 'none'; html = `<div style="font-family: 'Times New Roman', serif;"><h3>SENTENÇA ARBITRAL - PROCESSO ${p.numero_processo}</h3><p>Partes: ${p.requerente_nome} e ${p.requerido_nome}.</p><h4>FUNDAMENTAÇÃO E DISPOSITIVO:</h4><p style="white-space: pre-wrap; text-align:justify;">${window.activeAudiencia?.texto_sentenca || 'Nenhum texto registrado na aba Instrução.'}</p><div style="margin-top:60px; text-align:center;">_________________________________<br>Juiz Arbitral</div></div>`; }
    else if(num === 9) html = `<div style="font-family: 'Times New Roman', serif;"><h3>TERMO DE ENTREGA DE DOCUMENTOS</h3><p>Declaramos para os devidos fins que as partes receberam cópia da Sentença Arbitral proferida no processo ${p.numero_processo}.</p><div style="margin-top:60px; display:flex; justify-content:space-between; text-align:center;"><div>___________________________<br>Requerente</div><div>___________________________<br>Requerido</div></div></div>`;
    else if(num === 10 && extraData) { document.getElementById('btn-salvar-edicoes').style.display = 'none'; let strData = String(extraData.dataPagamento); let dataPag = (strData !== 'null' && strData !== 'undefined' && strData !== '') ? new Date(strData + 'T00:00:00').toLocaleDateString('pt-BR') : '_________________'; html = `<div style="font-family: 'Times New Roman', serif;"><h3>RECIBO DE ACORDO - PARCELA ${extraData.num}</h3><p>Recebi de ${p.requerido_nome} a importância de R$ ${Number(extraData.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}, referente ao pagamento da parcela ${extraData.num} do acordo firmado no processo ${p.numero_processo}.</p><p>Data do Pagamento: ${dataPag}</p><div style="margin-top:60px; text-align:center;">_________________________________<br>${p.requerente_nome} (Recebedor)</div></div>`; }
    else if(num === 11) html = `<div style="font-family: 'Times New Roman', serif;"><h3>RECIBO DE HONORÁRIOS DA CÂMARA</h3><p>A ${cam.nome || 'Câmara'} recebeu de ${mkEdit(p.requerente_nome, 'requerente_nome')} o valor de R$ ${Number(p.valor_causa * 0.1).toLocaleString('pt-BR')} referente aos honorários.</p></div>`;
    
    document.getElementById('p-body').innerHTML = html; 
    document.getElementById('modal-preview').style.display = 'flex';
    
    document.getElementById('btn-download').onclick = () => { 
        document.querySelectorAll('.editable-field').forEach(el => el.style.borderBottom = 'none'); 
        html2pdf().from(document.getElementById('pdf-area')).set({ margin: 15, filename: `Doc_${p.numero_processo}.pdf` }).save(); 
        setTimeout(() => document.querySelectorAll('.editable-field').forEach(el => el.style.borderBottom = '1px dashed var(--color-accent)'), 2000); 
    };
};

window.gerarDossie = async () => {
    const cam = JSON.parse(localStorage.getItem('camara_config') || '{}'); 
    const p = window.activeProcess;
    document.getElementById('p-logo').src = cam.logo || ''; 
    document.getElementById('p-logo').style.display = cam.logo ? 'inline-block' : 'none';
    document.getElementById('p-cam-nome').innerText = cam.nome || 'CÂMARA ARBITRAL'; 
    document.getElementById('p-cam-cnpj').innerText = cam.cnpj ? 'CNPJ: ' + cam.cnpj : '';
    
    const { data: hist } = await supabase.from('historico_processos').select('*').eq('processo_id', p.id).order('data_movimentacao', {ascending: true});
    
    let html = `<div style="text-align:center; margin-bottom: 30px;"><h2>DOSSIÊ DE PROCESSO ARBITRAL</h2><h3>Nº ${p.numero_processo}</h3></div>`;
    html += `<h4>1. QUALIFICAÇÃO DAS PARTES</h4><p><strong>Requerente:</strong> ${p.requerente_nome} (Doc: ${p.requerente_documento})</p><p><strong>Requerido:</strong> ${p.requerido_nome} (Doc: ${p.requerido_documento})</p><p><strong>Valor da Causa:</strong> R$ ${Number(p.valor_causa).toLocaleString('pt-BR', {minimumFractionDigits:2})}</p><hr>`;
    html += `<h4>2. HISTÓRICO DE MOVIMENTAÇÕES</h4><table border="1" cellpadding="5" cellspacing="0" width="100%" style="font-size:12px; text-align:left;"><tr><th>Data</th><th>Descrição</th><th>Status</th></tr>`;
    html += (hist || []).map(h => `<tr><td>${new Date(h.data_movimentacao).toLocaleString('pt-BR')}</td><td>${h.descricao}</td><td>${h.status_novo}</td></tr>`).join('');
    html += `</table>`;

    document.getElementById('p-body').innerHTML = html; 
    document.getElementById('btn-salvar-edicoes').style.display = 'none'; 
    document.getElementById('modal-preview').style.display = 'flex';
    document.getElementById('btn-download').onclick = () => { html2pdf().from(document.getElementById('pdf-area')).set({ margin: 15, filename: `Dossie_${p.numero_processo}.pdf` }).save(); };
};

window.fecharModal = () => document.getElementById('modal-preview').style.display = 'none';

// --- SUBMISSÕES E CRUD EXTRAS ---
document.getElementById('acordo-form').addEventListener('submit', (e) => { 
    e.preventDefault(); 
    window.showConfirm('Gerar acordo e parcelas definitivas?', async () => { 
        let vRaw = document.getElementById('aco_valor').value.replace('R$ ', '').replace(/\./g, '').replace(',', '.'); 
        const v = vRaw ? parseFloat(vRaw) : 0; 
        const d = new Date(document.getElementById('aco_data').value + 'T00:00:00'); 
        const { error } = await supabase.from('acordos').insert([{ processo_id: window.activeProcess.id, valor_acordado: v, quantidade_parcelas: parseInt(document.getElementById('aco_parc').value), dia_vencimento: d.getDate() }]); 
        if(error) window.showToast(error.message); else { window.showToast('Acordo gerado!'); window.openProc(window.activeProcess.id); window.carregarDashAnalytics(); } 
    }); 
});

window.pagarParcela = (id) => window.showConfirm('Dar baixa nesta parcela?', async () => { await supabase.rpc('registrar_pagamento_parcela', { p_parcela_id: id }); window.showToast('Pagamento registrado!'); window.openProc(window.activeProcess.id); window.carregarDashAnalytics(); });
window.excluirProcesso = (id) => window.showConfirm('A exclusão apagará TUDO. Confirma?', async () => { await supabase.from('processos').delete().eq('id', id); window.showToast('Processo excluído.'); window.carregarProcessos(); window.carregarDashAnalytics(); window.showView('dash'); });
window.excluirArbitro = (id) => window.showConfirm('Excluir este árbitro?', async () => { await supabase.from('arbitros').delete().eq('id', id); window.showToast('Excluído.'); window.carregarArbitros(); });
window.excluirNotificacao = (id) => window.showConfirm('Excluir notificação?', async () => { await supabase.from('notificacoes').delete().eq('id', id); window.showToast('Excluída.'); window.loadAndamento(); });
window.excluirAnexo = (id, path) => window.showConfirm('Deletar arquivo?', async () => { await supabase.storage.from('documentos_assinados').remove([path]); await supabase.from('processos_anexos').delete().eq('id', id); window.showToast('Deletado.'); window.loadAnexos(); });

window.exportarCSV = () => { 
    if (!window.db_procs || !window.db_procs.length) return window.showToast('Sem dados.'); 
    let csv = 'Nº Processo,Requerente,Requerido,Valor Causa,Status,Data\n'; 
    window.db_procs.forEach(p => { csv += `${p.numero_processo},"${p.requerente_nome}","${p.requerido_nome}",${p.valor_causa},${p.status},${new Date(p.created_at).toLocaleDateString('pt-BR')}\n`; }); 
    const a = document.createElement('a'); 
    a.href = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); 
    a.download = 'relatorio.csv'; 
    a.click(); 
};

document.getElementById('processo-form').addEventListener('submit', async (e) => { 
    e.preventDefault(); 
    const btn = e.target.querySelector('button[type="submit"]'); 
    btn.innerText = 'Processando...'; btn.disabled = true;
    let vRaw = document.getElementById('valor_causa').value.replace('R$ ', '').replace(/\./g, '').replace(',', '.'); 
    const v_causa = vRaw ? parseFloat(vRaw) : 0; 
    const n = new Date().getFullYear() + String(Math.floor(Math.random() * 90000)+10000); 
    try { 
        const { data:{user} } = await supabase.auth.getUser(); 
        await supabase.from('processos').insert([{ 
            numero_processo: n, 
            requerente_nome: document.getElementById('req_nome').value, 
            requerente_documento: document.getElementById('req_doc').value.replace(/\D/g, ""), 
            requerente_endereco: document.getElementById('req_end').value, 
            requerido_nome: document.getElementById('def_nome').value, 
            requerido_documento: document.getElementById('def_doc').value.replace(/\D/g, ""), 
            requerido_endereco: document.getElementById('def_end').value, 
            valor_causa: v_causa, 
            resumo_fatos: document.getElementById('fatos').value, 
            status: 'Protocolado', 
            user_id: user.id 
        }]); 
        window.showToast("Protocolado!"); 
        e.target.reset(); 
        window.carregarProcessos(); 
        window.showView('dash'); 
    } catch (err) {} finally { btn.innerText = 'Iniciar Procedimento'; btn.disabled = false; } 
});

document.getElementById('arbitro-form').addEventListener('submit', async (e) => { 
    e.preventDefault(); 
    await supabase.from('arbitros').insert([{ 
        nome: document.getElementById('arb_nome').value, 
        cpf: document.getElementById('arb_cpf').value.replace(/\D/g, ""), 
        rg: document.getElementById('arb_rg').value, 
        profissao: document.getElementById('arb_prof').value, 
        endereco: document.getElementById('arb_end').value 
    }]); 
    window.showToast("Salvo!"); 
    e.target.reset(); 
    window.carregarArbitros(); 
});

window.vincularArbitro = async () => { 
    const a = document.getElementById('select-arbitro').value; 
    if(a){ 
        await supabase.from('processos').update({ arbitro_id: a }).eq('id', window.activeProcess.id); 
        window.showToast('Vinculado!'); 
        window.carregarProcessos(); 
    } 
};

window.salvarTextosAudiencia = async () => { 
    const p = { 
        processo_id: window.activeProcess.id, 
        data_hora_audiencia: new Date().toISOString(), 
        texto_ata: document.getElementById('texto_ata').value, 
        texto_sentenca: document.getElementById('texto_sentenca').value 
    }; 
    let error; 
    if (window.activeAudiencia) { 
        error = (await supabase.from('audiencias').update({texto_ata: p.texto_ata, texto_sentenca: p.texto_sentenca}).eq('id', window.activeAudiencia.id)).error; 
    } else { 
        error = (await supabase.from('audiencias').insert([p])).error; 
    } 
    if (error) alert(error.message); 
    else { window.showToast("Textos salvos!"); window.openProc(window.activeProcess.id); } 
};

window.uploadAnexo = async () => { 
    const f = document.getElementById('arquivo_anexo').files[0]; 
    if(!f) return; 
    const pt = `proc_${window.activeProcess.id}/${Date.now()}_${f.name}`; 
    await supabase.storage.from('documentos_assinados').upload(pt, f); 
    await supabase.from('processos_anexos').insert([{ processo_id: window.activeProcess.id, nome_arquivo: f.name, caminho_arquivo: pt }]); 
    window.showToast('Anexo salvo!'); 
    window.loadAnexos(); 
};

window.downloadAnexo = async (pt) => { 
    const { data } = await supabase.storage.from('documentos_assinados').createSignedUrl(pt, 60); 
    if(data) window.open(data.signedUrl, '_blank'); 
};

window.visualizarRecibo = (id, num, valor, dt) => window.visualizarDoc(10, { num, valor, dataPagamento: dt });

document.getElementById('camara-form').addEventListener('submit', (e) => { 
    e.preventDefault(); 
    localStorage.setItem('camara_config', JSON.stringify({ 
        nome: document.getElementById('cam_nome').value, 
        cnpj: document.getElementById('cam_cnpj').value, 
        endereco: document.getElementById('cam_endereco').value, 
        fone: document.getElementById('cam_fone').value, 
        logo: localStorage.getItem('temp_logo') || '', 
        webhook_url: document.getElementById('cam_webhook_url').value, 
        webhook_token: document.getElementById('cam_webhook_token').value 
    })); 
    aplicarIdentidadeVisual(); 
    window.showToast("Configurações Salvas!"); 
});

document.getElementById('consulta-form').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const btn = document.getElementById('btn-consultar'); 
    btn.innerText = "Buscando..."; btn.disabled = true; 
    const rDiv = document.getElementById('consulta-resultado');
    try {
        const { data, error } = await supabase.rpc('consultar_processo_publico', { p_numero: document.getElementById('cons_num').value, p_documento: document.getElementById('cons_doc').value.replace(/\D/g, "") });
        if(data && data.length > 0) rDiv.innerHTML = `<strong>Status Atual:</strong> <span class="badge badge-status">${data[0].status}</span><br><br><strong>Partes:</strong><br> ${data[0].requerente_nome} x ${data[0].requerido_nome}<br><br><strong>Última Movimentação:</strong><br> ${new Date(data[0].updated_at).toLocaleString('pt-BR')}`;
        else rDiv.innerHTML = `<span style="color:var(--danger); font-weight:500;">Processo não encontrado ou documento inválido.</span>`;
    } catch(err) { rDiv.innerHTML = `<span style="color:var(--danger);">Erro na consulta.</span>`; }
    finally { rDiv.style.display = 'block'; btn.innerText = "Consultar Situação"; btn.disabled = false; }
});