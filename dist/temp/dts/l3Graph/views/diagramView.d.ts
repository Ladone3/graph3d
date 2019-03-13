import * as React from 'react';
import { Vector3d } from '../models/structures';
import { TemplateProvider } from '../customization';
import { GraphView } from './graph/graphView';
import { DiagramModel } from '../models/diagramModel';
import { WidgetsView } from './widgets/widgetsView';
import { Subscribable } from '../utils';
import { Node } from '../models/graph/node';
import { Link } from '../models/graph/link';
import { DragHandlerEvents } from '../input/dragHandler';
import { Core } from '../core';
export interface ViewOptions {
    nodeTemplateProvider?: TemplateProvider<Node>;
    linkTemplateProvider?: TemplateProvider<Link>;
}
export interface DiagramViewProps {
    model: DiagramModel;
    core: Core;
    onViewMount?: (view: DiagramView) => void;
    viewOptions?: ViewOptions;
    dragHandlers?: Subscribable<DragHandlerEvents>[];
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
    private highlighter;
    private dragHandlers;
    core: Core;
    graphView: GraphView;
    widgetsView: WidgetsView<any>;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;
    constructor(props: DiagramViewProps);
    componentDidMount(): void;
    componentDidUpdate(): void;
    private initSubViews;
    private subscribeOnModel;
    private subscribeOnHandlers;
    render(): JSX.Element;
}
