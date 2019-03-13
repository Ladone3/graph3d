import * as THREE from 'three';
import { GraphModel, Element } from '../models/graphModel';
import { DiagramElementView } from './diagramElementView';
import { NodeTemplateProvider, LinkTemplateProvider } from '../templates';
import { Subscribable } from '../utils';
export interface GraphViewProps {
    graphModel: GraphModel;
    scene: THREE.Scene;
    nodeTemplateProvider?: NodeTemplateProvider;
    linkTemplateProvider?: LinkTemplateProvider;
    simpleLinks?: boolean;
}
export interface GraphViewEvents {
    'click:overlay': {
        event: MouseEvent;
        target: Element;
    };
}
export declare class GraphView extends Subscribable<GraphViewEvents> {
    private props;
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    views: Map<string, DiagramElementView<Element>>;
    renderer: THREE.WebGLRenderer;
    overlayRenderer: THREE.CSS3DRenderer;
    graphModel: GraphModel;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;
    constructor(props: GraphViewProps);
    addElementView(element: Element): void;
    removeElementView(element: Element): void;
    private createNodeView(node);
    private createLinkView(link, group);
    update(specificIds: string[]): void;
}
