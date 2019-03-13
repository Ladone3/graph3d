import * as React from 'react';
import * as THREE from 'three';
import { Vector3d, Vector2d } from '../models/structures';
import { NodeTemplateProvider, LinkTemplateProvider } from '../customisation';
import { GraphView } from './graph/graphView';
import { DiagramModel } from '../models/diagramModel';
import { WidgetsView } from './widgets/widgetsView';
import { WebGLRenderer } from '../vrUtils/webVr';
import { VrManager } from '../vrUtils/vrManager';
import { CSS3DRenderer } from '../utils/CSS3DRenderer';
export interface ViewOptions {
    nodeTemplateProvider?: NodeTemplateProvider;
    linkTemplateProvider?: LinkTemplateProvider;
}
export interface DiagramViewProps {
    model: DiagramModel;
    onViewMount?: (view: DiagramView) => void;
    viewOptions?: ViewOptions;
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
export declare class DiagramView extends React.Component<DiagramViewProps> {
    renderer: WebGLRenderer;
    overlayRenderer: CSS3DRenderer;
    graphView: GraphView;
    widgetsView: WidgetsView;
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;
    vrManager: VrManager;
    screenParameters: {
        WIDTH: number;
        HEIGHT: number;
        VIEW_ANGLE: number;
        ASPECT: number;
        NEAR: number;
        FAR: number;
    };
    constructor(props: DiagramViewProps);
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
