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
    { rootMargin: "-45% 0px -45% 0px" }
  );

  sections.forEach((section) => navObserver.observe(section));

  /* ---------- Simulador de aforo ---------- */
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
    const WARNING_RATIO = 0.75;
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

    const inFlashRef = { id: null };
    const outFlashRef = { id: null };

    function render() {
      countEl.textContent = count;
      const ratio = count / MAX;
      barEl.style.width = `${Math.min(ratio * 100, 100)}%`;

      let state = "normal";
      let status = "Aforo normal";

      if (count >= MAX) {
        state = "alert";
        status = "Aforo máximo alcanzado — alerta activa";
      } else if (ratio >= WARNING_RATIO) {
        state = "warning";
        status = "Aforo alto — acercándose al límite";
      }

      const wasAlert = simulator.dataset.state === "alert";
      simulator.dataset.state = state;
      statusEl.textContent = status;
      metaAlarm.textContent = state === "alert" ? "Activa" : "Inactiva";
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
      }
      render();
    }

    function exit() {
      if (count > 0) {
        count -= 1;
        flashMeta(metaOut, outFlashRef);
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

  /* ---------- Contadores animados ---------- */
  const statNumbers = document.querySelectorAll(".stat__number");

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 900;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if (statNumbers.length) {
    const statObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    statNumbers.forEach((el) => statObserver.observe(el));
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

  /* ---------- Reproductor de música flotante ---------- */
  const SONG_TITLE = "Die with a smile - Bruno Mars piano cover";

  const musicBubble = document.getElementById("musicBubble");
  const musicPanel = document.getElementById("musicPanel");
  const musicPlayBtn = document.getElementById("musicPlayBtn");
  const musicStatus = document.getElementById("musicStatus");
  const songTitleEl = document.getElementById("songTitle");
  const bgAudio = document.getElementById("bgAudio");

  if (musicBubble && musicPanel && bgAudio) {
    if (songTitleEl) songTitleEl.textContent = SONG_TITLE;

    musicBubble.addEventListener("click", () => {
      musicPanel.classList.toggle("is-open");
    });

    document.addEventListener("click", (event) => {
      const clickedInside = musicPanel.contains(event.target) || musicBubble.contains(event.target);
      if (!clickedInside) musicPanel.classList.remove("is-open");
    });

    musicPlayBtn.addEventListener("click", () => {
      if (bgAudio.paused) {
        bgAudio.play()
          .then(() => {
            musicPlayBtn.textContent = "⏸";
            musicPlayBtn.setAttribute("aria-label", "Pausar");
            musicStatus.textContent = "Reproduciendo";
            musicBubble.classList.add("is-playing");
          })
          .catch(() => {
            musicStatus.textContent = "Agrega el archivo en recursos/Musicafondo.mp3";
          });
      } else {
        bgAudio.pause();
      }
    });

    bgAudio.addEventListener("pause", () => {
      musicPlayBtn.textContent = "▶";
      musicPlayBtn.setAttribute("aria-label", "Reproducir");
      musicStatus.textContent = "Pausado";
      musicBubble.classList.remove("is-playing");
    });

    bgAudio.addEventListener("error", () => {
      musicStatus.textContent = "Agrega el archivo en recursos/Musicafondo.mp3";
    });
  }
});
