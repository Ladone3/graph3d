import * as THREE from 'three';
import { GraphModel, Element, isNode, isLink, LinkGroup } from '../models/graphModel';
import { DiagramElementView } from './diagramElementView';
import { NodeView } from './nodeView';
import { LinkView } from './linkView';
import {
    NodeTemplateProvider,
    DEFAULT_NODE_TEMPLATE_PROVIDER,
    LinkTemplateProvider,
    DEFAULT_LINK_TEMPLATE_PROVIDER,
} from '../templates';
import { SimpleLinkView } from './simpleLinkView';
import { Subscribable } from '../utils';
import { Node } from '../models/node';
import { Link } from '../models/link';

export interface GraphViewProps {
    graphModel: GraphModel;
    scene: THREE.Scene;
    nodeTemplateProvider?: NodeTemplateProvider;
    linkTemplateProvider?: LinkTemplateProvider;
    simpleLinks?: boolean;
}

export interface GraphViewEvents {
    'click:overlay': {event: MouseEvent; target: Element};
}

export class GraphView extends Subscribable<GraphViewEvents> {
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    views: Map<string, DiagramElementView<Element>>;

    renderer: THREE.WebGLRenderer;
    overlayRenderer: THREE.CSS3DRenderer;
    graphModel: GraphModel;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;

    constructor(private props: GraphViewProps) {
        super();
        this.views = new Map();
        this.scene = props.scene;
        this.graphModel = props.graphModel;
        this.graphModel.nodes.forEach(node => this.addElementView(node));
        this.graphModel.links.forEach(link => this.addElementView(link));
    }

    public addElementView(element: Element) {
        const elementViewExists = this.views.get(element.id);
        if (elementViewExists) {
            return; // We already have view for this element
        }
        let view: DiagramElementView<Element>;
        if (isNode(element)) {
            view = this.createNodeView(element);
        } else {
            const group = this.graphModel.getGroup(element);
            view = this.createLinkView(element, group);
        }
        if (view) {
            const mesh = view.mesh;
            if (mesh) {
                this.scene.add(mesh);
            }
            const overlay = view.overlay;
            if (overlay) {
                const htmlElement: HTMLElement = overlay.element.firstChild;
                htmlElement.addEventListener('mousedown', (event: Event) => {
                    this.trigger('click:overlay', {event: event as MouseEvent, target: element});
                });
                this.scene.add(overlay);
            }
            this.views.set(element.id, view);
        }
    }

    public removeElementView(element: Element) {
        const view = this.views.get(element.id);
        if (view) {
            if (view.mesh) {
                this.scene.remove(view.mesh);
            }

            if (view.overlay) {
                this.scene.remove(view.overlay);
            }
        }
        this.views.delete(element.id);
    }

    private createNodeView(node: Node): DiagramElementView<Node> {
        const templateProvider =  this.props.nodeTemplateProvider || DEFAULT_NODE_TEMPLATE_PROVIDER;
        return new NodeView(node, templateProvider(node.types));
    }

    private createLinkView(link: Link, group: LinkGroup): DiagramElementView<Link> | undefined {
        const templateProvider = this.props.linkTemplateProvider || DEFAULT_LINK_TEMPLATE_PROVIDER;
        if (this.props.simpleLinks) {
            return new SimpleLinkView(link, templateProvider(link.types));
        } else {
            return new LinkView(
                link,
                group,
                templateProvider(link.types),
            );
        }
    }

    update(specificIds: string[]) {
        // const selection = this
        const updateView = (elementId: string) => {
            if (this.graphModel.fullUpdateList.has(elementId)) {
                const element = this.graphModel.getElementById(elementId);
                this.removeElementView(element);
                this.addElementView(element);
            }
            const view = this.views.get(elementId);
            if (view) { // View is added asynchronously
                view.update();
            }
        };
        if (!specificIds) {
            specificIds = [];
            this.views.forEach(view => {
                specificIds.push(view.model.id);
            });
        }
        for (const id of specificIds) {
            updateView(id);
        }
        this.graphModel.fullUpdateList.clear();
    }
}
