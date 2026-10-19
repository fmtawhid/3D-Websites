
const video = document.getElementById("propertyVideo");
const story = document.getElementById("story");

const card = document.getElementById("sceneCard");
const eyebrow = document.getElementById("sceneEyebrow");
const title = document.getElementById("sceneTitle");
const description = document.getElementById("sceneDescription");
const progressLabel = document.getElementById("progressLabel");

const scenes = [
  {
    eyebrow: "AVAILABLE FOR NEW PROJECTS",
    title: "Full Stack &amp;<br>Software Engineer",
    description:
      "I'm FM Tawhidul Islam. I build scalable web platforms and intelligent AI automations."
  },
  {
    eyebrow: "01 — FOUR YEARS IN PRODUCTION",
    title: "Ideas into<br>scalable products.",
    description:
      "Full-stack engineering with Laravel, Django, and WordPress for teams in Bangladesh, the USA, and beyond."
  },
  {
    eyebrow: "02 — FULL STACK + AI",
    title: "Software that<br>moves work forward.",
    description:
      "From enterprise SaaS and e-commerce platforms to AI workflows saving businesses 40+ hours every month."
  },
  {
    eyebrow: "03 — OPEN TO WORK",
    title: "Let's build<br>what's next.",
    description:
      "Available for freelance, remote, and relocation opportunities. Based in Dhaka, Bangladesh."
  }
];

let duration = 0;
let currentScene = -1;
let ticking = false;
let sceneTimeout;

function updateScene(progress) {
  const sceneIndex = Math.min(
    scenes.length - 1,
    Math.floor(progress * scenes.length)
  );

  if (sceneIndex === currentScene) return;

  currentScene = sceneIndex;
  const scene = scenes[sceneIndex];

  card.classList.add("changing");

  window.clearTimeout(sceneTimeout);
  sceneTimeout = window.setTimeout(() => {
    eyebrow.textContent = scene.eyebrow;
    title.innerHTML = scene.title;
    description.textContent = scene.description;
    progressLabel.textContent =
      `0${sceneIndex + 1} / 0${scenes.length}`;

    card.classList.remove("changing");
  }, 220);
}

function updateVideoFromScroll() {
  ticking = false;

  const rect = story.getBoundingClientRect();
  const scrollableDistance = story.offsetHeight - window.innerHeight;

  if (scrollableDistance <= 0) return;

  const progress = Math.max(
    0,
    Math.min(1, -rect.top / scrollableDistance)
  );

  updateScene(progress);

  if (!duration || !Number.isFinite(duration)) return;

  const targetTime = progress * duration;

  if (!video.seeking && Math.abs(video.currentTime - targetTime) > 0.04) {
    try {
      video.currentTime = targetTime;
    } catch (error) {
      // Some browsers cannot seek until media metadata is available.
    }
  }

  updateScene(progress);
}

function requestScrollUpdate() {
  if (ticking) return;

  ticking = true;
  window.requestAnimationFrame(updateVideoFromScroll);
}

video.addEventListener("loadedmetadata", () => {
  duration = video.duration;
  video.pause();
  requestScrollUpdate();
});

video.addEventListener("play", () => {
  // Keep this video scroll-controlled, not continuously playing.
  video.pause();
});

video.addEventListener("seeked", requestScrollUpdate);

window.addEventListener("scroll", requestScrollUpdate, {
  passive: true
});

window.addEventListener("resize", requestScrollUpdate);
requestScrollUpdate();

video.addEventListener("error", () => {
  console.error(
    "Video could not be loaded. Check assets/tawhid.mp4."
  );
});

const revealSelector = [
  ".intro > .section-kicker",
  ".intro-copy",
  ".intro-facts",
  ".proof-inner > div",
  ".section-heading",
  ".timeline-item",
  ".skills-title",
  ".skill-group",
  ".service-list article",
  ".project-card",
  ".review-grid blockquote",
  ".contact-copy",
  ".contact-form",
  ".site-footer > *"
].join(", ");

const revealElements = document.querySelectorAll(revealSelector);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -35px 0px"
  });

  revealElements.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${(index % 3) * 85}ms`);
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("successMessage");
const submitButton = contactForm?.querySelector('button[type="submit"]');
const loadingSpinner = contactForm?.querySelector(".loading-spin");

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  loadingSpinner.classList.add("is-loading");

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm)
    });

    if (!response.ok) throw new Error("Message submission failed.");

    contactStatus.hidden = false;
    contactForm.reset();
    window.setTimeout(() => {
      contactStatus.hidden = true;
    }, 5000);
  } catch (error) {
    window.alert("Could not send your message. Please email tawhid0406@gmail.com directly.");
  } finally {
    submitButton.disabled = false;
    loadingSpinner.classList.remove("is-loading");
  }
});
