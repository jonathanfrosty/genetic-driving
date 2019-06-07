class Checkpoint {
    number;
    start;
    finish;

    constructor(start, finish) {
        this.start = start;
        this.finish = finish;
    }

    setNumber(number) {
        this.number = number
    }

    show() {
        push();
        stroke(200);
        strokeWeight(2);
        text(this.number, this.start[0], this.start[1])
        line(this.start[0], this.start[1], this.finish[0], this.finish[1]);
        pop();
    }
}