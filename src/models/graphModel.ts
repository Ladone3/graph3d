import { Node } from './node';
import { Link } from './link';
import { Subscribable } from '../utils/subscribeable';
import { Vectro3D } from './models';

export type Element = Node | Link;

export interface GraphData {
    nodes: Node[];
    links: Link[];
}

export function isNode(element: Element): element is Node {
    return element instanceof Node;
}

export function isLink(element: Element): element is Link {
    return element instanceof Link;
}

/**
 * @fires add:elements
 * @fires remove:elements
 * @fires change:camera-angle
 * @fires syncupdate
 */
export class GraphModel extends Subscribable {
    private nodes: Node[] = [];
    private links: Link[] = [];
    private cameraAngle: Vectro3D = { x: 0, y: 0, z: 0 };
    private animationFrame: number;
    private updatedObjects: any[] = [];

    public getCameraAngle() {
        return this.cameraAngle;
    }

    public setCameraAngle(anglePoint: Vectro3D) {
        this.cameraAngle = {
            x: anglePoint.x % (Math.PI * 2),
            y: Math.max(Math.min(anglePoint.y, Math.PI), 0),
            z: anglePoint.z % (Math.PI * 2),
        };
        this.trigger('change:camera-angle', this.cameraAngle);

        // console.log('================');
        // console.log(this.cameraAngle.x);
        // console.log(this.cameraAngle.y);
        // console.log(this.cameraAngle.z);
    }

    public getData() {
        return { nodes: this.nodes, links: this.links };
    }

    public setData(data: GraphData) {
        const oldElements: Element[] = (this.nodes as Element[]).concat(this.links);
        this.removeElements(oldElements);
        this.nodes = [];
        this.links = [];
        const newElements: Element[] = (data.nodes as Element[]).concat(data.links);
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
        }
    }

    private subscribeOnElement(element: Element) {
        if (isNode(element)) {
            element.on('change:position', eventObject => this.performSyncUpdate(eventObject));
            element.on('change:size', eventObject => this.performSyncUpdate(eventObject));
            element.on('change:label', eventObject => this.performSyncUpdate(eventObject));
        } else if (isLink(element)) {
            element.on('change:label', eventObject => this.performSyncUpdate(eventObject));
        }
    }

    private unsubscribeFromElement(element: Element) {
        // if (isNode(element)) {
        //     element.on('');
        // } else if (isLink(element)) {

        // }
    }

    public performSyncUpdate(object?: any) {
        if (object) {
            this.updatedObjects.push(object);
        }
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = requestAnimationFrame(() => {
            const eventObjects = this.updatedObjects;
            this.updatedObjects = [];
            this.trigger('syncupdate', eventObjects);
        });
    }
}
