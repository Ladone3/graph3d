import * as React from 'react';
import * as THREE from 'three';
import { Vector3d, Vector2d } from '../models/structures';
import { TemplateProvider } from '../customization';
import { GraphView } from './graph/graphView';
import { DiagramModel } from '../models/diagramModel';
import { WidgetsView } from './widgets/widgetsView';
import { WebGLRenderer } from '../vrUtils/webVr';
import { VrManager } from '../vrUtils/vrManager';
import { CSS3DRenderer } from '../utils/CSS3DRenderer';
import { Node } from '../models/graph/node';
import { Link } from '../models/graph/link';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
export interface ViewOptions<Descriptor extends GraphDescriptor> {
    nodeTemplateProvider?: TemplateProvider<Node<Descriptor>>;
    linkTemplateProvider?: TemplateProvider<Link<Descriptor>, Descriptor>;
}
export interface DiagramViewProps<Descriptor extends GraphDescriptor> {
    model: DiagramModel<Descriptor>;
    onViewMount?: (view: DiagramView<Descriptor>) => void;
    viewOptions?: ViewOptions<Descriptor>;
}
export interface CameraState {
    position: Vector3d;
    focusDirection?: Vector3d;
}
export declare const DEFAULT_CAMERA_DIST = 100;
export declare const DEFAULT_SCREEN_PARAMETERS: {
    VIEW_ANGLE: number;
    NEAR: number;
    FAR: number;
};
export declare class DiagramView<Descriptor extends GraphDescriptor> extends React.Component<DiagramViewProps<Descriptor>> {
    renderer: WebGLRenderer;
    overlayRenderer: CSS3DRenderer;
    graphView: GraphView<Descriptor>;
    widgetsView: WidgetsView<any, Descriptor>;
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;
    vrManager: VrManager<Descriptor>;
    screenParameters: {
        WIDTH: number;
        HEIGHT: number;
        VIEW_ANGLE: number;
        ASPECT: number;
        NEAR: number;
        FAR: number;
    };
    constructor(props: DiagramViewProps<Descriptor>);
    componentDidMount(): void;
    mouseTo3dPos(event: MouseEvent | TouchEvent, distanceFromScreen?: number): Vector3d;
    clientPosTo3dPos(position: Vector2d, distanceFromScreen?: number): Vector3d;
    pos3dToClientPos(position: Vector3d): Vector2d;
    cameraState: CameraState;
    resize(): void;
    private initScene;
    private initSubViews;
    private subscribeOnModel;
    renderGraph(): void;
    render(): JSX.Element;
}
