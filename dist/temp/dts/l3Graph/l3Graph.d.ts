import * as React from 'react';
import { ViewController, ViewControllersSet } from './controllers/viewController';
import { DiagramModel } from './models/diagramModel';
import { ViewOptions } from './views/diagramView';
import { Vector2d, Vector3d } from './models/structures';
import { WidgetFactory, Widget } from './models/widgets/widget';
import { Node } from './models/graph/node';
import { OverlayPosition } from './views/graph/overlayAnchor';
import { ReactOverlay } from './customization';
import { GraphDescriptor } from './models/graph/graphDescriptor';
export interface L3GraphProps<Descriptor extends GraphDescriptor> {
    viewOptions?: ViewOptions<Descriptor>;
    viewControllers?: ViewControllersSet<Descriptor>;
    onComponentMount?: (graph: L3Graph<Descriptor>) => void;
    onComponentUnmount?: (graph: L3Graph<Descriptor>) => void;
}
export declare class L3Graph<Descriptor extends GraphDescriptor> extends React.Component<L3GraphProps<Descriptor>> {
    private diagramModel;
    private view;
    private keyHandler;
    private gamepadHandler;
    private mouseHandler;
    private viewControllers;
    private viewController;
    private defaultEditor;
    private gamepadEditor;
    constructor(props: L3GraphProps<Descriptor>);
    readonly model: DiagramModel<Descriptor>;
    resize(): void;
    getViewControllers(): ReadonlyArray<ViewController>;
    getViewController(): ViewController;
    setViewController(viewController: ViewController): void;
    attachOverlayToNode(node: Node<Descriptor>, overlay: ReactOverlay<Node<Descriptor>>, position: OverlayPosition): void;
    removeOverlayFromNode(node: Node<Descriptor>, overlayId: string): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    clientPosTo3dPos(position: Vector2d, distanceFromScreen?: number): Vector3d;
    pos3dToClientPos(position: Vector3d): Vector2d;
    private onViewMount;
    private configureViewControllers;
    private onFocus;
    private onBlur;
    registerWidget<CustomWidget extends Widget>(widgetResolver: WidgetFactory<CustomWidget, Descriptor>): void;
    removeWidget(widgetId: string): void;
    render(): JSX.Element;
}
