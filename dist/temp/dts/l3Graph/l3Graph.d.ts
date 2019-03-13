/// <reference types="react" />
import * as React from 'react';
import { ViewController, ViewControllersSet } from './controllers/viewController';
import { DiagramModel } from './models/diagramModel';
import { ViewOptions } from './views/diagramView';
import { Link } from './models/link';
import { Node } from './models/node';
import { Vector2D, Vector3D } from './models/primitives';
export interface GraphElements {
    nodes: Node[];
    links: Link[];
}
export interface L3GraphProps {
    elements: GraphElements;
    viewOptions?: ViewOptions;
    viewControllers?: ViewControllersSet;
    onComponentMount?: (graph: L3Graph) => void;
    onComponentUnmount?: (graph: L3Graph) => void;
}
export interface State {
    viewController?: ViewController;
}
export declare class L3Graph extends React.Component<L3GraphProps, State> {
    model: DiagramModel;
    private view;
    private keyHandler;
    private viewControllers;
    private mouseEditor;
    constructor(props: L3GraphProps);
    componentWillUpdate(props: L3GraphProps): void;
    viewController: ViewController;
    componentDidMount(): void;
    componentWillUnmount(): void;
    clientPosTo3dPos(position: Vector2D, distanceFromScreen?: number): Vector3D;
    pos3dToClientPos(position: Vector3D): Vector2D;
    private updateGraph(update);
    private merge(newGraphModel);
    private onWheel(e);
    private onMouseDown(event);
    private onOverlayDown(event);
    private onViewMount;
    private onFocus;
    private onBlur;
    private onKeyPressed;
    render(): JSX.Element;
}
