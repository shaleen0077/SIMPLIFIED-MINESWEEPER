class Minesweeper {
    constructor() {
        this.minePosition = [];
        this.counter = 0;
        this.gameReset = 0;
        this.mines = 0;
        this.rows = 0;
        this.cols = 0;
    }
    init() {
        this.requestInput();
    }
    /**
     * Create template for requesting information for minesweeper game
     * like number of rows, columns and count of mines
     * @returns void
     */
    requestInput() {
        const inputTemplate = `
            <div class="ms-input">
                <div class="ms-input-field">
                    <span>Rows</span>
                    <input placeholder="Enter number of rows" id="ms-row" min=2 value="5" type="number" />
                </div>
                <div class="ms-input-field">
                    <span>Columns</span>
                    <input placeholder="Enter number of columns" id="ms-col" min=2 value="5" type="number" />
                </div>
                <div class="ms-input-field">
                    <span>Mines</span>
                    <input placeholder="Enter number of mines" id="ms-mines-count" min=0 value="2" type="number" />
                </div>
                <button type="button" id="ms-btn-play">Play</button>
            </div>
        `;
        document.querySelector('.wrapper').innerHTML = inputTemplate;
        this.attachClickEvent();
    }
    /**
     * Attach click event on buttons and minesweeper cells
     * @returns void
     */
    attachClickEvent() {
        document.querySelector('.wrapper').addEventListener('click', (e) => {
            const target = e.target;
            if (target.id === 'ms-btn-play') {
                const rows = parseInt(this.getInputFieldValueById('ms-row'));
                const cols = parseInt(this.getInputFieldValueById('ms-col'));
                const mines = parseInt(this.getInputFieldValueById('ms-mines-count'));
                if (rows < 1 || cols < 1 || mines < 0) {
                    this.logData('Invalid inputs', 'error');
                }
                else if (rows * cols < mines) {
                    this.logData('Mines count cannot be greater than total cells.', 'error');
                }
                else {
                    this.constructMineGrid(rows, cols);
                    this.placeMines(rows, cols, mines);
                    this.mines = mines;
                    this.cols = cols;
                    this.rows = rows;
                    // disable the button
                    document.getElementById('ms-btn-play').disabled = true;
                }
            }
            else if (target.classList.contains('ms-cell')) {
                if (!this.gameReset) {
                    this.processCell(target);
                }
            }
        }, true);
    }
    /**
     * Check if user has clicked on bomb cell or on safe location
     * If location/cell is safe, show total count of mines in adjacent cell
     * @param target - Clicked cell
     */
    processCell(target) {
        if (!target.classList.contains('ms-cell-open')) {
            target.classList.add('ms-cell-open');
        }
        const row = parseInt(target.getAttribute('data-row'));
        const col = parseInt(target.getAttribute('data-col'));
        // Clicked on bomb. Show alert and reset game
        if (this.minePosition[row][col] === 1) {
            target.classList.add('ms-cell-bomb');
            this.logData('Game Over. You Lost the last match', 'error');
            this.gameReset = 1;
            document.getElementById('ms-btn-play').innerHTML = 'Play Again';
            // enable the button again
            document.getElementById('ms-btn-play').disabled = false;
        }
        // Acceptable cell is being clicked
        this.counter++;
        const maxRow = this.minePosition.length - 1;
        const maxCol = this.minePosition[0].length - 1;
        let totalMines = 0;
        if (row > 0) {
            totalMines += this.minePosition[row - 1][col];
        } // top
        if (row > 0 && col < maxCol) {
            totalMines += this.minePosition[row - 1][col + 1];
        } // top-right
        if (col < maxCol) {
            totalMines += this.minePosition[row][col + 1];
        } // right
        if (row < maxRow && col < maxCol) {
            totalMines += this.minePosition[row + 1][col + 1];
        } // bottom-right
        if (row < maxRow) {
            totalMines += this.minePosition[row + 1][col];
        } // bottom
        if (row < maxRow && col > 0) {
            totalMines += this.minePosition[row + 1][col - 1];
        } // bottom-left
        if (col > 0) {
            totalMines += this.minePosition[row][col - 1];
        } // left
        if (col > 0 && row > 0) {
            totalMines += this.minePosition[row - 1][col - 1];
        } // top-left
        target.innerHTML = totalMines;
        this.getGameStatus();
    }
    /**
     * Construct the mine sweeper grid and append in DOM
     * @param {number} rows - Rows of minesweeper game
     * @param {number} cols - Columns of minesweeper game
     * @returns void
     */
    constructMineGrid(rows, cols) {
        this.resetGame();
        let gameTemplate = document.createElement('table');
        gameTemplate.cellPadding = '0';
        gameTemplate.className = 'ms-play';
        let template = ``;
        for (let i = 0; i < rows; i++) {
            template += '<tr class="ms-game-row">';
            for (let j = 0; j < cols; j++) {
                template += `<td data-row="${i}" data-col="${j}" class="ms-cell"></td>`;
            }
            template += '</tr>';
        }
        gameTemplate.innerHTML = template;
        document.querySelector('.wrapper').appendChild(gameTemplate);
    }
    /**
     * Generate random pattern to place the mines in available grid
     * @param {number} rows - Rows of minesweeper game
     * @param {number} cols - Columns of minesweeper game
     * @param {number} mines - Number of mines
     * @returns void
     */
    placeMines(rows, cols, mines) {
        const totalCells = rows * cols;
        const arr = [...Array(totalCells).keys()];
        const mineLocationIndex = [];
        for (let i = 0; i < mines; i++) {
            const randomIndex = Math.floor(Math.random() * arr.length);
            mineLocationIndex.push(arr[randomIndex]);
            arr.splice(randomIndex, 1);
        }
        let index = 0;
        for (let i = 0; i < rows; i++) {
            this.minePosition[i] = [];
            for (let j = 0; j < cols; j++) {
                this.minePosition[i][j] = mineLocationIndex.includes(index) ? 1 : 0;
                index++;
            }
        }
    }
    /**
     * Log the passed data with class name
     * @param {string} data - Data for logging
     * @param {string} className - Class name
     * @returns void
     */
    logData(data, className = '') {
        const dataNode = document.createElement('div');
        if (className) {
            dataNode.classList.add(className);
        }
        dataNode.innerHTML = new Date().toLocaleTimeString() + ' - ' + data;
        document.querySelector('.logging').prepend(dataNode);
    }
    /**
     * Returns the value in the input field
     * @param {string} id - Id of input element
     * @returns {string} Value in the input field
     */
    getInputFieldValueById(id) {
        return document.getElementById(id).value;
    }
    getGameStatus() {
        if ((this.rows * this.cols) === (this.counter + this.mines)) {
            this.gameReset = 1;
            this.logData('Won the game!!!', 'won-game');
            document.getElementById('ms-btn-play').innerHTML = 'Play Again';
            // enable the button again
            document.getElementById('ms-btn-play').disabled = false;
        }
    }
    /**
     * Reset the game
     * @returns void
     */
    resetGame() {
        this.minePosition = [];
        this.counter = 0;
        this.mines = 0;
        this.gameReset = 0;
        document.getElementById('ms-btn-play').innerHTML = 'Play';
        document.querySelector('.logging').innerHTML = '';
        const msPlayDom = document.querySelector('.ms-play');
        if (document.contains(msPlayDom)) {
            msPlayDom.remove();
        }
    }
}
var game = new Minesweeper();
game.init();
