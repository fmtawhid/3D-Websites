
const video = document.getElementById("propertyVideo");
const story = document.getElementById("story");

const card = document.getElementById("sceneCard");
const eyebrow = document.getElementById("sceneEyebrow");
const title = document.getElementById("sceneTitle");
const description = document.getElementById("sceneDescription");
const progressLabel = document.getElementById("progressLabel");

const scenes = [
  {
    eyebrow: "THE C8 GENERATION",
    title: "Chevrolet<br>Corvette ZR1",
    description:
      "The most powerful production Corvette to date: a mid-engine supercar with a twin-turbo LT7 V8 and 1,064 horsepower."
  },
  {
    eyebrow: "01 — LT7 TWIN-TURBO V8",
    title: "Power with<br>a purpose.",
    description:
      "A 5.5-liter flat-plane-crank V8 delivers 1,064 hp and 828 lb-ft of torque through an 8-speed dual-clutch transmission."
  },
  {
    eyebrow: "02 — TRACK-FOCUSED AERO",
    title: "Sculpted for<br>the circuit.",
    description:
      "Available carbon-fiber aerodynamic components and the ZTK Performance Package sharpen the ZR1's track focus."
  },
  {
    eyebrow: "03 — CORVETTE ZR1",
    title: "A new kind<br>of Corvette.",
    description:
      "Explore the specifications, engineering, and design of Chevrolet's mid-engine, twin-turbo flagship."
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
    "Video could not be loaded. Check assets/car.mp4."
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

