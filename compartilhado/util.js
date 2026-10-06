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