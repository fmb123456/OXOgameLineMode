let Player1 = "0.1701104454 0.2538713120 0.3708350128 0.6028518572 1.8858873041 0.1877097248 0.4618886377 0.8376597179 1.6070491037";
let Player2 = "0.1701104454 0.2538713120 0.3708350128 0.6028518572 1.8858873041 0.1877097248 0.4618886377 0.8376597179 1.6070491037";
let dep = 3;
let imgNumber = 2;
//use "random" to get a random AI
class Board {
    constructor() {
        this.game = new Game();
        this.undoTimes = 2;
        document.querySelector(".big").addEventListener("click", e => {
            var target = e.target;
            if (target.matches(".Oavl") || target.matches(".Xavl"))
                this.move(target);
        });
        for (let [i, small] of[...document.querySelectorAll(".small")].entries()) {
            small.classList.add("s" + i);
            for (let [j, grid] of[...small.querySelectorAll(".grid")].entries()) {
                grid.classList.add("g" + i + j), grid.idx = [i, j];
            }
        }
    }
    move(target) {
        var idx = target.idx;
        var p;
        if (target.matches(".Oavl"))
            p = "O";
        else
            p = "X";
        target.classList.add(p);
        if (this.game.move(idx))
            target.closest(".small").classList.add(p);
        this.addHistory(idx, p);
        this.updateScreen();
    }
    updateScreen() {
        for (let grid of document.querySelectorAll(".Oavl"))
            grid.classList.remove("Oavl");
        for (let grid of document.querySelectorAll(".Xavl"))
            grid.classList.remove("Xavl");
        var p = this.game.cur_player === 1 ? "O" : "X";
        var avl = [...this.game.valid_moves()];
        if (avl.length) {
            for (let idx of avl)
                document.querySelector(".g" + idx.join("")).classList.add(p + "avl");
            document.querySelector("#top").className = p;
        } else {
            let winner = this.game.winner;
            if (winner)
                document.querySelector("#top").className = (winner === 1 ? "O" : "X") + "win";
            else
                document.querySelector("#top").className = "draw";
        }
        document.dispatchEvent(new Event("nextTurn"));
    }
    reset() {
        for (let node of[...document.querySelectorAll("#history>p")])
            node.parentNode.removeChild(node);
        for (let node of[...document.querySelectorAll(".O")])
            node.classList.remove("O");
        for (let node of[...document.querySelectorAll(".X")])
            node.classList.remove("X");
        this.game.reset();
        this.updateScreen();
    }
    undo() {
        for (let i = 0; i < this.undoTimes; ++i) {
            if (!this.game.history.length) break;
            var idx = this.game.history[this.game.history.length - 1];
            var big_change = this.game.undo();
            var p = this.game.cur_player === 1 ? "O" : "X";
            document.querySelector(".g" + idx.join("")).classList.remove(p);
            if (big_change)
                document.querySelector(".s" + idx[0]).classList.remove(p);
            var history = [...document.querySelectorAll("#history>p")];
            var del = history[history.length - 1];
            del.parentNode.removeChild(del);
        }
        this.updateScreen();
    }
    addHistory(idx, p) {
        var node = document.createElement("p");
        node.innerHTML = `${p}: ${idx.join()}`;
        document.querySelector("#history").appendChild(node);
    }
}
let board = new Board();
let p1 = new Player(Player1);
let p2 = new Player(Player2);
let bg = document.querySelector(".bg");
bg.style.backgroundImage = `url('images/oil${Math.floor(Math.random() * imgNumber) + 1}.jpg')`;

function p1Check() {
    if (!board.game.finish && board.game.cur_player === 1) {
        let idx = p1.best_move(board.game, dep);
        let target = document.querySelector(".g" + idx.join(""));
        board.move(target);
    }
}

function p2Check() {
    if (!board.game.finish && board.game.cur_player === -1) {
        let idx = p2.best_move(board.game, dep);
        let target = document.querySelector(".g" + idx.join(""));
        board.move(target);
    }
}

function setEventListener(useP1 = false, useP2 = true) {
    if (useP1 === true && useP2 === true) {
        alert("幹嘛? 不給, 選別的");
        return;
    }
    document.removeEventListener("nextTurn", p1Check);
    document.removeEventListener("nextTurn", p2Check);
    if (useP1)
        document.addEventListener("nextTurn", p1Check);
    if (useP2)
        document.addEventListener("nextTurn", p2Check);
    board.reset();
}
document.querySelector("#undo").onclick = function(e) { board.undo(); };
document.querySelector("#reset").onclick = function(e) { board.reset(); };
document.querySelector("select").onchange = function(e) {
    var choice = e.target.value;
    if (choice === "pvp") setEventListener(false, false), board.undoTimes = 1;
    else if (choice === "pvc") setEventListener(false, true), board.undoTimes = 2;
    else if (choice === "cvp") setEventListener(true, false), board.undoTimes = 2;
    else if (choice === "cvc") setEventListener(true, true);
};
setEventListener();
board.updateScreen();