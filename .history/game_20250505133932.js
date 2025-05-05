// game variables
let score = 0;
let lives = 3;
let level = 1;
let tracker = 0;
let asteroids = [];
let gameActive = false;
let asteroidSpeed = 2;
let spawnRate = 2000; // time between asteroid spawns
let spawnTimer;
let gameContainer = document.getElementById("game-container");
let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// DOM elements
const scoreDisplay = document.getElementById("score-display");
const livesDisplay = document.getElementById("lives-display");
const levelDisplay = document.getElementById("level-display");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const endGameButton = document.getElementById("end-game");
const playerShip = document.getElementById("player-ship");
const particlesContainer = document.getElementById("particles");

// Initialize the game
function initGame() {
    startScreen.style.display = "none";
    gameOverScreen.style.display = "none";
    score = 0;
    lives = 3;
    level = 1;
    asteroids = [];
    gameActive = true;
    asteroidSpeed = 2;
    spawnRate = 2000;

    updateScore();
    updateLives();
    updateLevel();

    // Remove any existing asteroids
    document.querySelectorAll(".asteroid").forEach((a) => a.remove());

    // Start spawning asteroids
    spawnTimer = setInterval(spawnAsteroid, spawnRate);

    requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop() {
    if (!gameActive) return;

    moveAsteroids();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

// Spawn a new asteroid
function spawnAsteroid() {
    if (!gameActive) return;

    const asteroid = document.createElement("div");
    asteroid.className = "asteroid";

    const left = Math.random() * (gameContainer.offsetWidth - 60);

    const top = -60;

    asteroid.style.left = left + "px";
    asteroid.style.top = top + "px";

    // Assign a random letter
    const letter = letters.charAt(Math.floor(Math.random() * letters.length));
    asteroid.textContent = letter;
    asteroid.dataset.letter = letter;

    gameContainer.appendChild(asteroid);
    asteroids.push({
        element: asteroid,
        x: left,
        y: top,
        letter: letter,
    });
}

// asteroids movement
function moveAsteroids() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.y += asteroidSpeed;
        asteroid.element.style.top = asteroid.y + "px";

        // checks if asteroid reached the bottom
        if (asteroid.y > gameContainer.offsetHeight) {
            loseLife();
            asteroid.element.remove();
            asteroids.splice(i, 1);
        }
    }
}

function checkKey(e) {
    if (!gameActive) return;

    const key = e.key.toUpperCase();

    // verifiying the key pressed
    for (let i = 0; i < asteroids.length; i++) {
        if (asteroids[i].letter === key) {
            destroyAsteroid(i);

            break;
        }
    }
}

// Destroy asteroid
function destroyAsteroid(index) {
    const asteroid = asteroids[index];

    // explosion effect
    const explosion = document.createElement("div");
    explosion.className = "explosion";
    explosion.style.left = asteroid.x + "px";
    explosion.style.top = asteroid.y + "px";
    gameContainer.appendChild(explosion);

    setTimeout(() => {
        explosion.remove();
    }, 500);

    asteroid.element.remove();
    asteroids.splice(index, 1);

    score += 10 * level;
    updateScore();

    if (score >= level * 100 && tracker <= 5) {
        levelUp();
    }
    if (level >= 5 && tracker <= 5) {
        tracker += 1;
    }
    // Only execute when tracker has reached 5
    if (tracker >= 5 && tracker <= 20) {
        tracker += 1;
    }
    if (tracker >= 20 && tracker <= 23) {
        levelUp();
        tracker += 1;
    }
    if (tracker >= 23 && tracker <= 35) {
        tracker += 1;
    }
    if (tracker >= 35) {
        levelUp();
        tracker += 1;
    }
}

// Level up
function levelUp() {
    if (score <= level * 200) {
        level++;
        updateLevel();

        // Increasees difficulty over time - needs to be fine tuned still
        asteroidSpeed += 0.5;
        spawnRate = Math.max(500, spawnRate - 200);

        // Reset the spawn timer with new rate - needs to be fine tuned still
        clearInterval(spawnTimer);
        spawnTimer = setInterval(spawnAsteroid, spawnRate);
    } else if (score >= level * 210) {
        level++;
        updateLevel();

        // Increasees difficulty over time - needs to be fine tuned still
        asteroidSpeed += 0.1;
        spawnRate = Math.max(300, spawnRate - 100);

        // Reset the spawn timer with new rate - needs to be fine tuned still
        clearInterval(spawnTimer);
        spawnTimer = setInterval(spawnAsteroid, spawnRate);
    }
}

// Lose a life
function loseLife() {
    lives--;
    updateLives();

    if (lives <= 0) {
        gameOver();
    }
}

// Check for collisions between asteroids and ship - Not done yet
function checkCollisions() {
    const shipRect = playerShip.getBoundingClientRect();

    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        const asteroidRect = asteroid.element.getBoundingClientRect();

        if (
            shipRect.left < asteroidRect.right &&
            shipRect.right > asteroidRect.left &&
            shipRect.top < asteroidRect.bottom &&
            shipRect.bottom > asteroidRect.top
        ) {
            // Collision detected
            loseLife();
            asteroid.element.remove();
            asteroids.splice(i, 1);
        }
    }
}

// Game over
function gameOver() {
    gameActive = false;
    clearInterval(spawnTimer);

    document.getElementById("final-score").textContent = `Your score: ${score}`;
    gameOverScreen.style.display = "block";
}

// Update displays
function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateLives() {
    livesDisplay.textContent = `Lives: ${lives}`;
}

function updateLevel() {
    levelDisplay.textContent = `Level: ${level}`;
}

// Event listeners
document.addEventListener("keydown", checkKey);
startButton.addEventListener("click", initGame);
restartButton.addEventListener("click", initGame);
//endGameButton.addEventListener('onclick', window.location.href = 'index.html');
//^^^^^^ forces and instint reload for some reason
window.addEventListener("load", function () {
    // This is to force the user back to the starting page
    if (performance.navigation && performance.navigation.type === 1) {
        // Only redirect if not on index.html
        if (
            !window.location.pathname.endsWith("index.html") &&
            window.location.pathname !== "/"
        ) {
            window.location.href = "/index.html";
        }
    }
});

const particles = [];
const ACCELERATION = 0.0007; // particles acceleration

// Create particles
for (let i = 0; i < 120; i++) {
    createParticle();
}

function createParticle() {
    const particle = document.createElement("div");
    const size = Math.random() * 5 + 2;

    particle.style.position = "absolute";
    particle.style.width = size + "px";
    particle.style.height = size + "px";
    particle.style.background = "rgba(255, 255, 255, 0.7)";
    particle.style.borderRadius = "50%";
    particle.style.boxShadow = "0 0 " + size + "px rgba(255, 255, 255, 0.7)";

    // Random position
    const xPos = Math.random() * 100;
    const yPos = Math.random() * 100;
    particle.style.left = xPos + "%";
    particle.style.top = yPos + "%";

    particlesContainer.appendChild(particle);

    particles.push({
        element: particle,
        x: xPos,
        y: yPos,
        speed: Math.random() * 0.05 + 0.02,
        size: size,
    });
}

// Animation loop
function animate() {
    particles.forEach((particle) => {
        // increase speed gradually
        particle.speed += ACCELERATION;

        // update position
        particle.y += particle.speed;

        // reset particle if it goes out of bounds
        if (particle.y > 100) {
            particle.y = -5;
            particle.x = Math.random() * 100;
            particle.speed = Math.random() * 0.05 + 0.02;
        }

        // Apply new position
        particle.element.style.top = particle.y + "%";
    });

    // Continue animation loop
    requestAnimationFrame(animate);
}

// Start animation
animate();
