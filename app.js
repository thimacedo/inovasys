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
    else if(num === 3) {
        html = `
        <div style="font-family: 'Times New Roman', serif; text-align: justify; line-height: 1.6;">
            <div style="text-align:center; margin-bottom:20px;">
                <h3 style="margin:0; text-transform:uppercase;">${cam.nome || 'CÂMARA DE ARBITRAGEM, MEDIAÇÃO E CONCILIAÇÃO'}</h3>
                <p style="margin:0; font-size:12px;">CNPJ: ${cam.cnpj || '___.___.___/____-__'}</p>
                <p style="margin:0; font-size:12px;">Endereço: ${cam.endereco || '___________________________'} | Fone: ${cam.fone || '_____________'}</p>
            </div>
            <h3 style="text-align:center; text-decoration:underline;">1ª NOTIFICAÇÃO EXTRAJUDICIAL</h3>
            <p><strong>Requerido(a):</strong> ${mkEdit(p.requerido_nome, 'requerido_nome')}</p>
            <p><strong>Endereço:</strong> ${mkEdit(p.requerido_endereco, 'requerido_endereco')}</p>
            <p><strong>Contato:</strong> ${mkEdit('_____________', 'campo_livre_contato_req')}</p>
            <br>
            <p>Prezado(a) Senhor(a),</p>
            <p>Solicitamos o comparecimento de Vossa Senhoria no próximo dia <strong>${mkEdit('__ de _______ de 20__ às __:__hs', 'campo_livre_data_audiencia')}</strong>, na sala de Audiências desta Câmara, Endereço: ${cam.endereco || '___________________________'}, a fim de instituir Arbitragem (resolver conflitos de maneira amigável), bem como firmar o competente Compromisso Arbitral, com fundamento na Lei Federal n. 9.307, de 23 de Setembro de 1996, atualizado pela Lei 13.129, de 26 de maio 2015 e recepcionado pelo Novo Código Processo Civil 2015.</p>
            <p>Finalmente, cientificamos Vossa Senhoria que foi instituído o PROCEDIMENTO ARBITRAL n° <strong>${p.numero_processo}</strong>, nesta Câmara de Arbitragem.</p>
            <p>Sem mais para o momento, colocamo-nos ao inteiro dispor para quaisquer esclarecimentos que se fizerem necessários.</p>
            <p style="text-align:right; margin-top:40px;">${mkEdit('Local, Data.', 'campo_livre_local_data')}</p>
            <div style="margin-top:60px; text-align:center;">___________________________________________________<br><strong>Oficial Extrajudicial</strong></div>
        </div>`;
    }
    else if(num === 4) { if(!arb) return alert("Vincule um árbitro primeiro."); html = `<div style="font-family: 'Times New Roman', serif;"><h3>PORTARIA DE NOMEAÇÃO N° ${p.numero_processo}</h3><p>O Presidente da ${cam.nome || 'Câmara'}, RESOLVE:</p><p>NOMEAR o Sr(a) <strong>${arb.nome}</strong> para atuar como Juiz Arbitral no processo.</p><div style="margin-top:60px; text-align:center;">_________________________________<br>Presidente</div></div>`; }
    else if(num === 5) { if(!arb) return alert("Vincule um árbitro primeiro."); html = `<div style="font-family: 'Times New Roman', serif;"><h3>TERMO DE COMPROMISSO DO ÁRBITRO</h3><p>O Sr(a) <strong>${arb.nome}</strong>, RG ${arb.rg || '-'}, CPF ${arb.cpf}, assume formalmente a função de Árbitro no Procedimento n° ${p.numero_processo}.</p><div style="margin-top:60px; text-align:center;">_________________________________<br>${arb.nome}<br>Árbitro</div></div>`; }
    else if(num === 6) { if(!arb) return alert("Vincule um árbitro primeiro."); html = `<div style="font-family: 'Times New Roman', serif;"><h3>TERMO DE COMPROMISSO ARBITRAL</h3><p>Pelo presente instrumento, ${mkEdit(p.requerente_nome, 'requerente_nome')} e ${mkEdit(p.requerido_nome, 'requerido_nome')} elegem a ${cam.nome || 'Câmara'} e o árbitro <strong>${arb.nome}</strong> para dirimir o litígio do processo ${p.numero_processo}.</p><div style="margin-top:60px; display:flex; justify-content:space-between; text-align:center;"><div>___________________________<br>Requerente</div><div>___________________________<br>Requerido</div></div></div>`; }
    else if(num === 7) { document.getElementById('btn-salvar-edicoes').style.display = 'none'; html = `<div style="font-family: 'Times New Roman', serif;"><h3>ATA DE AUDIÊNCIA N° ${p.numero_processo}</h3><p>Aos ${hoje}, realizou-se audiência referente ao processo.</p><h4>RELATO E TERMOS:</h4><p style="white-space: pre-wrap; text-align:justify;">${window.activeAudiencia?.texto_ata || 'Nenhum texto registrado na aba Instrução.'}</p><div style="margin-top:60px; text-align:center;">_________________________________<br>Árbitro / Partes</div></div>`; }
    else if(num === 8) { document.getElementById('btn-salvar-edicoes').style.display = 'none'; html = `<div style="font-family: 'Times New Roman', serif;"><h3>SENTENÇA ARBITRAL - PROCESSO ${p.numero_processo}</h3><p>Partes: ${p.requerente_nome} e ${p.requerido_nome}.</p><h4>FUNDAMENTAÇÃO E DISPOSITIVO:</h4><p style="white-space: pre-wrap; text-align:justify;">${window.activeAudiencia?.texto_sentenca || 'Nenhum texto registrado na aba Instrução.'}</p><div style="margin-top:60px; text-align:center;">_________________________________<br>Juiz Arbitral</div></div>`; }
    else if(num === 9) html = `<div style="font-family: 'Times New Roman', serif;"><h3>TERMO DE ENTREGA DE DOCUMENTOS</h3><p>Declaramos para os devidos fins que as partes receberam cópia da Sentença Arbitral proferida no processo ${p.numero_processo}.</p><div style="margin-top:60px; display:flex; justify-content:space-between; text-align:center;"><div>___________________________<br>Requerente</div><div>___________________________<br>Requerido</div></div></div>`;
    else if(num === 10 && extraData) { 
        document.getElementById('btn-salvar-edicoes').style.display = 'none'; 
        let strData = String(extraData.dataPagamento); 
        let dataPag = (strData !== 'null' && strData !== 'undefined' && strData !== '') ? new Date(strData + 'T00:00:00').toLocaleDateString('pt-BR') : mkEdit('__/__/____', 'campo_livre_data'); 
        html = `
        <div style="font-family: 'Times New Roman', serif; text-align: justify; line-height: 1.6;">
            <div style="text-align:center; margin-bottom:20px;">
                <h3 style="margin:0; text-transform:uppercase;">${cam.nome || 'CÂMARA DE ARBITRAGEM, MEDIAÇÃO E CONCILIAÇÃO'}</h3>
                <p style="margin:0; font-size:12px;">CNPJ: ${cam.cnpj || '___.___.___/____-__'}</p>
                <p style="margin:0; font-size:12px;">Endereço: ${cam.endereco || '___________________________'} | Fone: ${cam.fone || '_____________'}</p>
            </div>
            <h3 style="text-align:center; text-decoration:underline;">RECIBO DE VALORES DE ACORDO</h3>
            <div style="display:flex; justify-content:space-between; margin-bottom: 20px;">
                <p><strong>Data:</strong> ${dataPag}</p>
                <p><strong>Recibo de Pagamento nº:</strong> ${extraData.num}</p>
            </div>
            <p>EU, <strong>${mkEdit(p.requerente_nome, 'requerente_nome')}</strong>, CPF/CNPJ: ${mkEdit(Masks.doc(p.requerente_documento), 'requerente_documento')}, residente e domiciliado(a) à ${mkEdit(p.requerente_endereco, 'requerente_endereco')}. RECEBEU do(a) Sr(a). <strong>${mkEdit(p.requerido_nome, 'requerido_nome')}</strong>, CPF/CNPJ: ${mkEdit(Masks.doc(p.requerido_documento), 'requerido_documento')}, residente e domiciliado(a) à ${mkEdit(p.requerido_endereco, 'requerido_endereco')}.</p>
            <p>O Valor de <strong>R$ ${Number(extraData.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>, referente à parcela de pagamento acordado entre as partes mediante Cláusula ${mkEdit('___', 'campo_livre_clausula')} do TERMO DE ACORDO com Sentença Arbitral do processo Nº ${p.numero_processo}.</p>
            <p style="margin-top:20px;"><strong>Forma de pagamento:</strong> ${mkEdit('( ) Dinheiro &nbsp; ( ) Cheque &nbsp; ( ) Cartão &nbsp; ( ) Transferência / PIX', 'campo_livre_forma_pgto')}</p>
            <div style="margin-top:60px; text-align:center;">___________________________________________________<br><strong>${mkEdit(p.requerente_nome, 'requerente_nome')}</strong><br>Demandante (Recebedor)</div>
        </div>`; 
    }
    else if(num === 11) {
        html = `
        <div style="font-family: 'Times New Roman', serif; text-align: justify; line-height: 1.6;">
            <div style="text-align:center; margin-bottom:20px;">
                <h3 style="margin:0; text-transform:uppercase;">${cam.nome || 'CÂMARA DE ARBITRAGEM, MEDIAÇÃO E CONCILIAÇÃO'}</h3>
                <p style="margin:0; font-size:12px;">CNPJ: ${cam.cnpj || '___.___.___/____-__'}</p>
                <p style="margin:0; font-size:12px;">Endereço: ${cam.endereco || '___________________________'} | Fone: ${cam.fone || '_____________'}</p>
            </div>
            <h3 style="text-align:center; text-decoration:underline;">RECIBO DE HONORÁRIOS DA CÂMARA ARBITRAL</h3>
            <p>A <strong>${cam.nome || 'CÂMARA DE ARBITRAGEM'}</strong>, localizada à ${cam.endereco || '___________________________'} - CNPJ ${cam.cnpj || '___.___.___/____-__'}.</p>
            <p>Recebeu de <strong>${mkEdit(p.requerente_nome, 'requerente_nome')}</strong>, CPF/CNPJ: ${mkEdit(Masks.doc(p.requerente_documento), 'requerente_documento')}, residente e domiciliado(a) à ${mkEdit(p.requerente_endereco, 'requerente_endereco')}.</p>
            <p>O valor de <strong>R$ ${Number(p.valor_causa * 0.1).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>, referente ao pagamento dos Honorários Arbitrais da Câmara.</p>
            <p>Sem mais e para que esta seja interpretada como verdadeira, firmo.</p>
            <p style="text-align:right; margin-top: 30px;">${mkEdit('Local, Data.', 'campo_livre_local_data')}</p>
            <div style="margin-top:60px; text-align:center;">___________________________________________________<br><strong>DIRETOR FINANCEIRO</strong><br>${cam.nome || 'Câmara Arbitral'}</div>
        </div>`;
    }
    else if(num === 12) {
        html = `
        <div style="font-family: 'Times New Roman', serif; text-align: justify; line-height: 1.6;">
            <div style="text-align:center; margin-bottom:20px;">
                <h3 style="margin:0; text-transform:uppercase;">REQUERIMENTO</h3>
            </div>
            <p>À <strong>${cam.nome || 'CÂMARA DE ARBITRAGEM, MEDIAÇÃO E CONCILIAÇÃO'}</strong><br>
            CNPJ: ${cam.cnpj || '___.___.___/____-__'}, Matriz: ${cam.endereco || '___________________________'}</p>
            <br>
            <p><strong>${mkEdit(p.requerido_nome, 'requerido_nome')}</strong>, CPF/CNPJ: ${mkEdit(Masks.doc(p.requerido_documento), 'requerido_documento')}, residente e domiciliado(a) à ${mkEdit(p.requerido_endereco, 'requerido_endereco')}.</p>
            <br>
            <p>Eu, ${mkEdit(p.requerido_nome, 'requerido_nome')}, venho respeitosamente solicitar a esta Câmara Arbitral que: ${mkEdit('[Digite aqui o motivo do requerimento, ex: por motivo de estar passando por situação financeira difícil, não poderei pagar a parcela na data acordada...]', 'campo_livre_requerimento')}</p>
            <p>Pede Deferimento,</p>
            <p style="text-align:right; margin-top: 30px;">${mkEdit('Local, Data.', 'campo_livre_local_data')}</p>
            <div style="margin-top:60px; display:flex; justify-content:space-between; text-align:center;">
                <div>_________________________________________<br><strong>${mkEdit(p.requerido_nome, 'requerido_nome')}</strong><br>Demandado(a)</div>
                <div>_________________________________________<br><strong>${arb ? arb.nome : 'Árbitro'}</strong><br>Árbitro(a)</div>
            </div>
        </div>`;
    }
    else if(num === 13) {
        html = `
        <div style="font-family: 'Times New Roman', serif; text-align: center; line-height: 1.6;">
            <div style="min-height: 850px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <h3 style="margin:0; text-transform:uppercase;">JUSTIÇA PRIVADA</h3>
                <h2 style="margin:10px 0; text-transform:uppercase; color: var(--color-primary);">${cam.nome || 'CÂMARA DE ARBITRAGEM'}</h2>
                <h4 style="margin:0;">LEI 9.307/1996</h4>
                <h1 style="margin-top:80px; text-decoration: underline; font-size: 36px;">ANEXO</h1>
                <h2 style="margin-top:80px; color: #333; font-size: 28px;">DEMANDANTE</h2>
                <h3 style="margin-top:40px; text-transform: uppercase;">${mkEdit(p.requerente_nome, 'requerente_nome')}</h3>
                <p style="margin-top:20px; font-size:18px;">${mkEdit(p.requerente_endereco, 'requerente_endereco')}</p>
            </div>
            
            <div style="page-break-before: always;"></div>
            
            <div style="min-height: 850px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <h3 style="margin:0; text-transform:uppercase;">JUSTIÇA PRIVADA</h3>
                <h2 style="margin:10px 0; text-transform:uppercase; color: var(--color-primary);">${cam.nome || 'CÂMARA DE ARBITRAGEM'}</h2>
                <h4 style="margin:0;">LEI 9.307/1996</h4>
                <h1 style="margin-top:80px; text-decoration: underline; font-size: 36px;">ANEXO</h1>
                <h2 style="margin-top:80px; color: #333; font-size: 28px;">DEMANDADO</h2>
                <h3 style="margin-top:40px; text-transform: uppercase;">${mkEdit(p.requerido_nome, 'requerido_nome')}</h3>
                <p style="margin-top:20px; font-size:18px;">${mkEdit(p.requerido_endereco, 'requerido_endereco')}</p>
            </div>
        </div>`;
    }
    
    document.getElementById('p-body').innerHTML = html; 
    document.getElementById('modal-preview').style.display = 'flex';
    
    document.getElementById('btn-download').onclick = () => { 
        document.querySelectorAll('.editable-field').forEach(el => el.style.borderBottom = 'none'); 
        html2pdf().from(document.getElementById('pdf-area')).set({ margin: 15, filename: `Doc_${p.numero_processo}.pdf` }).save(); 
        setTimeout(() => document.querySelectorAll('.editable-field').forEach(el => el.style.borderBottom = '1px dashed var(--color-accent)'), 2000); 
    };
};