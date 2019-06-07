import * as THREE from 'three';
import { Link } from '../models/link';
import { Node } from '../models/node';
import { Widget } from '../models/widgets';
import { DiagramModel } from '../models/diagramModel';
import { KeyHandler } from '../utils';
import { MouseHandler } from '../utils/mouseHandler';

export interface View {
    readonly mesh: THREE.Object3D | null;
    readonly overlay: THREE.CSS3DObject | null;
    getBoundingBox(): THREE.Box3;
    update(): void;
}

export interface DiagramElementView extends View {
    model: Node | Link;
}

export interface DiagramWidgetView<WidgetModel extends Widget = any> extends View {
    model: WidgetModel;
}

export * from './arrowHelperView';
export * from './diagramView';
export * from './graphView';
export * from './linkView';
export * from './nodeView';
export * from './reactNodeWidgetView';
export * from './selectionView';
export * from './simpleLinkView';
export * from './widgetsView';
