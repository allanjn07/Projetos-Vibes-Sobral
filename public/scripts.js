const API = "https://projetos-vibes-sobral-production.up.railway.app/api";

let token = localStorage.getItem("svToken") || null;
let usuarioLogado = JSON.parse(localStorage.getItem("svUsuario")) || null;
let eventoAtualId = null;
let favoritedEvents = JSON.parse(localStorage.getItem("sobralVibeFavorites")) || [];

// ─── INICIALIZAÇÃO ───────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  atualizarPerfilHeader();
  carregarEventos();
  bindFiltros();
  bindBusca();
  bindAuth();
  bindModalEvento();
  bindFormEvento();

  document.getElementById("btn-add-evento")?.addEventListener("click", () => {
    abrirFormEvento();
  });
});

// ─── CARREGAR EVENTOS ────────────────────────────────────────
async function carregarEventos(categoria = null) {
  const grid = document.getElementById("events-grid");
  grid.innerHTML = '<p class="loading-msg">Carregando eventos...</p>';

  try {
    const url = categoria ? `${API}/eventos?categoria=${categoria}` : `${API}/eventos`;
    const res = await fetch(url);
    const eventos = await res.json();

    if (!eventos.length) {
      grid.innerHTML = '<p class="loading-msg">Nenhum evento encontrado.</p>';
      return;
    }

    grid.innerHTML = "";
    eventos.forEach(ev => grid.appendChild(criarCard(ev)));
  } catch (err) {
    grid.innerHTML = '<p class="loading-msg">Erro ao carregar eventos.</p>';
  }
}

// ─── CRIAR CARD ──────────────────────────────────────────────
function criarCard(ev) {
  const article = document.createElement("article");
  article.className = "event-card";
  article.dataset.category = ev.categoria;
  article.dataset.id = ev.id;

  const isFav = favoritedEvents.includes(String(ev.id));
  const badgeLabel = ev.categoria.charAt(0).toUpperCase() + ev.categoria.slice(1);
  const btnLabel = ev.tipo === "ingresso" ? "Ingressos" : "Ver Mais";

  article.innerHTML = `
    <div class="event-image">
      <img src="${ev.imagem_url || '/imagem/default.jpeg'}" alt="${ev.titulo}">
      <span class="badge">${badgeLabel}</span>
      <div class="favorite-icon ${isFav ? 'active' : ''}" data-id="${ev.id}">${isFav ? '❤️' : '♡'}</div>
    </div>
    <div class="event-info">
      <h3>${ev.titulo}</h3>
      <p class="event-details">📍 ${ev.local}</p>
      <p class="event-time">🕐 ${ev.horario}</p>
      <div class="event-footer">
        <button class="btn-secondary" data-location="${ev.local}">Ver Mapa</button>
        <button class="btn-primary" data-id="${ev.id}">${btnLabel}</button>
      </div>
    </div>
  `;

  // Favoritar
  article.querySelector(".favorite-icon").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorito(ev.id, article.querySelector(".favorite-icon"));
  });

  // Ver Mapa
  article.querySelector(".btn-secondary").addEventListener("click", () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.local)}`;
    window.open(url, "_blank");
  });

  // Ver Mais / Ingressos
  article.querySelector(".btn-primary").addEventListener("click", () => {
    abrirModalEvento(ev);
  });

  return article;
}

// ─── FAVORITAR ───────────────────────────────────────────────
function toggleFavorito(id, icon) {
  const sid = String(id);
  if (favoritedEvents.includes(sid)) {
    favoritedEvents = favoritedEvents.filter(f => f !== sid);
    icon.classList.remove("active");
    icon.innerHTML = "♡";
  } else {
    favoritedEvents.push(sid);
    icon.classList.add("active");
    icon.innerHTML = "❤️";
  }
  localStorage.setItem("sobralVibeFavorites", JSON.stringify(favoritedEvents));
}

// ─── FILTROS ─────────────────────────────────────────────────
function bindFiltros() {
  document.querySelectorAll(".btn-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const texto = btn.textContent.trim().toLowerCase();
      const mapa = { "hoje": null, "shows": "shows", "acadêmicos": "academicos", "histórico": "historico", "lazer": "lazer" };
      carregarEventos(mapa[texto] ?? null);
    });
  });
}

// ─── BUSCA ───────────────────────────────────────────────────
function bindBusca() {
  const input = document.querySelector(".search-bar input");
  input?.addEventListener("input", () => {
    const val = input.value.toLowerCase();
    document.querySelectorAll(".event-card").forEach(card => {
      const titulo = card.querySelector("h3")?.textContent.toLowerCase() || "";
      card.style.display = titulo.includes(val) ? "block" : "none";
    });
  });
}

// ─── MODAL EVENTO ────────────────────────────────────────────
function abrirModalEvento(ev) {
  eventoAtualId = ev.id;

  document.getElementById("modal-img").src = ev.imagem_url || "/imagem/default.jpeg";
  document.getElementById("modal-badge").textContent = ev.categoria;
  document.getElementById("modal-titulo").textContent = ev.titulo;
  document.getElementById("modal-local").textContent = ev.local;
  document.getElementById("modal-horario").textContent = ev.horario;
  document.getElementById("modal-data").textContent = ev.data_evento ? new Date(ev.data_evento).toLocaleDateString("pt-BR") : "";

  const precoWrap = document.getElementById("modal-preco-wrap");
  precoWrap.innerHTML = ev.preco ? `<p class="modal-preco">🎟️ ${ev.preco}</p>` : "";

  const btnIngresso = document.getElementById("modal-btn-ingresso");
  if (ev.tipo === "ingresso" && ev.link_ingresso) {
    btnIngresso.href = ev.link_ingresso;
    btnIngresso.style.display = "inline-block";
  } else {
    btnIngresso.style.display = "none";
  }

  document.getElementById("modal-btn-mapa").onclick = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.local)}`, "_blank");
  };

  carregarComentarios(ev.id);
  document.getElementById("modal-evento").style.display = "flex";
}

function bindModalEvento() {
  document.getElementById("closeModalEvento")?.addEventListener("click", () => {
    document.getElementById("modal-evento").style.display = "none";
  });

  document.getElementById("modal-evento")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal-evento")) {
      document.getElementById("modal-evento").style.display = "none";
    }
  });

  document.getElementById("btn-enviar-comentario")?.addEventListener("click", enviarComentario);
}

// ─── COMENTÁRIOS ─────────────────────────────────────────────
async function carregarComentarios(eventoId) {
  const lista = document.getElementById("comentarios-lista");
  lista.innerHTML = '<p class="loading-msg-sm">Carregando...</p>';

  try {
    const res = await fetch(`${API}/eventos/${eventoId}/comentarios`);
    const comentarios = await res.json();

    lista.innerHTML = comentarios.length ? "" : '<p class="loading-msg-sm">Nenhum comentário ainda.</p>';
    comentarios.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `<strong>${c.nome || "Usuário"}</strong><p>${c.texto}</p><small>${new Date(c.criado_em).toLocaleDateString("pt-BR")}</small>`;
      lista.appendChild(div);
    });
  } catch {
    lista.innerHTML = '<p class="loading-msg-sm">Erro ao carregar comentários.</p>';
  }

  const form = document.getElementById("comentario-form");
  const aviso = document.getElementById("comentario-login-aviso");
  if (token) {
    form.style.display = "block";
    aviso.style.display = "none";
  } else {
    form.style.display = "none";
    aviso.style.display = "block";
  }

  document.getElementById("abrir-login-comentario")?.addEventListener("click", () => {
    document.getElementById("modal-evento").style.display = "none";
    document.getElementById("modal-auth").style.display = "flex";
  });
}

async function enviarComentario() {
  const texto = document.getElementById("comentario-texto").value.trim();
  if (!texto || !eventoAtualId) return;

  try {
    const res = await fetch(`${API}/eventos/${eventoAtualId}/comentarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ texto })
    });

    if (res.ok) {
      document.getElementById("comentario-texto").value = "";
      carregarComentarios(eventoAtualId);
    }
  } catch (err) {
    console.error("Erro ao enviar comentário", err);
  }
}

// ─── AUTH ────────────────────────────────────────────────────
function bindAuth() {
  const avatar = document.getElementById("user-profile");
  avatar?.addEventListener("click", () => {
    if (token) {
      if (confirm("Deseja sair?")) {
        logout();
      }
    } else {
      document.getElementById("modal-auth").style.display = "flex";
    }
  });

  document.getElementById("closeModalAuth")?.addEventListener("click", () => {
    document.getElementById("modal-auth").style.display = "none";
  });

  document.getElementById("modal-auth")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal-auth")) {
      document.getElementById("modal-auth").style.display = "none";
    }
  });

  document.getElementById("go-register")?.addEventListener("click", () => {
    document.getElementById("auth-login").style.display = "none";
    document.getElementById("auth-register").style.display = "block";
  });

  document.getElementById("go-login")?.addEventListener("click", () => {
    document.getElementById("auth-register").style.display = "none";
    document.getElementById("auth-login").style.display = "block";
  });

  document.getElementById("btn-login")?.addEventListener("click", fazerLogin);
  document.getElementById("btn-register")?.addEventListener("click", fazerRegistro);
}

async function fazerLogin() {
  const email = document.getElementById("login-email").value;
  const senha = document.getElementById("login-senha").value;
  const erro = document.getElementById("login-error");

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });
    const data = await res.json();

    if (!res.ok) { erro.textContent = data.error || "Erro ao fazer login"; return; }

    token = data.token;
    usuarioLogado = data.usuario;
    localStorage.setItem("svToken", token);
    localStorage.setItem("svUsuario", JSON.stringify(usuarioLogado));
    document.getElementById("modal-auth").style.display = "none";
    atualizarPerfilHeader();
  } catch {
    erro.textContent = "Erro de conexão";
  }
}

async function fazerRegistro() {
  const nome = document.getElementById("reg-nome").value;
  const email = document.getElementById("reg-email").value;
  const senha = document.getElementById("reg-senha").value;
  const erro = document.getElementById("reg-error");

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha })
    });
    const data = await res.json();

    if (!res.ok) { erro.textContent = data.error || "Erro ao criar conta"; return; }

    token = data.token;
    usuarioLogado = data.usuario;
    localStorage.setItem("svToken", token);
    localStorage.setItem("svUsuario", JSON.stringify(usuarioLogado));
    document.getElementById("modal-auth").style.display = "none";
    atualizarPerfilHeader();
  } catch {
    erro.textContent = "Erro de conexão";
  }
}

function logout() {
  token = null;
  usuarioLogado = null;
  localStorage.removeItem("svToken");
  localStorage.removeItem("svUsuario");
  atualizarPerfilHeader();
}

function atualizarPerfilHeader() {
  const perfil = document.getElementById("user-profile");
  if (!perfil) return;

  if (usuarioLogado) {
    perfil.innerHTML = `<div class="avatar" title="${usuarioLogado.nome}">${usuarioLogado.nome.charAt(0).toUpperCase()}</div>`;
    if (usuarioLogado.role === "admin") {
      document.getElementById("btn-add-evento").style.display = "inline-block";
    }
  } else {
    perfil.innerHTML = `<div class="avatar" title="Entrar">?</div>`;
    const btn = document.getElementById("btn-add-evento");
    if (btn) btn.style.display = "none";
  }
}

// ─── FORM EVENTO (ADMIN) ─────────────────────────────────────
function abrirFormEvento(ev = null) {
  document.getElementById("form-evento-titulo").textContent = ev ? "Editar Evento" : "Novo Evento";
  document.getElementById("fe-titulo").value = ev?.titulo || "";
  document.getElementById("fe-categoria").value = ev?.categoria || "";
  document.getElementById("fe-local").value = ev?.local || "";
  document.getElementById("fe-horario").value = ev?.horario || "";
  document.getElementById("fe-data").value = ev?.data_evento?.slice(0, 10) || "";
  document.getElementById("fe-tipo").value = ev?.tipo || "info";
  document.getElementById("fe-preco").value = ev?.preco || "";
  document.getElementById("fe-link").value = ev?.link_ingresso || "";
  document.getElementById("fe-imagem").value = ev?.imagem_url || "";
  document.getElementById("fe-error").textContent = "";
  document.getElementById("modal-form-evento").dataset.editId = ev?.id || "";
  document.getElementById("modal-form-evento").style.display = "flex";
}

function bindFormEvento() {
  document.getElementById("closeModalFormEvento")?.addEventListener("click", () => {
    document.getElementById("modal-form-evento").style.display = "none";
  });

  document.getElementById("btn-salvar-evento")?.addEventListener("click", salvarEvento);
}

async function salvarEvento() {
  const editId = document.getElementById("modal-form-evento").dataset.editId;
  const erro = document.getElementById("fe-error");

  const body = {
    titulo: document.getElementById("fe-titulo").value,
    categoria: document.getElementById("fe-categoria").value,
    local: document.getElementById("fe-local").value,
    horario: document.getElementById("fe-horario").value,
    data_evento: document.getElementById("fe-data").value,
    tipo: document.getElementById("fe-tipo").value,
    preco: document.getElementById("fe-preco").value,
    link_ingresso: document.getElementById("fe-link").value,
    imagem_url: document.getElementById("fe-imagem").value,
  };

  try {
    const url = editId ? `${API}/eventos/${editId}` : `${API}/eventos`;
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) { erro.textContent = data.error || "Erro ao salvar"; return; }

    document.getElementById("modal-form-evento").style.display = "none";
    carregarEventos();
  } catch {
    erro.textContent = "Erro de conexão";
  }
}
