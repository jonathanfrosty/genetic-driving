class Moves {
    moves = [];

    constructor(data) {
        if(Array.isArray(data)) {
            this.moves = data;
        } else {
            for(let i = 0; i < data; i++) {
                this.moves.push(p5.Vector.random2D())
            }
        }
    }
}