import * as THREE from 'three';
import { GraphModel, Element } from '../../models/graph/graphModel';
import { NodeTemplateProvider, LinkTemplateProvider } from '../../customisation';
import { Subscribable } from '../../utils';
import { LinkRouter } from '../../utils/linkRouter';
import { DiagramElementView } from '../viewInterface';
import { VrManager } from '../../vrUtils/vrManager';
import { AbstracrOverlayAnchor3d } from './overlay3DAnchor';
export interface GraphViewProps {
    graphModel: GraphModel;
    vrManager: VrManager;
    onAdd3dObject: (object: THREE.Object3D) => void;
    onRemove3dObject: (object: THREE.Object3D) => void;
    nodeTemplateProvider?: NodeTemplateProvider;
    linkTemplateProvider?: LinkTemplateProvider;
    simpleLinks?: boolean;
}
export interface GraphViewEvents {
    'overlay:down': {
        event: MouseEvent | TouchEvent;
        target: Element;
    };
}
export declare class GraphView extends Subscribable<GraphViewEvents> {
    private props;
    views: Map<string, DiagramElementView>;
    anchors3d: Set<AbstracrOverlayAnchor3d<any, any>>;
    graphModel: GraphModel;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;
    linkRouter: LinkRouter;
    private vrManager;
    constructor(props: GraphViewProps);
    registerElement(element: Element): DiagramElementView;
    removeElementView(element: Element): void;
    private onAdd3dObject;
    private onRemove3dObject;
    private createNodeView;
    private createLinkView;
    update(specificIds: string[]): void;
}
