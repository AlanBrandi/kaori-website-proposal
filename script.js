// Kaori Café — interações
(() => {
  const OPEN_HOUR = 8;
  const CLOSE_HOUR = 20;
  const CLOSED_DAYS = [1]; // segunda
  const DAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

  /* ---------- nav ---------- */
  const nav = document.querySelector(".nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    links.classList.toggle("is-open", open);
    nav.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

  /* ---------- abas do cardápio ---------- */
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus();
      select(next);
    });
  });

  /* ---------- aberto agora? (horário de Sorocaba) ---------- */
  const now = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      weekday: "short", hour: "numeric", minute: "numeric", hour12: false,
    }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type).value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    return { day, hour: Number(get("hour")) % 24 };
  };

  const { day, hour } = now();
  const status = document.getElementById("openStatus");
  const text = status.querySelector(".status__text");
  const isOpenDay = (d) => !CLOSED_DAYS.includes(d);

  if (isOpenDay(day) && hour >= OPEN_HOUR && hour < CLOSE_HOUR) {
    status.classList.add("is-open");
    text.textContent = `Aberto agora · fecha às ${CLOSE_HOUR}h`;
  } else {
    let next = day;
    let offset = 0;
    if (!(isOpenDay(day) && hour < OPEN_HOUR)) {
      do { next = (next + 1) % 7; offset++; } while (!isOpenDay(next));
    }
    const when = offset === 0 ? "hoje" : offset === 1 ? "amanhã" : DAY_NAMES[next];
    status.classList.add("is-closed");
    text.textContent = `Fechado · abre ${when} às ${OPEN_HOUR}h`;
  }

  const today = document.querySelector(`.hours tr[data-day="${day}"]`);
  if (today) today.classList.add("is-today");

  /* ---------- revelar ao rolar ---------- */
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("is-in"));
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
