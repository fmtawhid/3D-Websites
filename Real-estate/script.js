const video = document.getElementById("propertyVideo");
const story = document.getElementById("story");
const card = document.getElementById("sceneCard");
const stage = story.querySelector(".sticky-stage");
const eyebrow = document.getElementById("sceneEyebrow");
const title = document.getElementById("hero-title");
const description = document.getElementById("sceneDescription");
const progressLabel = document.getElementById("progressLabel");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const introProgress = 0.12;

const scenes = [
  {
    eyebrow: "HOME FOR RENT",
    title: "WELCOME",
    description: "A comfortable place to call home."
  },
  {
    eyebrow: "THE PROPERTY",
    title: "Feel at<br>home.",
    description: "A welcoming space for everyday living."
  },
  {
    eyebrow: "MAKE IT YOURS",
    title: "Settle<br>in.",
    description: "Make this home your own."
  },
  {
    eyebrow: "INTERESTED?",
    title: "Come<br>see it.",
    description: "Enquire to arrange a viewing."
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
    console.error("The property video could not seek to the scroll position.", error);
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
  console.error("Video could not be loaded. Check assets/property-tour.mp4.");
});

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
reducedMotion.addEventListener("change", requestScrollUpdate);

requestScrollUpdate();
