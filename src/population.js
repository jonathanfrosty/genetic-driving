class Population {
    cars = [];

    constructor(data, lifespan) {
        if(lifespan == undefined) this.cars = data;
        else {
            for(let i = 0; i < data; i++) {
                this.cars.push(new Car(lifespan));
            }
        }
    }

    run() {
        for(let car of this.cars) {
            car.update();
            car.show();
            car.checkCollision();
            car.checkpointDetection();            
        }
    }

    getOverallFitness() {
        let overallFitness = 0;

        for(let car of this.cars) {
            overallFitness += car.getFitness();
        }

        return overallFitness;
    }  
}