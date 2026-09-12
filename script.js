document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Año dinámico ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menú móvil ---------- */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll(".navbar__link").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Resaltar sección activa ---------- */
  const links = document.querySelectorAll(".navbar__link");
  const sections = document.querySelectorAll("main > section[id]");

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          links.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
          });
        }
      });
    },
    { rootMargin: "-30% 0px -30% 0px" }
  );

  sections.forEach((section) => navObserver.observe(section));

  /* ---------- Animaciones Scroll (Reveal Corregidas) ---------- */
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  // Revelar elementos que ya están visibles al cargar la página de inmediato
  animatedElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom >= 0) {
      el.classList.add("is-visible");
    }
  });

  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05 }
  );

  animatedElements.forEach((el) => revealObserver.observe(el));

  /* ---------- Simulador de aforo (Límite 20) ---------- */
  const simulator = document.getElementById("simulator");
  const countEl = document.getElementById("simCount");
  const maxEl = document.getElementById("simMax");
  const barEl = document.getElementById("simBar");
  const statusEl = document.getElementById("simStatus");
  const btnIn = document.getElementById("btnIn");
  const btnOut = document.getElementById("btnOut");
  const btnAuto = document.getElementById("btnAuto");
  const btnReset = document.getElementById("btnReset");
  const metaIn = document.getElementById("metaIn");
  const metaOut = document.getElementById("metaOut");
  const metaAlarm = document.getElementById("metaAlarm");

  if (simulator) {
    const MAX = parseInt(maxEl.textContent, 10);
    const WARNING_RATIO = 0.70;
    let count = 0;
    let autoInterval = null;
    let audioCtx = null;

    function beep() {
      try {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "square";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch (e) {
        /* Web Audio no disponible */
      }
    }

    function flashMeta(el, timeoutRef) {
      el.textContent = "Detectado";
      el.classList.add("is-flash");
      clearTimeout(timeoutRef.id);
      timeoutRef.id = setTimeout(() => {
        el.textContent = "En espera";
        el.classList.remove("is-flash");
      }, 550);
    }

    function triggerBump() {
      countEl.classList.add("bump");
      setTimeout(() => countEl.classList.remove("bump"), 150);
    }

    const inFlashRef = { id: null };
    const outFlashRef = { id: null };

    function render() {
      countEl.textContent = count;
      const ratio = count / MAX;
      barEl.style.width = `${Math.min(ratio * 100, 100)}%`;

      let state = "normal";
      let status = "Aforo disponible (Verde)";

      if (count >= MAX) {
        state = "alert";
        status = "¡Aforo Lleno! — Alerta sonora y luz roja";
      } else if (ratio >= WARNING_RATIO) {
        state = "warning";
        status = "Cerca del límite — Advertencia (Amarillo)";
      }

      const wasAlert = simulator.dataset.state === "alert";
      simulator.dataset.state = state;
      statusEl.textContent = status;
      metaAlarm.textContent = state === "alert" ? "¡ALERTA ACTIVA!" : "Inactivo";
      metaAlarm.classList.toggle("is-flash", state === "alert");

      if (state === "alert" && !wasAlert) beep();

      if (count >= MAX && autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
        btnAuto.classList.remove("is-active");
        btnAuto.textContent = "Simulación automática";
      }
    }

    function enter() {
      if (count < MAX) {
        count += 1;
        flashMeta(metaIn, inFlashRef);
        triggerBump();
      }
      render();
    }

    function exit() {
      if (count > 0) {
        count -= 1;
        flashMeta(metaOut, outFlashRef);
        triggerBump();
      }
      render();
    }

    function reset() {
      count = 0;
      if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
      }
      btnAuto.classList.remove("is-active");
      btnAuto.textContent = "Simulación automática";
      render();
    }

    function toggleAuto() {
      if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
        btnAuto.classList.remove("is-active");
        btnAuto.textContent = "Simulación automática";
        return;
      }

      btnAuto.classList.add("is-active");
      btnAuto.textContent = "Detener simulación";
      autoInterval = setInterval(() => {
        const goingIn = Math.random() > 0.32;
        if (goingIn) enter(); else exit();
      }, 700);
    }

    btnIn.addEventListener("click", enter);
    btnOut.addEventListener("click", exit);
    btnReset.addEventListener("click", reset);
    btnAuto.addEventListener("click", toggleAuto);

    render();
  }

  /* ---------- Placeholders de la sección Evidencia ---------- */
  function showPlaceholderOnError(mediaId, placeholderId) {
    const mediaEl = document.getElementById(mediaId);
    const placeholderEl = document.getElementById(placeholderId);
    if (!mediaEl || !placeholderEl) return;

    const reveal = () => {
      mediaEl.classList.add("is-hidden");
      placeholderEl.hidden = false;
    };

    mediaEl.addEventListener("error", reveal, true);

    // Detección si los recursos de imagen o vídeo fallan
    setTimeout(() => {
      const isImg = mediaEl.tagName === "IMG";
      const notLoaded = isImg
        ? !mediaEl.complete || mediaEl.naturalWidth === 0
        : mediaEl.readyState === 0 && !mediaEl.currentSrc;
      if (notLoaded) reveal();
    }, 1200);
  }

  showPlaceholderOnError("mediaImgSim", "mediaImgSimPlaceholder");
  showPlaceholderOnError("mediaVideoSim", "mediaVideoSimPlaceholder");
  showPlaceholderOnError("mediaVideoFisico", "mediaVideoFisicoPlaceholder");
});
