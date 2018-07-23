interface Priority {
  key: string;
  priority: number;
};

type Vertices = { [targetId: string]: number };
type VerticesMap = { [id: string]: Vertices };

class PriorityQueue {
  private nodes: Priority[] = [];

  public enqueue(priority: number, key: string): void {
    this.nodes.push({
      key: key,
      priority: priority,
    });
    this.sort();
  }

  public dequeue(): string {
    return this.nodes.shift().key;
  }

  public sort(): void {
    this.nodes.sort(function (a, b) {
      return a.priority - b.priority;
    });
  }

  public isEmpty(): boolean {
    return this.nodes.length === 0;
  }
}

/**
 * Pathfinding starts here
 */
export class Graph {
  private vertices: VerticesMap = {};

  public addVertex(id: string, edges: Vertices) {
    this.vertices[id] = edges;
  };

  public getVertex(id: string) {
    return this.vertices[id];
  };

  public shortestPath(start: string, finish: string, localRules?: VerticesMap): string[] {
    const getCost = (from: string, to: string) => {
      if (localRules && localRules[from] && localRules[from][to] !== undefined) {
        return localRules[from][to];
      } else {
        return this.vertices[from][to];
      }
    };

    const nodes = new PriorityQueue();
    const distances: Vertices = {};
    const previous: { [id: string]: string } = {};

    let path: string[] = [start];
    let smallest: string;
    let vertex, neighbor, alt;

    for (vertex in this.vertices) {
      if (this.vertices.hasOwnProperty(vertex)) {
        if (vertex === start) {
          distances[vertex] = 0;
          nodes.enqueue(0, vertex);
        } else {
          distances[vertex] = Infinity;
          nodes.enqueue(Infinity, vertex);
        }

        previous[vertex] = null;
      }
    }

    while (!nodes.isEmpty()) {
      smallest = nodes.dequeue();

      if (smallest === finish) {
        path = [start];

        while (previous[smallest]) {
          path.push(smallest);
          smallest = previous[smallest];
        }

        break;
      }

      if (!smallest || distances[smallest] === Infinity) {
        continue;
      }

      for (neighbor in this.vertices[smallest]) {
        if (this.vertices[smallest].hasOwnProperty(neighbor)) {
          alt = distances[smallest] + getCost(smallest, neighbor);

          if (alt < distances[neighbor]) {
            distances[neighbor] = alt;
            previous[neighbor] = smallest;

            nodes.enqueue(alt, neighbor);
          }
        }
      }
    }

    return path;
  };
}

// var g = new Graph();

// g.addVertex('A', { B: 7, C: 8 });
// g.addVertex('B', { A: 7, F: 2 });
// g.addVertex('C', { A: 8, F: 6, G: 4 });
// g.addVertex('D', { F: 8 });
// g.addVertex('E', { H: 1 });
// g.addVertex('F', { B: 2, C: 6, D: 8, G: 9, H: 3 });
// g.addVertex('G', { C: 4, F: 9 });
// g.addVertex('H', { E: 1, F: 3 });

// // Log test, with the addition of reversing the path and prepending the first node so it's more readable
// console.log(g.shortestPath('A', 'H').concat(['A']).reverse());