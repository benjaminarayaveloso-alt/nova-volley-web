// =====================================================
//  CONFIGURACIÓN SUPABASE
//  → Reemplaza con tus credenciales de Supabase
//  → Las encuentras en: Project Settings > API
// =====================================================
const SUPABASE_URL    = 'https://sumhowyoumntoftlrjho.supabase.co';   // ← CAMBIAR
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bWhvd3lvdW1udG9mdGxyamhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2OTExMjEsImV4cCI6MjA4NzI2NzEyMX0.w2gAfTHJKsuY61MQChF0VbUT4t3RUt1br-U97M5Gb1M';                        // ← CAMBIAR

// =====================================================
//  CLIENTE SUPABASE (via REST API nativa, sin SDK)
//  → No requiere npm ni build step, funciona directo
// =====================================================
const DB = {
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Prefer': 'return=representation'
  },

  async getAll(table, options = {}) {
    try {
      let url = `${SUPABASE_URL}/rest/v1/${table}?order=created_at.desc`;
      if (options.limit) url += `&limit=${options.limit}`;
      if (options.filter) url += `&${options.filter}`;
      const res = await fetch(url, { headers: this.headers });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`[DB] getAll ${table}:`, err);
      return [];
    }
  },

  async insert(table, data) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Error ${res.status}`);
      }
      const result = await res.json();
      return Array.isArray(result) ? result[0] : result;
    } catch (err) {
      console.error(`[DB] insert ${table}:`, err);
      throw err;
    }
  },

  async delete(table, id) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.headers
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return true;
    } catch (err) {
      console.error(`[DB] delete ${table}:`, err);
      throw err;
    }
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
    catItems.forEach(item => item.classList.toggle('active', item.dataset.cat === cat));
    const data = catData[cat];
    infoTitle.textContent  = data.title;
    infoText.style.opacity = '0';
    setTimeout(() => {
      infoText.textContent    = data.text;
      infoHorario.textContent = data.horario;
      infoText.style.opacity  = '1';
    }, 150);
    photoCards.forEach(card => {
      card.classList.remove('front', 'back-1', 'back-2');
      if (card.dataset.cat === cat) card.classList.add('front');
    });
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

  activateCat('damas');
})();

// =====================================================
//  NEWS FEED — Carga desde Supabase
// =====================================================
(function () {
  const grid = document.getElementById('news-grid');
  if (!grid) return;

  const typeLabel = { general: 'General', urgente: '🔴 Urgente', evento: '📅 Evento' };
  const typeClass = { general: 'news-tag-general', urgente: 'news-tag-urgente', evento: 'news-tag-evento' };

  async function loadNews() {
    grid.innerHTML = `
      <div class="news-loading">
        <div class="news-spinner"></div>
        <span>Cargando noticias…</span>
      </div>`;

    const data = await DB.getAll('noticias', { limit: 12 });

    if (!data.length) {
      grid.innerHTML = '<div class="news-empty">No hay anuncios publicados aún.</div>';
      return;
    }

    grid.innerHTML = data.map(n => `
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

  // Recargar cuando el admin publique algo (mismo navegador)
  window.addEventListener('nova:news-updated', loadNews);

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
//  INSCRIPCIÓN FORM — Guarda en Supabase
// =====================================================
(function () {
  const form             = document.getElementById('registro-form');
  const fechaInput       = form ? form.querySelector('[name="fecha_nac"]') : null;
  const apoderadoSection = document.getElementById('apoderado-section');
  const apoderadoFields  = document.getElementById('apoderado-fields');
  if (!form) return;

  if (fechaInput) {
    fechaInput.addEventListener('change', () => {
      const age  = calcAge(fechaInput.value);
      const show = age !== null && age < 18;
      apoderadoSection.style.display = show ? 'block' : 'none';
      apoderadoFields.style.display  = show ? 'block' : 'none';
      const apoderadoNombre = form.querySelector('[name="apoderado_nombre"]');
      const apoderadoTel    = form.querySelector('[name="apoderado_telefono"]');
      apoderadoNombre.required = show;
      apoderadoTel.required    = show;
    });
  }

  function calcAge(dobStr) {
    if (!dobStr) return null;
    const dob   = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn       = document.getElementById('form-submit-btn');
    const btnText   = document.getElementById('form-submit-text');
    const successEl = document.getElementById('form-success');
    const errorEl   = document.getElementById('form-error');
    successEl.style.display = errorEl.style.display = 'none';

    btn.disabled   = true;
    btnText.textContent = 'ENVIANDO…';

    const fd      = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    if (!payload.nombre || !payload.fecha_nac || !payload.genero || !payload.categoria) {
      errorEl.textContent   = '⚠ Completa todos los campos obligatorios (*)';
      errorEl.style.display = 'block';
      btn.disabled   = false;
      btnText.textContent = 'ENVIAR INSCRIPCIÓN →';
      return;
    }

    const age = calcAge(payload.fecha_nac);
    if (age < 18 && (!payload.apoderado_nombre || !payload.apoderado_telefono)) {
      errorEl.textContent   = '⚠ Para menores de 18 años se requiere nombre y teléfono del apoderado';
      errorEl.style.display = 'block';
      btn.disabled   = false;
      btnText.textContent = 'ENVIAR INSCRIPCIÓN →';
      return;
    }

    try {
      await DB.insert('inscripciones', {
        nombre:              payload.nombre,
        fecha_nac:           payload.fecha_nac,
        genero:              payload.genero,
        categoria:           payload.categoria,
        apoderado_nombre:    payload.apoderado_nombre    || null,
        apoderado_telefono:  payload.apoderado_telefono  || null
      });

      btn.disabled = false;
      btnText.textContent = 'ENVIAR INSCRIPCIÓN →';
      form.reset();
      apoderadoSection.style.display = 'none';
      apoderadoFields.style.display  = 'none';
      successEl.style.display = 'flex';
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      errorEl.textContent   = '⚠ Error al enviar. Intenta nuevamente o contáctanos por WhatsApp.';
      errorEl.style.display = 'block';
      btn.disabled   = false;
      btnText.textContent = 'ENVIAR INSCRIPCIÓN →';
    }
  });
})();

// =====================================================
//  CONTACTO FORM — Guarda en Supabase
// =====================================================
(function () {
  const form = document.getElementById('contacto-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const successEl = document.getElementById('contacto-success');
    const fd = new FormData(form);
    const { nombre, email, mensaje } = Object.fromEntries(fd.entries());
    if (!nombre || !email || !mensaje) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled     = true;
    submitBtn.textContent  = 'ENVIANDO…';

    try {
      await DB.insert('mensajes', { nombre, email, mensaje });
      submitBtn.disabled    = false;
      submitBtn.textContent = 'ENVIAR MENSAJE →';
      form.reset();
      successEl.style.display = 'flex';
    } catch (err) {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'ENVIAR MENSAJE →';
      alert('Error al enviar. Intenta nuevamente.');
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

  let conversationHistory = [];
  let userContext = {
    askedAbout: [],
    interestedCategories: [],
    hasChildren: null,
    visitCount: 0
  };

  const KB = {
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
        'Las clases de <b>Damas</b> son muy dinámicas. Trabajamos técnica, táctica y mucho juego. Los horarios son mar/jue 18:00-19:30. 🏐',
        'El grupo de damas es súper motivador. Todas aprenden juntas sin importar el nivel. Entrenan martes y jueves a las 18:00.'
      ]
    },
    adultos: {
      keywords: ['adultos','varones','hombres','masculino','chicos','señores','men','varon','el','ellos'],
      variations: [
        '👨 Las clases de <b>Adultos</b> son de <b>lunes a jueves de 19:30 a 21:00</b>. Aceptamos todos los niveles, desde principiantes hasta jugadores con experiencia.',
        'El equipo masculino entrena <b>4 veces a la semana</b> (lun-jue 19:30-21:00). Trabajamos fundamentos técnicos, juego táctico y mucho partido.',
        'Para adultos varones tenemos entrenamientos completos de lunes a jueves en el horario de 19:30 a 21:00. No importa si nunca has jugado, ¡todos empezaron alguna vez! 💪'
      ]
    },
    escuela: {
      keywords: ['escuela','niños','niñas','niño','niña','hijo','hija','menor','chico','chica','kids','children','infantil','juvenil'],
      variations: [
        '👦👧 ¡La <b>Escuela de Voleibol</b> es perfecta para niños y niñas desde los <b>8 años</b>! Aprenden los fundamentos en un ambiente súper divertido y seguro.',
        'Nuestra escuela acepta desde los <b>8 años</b>. Los niños aprenden mientras se divierten, sin presión.',
        'La categoría <b>Escuela</b> es ideal para que los niños aprendan voleibol desde cero. Edad mínima: 8 años. 📞'
      ]
    },
    ubicacion: {
      keywords: ['donde','ubicacion','direccion','lugar','mapa','llegar','como llego','metro','bus','estacion','parking','estacionamiento','aparcar'],
      variations: [
        '📍 Estamos en <b>San Isidro 886, Santiago Centro</b>.<br><br>🚇 Muy cerca del <b>Metro Baquedano y Metro Santa Lucía</b><br>🅿️ Hay <b>estacionamiento disponible</b> en el mismo lugar',
        'Nos encuentras en <b>San Isidro 886</b>, en pleno Santiago Centro. Si vienes en metro, las estaciones más cercanas son Baquedano y Santa Lucía. ¡Y tenemos estacionamiento! 🅿️',
        'La dirección es <b>San Isidro 886, Santiago Centro</b>. Llegas fácil en metro (Baquedano o Santa Lucía). 🚗'
      ]
    },
    prueba: {
      keywords: ['prueba','gratis','free','trial','primera clase','probar','conocer','visita','visitar','ver','demo','test'],
      variations: [
        '🎯 ¡Tu <b>primera clase es GRATIS</b>, sin ningún compromiso! Solo necesitas:<br>1️⃣ Agendar por WhatsApp o formulario<br>2️⃣ Venir con ropa deportiva y zapatillas<br>3️⃣ ¡Disfrutar! 🏐',
        '¡Genial que quieras probar! La primera clase es <b>totalmente gratuita</b>. Puedes venir tal como estás (bueno, con ropa cómoda 😄).',
        'La clase de prueba es <b>sin costo y sin compromiso</b>. Vienes, conoces el club, juegas un poco y decides. 💪'
      ]
    },
    inscripcion: {
      keywords: ['inscribir','inscripcion','unirme','registro','registrar','apuntar','anotarme','como me inscribo','como entro','matricula','cupo'],
      variations: [
        '📋 Inscribirte es súper fácil:<br>1️⃣ Completa el <a href="#inscripcion" style="color:var(--mustard)">formulario web</a><br>2️⃣ O escríbenos por WhatsApp<br>3️⃣ Agenda tu primera clase gratis<br>4️⃣ ¡Ya estás dentro!',
        'Para inscribirte tienes 3 opciones: formulario en la web, WhatsApp o venir directo al club. Te recomiendo empezar con la clase gratis para que conozcas.',
        '¿Listo para unirte? 🏐 Puedes usar el formulario aquí mismo o escribirnos. ¡Ven a la clase de prueba gratis!'
      ]
    },
    requisitos: {
      keywords: ['necesito','requisito','que traer','que llevar','material','equipo','implementos','rodilleras','zapatillas','ropa','vestimenta'],
      variations: [
        '👕 Para empezar solo necesitas:<br>• <b>Ropa deportiva cómoda</b><br>• <b>Zapatillas deportivas</b><br>• <b>Botella de agua</b><br><br>Nosotros tenemos balones y todo el equipo.',
        'No necesitas mucho: ropa cómoda, zapatillas y ganas de jugar. El club tiene todos los balones y la red. 🏐'
      ]
    },
    nivel: {
      keywords: ['nivel','principiante','novato','nunca he jugado','sin experiencia','beginner','avanzado','intermedio','experto','se jugar','experiencia'],
      variations: [
        '💪 ¡Todos los niveles son bienvenidos! No importa si <b>nunca has tocado un balón</b> o si ya tienes experiencia. Nuestros entrenadores adaptan las clases para todos.',
        'Trabajamos con <b>principiantes y avanzados</b> en el mismo grupo. Los entrenadores se aseguran de que cada persona trabaje en lo que necesita.'
      ]
    }
  };

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
    const greetings = ['hola','hi','hey','buenas','saludos','buenos dias','buenas tardes','buenas noches','ola'];
    if (greetings.some(g => normalized.includes(g)) && words.length <= 3) return { intent: 'greeting', confidence: 1.0 };
    const thanks = ['gracias','thank','thx','grax','vale','perfecto','ok','okay','entiendo'];
    if (thanks.some(t => normalized.includes(t)) && words.length <= 4) return { intent: 'thanks', confidence: 1.0 };
    let bestMatch = { intent: null, score: 0 };
    for (const [intent, data] of Object.entries(KB)) {
      if (!data.keywords) continue;
      let score = 0;
      for (const keyword of data.keywords) {
        if (normalized.includes(keyword)) score += 2;
        else {
          const kws = keyword.split(' ');
          if (kws.every(kw => words.includes(kw))) score += 1;
        }
      }
      if (score > bestMatch.score) bestMatch = { intent, score };
    }
    return bestMatch.score > 0 ? { intent: bestMatch.intent, confidence: bestMatch.score / 5 } : { intent: 'unknown', confidence: 0 };
  }

  function generateResponse(userText) {
    const { intent, confidence } = extractIntent(userText);
    if (intent && !['greeting','thanks','unknown'].includes(intent)) {
      if (!userContext.askedAbout.includes(intent)) userContext.askedAbout.push(intent);
    }
    switch (intent) {
      case 'greeting':
        return ['👋 ¡Hola! Bienvenido/a al <b>Club Nova Volley</b>. Soy Nova Bot y estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?',
          '¡Hola! 🏐 Soy el asistente virtual de Nova Volley. ¿Qué necesitas saber sobre nuestras clases?',
          '👋 ¡Hola! ¿Tienes alguna pregunta sobre el club o las categorías?'][Math.floor(Math.random()*3)];
      case 'thanks':
        return ['¡De nada! 😊 Si tienes más preguntas, aquí estoy.',
          '¡Para eso estoy! 🏐 ¿Necesitas algo más o ya estás listo/a para la clase gratis?',
          'Un placer ayudarte. Si quieres agendar o tienes más dudas, solo dime. 💪'][Math.floor(Math.random()*3)];
      case 'unknown':
        return '🤔 No estoy seguro de haber entendido. Puedo ayudarte con:<br>• Horarios de clases<br>• Información de categorías<br>• Clase de prueba gratis<br>• Ubicación e instalaciones<br><br>¿Sobre qué quieres saber?';
      default:
        if (KB[intent] && KB[intent].variations) {
          const v = KB[intent].variations;
          let response = v[Math.floor(Math.random() * v.length)];
          if (confidence > 0.7 && !userContext.askedAbout.includes('prueba')) {
            const followups = ['<br><br>💡 Por cierto, ¿sabías que la primera clase es gratis?', '<br><br>🎯 Tip: Puedes venir a una clase de prueba sin compromiso.', ''];
            response += followups[Math.floor(Math.random() * followups.length)];
          }
          return response;
        }
        return '🤔 No tengo información específica sobre eso. Usa el botón <b>"Hablar con persona"</b> abajo para contactarnos por WhatsApp. 📞';
    }
  }

  function addMessage(html, isUser = false) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + (isUser ? 'chat-msg-user' : 'chat-msg-bot');
    div.innerHTML = html;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function botReply(html) {
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
    botReply(generateResponse(text));
  }

  function openChat() {
    isOpen = true;
    win.classList.add('open');
    notif.style.display = 'none';
    userContext.visitCount++;
    if (!messagesEl.children.length) {
      const hour = new Date().getHours();
      let greeting = hour < 12 ? '¡Buenos días!' : hour < 20 ? '¡Buenas tardes!' : '¡Buenas noches!';
      setTimeout(() => botReply(`${greeting} 👋 Soy <b>Nova Bot</b>, el asistente virtual del Club Nova Volley.<br><br>Puedo ayudarte con información sobre <b>horarios, categorías, inscripciones y tu clase gratis</b>. ¿Qué te gustaría saber? 🏐`), 300);
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

  document.querySelectorAll('.quick-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      const text = btn.textContent.replace(/^[^\s]+\s/, '');
      addMessage(text, true);
      quickEl.style.display = 'none';
      const intentMap = { horarios: 'horarios', precio: 'precio', prueba: 'prueba', ubicacion: 'ubicacion' };
      const intent   = intentMap[q] || 'unknown';
      const response = KB[intent] && KB[intent].variations
        ? KB[intent].variations[Math.floor(Math.random() * KB[intent].variations.length)]
        : generateResponse(text);
      botReply(response);
    });
  });

  if (gotoForm) gotoForm.addEventListener('click', closeChat);
  setTimeout(() => { if (!isOpen && userContext.visitCount === 0) notif.style.display = 'flex'; }, 5000);

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
})();
