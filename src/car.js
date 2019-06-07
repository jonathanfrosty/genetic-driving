class Car {
    r = 12;
    colour;

    pos = createVector(200, 175);
    vel = createVector();
    acc = createVector();

    moveset;
    maxSpeed;
    maxForce;

    lifeLived;    
    currentCheckpointNumber;
    currentLapNumber;
    crashed = false;

    constructor(data, maxSpeed=random(4) + 3, maxForce=random(5) + 3) {
        this.moveset = new Moves(data);
        
        this.maxSpeed = maxSpeed;
        this.maxForce = maxForce;
        this.lifeLived = 0;
        this.currentCheckpointNumber = -1;
        this.currentLapNumber = 1;
        this.colour = color('rgba(22, 99, 224, 0.6)')
    }

    applyForce(force) {
        this.acc.add(force);
    }

    checkCollision() {
        for(let edge of track.edges) {            
            if(collidePointLine(this.pos.x, this.pos.y, edge.start[0], edge.start[1], edge.finish[0], edge.finish[1], 0.2)) {
                this.crashed = true;
            }
            
            if(this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0) {
                this.crashed = true;
            }
        }
    }

    checkpointDetection() {
        for(let checkpoint of track.checkpoints) {                  
            if(collidePointLine(this.pos.x, this.pos.y, checkpoint.start[0], checkpoint.start[1], checkpoint.finish[0], checkpoint.finish[1], 0.5)) {
                if((this.currentCheckpointNumber + 1) % track.checkpoints.length == checkpoint.number) {
                    this.currentCheckpointNumber++;
                    if(checkpoint.number == track.checkpoints.length - 1) this.currentLapNumber++;
                    return checkpoint.number;                  
                }
            }            
        }
        return -1;
    }

    getFitness() {
        return Math.pow(this.currentCheckpointNumber, 2) + Math.pow(this.currentLapNumber, 2) + this.maxSpeed;
    }

    rotatePoint(x, y, degrees) {
        var newx = (x - this.pos.x) * cos(degrees * PI / 180) - (y - this.pos.y) * sin(degrees * PI / 180) + this.pos.x;
        var newy = (x - this.pos.x) * sin(degrees * PI / 180) + (y - this.pos.y) * cos(degrees * PI / 180) + this.pos.y;
        return [newx, newy];
    }

    show() {    
        let angle = this.vel.heading() + PI / 2;  

        push();

        translate(this.pos.x, this.pos.y);
        rotate(angle);

        fill(this.colour);
        noStroke();
        
        beginShape();
        vertex(0, -this.r);
        vertex(-this.r * 0.5, this.r);
        vertex(this.r * 0.5, this.r);
        endShape(CLOSE);

        pop();
    }

    setColour(colourString) {
        this.colour = color(colourString);
    }

    update() {
        if(!this.crashed) {
            let desired = p5.Vector.add(this.moveset.moves[count], this.vel);
            desired.setMag(this.maxSpeed);

            let steer = p5.Vector.sub(desired, this.vel);
            steer.limit(this.maxForce);
            
            this.applyForce(steer);        

            this.vel.add(this.acc);
            this.pos.add(this.vel);
            this.acc.mult(0);

            this.lifeLived++;
        }
    }
}