// Simple BrainMatch Game Script

let game = {
    level: "beginner",
    theme: "animals",
    timerOn: true,
    cards: [],
    flipped: [],
    matched: 0,
    totalPairs: 6,
    moves: 0,
    seconds: 0,
    timerInterval: null,
    locked: false
};

const images = {
    animals: [
        "images/animal1.jpg",
        "images/animal2.jpg",
        "images/animal3.jpg",
        "images/animal4.jpg",
        "images/animal5.jpg",
        "images/animal6.jpg"
    ],
    nature: [
        "images/nature1.jpg",
        "images/nature2.jpg",
        "images/nature3.jpg",
        "images/nature4.jpg",
        "images/nature5.jpg",
        "images/nature6.jpg"
    ],
    food: [
        "images/food1.jpg",
        "images/food2.jpg",
        "images/food3.jpg",
        "images/food4.jpg",
        "images/food5.jpg",
        "images/food6.jpg"
    ]
};

function getSettings() {
    const p = new URLSearchParams(window.location.search);
    return {
        level: p.get("level") || "beginner",
        theme: p.get("theme") || "animals",
        timer: p.get("timer") !== "off"
    };
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("gameBoard")) {
        startGame();
    }
});

function startGame() {
    const s = getSettings();
    game.level = s.level;
    game.theme = s.theme;
    game.timerOn = s.timer;

    // FIXED PAIRS FOR EACH LEVEL
    if (game.level === "beginner") game.totalPairs = 6;       // 12 cards
    if (game.level === "intermediate") game.totalPairs = 8;   // 16 cards
    if (game.level === "advanced") game.totalPairs = 12;      // 24 cards

    document.getElementById("matchCount").textContent =
        "0 / " + game.totalPairs;

    const board = document.getElementById("gameBoard");
    board.className = "game-board " + game.level;

    makeCards();
    if (game.timerOn) startTimer();
}

function makeCards() {
    const board = document.getElementById("gameBoard");
    board.innerHTML = "";

    // FIX: Always slice based on totalPairs
    let set = images[game.theme];

    // If not enough images, reuse them
    while (set.length < game.totalPairs) {
        set = set.concat(images[game.theme]);
    }

    set = set.slice(0, game.totalPairs);

    let cards = [...set, ...set]; // create pairs

    cards = shuffle(cards);

    cards.forEach((img) => {
        const card = document.createElement("div");
        card.className = "game-card";
        card.dataset.image = img;

        card.innerHTML = `
            <div class="card-face card-front">?</div>
            <div class="card-face card-back">
                <img src="${img}" alt="img">
            </div>
        `;

        card.addEventListener("click", () => flip(card));
        board.appendChild(card);
    });
}


function shuffle(arr) {
    let a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function flip(card) {
    if (game.locked) return;
    if (card.classList.contains("flipped")) return;
    if (card.classList.contains("matched")) return;

    card.classList.add("flipped");
    game.flipped.push(card);

    if (game.flipped.length === 2) {
        game.moves++;
        document.getElementById("moveCount").textContent = game.moves;
        checkMatch();
    }
}

function checkMatch() {
    game.locked = true;

    const [c1, c2] = game.flipped;
    const match = c1.dataset.image === c2.dataset.image;

    if (match) {
        setTimeout(() => {
            c1.classList.add("matched");
            c2.classList.add("matched");
            game.flipped = [];
            game.locked = false;
            game.matched++;

            document.getElementById("matchCount").textContent =
                game.matched + " / " + game.totalPairs;

            if (game.matched === game.totalPairs) finishGame();
        }, 400);
    } else {
        setTimeout(() => {
            c1.classList.remove("flipped");
            c2.classList.remove("flipped");
            game.flipped = [];
            game.locked = false;
        }, 900);
    }
}

function startTimer() {
    game.timerInterval = setInterval(() => {
        game.seconds++;
        document.getElementById("timer").textContent = format(game.seconds);
    }, 1000);
}

function format(sec) {
    let m = Math.floor(sec / 60);
    let s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function finishGame() {
    clearInterval(game.timerInterval);

    let score =
        Math.max(0, 300 - game.seconds) +
        Math.max(0, 100 - game.moves) +
        game.matched * 50;

    const p = new URLSearchParams();
    p.set("time", format(game.seconds));
    p.set("moves", game.moves);
    p.set("score", score);

    window.location.href = "result.html?" + p.toString();
}

function resetGame() {
    clearInterval(game.timerInterval);

    game.flipped = [];
    game.matched = 0;
    game.moves = 0;
    game.seconds = 0;
    game.locked = false;

    document.getElementById("moveCount").textContent = "0";
    document.getElementById("timer").textContent = "00:00";
    document.getElementById("matchCount").textContent =
        "0 / " + game.totalPairs;

    startGame();
}