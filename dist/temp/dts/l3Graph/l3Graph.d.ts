import * as React from 'react';
import { ViewController, ViewControllersSet } from './controllers/viewController';
import { DiagramModel } from './models/diagramModel';
import { ViewOptions } from './views/diagramView';
import { Vector2d, Vector3d } from './models/structures';
import { WidgetFactory } from './models/widgets/widget';
import { Node } from './models/graph/node';
import { OverlayPosition } from './views/graph/overlayAnchor';
import { ReactOverlay } from './customisation';
export interface L3GraphProps {
    viewOptions?: ViewOptions;
    viewControllers?: ViewControllersSet;
    onComponentMount?: (graph: L3Graph) => void;
    onComponentUnmount?: (graph: L3Graph) => void;
}
export declare class L3Graph extends React.Component<L3GraphProps> {
    private diagramModel;
    private view;
    private keyHandler;
    private gamepadHandler;
    private mouseHandler;
    private viewControllers;
    private viewController;
    private defaultEditor;
    private gamepadEditor;
    constructor(props: L3GraphProps);
    readonly model: DiagramModel;
    resize(): void;
    setViewController(viewController: ViewController): void;
    attachOverlayToNode(node: Node, overlay: ReactOverlay, position: OverlayPosition): void;
    removeOverlayFromNode(node: Node, overlayId: string): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    clientPosTo3dPos(position: Vector2d, distanceFromScreen?: number): Vector3d;
    pos3dToClientPos(position: Vector3d): Vector2d;
    private onViewMount;
    private configureViewControllers;
    private onFocus;
    private onBlur;
    registerWidget(widgetResolver: WidgetFactory): void;
    removeWidget(widgetId: string): void;
    render(): JSX.Element;
}
