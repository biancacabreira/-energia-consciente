// ==CALC==
const TARIFA = 0.822, DIAS_MES = 30, DIAS_ANO = 365; // R$/kWh, bandeira verde
function consumo(w, h){ const hora = w/1000; return {hora, dia: hora*h, mes: hora*h*DIAS_MES, ano: hora*h*DIAS_ANO}; }
function custo(kwh){ return kwh*TARIFA; }
function somar(l){ return l.reduce((t,a)=>{ const c = consumo(a.potencia, a.horas); t.hora+=c.hora; t.dia+=c.dia; t.mes+=c.mes; t.ano+=c.ano; return t; }, {hora:0, dia:0, mes:0, ano:0}); }
// ==/CALC==

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (n,d=2) => n.toLocaleString('pt-BR',{minimumFractionDigits:d, maximumFractionDigits:d});
const brl = n => 'R$ ' + fmt(n, n>0 && n<0.1 ? 3 : 2);
const kwh = n => fmt(n, n>0 && n<0.1 ? 3 : 2) + ' kWh';

// [grupo, [[nome, ícone, potência típica (W), chave de dicas]]]
const CATS = [
 ['Eletrônicos', [['TV','📺',100,'tv'],['Computador','🖥️',200,'pc'],['Notebook','💻',65,'pc'],['Monitor','🖥️',30,'pc'],['Videogame','🎮',200,'tv'],['Caixa de som','🔊',30,'tv'],['Roteador Wi-Fi','📶',10,'rede'],['Carregador de celular','🔋',10,'carga']]],
 ['Eletrodomésticos', [['Geladeira','🧊',60,'geladeira'],['Freezer','🥶',80,'geladeira'],['Ar-condicionado','❄️',1000,'ar'],['Ventilador','🌀',80,'vent'],['Chuveiro elétrico','🚿',5500,'chuveiro'],['Máquina de lavar','🧺',500,'lavar'],['Ferro de passar','👕',1000,'ferro'],['Micro-ondas','🍲',1200,'cozinha'],['Air fryer','🍟',1500,'cozinha'],['Forno elétrico','🍞',1500,'cozinha'],['Liquidificador','🥤',300,'cozinha'],['Aspirador de pó','🧹',1000,'generico'],['Secador de cabelo','💇',1200,'generico'],['Lâmpada LED','💡',9,'luz']]],
 ['Outros', [['Outro','🔌',0,'generico']]]
];
const CAT = {};
CATS.forEach(([g,l]) => l.forEach(([n,i,w,t]) => CAT[n] = {n,i,w,t}));
const catOf = a => CAT[a.cat || a.categoria] || CAT['Outro'];
const SRC = {
 c1:['Cemig, dicas de verão','https://www.agenciaminas.mg.gov.br/news/pdf/112469.pdf'],
 c2:['Cemig, 10 dicas','https://www.agenciaminas.mg.gov.br/news/pdf/111478.pdf'],
 c3:['Cemig, férias escolares','https://www.agenciaminas.mg.gov.br/news/pdf/120522.pdf'],
 idec:['Idec, dicas de economia','https://idec.org.br/node/26115'],
 idec2:['Idec, atenção ao stand-by','https://idec.org.br/em-acao/em-foco/atencao-ao-stand-by'],
 proc:['Procon-JF / ANEEL Consumo Consciente','https://www.pjf.mg.gov.br/administracao_indireta/procon/material_grafico/cartilhas/arquivos/cartilha-economia-de-energia.pdf'],
 ana:['ANA, dicas A3P','https://www.gov.br/ana/pt-br/todos-os-documentos-do-portal/documentos-gab/cosus/dicas-ambientais-da-a3p-evitamento-desperdicio-de-energia.pdf'],
 eq:['Equatorial Maranhão (O Imparcial)','https://oimparcial.com.br/noticias/2022/09/voce-sabe-como-usar-a-energia-sem-desperdicio-veja-dicas/']
};
const FONTES = {ar:['c3','c1','c2','idec','proc','eq','ana'],chuveiro:['c1','c3','c2','idec'],geladeira:['c1','c3','c2','eq'],lavar:['c1','c2','proc'],ferro:['c1','proc','eq'],tv:['c1','c3','idec','idec2'],pc:['idec','proc'],carga:['idec'],vent:['c1','c3','c2'],luz:['c1','c2','eq'],generico:['c3','c1','proc']};
const links = ks => ks.map(s => `<a href="${SRC[s][1]}" target="_blank" rel="noopener">${SRC[s][0]}</a>`).join(' · ');
const fontes = k => `<p class="src">${FONTES[k] ? 'Fontes: ' + links(FONTES[k]) + '. Algumas dicas deste grupo são recomendações gerais.' : 'Recomendações gerais, sem fonte específica.'}</p>`;

const TIPS = {
 ar:{d:['Mantenha entre 23 °C e 24 °C: temperaturas mais baixas gastam mais sem ganho real de conforto.','Feche portas e janelas e limpe os filtros com frequência.','Prefira modelos inverter com Selo Procel classe A e evite sol batendo no aparelho.'],f:'A Cemig estima economia de até 49% por mês ao trocar um ar-condicionado por um modelo mais eficiente.'},
 chuveiro:{d:['Use a posição "verão" sempre que o clima permitir: segundo a Cemig, a economia no consumo pode chegar a 30%.','Feche o chuveiro enquanto se ensaboa e reduza o tempo de banho: de nada adianta baixar a potência e demorar mais.','Evite o fim da tarde, horário de pico em que a rede fica mais sobrecarregada.'],f:'Segundo a Cemig, o chuveiro elétrico pode representar até 30% da fatura de energia.'},
 geladeira:{d:['Evite abrir a porta sem necessidade e não guarde alimentos ainda quentes.','Confira a borracha de vedação: se estiver ressecada, o ar frio escapa e o consumo sobe.','Não desligue à noite e deixe espaço ao redor para o ar circular.'],f:'Segundo a Cemig, uma geladeira em bom estado funciona cerca de 12 h por dia (o compressor liga e desliga). Por isso o consumo real é menor que a potência × 24 h.'},
 lavar:{d:['Lave sempre com a capacidade máxima indicada pelo fabricante.','Use a dosagem correta de sabão para evitar enxágues extras.'],f:'Juntar roupas para lavar de uma vez economiza energia e água.'},
 ferro:{d:['Junte as roupas e passe tudo de uma vez.','Desligue um pouco antes de terminar e aproveite o calor que sobra.','Evite usar junto com outros aparelhos de alta potência: sobrecarrega a rede e pode desarmar o disjuntor.'],f:'Todo aparelho com resistência, como o ferro, consome muita energia por hora de uso.'},
 tv:{d:['Desligue da tomada em vez de deixar em stand-by.','Reduza o brilho da tela e use o modo econômico.','Evite extensões e benjamins (T): segundo o Idec, eles desperdiçam energia.'],f:'Segundo a Cemig, o stand-by pode chegar a 15% do consumo do próprio aparelho. Reportagens que citam o Procel falam em até 12% da conta de luz residencial.'},
 pc:{d:['Ative a suspensão automática e apague o monitor quando sair.','Ao fim do dia, desligue da tomada (uma régua com botão ajuda).','Notebooks costumam gastar bem menos que computadores de mesa.'],f:'Computador em modo de espera continua consumindo energia.'},
 rede:{d:['Se for viajar ou ficar dias fora, desligue o roteador.','Desligue equipamentos de rede que não estão em uso.'],f:'Aparelhos pequenos ligados 24 h por dia somam bastante ao longo do mês.'},
 carga:{d:['Tire o carregador da tomada quando o aparelho estiver carregado.','Evite deixar carregadores ligados sem uso.'],f:'Pequenos gastos de vários aparelhos fazem diferença no fim do mês.'},
 vent:{d:['Prefira o ventilador ao ar-condicionado quando o calor for moderado.','Desligue ao sair: ele refresca pessoas, não o ambiente.','Mantenha as pás limpas para circular melhor o ar.'],f:'Um ventilador gasta uma fração do que consome um ar-condicionado.'},
 cozinha:{d:['Use o aparelho só pelo tempo necessário e evite abrir a porta com frequência.','Descongele alimentos na geladeira antes de preparar.','Ligue para quantidades adequadas: aquecer pouca comida desperdiça energia.'],f:'Aparelhos de alta potência gastam muito em pouco tempo: alguns minutos a menos já fazem diferença.'},
 luz:{d:['Troque lâmpadas antigas por LED: gastam bem menos e duram muito mais.','Apague a luz ao sair do cômodo e aproveite a luz natural.','Cores claras nas paredes deixam o ambiente mais iluminado.'],f:'Uma lâmpada LED pode durar cerca de 15 vezes mais que uma fluorescente.'},
 generico:{d:['Ao comprar, prefira aparelhos com Selo Procel classe A.','Desligue da tomada o que não está em uso.','Evite usar vários aparelhos de alta potência ao mesmo tempo.'],f:'Consumo = potência × tempo de uso: reduzir qualquer um dos dois reduz a conta.'}
};

// ---------- dados ----------
const load = () => { try { return JSON.parse(localStorage.getItem('aparelhos')||'[]'); } catch(e){ return []; } };
const save = l => { try { localStorage.setItem('aparelhos', JSON.stringify(l)); } catch(e){} };
let editId = null;

// ---------- navegação ----------
function show(v){
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.v===v));
  document.querySelectorAll('.view').forEach(s => s.classList.toggle('active', s.id==='v-'+v));
  if(v==='lista') renderLista();
  if(v==='sim') renderSim();
  window.scrollTo(0,0);
}
document.querySelectorAll('nav button').forEach(b => b.onclick = () => show(b.dataset.v));

// ---------- cadastro ----------
$('cat').innerHTML = CATS.map(([g,l]) => `<optgroup label="${g}">${l.map(([n]) => `<option>${n}</option>`).join('')}</optgroup>`).join('');

function sugerir(){
  const c = CAT[$('cat').value], p = $('pot');
  let h = c.w ? `Valor típico para ${c.n}: cerca de ${c.w} W. Confira na etiqueta do seu aparelho.` : 'Confira a potência na etiqueta do aparelho.';
  if(c.t==='geladeira') h += ' Na geladeira o compressor liga e desliga, então use a potência média.';
  $('pot-hint').textContent = h;
  if(c.w && (!p.value || p.dataset.auto==='1')){ p.value = c.w; p.dataset.auto = '1'; }
}
$('cat').onchange = sugerir;
$('pot').oninput = () => { $('pot').dataset.auto = '0'; };
$('tp').querySelector('.info').onclick = e => { e.stopPropagation(); $('tp').classList.toggle('open'); };
document.addEventListener('click', () => $('tp').classList.remove('open'));

function resetForm(){
  editId = null; $('form').reset(); $('pot').dataset.auto = '';
  $('form-titulo').textContent = 'Novo aparelho'; $('salvar').textContent = 'Adicionar aparelho'; $('cancelar').hidden = true;
  sugerir();
}
$('cancelar').onclick = () => { resetForm(); show('lista'); };

$('form').onsubmit = e => {
  e.preventDefault();
  const l = load(), d = {nome:$('nome').value.trim(), cat:$('cat').value, potencia:+$('pot').value, horas:+$('horas').value};
  if(editId){ const i = l.findIndex(a => a.id===editId); if(i>-1) l[i] = {...l[i], ...d}; }
  else l.push({id:Date.now(), ...d});
  save(l); resetForm(); show('lista');
};

function editar(id){
  const a = load().find(x => x.id===id); if(!a) return;
  editId = id;
  $('nome').value = a.nome; $('cat').value = catOf(a).n; $('pot').value = a.potencia; $('pot').dataset.auto = '0'; $('horas').value = a.horas;
  $('form-titulo').textContent = 'Editar aparelho'; $('salvar').textContent = 'Salvar alterações'; $('cancelar').hidden = false;
  sugerir(); show('cadastro');
}

// ---------- meus aparelhos ----------
function renderLista(){
  const l = load(), el = $('lista');
  if(!l.length){
    el.innerHTML = '<p class="empty">Nenhum aparelho cadastrado ainda.</p>';
  } else {
    el.innerHTML = l.map(a => {
      const c = catOf(a), k = consumo(a.potencia, a.horas), t = TIPS[c.t];
      return `<div class="ap">
        <div class="ap-top"><span class="ico">${c.i}</span>
          <div class="info-t"><b>${esc(a.nome)}</b><span>${c.n} · ${a.potencia} W · ${a.horas} h/dia</span></div>
          <div class="cons"><b>${kwh(k.dia)}/dia</b><span>${brl(custo(k.mes))}/mês</span></div></div>
        <div class="acts"><button class="lk" data-e="${a.id}">✎ Editar</button><button class="lk del" data-d="${a.id}">✕ Remover</button></div>
        <details><summary>💡 Dicas para ${c.n}</summary><ul>${t.d.map(x => `<li>${x}</li>`).join('')}</ul><p class="fato"><b>Você sabia?</b> ${t.f}</p>${fontes(c.t)}</details>
      </div>`;
    }).join('') + '<p class="src">Dicas adaptadas de materiais de distribuidoras (Cemig, Equatorial), Idec, Procon-JF/ANEEL e ANA. As fontes de cada categoria estão dentro das dicas.</p>';
    el.querySelectorAll('[data-e]').forEach(b => b.onclick = () => editar(+b.dataset.e));
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => {
      if(confirm('Remover este aparelho?')){ save(load().filter(a => a.id !== +b.dataset.d)); renderLista(); }
    });
  }
  const t = somar(l);
  $('t-dia').textContent = fmt(t.dia); $('t-mes').textContent = fmt(t.mes,1); $('t-ano').textContent = fmt(t.ano,0); $('t-custo').textContent = brl(custo(t.mes));
  const ins = $('insights');
  if(t.mes > 0){
    const top = l.map(a => ({a, k:consumo(a.potencia,a.horas)})).sort((x,y) => y.k.mes - x.k.mes)[0];
    ins.innerHTML = `<div class="tipbox"><b>${esc(top.a.nome)}</b> é o que mais pesa: ${fmt(top.k.mes/t.mes*100,0)}% do consumo mensal.</div>
      <div class="tipbox">Cada hora a menos por dia em <b>${esc(top.a.nome)}</b> economiza cerca de ${brl(custo(consumo(top.a.potencia,1).mes))} por mês.</div>
      <div class="tipbox">${TIPS[catOf(top.a).t].d[0]}</div>`;
  } else ins.innerHTML = '<p class="empty">Cadastre aparelhos para ver as dicas personalizadas.</p>';
}

// ---------- simulador ----------
let tocou = false;
function syncHoras(){
  const v = $('sim-ap').value, all = v==='all';
  $('sim-h-wrap').hidden = all; tocou = false;
  if(!all){ const a = load().find(x => x.id===+v); if(a){ $('sim-h').value = a.horas; $('sim-h-out').textContent = a.horas; } }
}
function renderSim(){
  const l = load(), s = $('sim-ap'), cur = s.value;
  $('sim-box').hidden = !l.length; $('sim-vazio').hidden = !!l.length;
  s.innerHTML = '<option value="all">Todos os aparelhos</option>' + l.map(a => `<option value="${a.id}">${esc(a.nome)}</option>`).join('');
  if([...s.options].some(o => o.value===cur)) s.value = cur;
  syncHoras(); simCalc();
}
function simCalc(){
  const l = load(), v = $('sim-ap').value; let c, extra = '';
  if(v==='all') c = somar(l);
  else {
    const a = l.find(x => x.id===+v); if(!a) return;
    const h = tocou ? +$('sim-h').value : a.horas;
    c = consumo(a.potencia, h); $('sim-h-out').textContent = h;
    const dm = consumo(a.potencia, a.horas).mes - c.mes;
    if(Math.abs(dm) > 1e-9) extra = dm > 0
      ? `Reduzindo de ${a.horas} h para ${h} h por dia, você economiza ${brl(custo(dm))} por mês (${kwh(dm)}).`
      : `Aumentando de ${a.horas} h para ${h} h por dia, você gastaria ${brl(custo(-dm))} a mais por mês.`;
  }
  $('sim-res').innerHTML = [['Por hora',c.hora],['Por dia',c.dia],['Por mês',c.mes],['Por ano',c.ano]]
    .map(([t,k]) => `<div class="res"><span>${t}</span><b class="num">${brl(custo(k))}</b><em>${kwh(k)}</em></div>`).join('');
  $('sim-nota').textContent = 'Por hora: ' + (v==='all' ? 'custo de 1 hora com todos os aparelhos ligados ao mesmo tempo.' : 'custo de 1 hora de uso deste aparelho.');
  $('sim-extra').innerHTML = extra ? `<div class="tipbox">${extra}</div>` : '';
}
$('sim-ap').onchange = () => { syncHoras(); simCalc(); };
$('sim-h').oninput = () => { tocou = true; simCalc(); };

resetForm();
