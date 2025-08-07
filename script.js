const canvas = document.getElementById('pong');
const context = canvas.getContext('2d');

// Game state
let gameMode = null; // 'player-vs-ai' or 'ai-vs-ai'

// Game objects
const player1 = {
    x: 10,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    score: 0,
    dy: 0, // velocity
    reaction: 0.1,
    learningRate: 0.01
};

const player2 = {
    x: canvas.width - 20,
    y: canvas.height / 2 - 50,
    width: 10,
    height: 100,
    score: 0,
    dy: 0, // velocity
    reaction: 0.1,
    learningRate: 0.01
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 10,
    height: 10,
    speed: 5,
    dx: 5,
    dy: 5
};

// Draw functions
function drawRect(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

function drawText(text, x, y, color) {
    context.fillStyle = color;
    context.font = '35px sans-serif';
    context.fillText(text, x, y);
}

function drawNet() {
    for (let i = 0; i < canvas.height; i += 15) {
        drawRect(canvas.width / 2 - 1, i, 2, 10, 'white');
    }
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Move the ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y + ball.height > canvas.height || ball.y - ball.height < 0) {
        ball.dy = -ball.dy;
    }

    // Ball collision with paddles
    if (collision(ball, player1) || collision(ball, player2)) {
        ball.dx = -ball.dx;
    }

    // Score points
    if (ball.x - ball.width < 0) {
        player2.score++;
        // Player 1 missed, make it learn
        if (gameMode === 'ai-vs-ai') {
            player1.reaction = Math.max(0.01, player1.reaction - player1.learningRate);
        }
        resetBall();
    } else if (ball.x + ball.width > canvas.width) {
        player1.score++;
        // Player 2 missed, make it learn
        player2.reaction = Math.max(0.01, player2.reaction - player2.learningRate);
        resetBall();
    }

    // Move paddles
    if (gameMode === 'player-vs-ai') {
        player1.y += player1.dy;
        // Keep paddle within canvas bounds
        if (player1.y < 0) player1.y = 0;
        if (player1.y + player1.height > canvas.height) player1.y = canvas.height - player1.height;

        // AI for player 2
        aiMove(player2);

    } else if (gameMode === 'ai-vs-ai') {
        // AI for player 1
        aiMove(player1);
        // AI for player 2
        aiMove(player2);
    }
}

function aiMove(player) {
    // Simple AI with a reaction delay
    const targetY = ball.y - player.height / 2;
    const dy = (targetY - player.y) * player.reaction;

    // Add a bit of imperfection
    if (Math.abs(dy) > 2) {
        player.y += dy;
    }

    // Keep paddle within canvas bounds
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

// Collision detection
function collision(b, p) {
    b.top = b.y - b.height;
    b.bottom = b.y + b.height;
    b.left = b.x - b.width;
    b.right = b.x + b.width;

    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

// Render the game
function render() {
    // Clear the canvas
    drawRect(0, 0, canvas.width, canvas.height, 'black');

    // Draw the net
    drawNet();

    // Draw the scores
    drawText(player1.score, canvas.width / 4, canvas.height / 5, 'white');
    drawText(player2.score, 3 * canvas.width / 4, canvas.height / 5, 'white');

    // Draw the paddles
    drawRect(player1.x, player1.y, player1.width, player1.height, 'white');
    drawRect(player2.x, player2.y, player2.width, player2.height, 'white');

    // Draw the ball
    drawCircle(ball.x, ball.y, ball.width, 'white');
}

// Event listeners for menu
document.getElementById('player-vs-ai').addEventListener('click', () => {
    gameMode = 'player-vs-ai';
    startGame();
});

document.getElementById('ai-vs-ai').addEventListener('click', () => {
    gameMode = 'ai-vs-ai';
    startGame();
});

function startGame() {
    document.getElementById('menu').style.display = 'none';
    resetBall();
    gameLoop();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 5;
    ball.dx = -ball.dx;
}

// Initial render
render();

// Keyboard controls
document.addEventListener('keydown', (event) => {
    if (gameMode === 'player-vs-ai') {
        switch (event.key) {
            case 'ArrowUp':
                player1.dy = -5;
                break;
            case 'ArrowDown':
                player1.dy = 5;
                break;
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (gameMode === 'player-vs-ai') {
        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown':
                player1.dy = 0;
                break;
        }
    }
});
