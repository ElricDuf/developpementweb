document.addEventListener('DOMContentLoaded',function(){
  const form=document.getElementById('contactForm');
  if(!form) return;
  form.addEventListener('submit',function(e){
    e.preventDefault();
    const name=form.name.value.trim();
    const email=form.email.value.trim();
    const message=form.message.value.trim();
    if(!name||!email||!message){
      const status=document.getElementById('formStatus');
      if(status){status.style.display='block';status.textContent='Merci de remplir tous les champs.'}
      else alert('Merci de remplir tous les champs.');
      return;
    }
    const status=document.getElementById('formStatus');
    // Simulate send
    form.querySelector('button').disabled=true;
    form.querySelector('button').textContent='Envoi…';
    if(status){status.style.display='block';status.textContent='Envoi en cours…'}
    setTimeout(()=>{
      form.reset();
      form.querySelector('button').disabled=false;
      form.querySelector('button').textContent='Envoyer';
      if(status){status.textContent='Merci — votre message a été envoyé (simulation).'}
      else alert('Merci — votre message a été envoyé (simulation).');
    },800);
  });
  // Mobile burger menu
  const burger=document.querySelector('.burger');
  const mobileNav=document.getElementById('mobileNav');
  function openNav(){
    if(!mobileNav||!burger) return;
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden','false');
    burger.setAttribute('aria-expanded','true');
    document.body.classList.add('nav-open');
  }
  function closeNav(){
    if(!mobileNav||!burger) return;
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden','true');
    burger.setAttribute('aria-expanded','false');
    document.body.classList.remove('nav-open');
    burger.focus();
  }
  if(burger && mobileNav){
    burger.addEventListener('click',function(){
      const open = burger.getAttribute('aria-expanded') === 'true';
      if(open) closeNav(); else openNav();
    });
    // Close when clicking a link inside
    mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeNav));
    // Close on Escape
    document.addEventListener('keydown',function(e){
      if(e.key === 'Escape' && mobileNav.classList.contains('open')){
        closeNav();
      }
    });
  }
});
