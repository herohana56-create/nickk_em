/* A real, expiring local offer. No customer data, analytics or network requests. */
(() => {
 'use strict';
 const config=window.InviteBusiness, key='nikita-launch-offer-v1', duration=config.offerMinutes*60000;
 const money=value=>new Intl.NumberFormat('ru-RU').format(value)+' ₽';
 let state=null, persistent=true;
 try {
  const saved=localStorage.getItem(key);
  if(saved!==null){state=JSON.parse(saved);if(!Number.isFinite(state.startedAt)||!Number.isFinite(state.expiresAt)||state.expiresAt-state.startedAt!==duration)throw Error('Invalid offer');}
  else {state={startedAt:Date.now(),expiresAt:Date.now()+duration,ended:false};state.expiresAt=state.startedAt+duration;localStorage.setItem(key,JSON.stringify(state));}
 } catch {persistent=false;state=null;}
 function active(){return persistent&&state&&!state.ended&&Date.now()>=state.startedAt&&Date.now()<state.expiresAt;}
 function quote(){return {amount:active()?config.launchPrice:config.normalPrice,createdAt:Date.now(),expiresAt:state?.expiresAt||null};}
 let lastAmount;
 function render(){
  if(state&&!state.ended&&(Date.now()>=state.expiresAt||Date.now()<state.startedAt)){
   state.ended=true;try{localStorage.setItem(key,JSON.stringify(state));}catch{}
  }
  const isActive=active(),amount=quote().amount;
  document.querySelectorAll('[data-current-price]').forEach(el=>el.textContent=money(amount));
  document.querySelectorAll('[data-regular-price]').forEach(el=>{el.textContent=money(config.normalPrice);el.hidden=!isActive;});
  const seconds=Math.max(0,Math.ceil(((state?.expiresAt||0)-Date.now())/1000));
  document.querySelectorAll('[data-offer-timer]').forEach(el=>{el.textContent=isActive?String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0'):'00:00';});
  document.querySelectorAll('[data-offer-clock]').forEach(el=>el.hidden=!isActive);
  document.querySelectorAll('[data-offer-caption]').forEach(el=>el.textContent=isActive?'Предложение первого знакомства · 15 минут с первого посещения в этом браузере':persistent?'Время предложения истекло. Приглашение можно заказать по обычной цене.':'Стоимость одного персонального приглашения');
  if(lastAmount!==undefined&&lastAmount!==amount){document.querySelectorAll('[data-offer-status]').forEach(el=>el.textContent='Время предложения истекло. Текущая цена — '+money(amount)+'.');document.dispatchEvent(new CustomEvent('offerexpired'));}
  lastAmount=amount;
 }
 window.InviteOffer={quote,money,render};
 window.addEventListener('storage',e=>{if(e.key!==key)return;try{const data=JSON.parse(e.newValue);if(data&&Number.isFinite(data.startedAt)&&Number.isFinite(data.expiresAt)&&data.expiresAt-data.startedAt===duration)state=data;else{persistent=false;state=null;}}catch{persistent=false;state=null;}render();});
 document.addEventListener('visibilitychange',render);
 document.addEventListener('DOMContentLoaded',render);setInterval(render,1000);
})();

/* Outbound Telegram links require fresh, separate consent for every handoff. */
(() => {
 'use strict';
 let pending=null;
 const business=window.InviteBusiness;
 const ready=()=>Boolean(business.name&&business.status&&business.inn&&business.email);
 const url=()=> 'https://t.me/'+business.telegram;
 window.InviteContact={url,ready};
 function dialog(){
  let el=document.getElementById('contact-consent');if(el)return el;
  el=document.createElement('dialog');el.id='contact-consent';el.className='contact-dialog';el.setAttribute('aria-labelledby','contact-title');
  el.innerHTML=`<form method="dialog"><button class="dialog-close" value="cancel" aria-label="Закрыть">×</button><p class="eyebrow">Перед переходом</p><h2 id="contact-title">Продолжим в Telegram?</h2><p>Откроется личный чат с Никитой. В ссылке нет данных заказа и автоматически подготовленного сообщения. Сообщение вы напишете сами.</p><label class="check-label"><input type="checkbox" id="contact-personal">Даю отдельное <a href="consent.html" target="_blank" rel="noopener">согласие на обработку персональных данных</a> исполнителем и ознакомлен(а) с <a href="privacy.html" target="_blank" rel="noopener">политикой</a>.</label><label class="check-label"><input type="checkbox" id="contact-terms">Ознакомлен(а) с <a href="terms.html" target="_blank" rel="noopener">условиями заказа</a>: до 7 дней, оплата после согласования готового результата.</label><p id="contact-draft-note" class="legal-draft-note"></p><button class="button primary" type="button" id="contact-proceed" disabled>Перейти в Telegram →</button><p class="dialog-footnote">Это переход к обсуждению. Сообщение отправляете вы сами. Оплаты на сайте нет.</p></form>`;
  document.body.append(el);
  const update=()=>{el.querySelector('#contact-proceed').disabled=!(ready()&&el.querySelector('#contact-personal').checked&&el.querySelector('#contact-terms').checked);};
  el.addEventListener('change',update);
  el.querySelector('#contact-proceed').addEventListener('click',()=>{if(!ready()||!el.querySelector('#contact-personal').checked||!el.querySelector('#contact-terms').checked)return;const target=pending;el.close();pending=null;if(target)window.open(target,'_blank','noopener,noreferrer');});
  return el;
 }
 document.addEventListener('click',event=>{
  const link=event.target.closest('a');if(!link)return;
  let target;try{target=new URL(link.href,location.href);}catch{return;}
  if(!link.matches('[data-contact],[data-contact-style],#send-telegram')&&(target.hostname!=='t.me'||target.pathname!=='/'+business.telegram))return;
  event.preventDefault();event.stopImmediatePropagation();
  const el=dialog();el.querySelectorAll('input[type=checkbox]').forEach(input=>input.checked=false);el.querySelector('#contact-proceed').disabled=true;
  el.querySelector('#contact-draft-note').textContent=ready()?'':'Предпросмотр: реквизиты исполнителя ещё не заполнены. Переход к заказу будет включён после подготовки окончательных документов.';
  pending=url();
  el.showModal();
 },true);
})();
