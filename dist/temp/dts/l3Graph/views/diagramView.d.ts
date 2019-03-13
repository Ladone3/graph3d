/// <reference types="react" />
import * as React from 'react';
import * as THREE from 'three';
import { Vector3D, Vector2D } from '../models/primitives';
import { NodeTemplateProvider, LinkTemplateProvider } from '../templates';
import { GraphView } from './graphView';
import { DiagramModel } from '../models/diagramModel';
import { WidgetsView } from './widgetsView';
export interface ViewOptions {
    nodeTemplateProvider?: NodeTemplateProvider;
    linkTemplateProvider?: LinkTemplateProvider;
    simpleLinks?: boolean;
}
export interface DiagramViewProps {
    model: DiagramModel;
    onViewMount?: (view: DiagramView) => void;
    viewOptions?: ViewOptions;
}
export interface CameraState {
    position: Vector3D;
    focusDirection?: Vector3D;
}
export declare const DEFAULT_CAMERA_DIST = 100;
export declare class DiagramView extends React.Component<DiagramViewProps> {
    private renderer;
    private overlayRenderer;
    graphView: GraphView;
    widgetsView: WidgetsView;
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;
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
    mouseTo3dPos(event: MouseEvent, distanceFromScreen?: number): Vector3D;
    clientPosTo3dPos(position: Vector2D, distanceFromScreen?: number): Vector3D;
    cameraState: CameraState;
    private initScene();
    private initSubViews();
    private subscribeOnModel();
    renderGraph(): void;
    render(): JSX.Element;
}
