import * as THREE from 'three';
import { DiagramElementView } from './diagramElementView';
import { WidgetsModel } from '../models/widgetsModel';
import { Widget } from '../models/widget';
export interface WidgetsViewProps {
    widgetsModel: WidgetsModel;
    scene: THREE.Scene;
}
export declare class WidgetsView {
    private props;
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    views: Map<string, DiagramElementView<any>>;
    renderer: THREE.WebGLRenderer;
    overlayRenderer: THREE.CSS3DRenderer;
    widgetsModel: WidgetsModel;
    meshHtmlContainer: HTMLElement;
    overlayHtmlContainer: HTMLElement;
    constructor(props: WidgetsViewProps);
    addWidgetView(widget: Widget): void;
    removeWidgetView(widget: Widget): void;
    private findViewForWidget(model);
    update(specificIds?: string[]): void;
}
