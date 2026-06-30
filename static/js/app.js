const container = document.getElementById("phrases-container");
const searchInput = document.getElementById("search");

const showFavoritesBtn = document.getElementById("show-favorites");
const showAllBtn = document.getElementById("show-all");
const settingsBtn = document.getElementById("settings-btn");
const modal = document.getElementById("settings-modal");
const closeModal = document.getElementById("close-modal");

const splash = document.getElementById("splash-screen");

let phrases = [];
let favorites = new Set();
let showOnlyFavorites = false;
let viewMode = "categories";
let selectedCategory = null;
let touchStartX = 0;
let touchEndX = 0;
let currentAudio = null;

const categoryIcons = {
    "Приветствие. Встреча. – Приветствиелэк. Ньэнугунул.": "👋",
    "Знакомство. Семья. – Ньэлэйтэйоол. Шоромоньулпэ.": "👨‍👩‍👧",
    "Этикетные слова.": "🙏",
    "Здоровье. – Шоромо пэнги.": "🏥",
    "Времена года. – Ньэмолҕил параапэ.": "🌦️",
    "Школа.": "🎓",
    "Наш поселок.": "🏘️",
    "Охота (поход за дом). Рыболовство. – Нумэ йэкльиэ эйрэл. Анил иксьиил.": "🎣",
    "Досуг.": "🎉",
    "Счет.": "🔢"
};

function renderPreserveScroll() {
    const scroll = container.scrollTop;

    render();

    requestAnimationFrame(() => {
        container.scrollTop = scroll;
    });
}

function updateModeButtons() {
    showFavoritesBtn.classList.remove("active");
    showAllBtn.classList.remove("active");

    if (showOnlyFavorites) {
        showFavoritesBtn.classList.add("active");
    }

    if (!showOnlyFavorites) {
        showAllBtn.classList.add("active");
    }
}

function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
}

function handleSwipeGesture() {
    const swipeDistance = touchEndX - touchStartX;

    if (swipeDistance > 80) {
        goBack();
    }
}

function goBack() {
    if (viewMode === "phrases") {
        viewMode = "categories";
        selectedCategory = null;
        renderPreserveScroll();
    }
}

// load fav
function loadFavorites() {
    const saved = localStorage.getItem("favorites");
    if (saved) favorites = new Set(JSON.parse(saved));
}

// save fav
function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify([...favorites]));
}

// load phrases
async function loadPhrases() {
    const res = await fetch("/api/phrases");
    phrases = await res.json();

    renderPreserveScroll();
}

// switch fav
function toggleFavorite(id) {
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);

    saveFavorites();
    renderPreserveScroll();
}

function addBackButton() {
    const back = document.createElement("button");
    back.textContent = "← Назад";
    back.classList.add("back-btn");

    back.addEventListener("click", () => {
        viewMode = "categories";
        selectedCategory = null;
        showOnlyFavorites = false;
        searchInput.value = "";

        renderPreserveScroll();
    });

    container.prepend(back);
}

// audio
function playAudio(fileName) {
    if (!fileName) return;

    if (
        currentAudio &&
        !currentAudio.paused &&
        currentAudio.src.endsWith(fileName)
    ) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
        return;
    }

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(`/static/audio/${fileName}`);

    currentAudio.play().catch(err => {
        console.log("Audio error: ", err);
    });

    currentAudio.onended = () => {
        currentAudio = null;
    };
}

// get categories
function getCategories() {
    const set = new Set();
    phrases.forEach(p => set.add(p.category));
    return [...set];
}

function renderCategoriesScreen() {
    container.innerHTML = "";

    const cats = getCategories();

    cats.forEach(cat => {
        const btn = document.createElement("div");
        const icon = categoryIcons[cat] || "📁";

        btn.classList.add("category-card");
        const count = phrases.filter(p => p.category === cat).length;
        btn.innerHTML = `
            <div>
                <div>${icon} ${cat}</div>
                <div class="category-count">
                    ${phrases.filter(p => p.category === cat).length} фраз
                </div>
            </div>
            <span>›</span>
        `;

        btn.addEventListener("click", () => {
            selectedCategory = cat;
            showOnlyFavorites = false;
            viewMode = "phrases";
            renderPreserveScroll();
        });

        container.appendChild(btn);
    });
}

// filter + fav mode
function getFilteredPhrases() {
    const searchValue = searchInput.value.toLowerCase();

    return phrases.filter(p => {
        const matchText =
            p.ru.toLowerCase().includes(searchValue) ||
            p.ykg.toLowerCase().includes(searchValue);

        const matchFav = !showOnlyFavorites || favorites.has(p.id);

        const matchCategory =
            !selectedCategory || p.category === selectedCategory;

        return matchText && matchFav && matchCategory;
    });
}

function render() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    container.scrollTop = 0;

    if (viewMode === "categories") {
        renderCategoriesScreen();
    } else {
        renderPhrasesScreen();
    }

    updateModeButtons();
}



// render
function renderPhrasesScreen() {
    container.innerHTML = "";
    addBackButton();

    const data = getFilteredPhrases();

    data.forEach(p => {
        const card = document.createElement("div");
        card.classList.add("phrase-card");

        const isFav = favorites.has(p.id);

        card.style.cursor = "pointer";

        card.innerHTML = `
            <div class="card-header">

                <div class="ru">
                    ${p.ru}
                </div>

                <div class="actions">
                    <button class="audio-btn">🔊</button>
                    <button class="fav-btn ${isFav ? "active" : ""}">
                        ${isFav ? "❤️" : "🤍"}
                    </button>
                </div>

            </div>

            <div class="ykg">
                ${p.ykg}
            </div>
        `;

        card.querySelector(".fav-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavorite(p.id);
            });

        const audioBtn = card.querySelector(".audio-btn");

        card.querySelector(".audio-btn").addEventListener("click", (e) => {
            e.stopPropagation();

            playAudio(p.audio);
        });

        if (!p.audio) {
            audioBtn.style.opacity = "0.3";
            audioBtn.style.pointerEvents = "none";
        };

        container.appendChild(card);
    });
}

// search
searchInput.addEventListener("input", () => {
    if (viewMode === "categories") {
        viewMode = "phrases";
        selectedCategory = null;
    }

    renderPreserveScroll();
});

// mode buttons
showFavoritesBtn.addEventListener("click", () => {
    showOnlyFavorites = true;
    selectedCategory = null;
    viewMode = "phrases";
    updateModeButtons();
    renderPreserveScroll();
});

showAllBtn.addEventListener("click", () => {
    showOnlyFavorites = false;
    selectedCategory = null;
    searchInput.value = "";
    viewMode = "categories";
    updateModeButtons();
    renderPreserveScroll();
});

settingsBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
});

modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden")
    }
});

document.addEventListener("DOMContentLoaded", () => {

    const splash = document.getElementById("splash-screen");

    if (!splash) return;

    setTimeout(() => {
        splash.style.opacity = "0";
        splash.style.transition = "0.4s ease";

        setTimeout(() => {
            splash.style.display = "none";
        }, 400);

    }, 800);
});

container.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
}, { passive: true});
container.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;

    if (diff > 80) {
        goBack();
    }
});

document.body.style.overscrollBehaviorX = "contain";

// start
loadFavorites();
loadPhrases();
