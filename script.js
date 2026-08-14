const toast = document.getElementById("toast");
const themeToggle = document.getElementById("themeToggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function showToast(message = "copied!") {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1500);
}

/* -------------------------
   DARK MODE
------------------------- */

const storedTheme = localStorage.getItem("sbuj-theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = storedTheme || (systemPrefersDark ? "dark" : "light");

function applyTheme(theme, save = false) {
  document.documentElement.dataset.theme = theme;

  const isDark = theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode"
  );

  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", isDark ? "#18130f" : "#A68B64");
  }

  if (save) {
    localStorage.setItem("sbuj-theme", theme);
  }
}

applyTheme(initialTheme);

themeToggle.addEventListener("click", () => {
  const nextTheme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";

  applyTheme(nextTheme, true);
});

/* Follow system changes only until visitor manually chooses a theme. */
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  if (!localStorage.getItem("sbuj-theme")) {
    applyTheme(event.matches ? "dark" : "light");
  }
});

/* -------------------------
   SCROLL REVEAL
------------------------- */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

/* -------------------------
   SUBTLE POINTER TILT
------------------------- */

if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const ry = (x - 0.5) * 5;
      const rx = (0.5 - y) * 5;

      card.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      card.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

/* -------------------------
   COPY DISCOUNT CODES
------------------------- */

function honeyConfetti(button) {
  if (reduceMotion) return;

  const rect = button.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  for (let i = 0; i < 10; i += 1) {
    const particle = document.createElement("span");
    particle.className = "honey-confetti";
    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;

    const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.35;
    const distance = 36 + Math.random() * 44;

    particle.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--rot", `${Math.random() * 300 - 150}deg`);

    document.body.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove());
  }
}

document.querySelectorAll(".copy-code").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.dataset.code;

    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const temp = document.createElement("textarea");
      temp.value = code;
      temp.style.position = "fixed";
      temp.style.opacity = "0";
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
    }

    button.classList.remove("is-copied");
    void button.offsetWidth;
    button.classList.add("is-copied");
    honeyConfetti(button);
    showToast(`${code} copied!`);
  });
});
