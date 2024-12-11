document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const difficultySelect = document.getElementById('difficulty');
    const customSettings = document.querySelector('.custom-settings');
    const customRowsInput = document.getElementById('custom-rows');
    const customColsInput = document.getElementById('custom-cols');
    const customMinesInput = document.getElementById('custom-mines');
    const message = document.getElementById('message');
    const mineCounterDisplay = document.getElementById('mine-counter');
    const timerDisplay = document.getElementById('timer');
    let gameStarted = false;
    let startTime;
    let timerInterval;
    let rows, cols, mines;
    let board;
    let flagsPlaced;
    let gameOver;

    function startGame() {
        gameOver = false;
        gameStarted = true;
        flagsPlaced = 0;
        message.textContent = '';
        grid.innerHTML = '';
        clearInterval(timerInterval);
        timerDisplay.textContent = '00:00';
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);

        if (difficultySelect.value === 'custom') {
            rows = parseInt(customRowsInput.value);
            cols = parseInt(customColsInput.value);
            mines = parseInt(customMinesInput.value);
        } else {
            switch (difficultySelect.value) {
                case 'beginner':
                    rows = 9;
                    cols = 9;
                    mines = 10;
                    break;
                case 'intermediate':
                    rows = 16;
                    cols = 16;
                    mines = 40;
                    break;
                case 'expert':
                    rows = 16;
                    cols = 30;
                    mines = 99;
                    break;
            }
        }

        if (mines >= rows * cols) {
            mines = Math.floor(rows * cols * 0.8);
            alert("Too many mines for the given grid size. Mines adjusted to " + mines);
        }

        board = createBoard(rows, cols, mines);
        renderBoard(board);
        updateMineCounter();
    }

    function updateTimer() {
        if (!gameStarted || gameOver) return;
        const currentTime = new Date();
        const timeDiff = Math.floor((currentTime - startTime) / 1000);
        const minutes = String(Math.floor(timeDiff / 60)).padStart(2, '0');
        const seconds = String(timeDiff % 60).padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    function createBoard(rows, cols, mines) {
        const board = Array(rows).fill(null).map(() => Array(cols).fill(0));
        let minesPlaced = 0;
        while (minesPlaced < mines) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            if (board[row][col] !== 'mine') {
                board[row][col] = 'mine';
                minesPlaced++;
            }
        }
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (board[i][j] !== 'mine') {
                    board[i][j] = countAdjacentMines(board, i, j);
                }
            }
        }
        return board;
    }

    function countAdjacentMines(board, row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length && board[newRow][newCol] === 'mine') {
                    count++;
                }
            }
        }
        return count;
    }

    function renderBoard(board) {
        grid.style.gridTemplateColumns = `repeat(${board[0].length}, 30px)`;
        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const square = document.createElement('div');
                square.classList.add('square');
                square.dataset.row = rowIndex;
                square.dataset.col = colIndex;
                square.addEventListener('click', handleSquareClick);
                square.addEventListener('contextmenu', handleRightClick);
                grid.appendChild(square);
            });
        });
    }

    function handleSquareClick(event) {
        if (!gameStarted || gameOver) return;
        const square = event.target;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        if (square.classList.contains('revealed') || square.classList.contains('flagged')) return;
        if (board[row][col] === 'mine') {
            revealMines();
            square.classList.add('mine');
            message.textContent = 'Game Over!';
            gameOver = true;
            clearInterval(timerInterval);
        } else {
            revealSquare(row, col);
            checkWin();
        }
    }

    function handleRightClick(event) {
        event.preventDefault();
        if (!gameStarted || gameOver) return;
        const square = event.target;
        if (square.classList.contains('revealed')) return;
        if (square.classList.contains('flagged')) {
            square.classList.remove('flagged');
            flagsPlaced--;
        } else {
            square.classList.add('flagged');
            flagsPlaced++;
        }
        updateMineCounter();
    }

    function revealSquare(row, col) {
        if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) return;
        const square = grid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!square || square.classList.contains('revealed') || square.classList.contains('flagged')) return;
        square.classList.add('revealed');
        if (board[row][col] > 0) {
            square.textContent = board[row][col];
        } else if (board[row][col] === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    revealSquare(row + i, col + j);
                }
            }
        }
    }

    function revealMines() {
        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell === 'mine') {
                    const square = grid.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex}"]`);
                    square.classList.add('mine');
                }
            });
        });
    }

    function checkWin() {
        let revealedCount = 0;
        grid.querySelectorAll('.square.revealed').forEach(() => revealedCount++);
        if (revealedCount === rows * cols - mines) {
            message.textContent = 'You Win!';
            gameOver = true;
            clearInterval(timerInterval);
        }
    }

    function updateMineCounter() {
        mineCounterDisplay.textContent = mines - flagsPlaced;
    }

    difficultySelect.addEventListener('change', function () {
        if (this.value === 'custom') {
            customSettings.style.display = 'inline-block';
        } else {
            customSettings.style.display = 'none';
        }
    });

    document.getElementById('reset-button').addEventListener('click', startGame);

    startGame();
});
