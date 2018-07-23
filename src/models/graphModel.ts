import { Node } from './node';
import { Link } from './link';
import { Subscribable, GraphEvent } from '../utils/subscribeable';
import { Vectro3D } from './models';
import { Polygon } from './polygon';

export type Element = Node | Link | Polygon;

export interface GraphData {
    nodes: Node[];
    links?: Link[];
    polygons?: Polygon[];
}

export function isNode(element: Element): element is Node {
    return element instanceof Node;
}

export function isLink(element: Element): element is Link {
    return element instanceof Link;
}

export function isPolygon(element: Element): element is Polygon {
    return element instanceof Polygon;
}

/**
 * @fires add:elements
 * @fires remove:elements
 * @fires change:camera-position
 * @fires syncupdate
 */
export class GraphModel extends Subscribable<GraphModel> {
    private nodes: Node[] = [];
    private links: Link[] = [];
    private polygons: Polygon[] = [];
    private cameraAngle: Vectro3D = { x: 0, y: 0, z: 0 };
    private cameraDistance: number = 100;
    private animationFrame: number;
    private events: any[] = [];

    public getCameraAngle() {
        return this.cameraAngle;
    }

    public setCameraAngle(anglePoint: Vectro3D) {
        this.cameraAngle = {
            x: anglePoint.x % (Math.PI * 2),
            y: Math.max(Math.min(anglePoint.y, Math.PI), 0),
            z: anglePoint.z % (Math.PI * 2),
        };
        this.trigger('change:camera-position');
    }

    public getCameraDistance() {
        return this.cameraDistance;
    }

    public setCameraDistance(distance: number) {
        this.cameraDistance = Math.max(0, distance);
        this.trigger('change:camera-position');
    }

    public getData() {
        return { nodes: this.nodes, links: this.links, polygons: this.polygons };
    }

    public setData(data: GraphData) {
        const oldElements: Element[] = [].concat(this.nodes).concat(this.links).concat(this.polygons);
        this.removeElements(oldElements);
        this.nodes = [];
        this.links = [];
        this.polygons = [];
        const newElements: Element[] = [].concat(data.nodes)
                                         .concat(data.links || [])
                                         .concat(data.polygons || []);
        this.addElements(newElements);
    }

    public addElement(element: Element) {
        this._addElement(element);
        this.trigger('add:elements', [element]);
    }

    public addElements(elements: Element[]) {
        for (let element of elements) {
            this._addElement(element);
        }
        this.trigger('add:elements', elements);
    }

    public removeElement(element: Element) {
        this.unsubscribeFromElement(element);

        if (isNode(element)) {
            this.nodes = this.nodes.filter(node => node.id !== element.id);
        } else if (isLink(element)) {
            this.links = this.links.filter(link => link.id !== element.id);
        }
        this.trigger('remove:elements', [element]);
    }

    public removeElements(elements: Element[]) {
        const elementsMap: { [id: string]: boolean } = {};
        for (let element of elements) {
            elementsMap[element.id] = true;
        }
        this.nodes = this.nodes.filter(node => !elementsMap[node.id]);
        this.links = this.links.filter(link => !elementsMap[link.id]);
        this.trigger('remove:elements', elements);
    }

    private _addElement(element: Element) {
        this.subscribeOnElement(element);

        if (isNode(element)) {
            this.nodes.push(element);
        } else if (isLink(element)) {
            this.links.push(element);
        } else if (isPolygon(element)) {
            this.polygons.push(element);
        }
    }

    private subscribeOnElement(element: Element) {
        if (isNode(element)) {
            element.on('change:position', event => this.performSyncUpdate(event));
            element.on('change:size', event => this.performSyncUpdate(event));
            element.on('change:label', event => this.performSyncUpdate(event));
        } else if (isLink(element)) {
            element.on('change:label', event => this.performSyncUpdate(event));
            element.on('change:geometry', event => this.performSyncUpdate(event));
        } else if (isPolygon(element)) {
            element.on('change:geometry', event => this.performSyncUpdate(event));
        }
    }

    private unsubscribeFromElement(element: Element) {
        // ...
    }

    public performSyncUpdate(event: GraphEvent) {
        this.events.push(event);
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = requestAnimationFrame(() => {
            const events = this.events;
            this.events = [];
            this.trigger('syncupdate', events);
        });
    }
}
