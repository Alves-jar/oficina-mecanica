/* Funções e constantes compartilhadas */
var ST={recebido:'Recebido',orcamento:'Em orçamento',execucao:'Em execução',pronto:'Pronto'};
var NUM={recebido:1,orcamento:2,execucao:3,pronto:4};
function $(i){return document.getElementById(i)}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function brl(v){return v==null?'—':v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function dt(s){return new Date(s).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}
function d(s){return new Date(s+'T12:00:00').toLocaleDateString('pt-BR')}
function carregaJson(url){return fetch(url).then(function(r){if(!r.ok)throw new Error('Arquivo não encontrado: <b>'+r.url+'</b> (erro '+r.status+')');return r.json()})}
function msgErro(e){return 'Não foi possível carregar os dados. '+(e&&e.message?e.message+'. ':'')+'Confira se a pasta <b>dados/</b> está ao lado de <b>painel-oficina.html</b> e se o servidor (Live Server) foi aberto na pasta do projeto. Se abriu o HTML direto do disco, use um servidor local.'}

/* ---- Ordens criadas pelo sistema (guardadas no navegador, em localStorage) ---- */
var CHAVE_ORDENS='oficina.ordens';
function ordensLocais(){try{return JSON.parse(localStorage.getItem(CHAVE_ORDENS))||[]}catch(e){return []}}
function salvaOrdensLocais(l){try{localStorage.setItem(CHAVE_ORDENS,JSON.stringify(l));return true}catch(e){return false}}
/* Lê o JSON de ordens e junta com as ordens criadas na tela "Nova ordem" */
function carregaOrdens(url){return carregaJson(url).then(function(l){return l.concat(ordensLocais())})}
/* Se a ordem foi criada pelo sistema, grava nela as alterações (ex.: mudança de status) */
function atualizaOrdemLocal(o){var l=ordensLocais(),i=-1;l.forEach(function(x,k){if(x.id===o.id)i=k});if(i<0)return false;l[i]=o;return salvaOrdensLocais(l)}