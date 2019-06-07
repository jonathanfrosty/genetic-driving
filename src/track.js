class Track {
    outerPoints = [[100, 100], [width - 100, 100], [width - 100, height - 100], [100, height - 100]];
    innerPoints = [[250, 250], [width - 250, 250], [width - 250, height - 250], [250, height - 250]];
    edges = [];
    checkpoints = [];
    checkpointsPerEdge = 3;

    constructor() {
        for(let i = 0; i < this.outerPoints.length && i < this.innerPoints.length; i++) {
            this.edges.push(new Edge(this.outerPoints[i], this.outerPoints[(i + 1) % this.outerPoints.length]));
            this.edges.push(new Edge(this.innerPoints[i], this.innerPoints[(i + 1) % this.innerPoints.length]));            
        }

        this.generateCheckpoints();
    }

    show() {
        push();
        stroke(229, 39, 22);
        strokeWeight(3);
        beginShape();

        // Exterior part of shape, clockwise winding
        for(let point of this.outerPoints) {
            vertex(point[0], point[1]);
        }

        // Interior part of shape, counter-clockwise winding
        beginContour();

        for(let i = this.innerPoints.length - 1; i >= 0; i--) {
            vertex(this.innerPoints[i][0], this.innerPoints[i][1]);
        }

        endContour();

        endShape(CLOSE);
        pop();

        for(let checkpoint of this.checkpoints) {
            checkpoint.show();
        }
    }

    getIntervals(edge, totalIntervals) {
        let edgeIntervals = [];
        for(let i = 1; i <= totalIntervals; i++) {
            let interval = i / totalIntervals;
            let x = edge.start[0] + interval * (edge.finish[0] - edge.start[0]);
            let y = edge.start[1] + interval * (edge.finish[1] - edge.start[1]);
            edgeIntervals.push([x, y]);
        }

        return edgeIntervals;
    }

    generateCheckpoints() {
        for(let i = 0; i < this.edges.length; i += 2) {
            let outerEdge = this.edges[i];
            let innerEdge = this.edges[i + 1];

            let outerEdgeIntervals = this.getIntervals(outerEdge, this.checkpointsPerEdge)     

            let innerEdgeIntervals = this.getIntervals(innerEdge, this.checkpointsPerEdge)

            for(let l = 0; l < outerEdgeIntervals.length && l < innerEdgeIntervals.length; l++) {
                let start = outerEdgeIntervals[l];
                let finish = innerEdgeIntervals[l];
                this.checkpoints.push(new Checkpoint(start, finish));
            }
        }

        for(let i = 0; i < this.checkpoints.length; i++) {
            this.checkpoints[i].number = i;
        }
    }
}