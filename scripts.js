// =====================================================
//  SISTEMA DE ALMACENAMIENTO LOCAL
//  → Los datos se guardan en el navegador (localStorage)
// =====================================================
const Storage = {
  get(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  add(key, item) {
    const data = this.get(key);
    const newItem = { ...item, id: Date.now().toString(), created_at: new Date().toISOString() };
    data.unshift(newItem);
    this.set(key, data);
    return newItem;
  },
  delete(key, id) {
    const data = this.get(key).filter(item => item.id !== id);
    this.set(key, data);
  }
};

// =====================================================
//  HERO CANVAS — Proactive Mesh Grid
// =====================================================
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const SPACING      = 45;
  const MOUSE_RADIUS = 180;
  const SPRING       = 0.04;
  const FRICTION     = 0.88;
  const PUSH_FORCE   = 0.35;

  let W, H, cols, rows, grid;
  let mouse = { x: -9999, y: -9999 };

  function buildGrid() {
    const dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
    
    cols = Math.ceil(W / SPACING) + 2;
    rows = Math.ceil(H / SPACING) + 2;
    grid = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const bx = c * SPACING;
        const by = r * SPACING;
        row.push({ bx, by, x: bx, y: by, vx: 0, vy: 0 });
      }
      grid.push(row);
    }
  }

  function tick() {
    if (!grid || !grid.length) return;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p  = grid[r][c];
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_RADIUS * MOUSE_RADIUS) {
          const dist  = Math.sqrt(d2) || 0.001;
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.vx += (dx / dist) * force * PUSH_FORCE * MOUSE_RADIUS * 0.05;
          p.vy += (dy / dist) * force * PUSH_FORCE * MOUSE_RADIUS * 0.05;
        }
        p.vx += (p.bx - p.x) * SPRING;
        p.vy += (p.by - p.y) * SPRING;
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;
      }
    }
  }

  const HOT_R  = 239, HOT_G  = 68,  HOT_B  = 68;
  const BASE_R = 234, BASE_G = 221, BASE_B = 202;

  function draw() {
    if (!grid || !grid.length) return;
    ctx.clearRect(0, 0, W, H);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p  = grid[r][c];
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        const t  = Math.max(0, 1 - d / MOUSE_RADIUS);
        const lineR = Math.round(BASE_R + (HOT_R - BASE_R) * t);
        const lineG = Math.round(BASE_G + (HOT_G - BASE_G) * t);
        const lineB = Math.round(BASE_B + (HOT_B - BASE_B) * t);
        const lineAlpha = 0.18 + t * 0.55;
        ctx.strokeStyle = `rgba(${lineR},${lineG},${lineB},${lineAlpha})`;
        ctx.lineWidth   = 0.8 + t * 0.8;
        if (c < cols - 1) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(grid[r][c + 1].x, grid[r][c + 1].y);
          ctx.stroke();
        }
        if (r < rows - 1) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(grid[r + 1][c].x, grid[r + 1][c].y);
          ctx.stroke();
        }
        const nodeAlpha  = 0.28 + t * 0.72;
        const nodeRadius = 1.2  + t * 2.6;
        ctx.fillStyle = `rgba(${lineR},${lineG},${lineB},${nodeAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function loop() { tick(); draw(); requestAnimationFrame(loop); }

  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  window.addEventListener('touchmove', e => {
    const rect  = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouse.x = touch.clientX - rect.left;
    mouse.y = touch.clientY - rect.top;
  }, { passive: true });
  window.addEventListener('touchend', () => { mouse.x = -9999; mouse.y = -9999; });
  document.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(buildGrid, 100);
  });

  buildGrid();
  requestAnimationFrame(loop);
})();

// =====================================================
//  MOBILE NAV
// =====================================================
(function () {
  const hamburger = document.getElementById('nav-hamburger');
  const menu      = document.getElementById('mobile-menu');
  const closeBtn  = document.getElementById('mobile-menu-close');
  if (!hamburger || !menu) return;

  function open()  { menu.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function close() { menu.classList.remove('open'); document.body.style.overflow = ''; }

  hamburger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', close));
})();

// =====================================================
//  SHUFFLE STACK — Categorías
// =====================================================
(function () {
  const catData = {
    damas: {
      title: 'DAMAS',
      text: 'Voleibol femenino de alta energía. Entrenamientos técnicos y tácticos para todos los niveles. Desarrolla tus habilidades en un ambiente motivador y competitivo.',
      horario: 'MAR & JUE — 18:00 a 19:30'
    },
    varones: {
      title: 'VARONES',
      text: 'Equipo masculino con foco en técnica, potencia y juego en equipo. Entrenadores certificados para llevar tu juego al siguiente nivel.',
      horario: 'LUN A JUE — 19:30 a 21:00'
    },
    escuela: {
      title: 'ESCUELA',
      text: 'Formación deportiva para niñas y niños desde 8 años. Aprenden los fundamentos del voleibol en un espacio seguro, divertido y motivador.',
      horario: 'CONSULTAR HORARIOS'
    }
  };

  const catItems    = document.querySelectorAll('.cat-item');
  const photoCards  = document.querySelectorAll('.photo-card');
  const infoTitle   = document.getElementById('info-title');
  const infoText    = document.getElementById('info-text');
  const infoHorario = document.getElementById('info-horario');
  if (!catItems.length) return;

  function activateCat(cat) {
    // Actualizar items activos
    catItems.forEach(item => item.classList.toggle('active', item.dataset.cat === cat));
    
    // Actualizar texto con transición
    const data = catData[cat];
    infoTitle.textContent  = data.title;
    infoText.style.opacity = '0';
    setTimeout(() => {
      infoText.textContent    = data.text;
      infoHorario.textContent = data.horario;
      infoText.style.opacity  = '1';
    }, 150);
    
    // Reorganizar cards
    photoCards.forEach(card => {
      // Remover todas las clases de posición
      card.classList.remove('front', 'back-1', 'back-2');
      
      if (card.dataset.cat === cat) {
        // La card seleccionada va al frente
        card.classList.add('front');
      }
    });
    
    // Asignar posiciones a las cards que no están al frente
    const otherCards = Array.from(photoCards).filter(c => c.dataset.cat !== cat);
    if (otherCards.length >= 1) otherCards[0].classList.add('back-1');
    if (otherCards.length >= 2) otherCards[1].classList.add('back-2');
  }

  catItems.forEach(item => {
    item.addEventListener('mouseenter', () => activateCat(item.dataset.cat));
    item.addEventListener('click',      () => activateCat(item.dataset.cat));
    item.addEventListener('touchstart', e => {
      e.preventDefault();
      activateCat(item.dataset.cat);
    }, { passive: false });
  });
  
  // Inicializar con la primera categoría activa
  activateCat('damas');
})();

// =====================================================
//  NEWS FEED — Carga desde localStorage
// =====================================================
(function () {
  const grid = document.getElementById('news-grid');
  if (!grid) return;

  const typeLabel = { general: 'General', urgente: '🔴 Urgente', evento: '📅 Evento' };
  const typeClass = { general: 'news-tag-general', urgente: 'news-tag-urgente', evento: 'news-tag-evento' };

  function loadNews() {
    const data = Storage.get('noticias');
    
    if (!data.length) {
      grid.innerHTML = '<div class="news-empty">No hay anuncios publicados aún.</div>';
      return;
    }
    
    grid.innerHTML = data.slice(0, 12).map(n => `
      <div class="news-card">
        <div class="news-card-header">
          <span class="news-tag ${typeClass[n.tipo] || 'news-tag-general'}">${typeLabel[n.tipo] || n.tipo}</span>
          <span class="news-date">${fmtDate(n.created_at)}</span>
        </div>
        <h3 class="news-title">${escHtml(n.titulo)}</h3>
        <p class="news-body">${escHtml(n.contenido)}</p>
      </div>`).join('');
  }

  loadNews();
  
  // Recargar cuando cambien las noticias
  window.addEventListener('storage', loadNews);

  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function escHtml(s) {
    if (!s) return '';
    return s.toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
})();

// =====================================================
//  INSCRIPCIÓN FORM
// =====================================================
(function () {
  const form      = document.getElementById('registro-form');
  const fechaInput = form ? form.querySelector('[name="fecha_nac"]') : null;
  const apoderadoSection = document.getElementById('apoderado-section');
  const apoderadoFields  = document.getElementById('apoderado-fields');
  if (!form) return;

  // Mostrar/ocultar sección apoderado según edad
  if (fechaInput) {
    fechaInput.addEventListener('change', () => {
      const age = calcAge(fechaInput.value);
      const show = age !== null && age < 18;
      apoderadoSection.style.display = show ? 'block' : 'none';
      apoderadoFields.style.display  = show ? 'block' : 'none';
      
      // Hacer campos del apoderado requeridos si es menor
      const apoderadoNombre = form.querySelector('[name="apoderado_nombre"]');
      const apoderadoTel = form.querySelector('[name="apoderado_telefono"]');
      if (show) {
        apoderadoNombre.required = true;
        apoderadoTel.required = true;
      } else {
        apoderadoNombre.required = false;
        apoderadoTel.required = false;
      }
    });
  }

  function calcAge(dobStr) {
    if (!dobStr) return null;
    const dob  = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn       = document.getElementById('form-submit-btn');
    const btnText   = document.getElementById('form-submit-text');
    const successEl = document.getElementById('form-success');
    const errorEl   = document.getElementById('form-error');
    successEl.style.display = errorEl.style.display = 'none';

    btn.disabled = true;
    btnText.textContent = 'ENVIANDO…';

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    // Validación básica
    if (!payload.nombre || !payload.fecha_nac || !payload.genero || !payload.categoria) {
      errorEl.textContent = '⚠ Completa todos los campos obligatorios (*)';
      errorEl.style.display = 'block';
      btn.disabled = false;
      btnText.textContent = 'ENVIAR INSCRIPCIÓN →';
      return;
    }
    
    // Validar apoderado si es menor
    const age = calcAge(payload.fecha_nac);
    if (age < 18) {
      if (!payload.apoderado_nombre || !payload.apoderado_telefono) {
        errorEl.textContent = '⚠ Para menores de 18 años se requiere nombre y teléfono del apoderado';
        errorEl.style.display = 'block';
        btn.disabled = false;
        btnText.textContent = 'ENVIAR INSCRIPCIÓN →';
        return;
      }
    }

    try {
      // Guardar en localStorage
      Storage.add('inscripciones', {
        nombre: payload.nombre,
        fecha_nac: payload.fecha_nac,
        genero: payload.genero,
        categoria: payload.categoria,
        apoderado_nombre: payload.apoderado_nombre || null,
        apoderado_telefono: payload.apoderado_telefono || null
      });

      btn.disabled = false;
      btnText.textContent = 'ENVIAR INSCRIPCIÓN →';
      form.reset();
      apoderadoSection.style.display = 'none';
      apoderadoFields.style.display  = 'none';
      successEl.style.display = 'flex';
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
      errorEl.textContent = '⚠ Error al enviar. Intenta nuevamente.';
      errorEl.style.display = 'block';
      btn.disabled = false;
      btnText.textContent = 'ENVIAR INSCRIPCIÓN →';
    }
  });
})();

// =====================================================
//  CONTACTO FORM
// =====================================================
(function () {
  const form = document.getElementById('contacto-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const successEl = document.getElementById('contacto-success');
    const fd = new FormData(form);
    const { nombre, email, mensaje } = Object.fromEntries(fd.entries());
    if (!nombre || !email || !mensaje) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'ENVIANDO…';

    try {
      Storage.add('mensajes', { nombre, email, mensaje });
      
      submitBtn.disabled = false;
      submitBtn.textContent = 'ENVIAR MENSAJE →';
      form.reset();
      successEl.style.display = 'flex';
    } catch (error) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'ENVIAR MENSAJE →';
    }
  });
})();

// =====================================================
//  CHATBOT INTELIGENTE CON MEMORIA CONVERSACIONAL
// =====================================================
(function () {
  const bubble     = document.getElementById('chat-bubble');
  const win        = document.getElementById('chat-window');
  const closeBtn   = document.getElementById('chat-close');
  const input      = document.getElementById('chat-input');
  const sendBtn    = document.getElementById('chat-send');
  const messagesEl = document.getElementById('chat-messages');
  const quickEl    = document.getElementById('chat-quick-replies');
  const notif      = document.getElementById('chat-notification');
  if (!bubble) return;

  let isOpen = false;
  let gotoForm = document.getElementById('chat-goto-form');
  
  // ── MEMORIA CONVERSACIONAL ──
  let conversationHistory = [];
  let userContext = {
    askedAbout: [],
    interestedCategories: [],
    hasChildren: null,
    visitCount: 0
  };

  // ── BASE DE CONOCIMIENTO EXPANDIDA ──
  const KB = {
    // HORARIOS Y CLASES
    horarios: {
      keywords: ['horario','cuando','dia','dias','hora','horas','schedule','lunes','martes','miercoles','jueves','viernes','sabado','domingo','que dia','a que hora','cuanto tiempo','duracion'],
      variations: [
        '⏰ <strong>Horarios de Nova Volley:</strong><br><br>• <b>Damas:</b> Martes y Jueves de 18:00 a 19:30<br>• <b>Adultos (varones):</b> Lunes a Jueves de 19:30 a 21:00<br>• <b>Escuela (niños y niñas):</b> Consulta disponibilidad directamente<br><br>📍 San Isidro 886, Santiago Centro',
        'Tenemos clases <b>de lunes a jueves</b>. Las damas entrenan martes y jueves de 18:00 a 19:30, los adultos de lunes a jueves de 19:30 a 21:00, y para la escuela puedes consultar los horarios disponibles. 📅',
        'Nuestros entrenamientos son:<br>🏐 <b>Damas:</b> Mar/Jue 18:00-19:30<br>🏐 <b>Adultos:</b> Lun-Jue 19:30-21:00<br>🏐 <b>Escuela:</b> Horarios a consultar'
      ]
    },
    
    damas: {
      keywords: ['damas','mujeres','femenino','chicas','señoras','ladies','mujer','ella','ellas'],
      variations: [
        '👩 ¡El equipo de <b>Damas</b> es genial! Entrenan los <b>martes y jueves de 18:00 a 19:30</b>. Es para todos los niveles, desde principiantes hasta avanzadas. ¿Te gustaría probar una clase gratis?',
        'Las clases de <b>Damas</b> son muy dinámicas. Trabajamos técnica, táctica y mucho juego. Los horarios son mar/jue 18:00-19:30. ¿Tienes experiencia previa o serías nueva en el voleibol? 🏐',
        'El grupo de damas es súper motivador. Todas aprenden juntas sin importar el nivel. Entrenan martes y jueves a las 18:00. ¿Qué te gustaría saber más?'
      ]
    },
    
    adultos: {
      keywords: ['adultos','varones','hombres','masculino','chicos','señores','men','varon','el','ellos'],
      variations: [
        '👨 Las clases de <b>Adultos</b> son de <b>lunes a jueves de 19:30 a 21:00</b>. Aceptamos todos los niveles, desde principiantes hasta jugadores con experiencia. ¿Juegas voleibol o quieres empezar?',
        'El equipo masculino entrena <b>4 veces a la semana</b> (lun-jue 19:30-21:00). Trabajamos fundamentos técnicos, juego táctico y mucho partido. ¿Te interesa unirte?',
        'Para adultos varones tenemos entrenamientos completos de lunes a jueves en el horario de 19:30 a 21:00. No importa si nunca has jugado, ¡todos empezaron alguna vez! 💪'
      ]
    },
    
    escuela: {
      keywords: ['escuela','niños','niñas','niño','niña','hijo','hija','menor','chico','chica','kids','children','infantil','juvenil'],
      variations: [
        '👦👧 ¡La <b>Escuela de Voleibol</b> es perfecta para niños y niñas desde los <b>8 años</b>! Aprenden los fundamentos en un ambiente súper divertido y seguro. Para horarios específicos, es mejor que contactes directamente al club. ¿Tu hijo/a tiene experiencia jugando?',
        'Nuestra escuela acepta desde los <b>8 años</b>. Los niños aprenden mientras se divierten, sin presión. Los horarios varían según la demanda, así que te recomiendo escribir para consultar disponibilidad. ¿Qué edad tiene tu pequeño/a?',
        'La categoría <b>Escuela</b> es ideal para que los niños aprendan voleibol desde cero. Edad mínima: 8 años. Te sugiero contactar al club para ver los horarios que mejor les acomoden. 📞'
      ]
    },
    
    // UBICACIÓN Y ACCESO
    ubicacion: {
      keywords: ['donde','ubicacion','direccion','lugar','mapa','llegar','como llego','metro','bus','estacion','parking','estacionamiento','aparcar'],
      variations: [
        '📍 Estamos en <b>San Isidro 886, Santiago Centro</b>.<br><br>🚇 Muy cerca del <b>Metro Baquedano y Metro Santa Lucía</b><br>🅿️ Hay <b>estacionamiento disponible</b> en el mismo lugar<br>🚌 Bien conectado por transporte público',
        'Nos encuentras en <b>San Isidro 886</b>, en pleno Santiago Centro. Si vienes en metro, las estaciones más cercanas son Baquedano y Santa Lucía. ¡Y tenemos estacionamiento! 🅿️',
        'La dirección es <b>San Isidro 886, Santiago Centro</b>. Llegas fácil en metro (Baquedano o Santa Lucía). No te preocupes por estacionar, tenemos espacio disponible. 🚗'
      ]
    },
    
    // CLASE GRATIS
    prueba: {
      keywords: ['prueba','gratis','free','trial','primera clase','probar','conocer','visita','visitar','ver','demo','test'],
      variations: [
        '🎯 ¡Tu <b>primera clase es GRATIS</b>, sin ningún compromiso! Solo necesitas:<br>1️⃣ Agendar por WhatsApp o formulario<br>2️⃣ Venir con ropa deportiva y zapatillas<br>3️⃣ ¡Disfrutar! 🏐<br><br>No necesitas experiencia previa. ¿Para qué categoría te gustaría agendar?',
        '¡Genial que quieras probar! La primera clase es <b>totalmente gratuita</b>. Puedes venir tal como estás (bueno, con ropa cómoda 😄). ¿Te agendo para damas, adultos o escuela?',
        'La clase de prueba es <b>sin costo y sin compromiso</b>. Vienes, conoces el club, juegas un poco y decides. ¿Cuándo te gustaría venir? Puedo ayudarte a coordinar. 💪'
      ]
    },
    
    // INSCRIPCIÓN Y PROCESO
    inscripcion: {
      keywords: ['inscribir','inscripcion','unirme','registro','registrar','apuntar','anotarme','como me inscribo','como entro','matricula','cupo'],
      variations: [
        '📋 Inscribirte es súper fácil:<br>1️⃣ Completa el <a href="#inscripcion" style="color:var(--mustard)">formulario web</a><br>2️⃣ O escríbenos por WhatsApp<br>3️⃣ Agenda tu primera clase gratis<br>4️⃣ ¡Ya estás dentro!<br><br>Tenemos cupos para <b>Damas, Adultos y Escuela</b>. ¿Cuál te interesa?',
        'Para inscribirte tienes 3 opciones: formulario en la web, WhatsApp o venir directo al club. Te recomiendo empezar con la clase gratis para que conozcas. ¿Qué categoría te llama más la atención?',
        '¿Listo para unirte? 🏐 Puedes usar el formulario aquí mismo o escribirnos. Lo más importante: ¡ven a la clase de prueba gratis! Así conoces el ambiente. ¿Para quién sería la inscripción?'
      ]
    },
    
    // REQUISITOS Y MATERIALES
    requisitos: {
      keywords: ['necesito','requisito','que traer','que llevar','material','equipo','implementos','rodilleras','zapatillas','ropa','vestimenta'],
      variations: [
        '👕 Para empezar solo necesitas:<br>• <b>Ropa deportiva cómoda</b><br>• <b>Zapatillas deportivas</b> (idealmente de voleibol, pero cualquiera sirve al inicio)<br>• <b>Botella de agua</b><br><br>Las rodilleras son opcionales pero recomendadas. Nosotros tenemos balones y todo el equipo. ¿Ya tienes todo listo?',
        'No necesitas mucho: ropa cómoda, zapatillas y ganas de jugar. El club tiene todos los balones y la red. Si quieres, puedes traer rodilleras, pero no es obligatorio al principio. 🏐',
        'Básicamente traes tu ropa deportiva y zapatillas. Todo lo demás (balones, red, cancha) lo ponemos nosotros. ¿Lista/o para tu primera clase?'
      ]
    },
    
    // NIVEL Y EXPERIENCIA
    nivel: {
      keywords: ['nivel','principiante','novato','nunca he jugado','sin experiencia','beginner','avanzado','intermedio','experto','se jugar','experiencia'],
      variations: [
        '💪 ¡Todos los niveles son bienvenidos! No importa si <b>nunca has tocado un balón</b> o si ya tienes experiencia. Nuestros entrenadores adaptan las clases para que todos mejoren a su ritmo. ¿Cuánta experiencia tienes tú?',
        'Trabajamos con <b>principiantes y avanzados</b> en el mismo grupo. Los entrenadores se aseguran de que cada persona trabaje en lo que necesita. ¿Has jugado antes o sería tu primera vez?',
        'No te preocupes por tu nivel. Acá todos empezaron de cero alguna vez. Lo importante son las ganas de aprender y disfrutar. ¿Qué nivel dirías que tienes?'
      ]
    },
    
    // EDAD Y RESTRICCIONES
    edad: {
      keywords: ['edad','años','cuantos años','rango','menor','mayor','adulto mayor','tercera edad','jubilado'],
      variations: [
        '📅 <b>Categoría Escuela:</b> Desde 8 años<br><b>Categoría Damas/Adultos:</b> A partir de 18 años (sin límite superior)<br><br>¡Tenemos jugadores de todas las edades! Lo importante es la actitud y las ganas. ¿Para qué edad estás buscando?',
        'Para niños desde los <b>8 años</b> en la Escuela. Para adultos no hay límite de edad, tenemos jugadores desde 18 hasta 60+ años. ¿Cuántos años tienes tú?',
        'La Escuela acepta desde 8 años. Para adultos, si tienes más de 18 puedes entrar sin problema, sin importar si tienes 20, 40 o 60. 😊'
      ]
    },
    
    // ENTRENADORES
    entrenador: {
      keywords: ['entrenador','profesor','coach','capacitado','certificado','quien enseña','instructor','monitor'],
      variations: [
        '🏆 Nuestros entrenadores están <b>certificados</b> y tienen amplia experiencia en voleibol competitivo y formativo. Cada categoría tiene un programa específico diseñado por profesionales. ¿Te gustaría saber más sobre la metodología de alguna categoría en particular?',
        'Trabajamos con <b>coaches certificados</b> que han jugado y entrenado por años. Son apasionados del voleibol y les encanta enseñar. Cada uno se especializa en su categoría. 💪',
        'Los profes son buenísimos, con <b>certificación oficial</b> y mucha cancha (literal y figurada 😄). Te van a ayudar a mejorar sea cual sea tu nivel.'
      ]
    },
    
    // INSTALACIONES
    instalaciones: {
      keywords: ['cancha','canchas','instalacion','instalaciones','gimnasio','recinto','lugar','espacio','camarines','baños','duchas'],
      variations: [
        '🏐 Tenemos <b>3 canchas profesionales</b> en San Isidro 886. Las instalaciones incluyen:<br>• Canchas con piso profesional<br>• Camarines<br>• Estacionamiento<br>• Iluminación de calidad<br><br>¿Te gustaría venir a conocerlas en tu clase gratis?',
        'Contamos con <b>3 canchas de nivel profesional</b>, todas con excelente piso y red. Las instalaciones están bien mantenidas. ¿Quieres agendar una visita?',
        'El club tiene 3 canchas completas, todas en buen estado. Camarines, estacionamiento, todo lo necesario para entrenar cómodo. 💯'
      ]
    },

    // SEGUIMIENTO CONTEXTUAL
    followup_categoria: {
      keywords: ['__FOLLOWUP_CATEGORIA__'],
      variations: [
        'Perfecto. Para {categoria}, los entrenamientos son {horario}. ¿Te gustaría agendar tu clase de prueba gratis o necesitas saber algo más?',
        '¡Excelente elección! {categoria} entrena {horario}. ¿Quieres que te ayude a agendar o tienes más preguntas?',
        'Genial, {categoria} es una gran opción. El horario es {horario}. ¿Te anoto para una clase de prueba?'
      ]
    }
  };

  // ── SISTEMA DE NLP BÁSICO ──
  function normalizeText(text) {
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[¿?¡!.,;:]/g, ' ')
      .trim();
  }

  function extractIntent(text) {
    const normalized = normalizeText(text);
    const words = normalized.split(/\s+/);
    
    // Detectar saludos
    const greetings = ['hola','hi','hey','buenas','saludos','buenos dias','buenas tardes','buenas noches','ola','holaaa'];
    if (greetings.some(g => normalized.includes(g)) && words.length <= 3) {
      return { intent: 'greeting', confidence: 1.0 };
    }
    
    // Detectar agradecimientos
    const thanks = ['gracias','thank','thx','grax','vale','perfecto','ok','okay','entiendo','entendido'];
    if (thanks.some(t => normalized.includes(t)) && words.length <= 4) {
      return { intent: 'thanks', confidence: 1.0 };
    }
    
    // Detectar intención principal por keywords
    let bestMatch = { intent: null, score: 0 };
    
    for (const [intent, data] of Object.entries(KB)) {
      if (!data.keywords) continue;
      
      let score = 0;
      for (const keyword of data.keywords) {
        if (normalized.includes(keyword)) {
          // Dar más peso a keywords exactos
          score += 2;
        } else {
          // Buscar coincidencias parciales
          const keywordWords = keyword.split(' ');
          if (keywordWords.every(kw => words.includes(kw))) {
            score += 1;
          }
        }
      }
      
      if (score > bestMatch.score) {
        bestMatch = { intent, score };
      }
    }
    
    return bestMatch.score > 0 ? 
      { intent: bestMatch.intent, confidence: bestMatch.score / 5 } : 
      { intent: 'unknown', confidence: 0 };
  }

  function extractEntities(text) {
    const normalized = normalizeText(text);
    const entities = {};
    
    // Detectar categorías mencionadas
    if (/damas|mujeres|femenino|chicas/.test(normalized)) {
      entities.categoria = 'damas';
    } else if (/adultos|varones|hombres|masculino/.test(normalized)) {
      entities.categoria = 'adultos';
    } else if (/escuela|niños|niñas|hijo|hija/.test(normalized)) {
      entities.categoria = 'escuela';
    }
    
    // Detectar nivel
    if (/principiante|novato|nunca|sin experiencia/.test(normalized)) {
      entities.nivel = 'principiante';
    } else if (/avanzado|experto|profesional/.test(normalized)) {
      entities.nivel = 'avanzado';
    }
    
    // Detectar edad (números)
    const ageMatch = text.match(/\b(\d{1,2})\s*(años|año)\b/);
    if (ageMatch) {
      entities.edad = parseInt(ageMatch[1]);
    }
    
    return entities;
  }

  // ── GENERADOR DE RESPUESTAS INTELIGENTE ──
  function generateResponse(userText) {
    const { intent, confidence } = extractIntent(userText);
    const entities = extractEntities(userText);
    
    // Actualizar contexto
    if (intent && intent !== 'greeting' && intent !== 'thanks' && intent !== 'unknown') {
      if (!userContext.askedAbout.includes(intent)) {
        userContext.askedAbout.push(intent);
      }
    }
    
    if (entities.categoria) {
      if (!userContext.interestedCategories.includes(entities.categoria)) {
        userContext.interestedCategories.push(entities.categoria);
      }
    }
    
    if (entities.edad && entities.edad < 18) {
      userContext.hasChildren = true;
    }

    // Generar respuesta según intención
    switch(intent) {
      case 'greeting':
        const greetingResponses = [
          '👋 ¡Hola! Bienvenido/a al <b>Club Nova Volley</b>. Soy Nova Bot y estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?',
          '¡Hola! 🏐 ¿Qué tal? Soy el asistente virtual de Nova Volley. Cuéntame, ¿qué necesitas saber sobre nuestras clases?',
          '👋 ¡Hola! Me alegra verte por acá. ¿Tienes alguna pregunta sobre el club o las categorías?'
        ];
        return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
        
      case 'thanks':
        const thanksResponses = [
          '¡De nada! 😊 Si tienes más preguntas, aquí estoy. También puedes hablar con una persona real usando el botón de abajo. 👇',
          '¡Para eso estoy! 🏐 ¿Necesitas algo más o ya estás listo/a para la clase gratis?',
          'Un placer ayudarte. Si quieres agendar o tienes más dudas, solo dime. 💪'
        ];
        return thanksResponses[Math.floor(Math.random() * thanksResponses.length)];
        
      case 'unknown':
        // Respuesta inteligente basada en contexto previo
        if (userContext.askedAbout.length > 0) {
          const lastTopic = userContext.askedAbout[userContext.askedAbout.length - 1];
          return `🤔 Hmm, no estoy seguro de haber entendido bien. ¿Tu pregunta es sobre <b>${lastTopic}</b>? También puedo ayudarte con horarios, inscripciones, clase gratis y más. ¿Qué necesitas?`;
        }
        return '🤔 No estoy seguro de haber entendido. Puedo ayudarte con:<br>• Horarios de clases<br>• Información de categorías<br>• Clase de prueba gratis<br>• Ubicación e instalaciones<br>• Requisitos e inscripción<br><br>¿Sobre qué quieres saber?';
        
      default:
        // Usar base de conocimiento con variación
        if (KB[intent] && KB[intent].variations) {
          const variations = KB[intent].variations;
          let response = variations[Math.floor(Math.random() * variations.length)];
          
          // Personalizar con entidades si existen
          if (entities.categoria && intent === 'followup_categoria') {
            const horarioMap = {
              'damas': 'martes y jueves de 18:00 a 19:30',
              'adultos': 'lunes a jueves de 19:30 a 21:00',
              'escuela': 'según disponibilidad (consultar)'
            };
            response = response.replace('{categoria}', entities.categoria);
            response = response.replace('{horario}', horarioMap[entities.categoria]);
          }
          
          // Agregar seguimiento contextual
          if (confidence > 0.7 && !userContext.askedAbout.includes('prueba')) {
            const followups = [
              '<br><br>💡 Por cierto, ¿sabías que la primera clase es gratis?',
              '<br><br>🎯 Tip: Puedes venir a una clase de prueba sin compromiso.',
              ''
            ];
            response += followups[Math.floor(Math.random() * followups.length)];
          }
          
          return response;
        }
        
        return '🤔 No tengo información específica sobre eso, pero nuestro equipo sí puede ayudarte. Usa el botón <b>"Hablar con persona"</b> abajo para contactarnos por WhatsApp. 📞';
    }
  }

  // ── INTERFAZ DEL CHAT ──
  function addMessage(html, isUser = false) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + (isUser ? 'chat-msg-user' : 'chat-msg-bot');
    div.innerHTML = html;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    
    // Guardar en historial
    conversationHistory.push({
      role: isUser ? 'user' : 'assistant',
      content: html,
      timestamp: new Date().toISOString()
    });
  }

  function botReply(html) {
    // Simula typing con duración variable según longitud
    const typingDuration = 500 + Math.min(html.length * 5, 1500);
    
    const typing = document.createElement('div');
    typing.className = 'chat-msg chat-msg-bot chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    
    setTimeout(() => {
      messagesEl.removeChild(typing);
      addMessage(html, false);
    }, typingDuration);
  }

  function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    
    addMessage(escHtml(text), true);
    input.value = '';
    quickEl.style.display = 'none';
    
    const response = generateResponse(text);
    botReply(response);
  }

  function openChat() {
    isOpen = true;
    win.classList.add('open');
    notif.style.display = 'none';
    userContext.visitCount++;
    
    if (!messagesEl.children.length) {
      // Mensaje de bienvenida personalizado según hora
      const hour = new Date().getHours();
      let greeting = '¡Hola!';
      if (hour < 12) greeting = '¡Buenos días!';
      else if (hour < 20) greeting = '¡Buenas tardes!';
      else greeting = '¡Buenas noches!';
      
      setTimeout(() => {
        botReply(`${greeting} 👋 Soy <b>Nova Bot</b>, el asistente virtual del Club Nova Volley.<br><br>Puedo ayudarte con información sobre <b>horarios, categorías, inscripciones y tu clase gratis</b>. ¿Qué te gustaría saber? 🏐`);
      }, 300);
    }
  }

  function closeChat() {
    isOpen = false;
    win.classList.remove('open');
  }

  bubble.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);
  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });

  // Quick replies con seguimiento
  document.querySelectorAll('.quick-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      const text = btn.textContent.replace(/^[^\s]+\s/, '');
      addMessage(text, true);
      quickEl.style.display = 'none';
      
      const intentMap = {
        'horarios': 'horarios',
        'precio': 'precio',
        'prueba': 'prueba',
        'ubicacion': 'ubicacion'
      };
      
      const intent = intentMap[q] || 'unknown';
      const response = KB[intent] && KB[intent].variations ? 
        KB[intent].variations[Math.floor(Math.random() * KB[intent].variations.length)] :
        generateResponse(text);
      
      botReply(response);
    });
  });

  // Goto form link
  if (gotoForm) {
    gotoForm.addEventListener('click', closeChat);
  }

  // Show notification after 5s
  setTimeout(() => {
    if (!isOpen && userContext.visitCount === 0) {
      notif.style.display = 'flex';
    }
  }, 5000);

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
})();