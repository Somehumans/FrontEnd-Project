// game variables
let score = 0;
let lives = 3;
let level = 1;
let tracker = 0;
let asteroids = [];
let gameActive = false;
let asteroidSpeed = 3;
let spawnRate = 2000; // time between asteroid spawns
let spawnTimer;
let gameContainer = document.getElementById("game-container");
let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MAX_ASTEROIDS = 4; // maximum number of asteroids at once

// Movement boundaries
const MARGIN = 150; // increased margin from edges
const MIN_BOTTOM = 20;
const MAX_BOTTOM = gameContainer.offsetHeight - 200;

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
    asteroidSpeed = 3;
    spawnRate = 2000;

    // Show and position the ship
    playerShip.style.display = 'block';
    playerShip.classList.remove('game-active'); // Remove game-active class if it exists
    playerShip.classList.add('game-started');

    // Add game-active class after initial animation
    setTimeout(() => {
        playerShip.classList.add('game-active');
    }, 1500);

    updateScore();
    updateLives();
    updateLevel();

    // Remove any existing asteroids
    document.querySelectorAll(".asteroid").forEach((a) => a.remove());

    // Start spawning asteroids with a delay to let ship animation complete
    setTimeout(() => {
        spawnTimer = setInterval(spawnAsteroid, spawnRate);
    }, 1500);

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
    
    // Don't spawn if we already have max asteroids
    if (asteroids.length >= MAX_ASTEROIDS) return;

    const asteroid = document.createElement("div");
    asteroid.className = "asteroid";

    // Ensure asteroids don't spawn too close to edges
    const left = Math.random() * (gameContainer.offsetWidth - 2 * MARGIN) + MARGIN;
    const top = -60;

    asteroid.style.left = left + "px";
    asteroid.style.top = top + "px";

    // Assign a random letter that isn't currently in use
    let availableLetters = letters.split('').filter(letter => 
        !asteroids.some(a => a.letter === letter)
    );
    if (availableLetters.length === 0) return; // Skip if no letters available
    
    const letter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
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

    // verifiying the key pressed for asteroids
    for (let i = 0; i < asteroids.length; i++) {
        if (asteroids[i].letter === key) {
            // Move ship towards the asteroid horizontally only
            const asteroid = asteroids[i];
            const asteroidRect = asteroid.element.getBoundingClientRect();
            const containerWidth = gameContainer.offsetWidth;
            const containerHeight = gameContainer.offsetHeight;

            // Calculate target position with stricter boundaries
            const targetX = Math.min(
                Math.max(asteroidRect.left, MARGIN),
                containerWidth - MARGIN
            );

            // Limit movement to middle section of screen horizontally
            const finalX = Math.max(
                MARGIN,
                Math.min(targetX, containerWidth - MARGIN)
            );

            // Calculate the bottom 30% boundary
            const bottomThirtyPercent = containerHeight * 0.7; // This is the Y position where the bottom 30% begins

            // Set vertical position to be in the bottom 30% of the screen
            // Position will be somewhere between the 70% mark and the bottom (with some padding)
            const finalY = Math.max(
                bottomThirtyPercent,
                Math.min(containerHeight - 100, asteroidRect.top) // Keep some padding from the bottom
            );

            // Move ship horizontally and ensure it stays in bottom 30%
            playerShip.style.left = finalX + 'px';
            playerShip.style.top = finalY + 'px';
            playerShip.style.transform = 'translateX(-50%)';

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
    } else {
        // Respawn effect
        playerShip.classList.add('respawning');
        
        // Reset ship horizontal position only, maintain vertical position
        playerShip.style.left = '50%';
        playerShip.style.transform = 'translateX(-50%)';
        
        // Remove respawning class after animation
        setTimeout(() => {
            playerShip.classList.remove('respawning');
        }, 3000);
    }
}

// Check for collisions between asteroids and ship
function checkCollisions() {
    const shipRect = playerShip.getBoundingClientRect();
    
    // Calculate a smaller hitbox (reduce by 60% of the original size)
    const hitboxReduction = 0.6;
    const hitboxWidth = shipRect.width * (1 - hitboxReduction);
    const hitboxHeight = shipRect.height * (1 - hitboxReduction);
    
    // Center the smaller hitbox
    const hitboxLeft = shipRect.left + (shipRect.width - hitboxWidth) / 2;
    const hitboxTop = shipRect.top + (shipRect.height - hitboxHeight) / 2;
    const hitboxRight = hitboxLeft + hitboxWidth;
    const hitboxBottom = hitboxTop + hitboxHeight;

    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        const asteroidRect = asteroid.element.getBoundingClientRect();

        if (
            hitboxLeft < asteroidRect.right &&
            hitboxRight > asteroidRect.left &&
            hitboxTop < asteroidRect.bottom &&
            hitboxBottom > asteroidRect.top
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
    
    // Hide the ship and remove classes
    playerShip.style.display = 'none';
    playerShip.classList.remove('game-started', 'game-active');
    
    // Remove all asteroids
    asteroids.forEach(asteroid => asteroid.element.remove());
    asteroids = [];

    document.getElementById("final-score").textContent = `Your score: ${score}`;
    gameOverScreen.style.display = "block";
}

// Update displays
function updateScore() {
    scoreDisplay.textContent = `SCORE: ${score}`;
}

function updateLives() {
    livesDisplay.textContent = `LIVES: ${lives}`;
}

function updateLevel() {
    levelDisplay.textContent = `LEVEL: ${level}`;
}

// Event listeners
document.addEventListener("keydown", checkKey);
startButton.addEventListener("click", initGame);
restartButton.addEventListener("click", initGame);
endGameButton.addEventListener("click", function () {
    // Instead of redirecting, just reload the current page
    window.location.reload();
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
