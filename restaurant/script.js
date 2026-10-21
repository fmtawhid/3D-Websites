const video = document.getElementById("restaurantVideo");
const story = document.getElementById("story");
const card = document.getElementById("sceneCard");
const stage = story.querySelector(".sticky-stage");
const eyebrow = document.getElementById("sceneEyebrow");
const title = document.getElementById("hero-title");
const description = document.getElementById("sceneDescription");
const progressLabel = document.getElementById("progressLabel");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const introProgress = 0;

const revealElements = document.querySelectorAll(
  ".section-heading, .feature-card, .menu-note, .design-copy, .design-art, .visit-content, .site-footer"
);

revealElements.forEach((element) => element.classList.add("motion-reveal"));

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
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

  revealElements.forEach((element) => revealObserver.observe(element));
}

const scenes = [
  {
    eyebrow: "A TABLE FULL OF STORIES",
    title: "COME<br>HUNGRY.",
    description: "Bengali soul, a little bit of surprise, and always room for one more."
  },
  {
    eyebrow: "FROM OUR KITCHEN",
    title: "MADE<br>WITH FIRE.",
    description: "Old recipes, market-fresh ingredients, and the good things worth sharing."
  },
  {
    eyebrow: "BENGALI, WITH A TWIST",
    title: "ROOTED<br>IN FLAVOUR.",
    description: "A little nostalgia, a little surprise, and plenty of room around the table."
  },
  {
    eyebrow: "THERE'S ALWAYS ROOM",
    title: "PULL UP<br>A CHAIR.",
    description: "Bring your people and your appetite. We’ll take care of the rest."
  }
];

let duration = 0;
let currentScene = -1;
let ticking = false;
let lastRequestedTime = -1;
let pendingSeekUpdate = false;
let sceneTimeout;

function updateScene(progress) {
  const isIntro = progress < introProgress;
  stage.classList.toggle("intro-pause", isIntro);

  const sceneIndex = isIntro
    ? -1
    : Math.min(
        scenes.length - 1,
        Math.floor(((progress - introProgress) / (1 - introProgress)) * scenes.length)
      );

  if (sceneIndex === currentScene) return;

  currentScene = sceneIndex;
  window.clearTimeout(sceneTimeout);

  if (sceneIndex < 0) {
    card.classList.remove("is-visible", "changing");
    return;
  }

  const scene = scenes[sceneIndex];
  card.classList.add("is-visible", "changing");
  sceneTimeout = window.setTimeout(() => {
    eyebrow.textContent = scene.eyebrow;
    title.innerHTML = scene.title;
    description.textContent = scene.description;
    progressLabel.textContent = `0${sceneIndex + 1} / 0${scenes.length}`;
    card.classList.remove("changing");
  }, 180);
}

function updateFromScroll() {
  ticking = false;

  const rect = story.getBoundingClientRect();
  const scrollableDistance = story.offsetHeight - window.innerHeight;

  if (scrollableDistance <= 0) return;

  const progress = Math.max(0, Math.min(1, -rect.top / scrollableDistance));
  updateScene(progress);

  if (!duration || !Number.isFinite(duration) || reducedMotion.matches) return;

  const targetTime = progress * duration;
  if (video.seeking) {
    pendingSeekUpdate = true;
    return;
  }

  if (
    Math.abs(video.currentTime - targetTime) < 0.04 ||
    Math.abs(lastRequestedTime - targetTime) < 0.04
  ) {
    return;
  }

  try {
    lastRequestedTime = targetTime;
    video.currentTime = targetTime;
  } catch (error) {
    console.error("The restaurant video could not seek to the scroll position.", error);
  }
}

function updateAfterSeek() {
  if (!pendingSeekUpdate) return;

  pendingSeekUpdate = false;
  requestScrollUpdate();
}

function requestScrollUpdate() {
  if (ticking) return;

  ticking = true;
  window.requestAnimationFrame(updateFromScroll);
}

video.addEventListener("loadedmetadata", () => {
  duration = video.duration;
  video.pause();
  requestScrollUpdate();
});

video.addEventListener("seeked", updateAfterSeek);
video.addEventListener("play", () => video.pause());
video.addEventListener("error", () => {
  console.error("Restaurant video could not be loaded. Check assets/final.mp4.");
});

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
reducedMotion.addEventListener("change", requestScrollUpdate);

requestScrollUpdate();
