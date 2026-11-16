/* Nikita invitations. No dependencies, analytics, automatic messages or form backend. */
'use strict';
const STYLES = window.WeddingCatalog;
const $ = (selector,root=document)=>root.querySelector(selector);
// Preserve links already used by the original public portfolio.
const STYLE_ALIASES = {postcard:'childhood',love:'equation',film:'tili',crayon:'color'};
const styleId = id => STYLE_ALIASES[id] || id;
function renderCards(){
  $('#collection-grid').innerHTML=STYLES.map((s,i)=>`<article class="style-card theme-${s.theme} ${i===6?'featured':''}" data-category="${s.category}"><a class="preview-link" href="?demo=${s.id}" data-demo="${s.id}" aria-label="Открыть интерактивный пример «${s.name}»">${window.InvitationCollection.preview(s)}<span class="preview-badge">Попробовать приглашение <svg class="out-arrow" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a><div class="card-body"><div class="card-heading"><h3>${s.name}</h3><span class="card-index">0${i+1} / 07</span></div><p>${s.desc}</p><div class="card-actions"><a href="?demo=${s.id}" data-demo="${s.id}">Смотреть пример <svg class="out-arrow" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 18 18 6M6 6h12v12"/></svg></a><a class="choose-style" data-contact-style="${s.id}" href="contact.html?style=${s.id}" target="_blank" rel="noopener noreferrer">Хочу такое →</a></div></div></article>`).join('');

}
renderCards();
// The paper sample in the portfolio hero uses the same data as the first invitation.
{
 const sample=STYLES[0],name=document.querySelector('.hero-names'),date=document.querySelector('.hero-date');
 if(name&&date){
 const and=document.createElement('i');and.textContent='&';name.replaceChildren(document.createTextNode(sample.names[0]),document.createElement('br'),and,document.createTextNode(' '+sample.names[1]));
 const parts=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).formatToParts(new Date(sample.date+'T12:00Z'));
 date.firstElementChild.textContent=parts.find(x=>x.type==='day').value;date.lastElementChild.replaceChildren(document.createTextNode(parts.find(x=>x.type==='month').value),document.createElement('br'),document.createTextNode(sample.date.slice(0,4)));
 document.querySelector('.hero-art').setAttribute('aria-label','Пример приглашения '+sample.names.join(' и ')+', '+sample.date);
 }
}

if($('#year'))$('#year').textContent=new Date().getFullYear();
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.filter').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  let n=0;document.querySelectorAll('.style-card').forEach(card=>{card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter;if(!card.hidden)n++;});
  $('#filter-status').textContent=`Показано приглашений: ${n}`;
}));
function demoRSVP(){return `<section class="demo-section" id="demo-rsvp"><p class="eyebrow">Анкета гостя · тестовый режим</p><h2>Разделите с нами<br>этот день.</h2><p id="rsvp-note" class="demo-small-note">Попробуйте ответить. Это демонстрация: данные никуда не отправляются и не сохраняются. Используйте вымышленное имя.</p><form id="rsvp-form" aria-describedby="rsvp-note" onsubmit="return false"><label>Имя для примера<input name="guest" required maxlength="100" autocomplete="off" placeholder="Тестовый гость"></label><label>Сможете прийти?<select name="attendance"><option value="yes">Да, с удовольствием!</option><option value="no">К сожалению, не смогу</option></select></label><fieldset id="participation"><legend>Детали участия (пример)</legend><label class="check-label"><input type="checkbox" name="plus">Буду со спутником — если он приглашён</label><label id="plus-name-label" hidden>Имя спутника для примера<input name="plusName" maxlength="100" disabled autocomplete="off" placeholder="Тестовый спутник"></label><label>Пожелания по меню<input name="menu" maxlength="200" placeholder="Например, вегетарианское меню"></label><label>Нужен ли трансфер?<select name="transfer"><option value="undecided">Пока не знаю</option><option value="yes">Да</option><option value="no">Нет</option></select></label></fieldset><button type="submit" class="button" id="test-rsvp">Проверить ответ (демо)</button><p id="rsvp-result" class="demo-result" role="status" aria-live="polite"></p></form></section>`;}
let activeDemo=null;
function renderRoute({focus=false}={}){
  const id=new URL(location.href).searchParams.get('demo');const s=STYLES.find(x=>x.id===styleId(id));
  $('#portfolio').hidden=!!s;$('#demo-view').hidden=!s;activeDemo=s||null;
  if(!s){$('#demo-view').replaceChildren();document.title='Никита — приглашения с вашей историей';if(id){const u=new URL(location.href);u.searchParams.delete('demo');history.replaceState({},'',u);}return;}
  $('#demo-view').innerHTML=window.InvitationCollection.page(s,demoRSVP());
  document.title=`${s.name} — демо приглашения · Никита`;
  wireRSVP();$('#calendar-download').addEventListener('click',downloadCalendar);window.InviteOffer.render();
  if(focus){window.scrollTo({top:0,behavior:'instant'});$('.demo-page').tabIndex=-1;$('.demo-page').focus({preventScroll:true});}
}
function home(hash){const u=new URL(location.href);u.searchParams.delete('demo');u.hash=hash;history.pushState({},'',u);renderRoute();requestAnimationFrame(()=>{const el=$(hash);if(el){el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});el.tabIndex=-1;el.focus({preventScroll:true});}});}
document.addEventListener('click',event=>{
  const demo=event.target.closest('[data-demo]');const back=event.target.closest('[data-home]');
  if(demo&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();const u=new URL(location.href);u.searchParams.set('demo',demo.dataset.demo);u.hash='';history.pushState({},'',u);renderRoute({focus:true});}

  if(back){event.preventDefault();home('#collection');}
});
window.addEventListener('popstate',()=>{renderRoute();if(location.hash)requestAnimationFrame(()=>{try{document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();}catch{/* Invalid URL fragment: keep the page usable. */}});});
function wireRSVP(){
 const form=$('#rsvp-form');const participation=$('#participation');const plusLabel=$('#plus-name-label');
 function conditions(){const yes=form.elements.attendance.value==='yes';participation.hidden=!yes;participation.disabled=!yes;plusLabel.hidden=!yes||!form.elements.plus.checked;form.elements.plusName.disabled=plusLabel.hidden;form.elements.plusName.required=!plusLabel.hidden;$('#rsvp-result').textContent='';$('#test-rsvp').textContent='Проверить ответ (демо)';}
 form.elements.attendance.addEventListener('change',conditions);form.elements.plus.addEventListener('change',conditions);
 form.addEventListener('input',()=>{$('#rsvp-result').textContent='';});
 form.addEventListener('submit',e=>{e.preventDefault();const no=form.elements.attendance.value==='no';$('#rsvp-result').textContent=`${form.elements.guest.value.trim()||'Тестовый гость'}: ${no?'не сможет присутствовать':`будет на празднике; гостей: ${form.elements.plus.checked?2:1}`}.\nПроверка завершена. Это демонстрация: ответ не отправлен и не сохранён.`;$('#test-rsvp').textContent='Изменить тестовый ответ';});conditions();
}
function saveFile(name,content,type='text/plain;charset=utf-8'){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function downloadCalendar(){
 const s=activeDemo,ceremony=s.events.find(e=>e.kind==='ceremony')||s.events[0];
 // Resolve the IANA zone for this date, so a later winter booking also exports correctly.
 const zoned=new Intl.DateTimeFormat('en-GB',{timeZone:s.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 const utc=time=>{
  const wall=Date.parse(`${s.date}T${time}:00Z`);let instant=wall;
  for(let i=0;i<2;i++){
   const p=Object.fromEntries(zoned.formatToParts(new Date(instant)).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
   const represented=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);
   instant-=represented-wall;
  }
  return new Date(instant).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 };
 const escape=value=>String(value).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Nikita//Wedding Demo//RU','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:nikita-demo-${s.id}-${s.date}`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART:${utc(ceremony.time)}`,`DTEND:${utc(s.endTime)}`,`SUMMARY:${escape('ДЕМО — '+s.names.join(' и ')+': пример свадьбы')}`,`DESCRIPTION:${escape('Демонстрационное событие из портфолио. Не настоящее приглашение. Часовой пояс: '+s.timezone+'.')}`,`LOCATION:${escape(s.city+' — демонстрация без адреса')}`,'STATUS:TENTATIVE','END:VEVENT','END:VCALENDAR',''];
 const encoder=new TextEncoder();const folded=lines.map(line=>{let text='',row='';for(const ch of line){if(encoder.encode(row+ch).length>73){text+=row+'\r\n';row=' ';}row+=ch;}return text+row;}).join('\r\n');saveFile('wedding-demo.ics',folded,'text/calendar;charset=utf-8');
}

renderRoute();
