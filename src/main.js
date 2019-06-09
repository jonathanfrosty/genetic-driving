let track;

let currentPopulation;
let populationSize = 500;
let lifespan = 10000;

let lifeP;
let count = 0;
let generationP;
let generation = 0;
let mostLapsP;
let mostLaps = 0;
let keyP;

function setup() {
    collideDebug(true);
    createCanvas(windowWidth, windowHeight);
    background(0);
    track = new Track();
    currentPopulation = new Population(populationSize, lifespan);
    lifeP = createP().position(10, 10);
    generationP = createP().position(10, 30);
    mostLapsP = createP().position(10, 50).html("Most Laps: " + mostLaps);
    keyP = createP().position(10, height - 100);
}

function draw() {
    background(0);

    track.show(); 
    
    if(count >= lifespan || allCrashed()) {
        console.log("Farthest Checkpoint Reached: " + this.getFarthestCheckpointReached(currentPopulation));
        mostLaps = this.getMostLaps(currentPopulation);
        evolve();
    } else {
        currentPopulation.run();
    }

    lifeP.html("Lifetime: " + count + " / " + lifespan);
    generationP.html("Generation: " + generation);
    mostLapsP.html("Most Laps: " + mostLaps);
    keyP.html("<b>KEY</b><br><span id='blue'>Blue: unaltered</span><br><span id='green'>Green: crossover</span><br><span id='purple'>Purple: mutation</span><br><span id='red'>Red: crossover & mutation</span>")
    count++;
}

function allCrashed() {
    let allCrashed = true;

    for(let car of currentPopulation.cars) {
        if(!car.crashed) {
            allCrashed = false;
            break;
        }
    }

    return allCrashed;
}

function getMostLaps(population) {
    let cars = population.cars;
    let mostLapsValue = 0;

    for(let car of cars) {
        if(car.currentLapNumber - 1 > mostLapsValue) mostLapsValue = car.currentLapNumber - 1;
    }

    return mostLapsValue;
}

function getFarthestCheckpointReached(population) {
    let cars = population.cars;
    let bestCar = cars[0];

    for(let car of cars) {
        if(car.currentCheckpointNumber > bestCar.currentCheckpointNumber) bestCar = car;
    }

    return bestCar.currentCheckpointNumber;
}

function evolve() {
    let evolvedCars = [];

    while(evolvedCars.length != currentPopulation.cars.length) {
        let chosenCar = rouletteWheelSelection(currentPopulation);
        let partnerCar = getBestCar(currentPopulation.cars);

        let value = 0;
        let newCar = chosenCar;

        if(random() <= 0.1) {
            newCar = mutate(chosenCar);
            value += 1;            
        }
        if(random() <= 0.8) {
            newCar = crossover(newCar, partnerCar);
            value += 2;
        }

        if(value == 1) newCar.setColour('rgba(182, 32, 219, 0.6)'); // mutated - purple
        else if(value == 2) newCar.setColour('rgba(26, 204, 47, 0.6)');  // crossover - green
        else if(value == 3) newCar.setColour('rgba(219, 37, 37, 0.6)');  // both - red
        else newCar.setColour('rgba(22, 99, 224, 0.6)'); // neither - blue

        evolvedCars.push(chosenCar);
        evolvedCars.push(newCar);
    }

    currentPopulation = this.generateNewPopulation(evolvedCars);

    count = 0;
    generation++;
    
}

function generateNewPopulation(cars) {
    let newCars = [];

    for(let car of cars) {
        let newCar = new Car(car.moveset.moves, car.maxSpeed, car.maxForce);
        newCar.setColour(car.colour)
        newCars.push(newCar);
    }

    let newPopulation = new Population(newCars);

    return newPopulation;
}

function rouletteWheelSelection(population) {
    let cars = population.cars;

    let randomValue = random();
    let cumulativeFitnessProportion = 0;

    let chosenCar = cars[Math.round(Math.random() * (cars.length - 1))];

    for (let car of cars) {
        let fitnessProportion = car.getFitness() / population.getOverallFitness();
        cumulativeFitnessProportion += fitnessProportion;

        if (cumulativeFitnessProportion >= randomValue) {
            chosenCar = car;
            break;
        }
    }

    return chosenCar;
}

function getBestCar(cars) {
    let bestCar = cars[0];

    for(let car of cars) {
        if(car.getFitness() > bestCar.getFitness()) bestCar = car
    }

    return bestCar;
}

function crossover(chosen, partner) {
    let chosenMoves = chosen.moveset.moves;

    if(random() > 0.5) {
        let partnerMoves = partner.moveset.moves;
        let newMoves = [];
        let crossoverPoint = chosen.lifeLived;

        for(let i = 0; i < lifespan; i++) {
            if(i > crossoverPoint) newMoves[i] = chosenMoves[i];
            else newMoves[i] = partnerMoves[i];
        }

        return new Car(newMoves, chosen.maxSpeed, chosen.maxForce);
    }

    if(random() > 0.5) {
        let chosenMaxSpeed = chosen.maxSpeed;
        let partnerMaxSpeed = partner.maxSpeed;
    
        let average = (chosenMaxSpeed + partnerMaxSpeed) / 2;
    
        let newMaxSpeed = (random() > 0.5) ?
                average + (0.5 * Math.abs(chosenMaxSpeed - partnerMaxSpeed) * random() * 0.5) :
                average - (0.5 * Math.abs(chosenMaxSpeed - partnerMaxSpeed) * random() * 0.5);

        return new Car(chosenMoves, newMaxSpeed, chosen.maxForce)
    } else {
        let chosenMaxForce = chosen.maxForce;
        let partnerMaxForce = partner.maxForce;
    
        let average = (chosenMaxForce + partnerMaxForce) / 2;
    
        let newMaxForce = (Math.random() > 0.5) ?
                average + (0.5 * Math.abs(chosenMaxForce - partnerMaxForce) * random() * 0.5) :
                average - (0.5 * Math.abs(chosenMaxForce - partnerMaxForce) * random() * 0.5);
        
        return new Car(chosenMoves, chosen.maxSpeed, newMaxForce);
    }
}

function mutate(car) {
    let numberOfMutations = 10;

    let newCar;
    let newMoves = car.moveset.moves;

    if(random() > 0.3) {
        let lifeLived = car.lifeLived;
        let checkpointReached = car.currentCheckpointNumber + 1;

        let sigmoidal = this.calculateSigmoidalValue(checkpointReached);
        let value = floor(map(sigmoidal, 0, 1, lifeLived, numberOfMutations));
        let minimumIndex = lifeLived - value;
    
        for(let i = 0; i < numberOfMutations; i++) {
            let randomIndex = minimumIndex + floor(random(lifeLived - minimumIndex));
            newMoves[randomIndex] = p5.Vector.random2D().mult(random() > 0.5 ? 2 : -2);
        }        
        newCar = new Car(newMoves, car.maxSpeed, car.maxForce);
    } else {
        if(random() > 0.5) {
            let randomFactor = random() * 0.02 + 1;
            newCar = new Car(newMoves, car.maxSpeed * randomFactor, car.maxForce * randomFactor);
        } else {
            let randomFactor = 1 - random() * 0.02;
            newCar = new Car(newMoves, car.maxSpeed, car.maxForce * randomFactor);
        }        
    }

    newCar.lifeLived = car.lifeLived;

    return newCar;
}

function calculateSigmoidalValue(x) {
    let threshold = 1;
    let gain = 2;

    let difference = gain * max(x - threshold, 0);
    let sigmoidal = difference / (difference + 1);

    return sigmoidal;
}