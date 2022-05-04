class App {
    // **************変更可能な設定************************************
    FIELD_WIDTH = 15; //フィールド全体の幅 : (壁を含むブロックの数）
    FIELD_HEIGHT = 31; //フィールド全体の高さ : (壁を含むブロックの数）
    CELL_SIZE = 20; //セル1個の辺の長さ（px）
    CELL_MARGIN = 1; //セルとセルの間の幅（px）
    MARGIN_TOP = 2; //上端からの余白(px)
    MARGIN_LEFT = 2; //左端からの余白(px)
    CELL_COLOR = {
        EMPTY: "#eee", //空白のセルの色
        FILLED: "#000", //壁の色
        // それぞれのミノの色
        S: "blue",
        T: "orange",
        I: "#55f",
        L: "#f55",
        J: "#5f5",
        O: "#555",
    };
    // ミノの生成位置
    DEFAULT_MINO_POSITION = {
        X: 5,
        Y: 3,
    };
    // *****************************************************************
    FIELD_CELL_STATE = {
        EMPTY: -1,
        FILLED: 0,
    };
    MINO_HEIGHT = 4;
    MINO_WIDTH = 4;
    constructor() {
        this.mino = MINO.S;
        this.mino_type = "S";
        this.rotate_state = 0;
        this.mino_y = this.DEFAULT_MINO_POSITION.Y;
        this.mino_x = this.DEFAULT_MINO_POSITION.X;
    }
    main() {
        this.initAll();
        this.drawAll();
    }
    initAll() {
        this.assertColorImplement();
        this.initCanvas();
        this.initStates();
        this.connectEvents();
        this.startAutoDown();
    }
    initCanvas() {
        this.$canvas = document.getElementById("canvas");
        this.ctx = this.$canvas.getContext("2d");
    }
    initStates() {
        this.initEmptyFieldStates();
        this.initFieldWallStates();
    }
    initEmptyFieldStates() {
        this.field_states = new Array(this.FIELD_HEIGHT);
        for (let yi = 0; yi < this.FIELD_HEIGHT; yi++) {
            this.field_states[yi] = new Array(this.FIELD_WIDTH).fill(
                this.FIELD_CELL_STATE.EMPTY
            );
        }
    }
    initFieldWallStates() {
        for (let yi = 0; yi < this.FIELD_HEIGHT; yi++) {
            this.field_states[yi][0] = this.FIELD_CELL_STATE.FILLED;
            this.field_states[yi][this.FIELD_WIDTH - 1] =
                this.FIELD_CELL_STATE.FILLED;
        }
        for (let xi = 0; xi < this.FIELD_WIDTH; xi++) {
            this.field_states[this.FIELD_HEIGHT - 1][xi] =
                this.FIELD_CELL_STATE.FILLED;
        }
    }
    assertColorImplement() {
        for (let typ of MINO_TYPES) {
            if (!this.CELL_COLOR[typ]) {
                throw new Error(`MINO_TYPE:${typ}の色が定義されていません。`);
            }
        }
    }
    startAutoDown() {
        this.intervalID = setInterval(() => {
            this.moveDown();
        }, 1000);
    }
    connectEvents() {
        addEventListener("keydown", (e) => {
            switch (e.key) {
                case "d":
                case "ArrowRight":
                    this.moveRight();
                    break;
                case "a":
                case "ArrowLeft":
                    this.moveLeft();
                    break;
                case "w":
                case "ArrowUp":
                    this.rotateMino();
                    break;
                case "s":
                case "ArrowDown":
                    this.moveDown();
                    break;
                case " ":
                    this.hardDrop();
                    break;
                default:
                    break;
            }
        });
    }
    moveRight() {
        ++this.mino_x;
        if (this.hitCheck()) {
            --this.mino_x;
        }
        this.drawAll();
    }
    moveLeft() {
        --this.mino_x;
        if (this.hitCheck()) {
            ++this.mino_x;
        }
        this.drawAll();
    }
    moveDown() {
        ++this.mino_y;
        if (this.hitCheck()) {
            --this.mino_y;
            this.respawn();
            return;
        }
        this.drawAll();
    }
    rotateMino() {
        this.rotate_state = (this.rotate_state + 1) % 4;
        if (this.hitCheck()) {
            this.rotate_state = (this.rotate_state + 3) % 4;
        }
        this.drawAll();
    }
    // ハードドロップ(ミノが一番下まで落ちる)
    hardDrop() {
        while (!this.hitCheck()) {
            ++this.mino_y;
        }
        --this.mino_y;
        this.respawn();
    }
    respawn() {
        this.fixMinoToField();
        this.deleteFilledLines();
        this.respawnMino();
        this.drawAll();
    }
    fixMinoToField() {
        for (let yi = 0; yi < this.MINO_HEIGHT; yi++) {
            for (let xi = 0; xi < this.MINO_WIDTH; xi++) {
                if (this.mino[this.rotate_state][yi][xi] === 0) {
                    continue;
                }
                const y = this.mino_y + yi;
                const x = this.mino_x + xi;
                this.field_states[y][x] = this.FIELD_CELL_STATE.FILLED;
            }
        }
    }
    deleteFilledLines() {
        for (let yi = 0; yi < this.FIELD_HEIGHT - 1; yi++) {
            let is_filled = true;
            for (let xi = 1; xi < this.FIELD_WIDTH - 1; xi++) {
                if (this.field_states[yi][xi] === this.FIELD_CELL_STATE.EMPTY) {
                    is_filled = false;
                    break;
                }
            }
            if (is_filled) {
                this.removeSingleLine(yi);
            }
        }
    }
    removeSingleLine(line_number) {
        for (let yi = line_number; yi > 0; yi--) {
            for (let xi = 1; xi < this.FIELD_WIDTH - 1; xi++) {
                this.field_states[yi][xi] = this.field_states[yi - 1][xi];
            }
        }
    }
    respawnMino() {
        this.resetMinoType();
        this.resetMinoPosition();
        this.resetMinoRotation();
        if (this.hitCheck()) {
            this.gameOver();
        }
    }
    gameOver() {
        this.clearFieldStates();
        alert("GAME OVER");
    }
    resetMinoPosition() {
        this.mino_y = this.DEFAULT_MINO_POSITION.Y;
        this.mino_x = this.DEFAULT_MINO_POSITION.X;
    }
    resetMinoRotation() {
        this.rotate_state = 0;
    }
    resetMinoType() {
        this.mino = this.getRandomMino();
    }
    getRandomMino() {
        const random_index = Math.floor(Math.random() * MINO_TYPES_LENGTH);
        const random_type = MINO_TYPES[random_index];
        this.mino_type = random_type;
        return MINO[random_type];
    }

    // 壁の内側を全部消す
    clearFieldStates() {
        for (let yi = 0; yi < this.FIELD_HEIGHT - 1; yi++) {
            for (let xi = 1; xi < this.FIELD_WIDTH - 1; xi++) {
                this.field_states[yi][xi] = this.FIELD_CELL_STATE.EMPTY;
            }
        }
    }

    drawAll() {
        this.drawField();
        this.drawMino();
    }

    drawField() {
        for (let yi = 0; yi < this.FIELD_HEIGHT; yi++) {
            for (let xi = 0; xi < this.FIELD_WIDTH; xi++) {
                if (
                    this.field_states[yi][xi] === this.FIELD_CELL_STATE.FILLED
                ) {
                    this.drawCell(yi, xi, this.CELL_COLOR.FILLED);
                    continue;
                }
                if (this.field_states[yi][xi] === this.FIELD_CELL_STATE.EMPTY) {
                    this.drawCell(yi, xi, this.CELL_COLOR.EMPTY);
                    continue;
                }
            }
        }
    }
    drawMino() {
        for (let yi = 0; yi < this.MINO_HEIGHT; yi++) {
            for (let xi = 0; xi < this.MINO_WIDTH; xi++) {
                if (this.mino[this.rotate_state][yi][xi] === 0) {
                    continue;
                }
                const y = this.mino_y + yi;
                const x = this.mino_x + xi;
                const mino_color = this.CELL_COLOR[this.mino_type];
                this.drawCell(y, x, mino_color);
            }
        }
    }
    drawCell(yi, xi, color) {
        this.ctx.fillStyle = color;
        const y = (yi + this.MARGIN_TOP) * (this.CELL_SIZE + this.CELL_MARGIN);
        const x = (xi + this.MARGIN_LEFT) * (this.CELL_SIZE + this.CELL_MARGIN);
        this.ctx.fillRect(x, y, this.CELL_SIZE, this.CELL_SIZE);
    }
    hitCheck() {
        for (let yi = 0; yi < this.MINO_HEIGHT; yi++) {
            for (let xi = 0; xi < this.MINO_WIDTH; xi++) {
                if (this.mino[this.rotate_state][yi][xi] === 0) {
                    continue;
                }
                const y = this.mino_y + yi;
                const x = this.mino_x + xi;
                if (this.field_states[y][x] === this.FIELD_CELL_STATE.FILLED) {
                    return true;
                }
            }
        }
        return false;
    }
}

const MINO = {
    S: [
        // 0deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0],
        ],
        // 90deg
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0],
        ],
        // 180deg
        [
            [0, 0, 0, 0],
            [0, 0, 1, 1],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        // 270deg
        [
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 0],
        ],
    ],
    T: [
        // 0deg
        [
            [0, 1, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        // 90deg
        [
            [0, 1, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
        ],
        // 180deg
        [
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
        ],
        // 270deg
        [
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
        ],
    ],
    I: [
        // 0deg
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ],
        // 90deg
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
        ],
        // 180deg
        [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
        ],
        // 270deg
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
    ],
    L: [
        // 0deg
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        // 90deg
        [
            [0, 0, 0, 0],
            [0, 0, 1, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        // 180deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
        ],
        // 270deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 1],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
        ],
    ],
    J: [
        // 0deg
        [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        // 90deg
        [
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 0],
        ],
        // 180deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ],
        // 270deg
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 1],
            [0, 0, 0, 0],
        ],
    ],
    O: [
        // 0deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        // 90deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        // 180deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        // 270deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
    ],
};
const MINO_TYPES = Object.keys(MINO);
const MINO_TYPES_LENGTH = MINO_TYPES.length;
const app = new App();
app.main();
