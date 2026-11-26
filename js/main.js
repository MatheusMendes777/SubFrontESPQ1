/* StoreBooks - lógica da loja (carrinho, filtros, busca, modais, newsletter) */
const cover = isbn => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
const books = [
  { id: "clean", t: "Código Limpo", a: "Robert C. Martin", p: 129.9, c: "Tecnologia", isbn: "9780132350884", d: "Princípios e exemplos para escrever código legível, simples e fácil de manter." },
  { id: "pragmatic", t: "O Programador Pragmático", a: "Andrew Hunt e David Thomas", p: 139.9, c: "Tecnologia", isbn: "9780135957059", d: "Práticas do dia a dia para quem quer evoluir como desenvolvedor de software." },
  { id: "hobbit", t: "O Hobbit", a: "J.R.R. Tolkien", p: 69.9, c: "Fantasia", isbn: "9780547928227", d: "A viagem de Bilbo Bolseiro com treze anões para recuperar um tesouro guardado por um dragão." },
  { id: "harry", t: "Harry Potter e a Pedra Filosofal", a: "J.K. Rowling", p: 54.9, c: "Fantasia", isbn: "9780590353427", d: "O menino que descobre ser bruxo e entra para a Escola de Magia de Hogwarts." },
  { id: "duna", t: "Duna", a: "Frank Herbert", p: 79.9, c: "Ficção", isbn: "9780441172719", d: "Em um planeta deserto, uma família nobre disputa o controle da especiaria mais valiosa do universo." },
  { id: "1984", t: "1984", a: "George Orwell", p: 44.9, c: "Ficção", isbn: "9780451524935", d: "Um retrato sombrio de vigilância, propaganda e controle total do Estado." },
  { id: "principe", t: "O Pequeno Príncipe", a: "Antoine de Saint-Exupéry", p: 34.9, c: "Infantil", isbn: "9780156012195", d: "Um piloto encontra no deserto um menino que viajou por vários planetas." },
  { id: "tempo", t: "Uma Breve História do Tempo", a: "Stephen Hawking", p: 62.9, c: "Ciência", isbn: "9780553380163", d: "Do Big Bang aos buracos negros, explicado para quem não é físico." },
];
const catMeta = { "Ficção": "📖", "Fantasia": "🐉", "Tecnologia": "💻", "Infantil": "🧸", "Ciência": "🔭" };
const byId = id => books.find(b => b.id === id);
const brl = n => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const $ = s => document.querySelector(s);
const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* Capa de reserva (SVG) caso a imagem remota não carregue */
function fallbackSrc(id) {
  const b = byId(id), w = b.t.split(" "), h = Math.ceil(w.length / 2);
  const l1 = w.slice(0, h).join(" "), l2 = w.slice(h).join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect width="300" height="450" fill="#3b1a7a"/><circle cx="230" cy="90" r="60" fill="#8b5cf6" opacity=".7"/><rect x="20" y="20" width="6" height="410" fill="#c4b5fd"/><text x="44" y="270" font-family="Georgia,serif" font-size="26" font-weight="700" fill="#fff">${l1}</text><text x="44" y="304" font-family="Georgia,serif" font-size="26" font-weight="700" fill="#fff">${l2}</text><text x="44" y="410" font-family="Arial" font-size="15" fill="#e7e4ee">${b.a}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
window.coverFallback = img => { img.onerror = null; img.src = fallbackSrc(img.dataset.id); };
const imgTag = (b, cls) => `<img src="${cover(b.isbn)}" data-id="${b.id}" alt="Capa de ${b.t}" loading="lazy" onerror="coverFallback(this)" class="${cls}">`;

/* Estado */
const store = {
  get() { try { return JSON.parse(localStorage.getItem("sb-cart")) || {}; } catch { return {}; } },
  set(v) { try { localStorage.setItem("sb-cart", JSON.stringify(v)); } catch {} },
};
let cart = store.get();
Object.keys(cart).forEach(id => { if (!byId(id)) delete cart[id]; });
const ui = { cat: "Todos", q: "", sort: "rel" };
let detailId = null;

function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast align-items-center"; el.setAttribute("role", "status");
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div></div>`;
  $("#toasts").appendChild(el);
  el.addEventListener("hidden.bs.toast", () => el.remove());
  new bootstrap.Toast(el, { delay: 2500 }).show();
}

/* Renderização */
function renderChips() {
  $("#chips").innerHTML = ["Todos", ...Object.keys(catMeta)].map(c =>
    `<button type="button" data-chip="${c}" class="chip ${c === ui.cat ? "active" : ""}">${c}</button>`).join("");
}
function renderCats() {
  $("#cats").innerHTML = Object.keys(catMeta).map((c, i) => {
    const b = books.find(x => x.c === c), n = books.filter(x => x.c === c).length;
    return `<button type="button" data-cat="${c}" style="animation-delay:${i * 90}ms"
      class="reveal opacity-0 text-left bg-graphite border border-white/10 rounded-2xl p-3 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-500 active:scale-95">
      ${imgTag(b, "w-full aspect-[3/2] object-cover object-top rounded-xl mb-3")}
      <strong class="block font-display text-lg text-white">${catMeta[c]} ${c}</strong>
      <small class="text-mute">${n} ${n > 1 ? "livros" : "livro"}</small></button>`;
  }).join("");
  observe();
}
function renderBooks() {
  let list = books.filter(b => (ui.cat === "Todos" || b.c === ui.cat) &&
    (!ui.q || norm(b.t + " " + b.a + " " + b.c).includes(norm(ui.q))));
  if (ui.sort === "asc") list.sort((a, b) => a.p - b.p);
  if (ui.sort === "desc") list.sort((a, b) => b.p - a.p);
  if (ui.sort === "az") list.sort((a, b) => a.t.localeCompare(b.t, "pt-BR"));
  $("#books").innerHTML = list.length ? list.map(b => `
    <article class="flex flex-col bg-graphite border border-white/10 rounded-2xl p-4 shadow-card transition duration-300 ease-out hover:scale-105 hover:shadow-2xl hover:animate-shadowPulse">
      <button type="button" data-act="details" data-id="${b.id}" class="block mb-4 rounded-xl overflow-hidden bg-slate2" aria-label="Ver detalhes de ${b.t}">
        ${imgTag(b, "w-full aspect-[2/3] object-cover")}</button>
      <span class="text-xs font-semibold text-brand-400">${b.c}</span>
      <h3 class="font-display text-xl font-bold text-white leading-snug">${b.t}</h3>
      <p class="text-sm text-mute mb-3">${b.a}</p>
      <div class="mt-auto flex items-center justify-between gap-2">
        <strong class="text-lg text-white">${brl(b.p)}</strong>
        <span class="flex gap-2">
          <button type="button" data-act="details" data-id="${b.id}" class="btn-ghost-sb !px-3 !py-2 text-sm">Detalhes</button>
          <button type="button" data-act="add" data-id="${b.id}" class="btn-primary-sb !px-3 !py-2 text-sm">Comprar</button>
        </span>
      </div>
    </article>`).join("")
    : `<p class="col-span-full text-center text-mute py-10">Nenhum livro encontrado. Tente outro título, autor ou categoria.</p>`;
}
const total = () => Object.entries(cart).reduce((s, [id, q]) => s + byId(id).p * q, 0);
function renderCart() {
  const entries = Object.entries(cart);
  const count = entries.reduce((s, [, q]) => s + q, 0);
  $("#cart-count").textContent = count;
  $("#cart-total").textContent = brl(total());
  $("#checkout-btn").disabled = !count; $("#clear-cart").disabled = !count;
  $("#cart-items").innerHTML = count ? entries.map(([id, q]) => { const b = byId(id); return `
    <div class="flex gap-3 items-center bg-slate2 rounded-xl p-2">
      ${imgTag(b, "w-14 aspect-[2/3] object-cover rounded-lg")}
      <div class="flex-1 min-w-0"><p class="font-bold text-white mb-0 truncate">${b.t}</p>
        <p class="text-sm text-mute mb-1">${brl(b.p)}</p>
        <div class="flex items-center gap-2">
          <button type="button" data-act="dec" data-id="${id}" class="chip !px-3 !py-0" aria-label="Diminuir">−</button>
          <span>${q}</span>
          <button type="button" data-act="inc" data-id="${id}" class="chip !px-3 !py-0" aria-label="Aumentar">+</button>
        </div></div>
      <button type="button" data-act="rm" data-id="${id}" class="text-mute hover:text-white px-2" aria-label="Remover ${b.t}">🗑</button>
    </div>`; }).join("")
    : `<p class="text-center text-mute py-10">Seu carrinho está vazio. Escolha um livro para começar.</p>`;
}
function observe() {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("animate-slideIn"); e.target.classList.remove("opacity-0"); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

/* Ações */
function setQty(id, q) {
  if (q <= 0) delete cart[id]; else cart[id] = Math.min(q, 99);
  store.set(cart); renderCart();
}
function add(id, silent) {
  setQty(id, (cart[id] || 0) + 1);
  const badge = $("#cart-count"); badge.classList.add("animate-pulse-social");
  setTimeout(() => badge.classList.remove("animate-pulse-social"), 800);
  if (!silent) toast(`“${byId(id).t}” adicionado ao carrinho`);
}
const cartPanel = () => bootstrap.Offcanvas.getOrCreateInstance($("#cart"));
function openDetails(id) {
  const b = byId(id); detailId = id;
  $("#d-img").src = cover(b.isbn); $("#d-img").dataset.id = id; $("#d-img").onerror = e => coverFallback(e.target);
  $("#d-img").alt = "Capa de " + b.t;
  $("#d-cat").textContent = b.c; $("#d-title").textContent = b.t; $("#d-author").textContent = b.a;
  $("#d-desc").textContent = b.d; $("#d-price").textContent = brl(b.p);
  bootstrap.Modal.getOrCreateInstance($("#detail-modal")).show();
}
function filterTo(cat) {
  ui.cat = cat; renderChips(); renderBooks();
  $("#lancamentos").scrollIntoView({ behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  $("#hero-img").src = cover(byId("duna").isbn);
  $("#hero-img").onerror = e => coverFallback(e.target);
  renderChips(); renderCats(); renderBooks(); renderCart();

  $("#books").addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el) return;
    el.dataset.act === "add" ? add(el.dataset.id) : openDetails(el.dataset.id);
  });
  $("#chips").addEventListener("click", e => { const c = e.target.closest("[data-chip]"); if (c) { ui.cat = c.dataset.chip; renderChips(); renderBooks(); } });
  $("#cats").addEventListener("click", e => { const c = e.target.closest("[data-cat]"); if (c) filterTo(c.dataset.cat); });
  $("#sort").addEventListener("change", e => { ui.sort = e.target.value; renderBooks(); });

  const s = $("#search");
  s.addEventListener("input", () => { ui.q = s.value; renderBooks(); });
  s.addEventListener("keydown", e => {
    if (e.key === "Escape") { s.value = ""; ui.q = ""; renderBooks(); s.blur(); }
    if (e.key === "Enter") $("#lancamentos").scrollIntoView({ behavior: "smooth" });
  });

  $("#hero-buy").addEventListener("click", () => { add("duna", true); cartPanel().show(); });
  $("#open-cart").addEventListener("click", () => cartPanel().show());
  $("#d-add").addEventListener("click", () => { add(detailId); bootstrap.Modal.getInstance($("#detail-modal")).hide(); });

  $("#cart-items").addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el) return;
    const id = el.dataset.id, q = cart[id] || 0;
    if (el.dataset.act === "inc") setQty(id, q + 1);
    if (el.dataset.act === "dec") setQty(id, q - 1);
    if (el.dataset.act === "rm") { setQty(id, 0); toast("Livro removido do carrinho"); }
  });
  $("#clear-cart").addEventListener("click", () => { cart = {}; store.set(cart); renderCart(); toast("Carrinho esvaziado"); });

  /* Checkout */
  $("#checkout-btn").addEventListener("click", () => {
    $("#co-total").textContent = brl(total());
    $("#co-form").classList.remove("was-validated");
    $("#co-form-wrap").classList.remove("hidden"); $("#co-done").classList.add("hidden");
    cartPanel().hide();
    bootstrap.Modal.getOrCreateInstance($("#checkout-modal")).show();
  });
  $("#co-form").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target; f.classList.add("was-validated");
    if (!f.checkValidity()) return;
    const n = "SB-" + Math.floor(100000 + Math.random() * 900000);
    $("#co-msg").textContent = `Pedido ${n} de ${brl(total())} via ${$("#co-pay").value}. Enviamos os detalhes para ${$("#co-email").value}.`;
    cart = {}; store.set(cart); renderCart(); f.reset(); f.classList.remove("was-validated");
    $("#co-form-wrap").classList.add("hidden"); $("#co-done").classList.remove("hidden");
  });

  /* Newsletter */
  $("#news-form").addEventListener("submit", e => {
    e.preventDefault();
    const i = $("#news-email");
    if (!i.checkValidity() || !i.value) { i.classList.add("is-invalid"); toast("Digite um e-mail válido"); return; }
    i.classList.remove("is-invalid"); e.target.reset(); toast("Inscrição confirmada. Obrigado!");
  });

  /* Menu mobile fecha ao clicar num link; voltar ao topo */
  document.querySelectorAll("#menu a").forEach(a => a.addEventListener("click", () => {
    const m = bootstrap.Collapse.getInstance($("#menu")); if (m) m.hide();
  }));
  const top = $("#to-top");
  addEventListener("scroll", () => {
    const show = scrollY > 400;
    top.classList.toggle("opacity-0", !show); top.classList.toggle("pointer-events-none", !show);
  }, { passive: true });
  top.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
});
