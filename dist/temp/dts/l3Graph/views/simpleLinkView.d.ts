import * as THREE from 'three';
import { Link } from '../models/link';
import { DiagramElementView } from './diagramElementView';
import { LinkViewTemplate } from '../templates';
export declare class SimpleLinkView implements DiagramElementView<Link> {
    readonly model: Link;
    readonly mesh: THREE.Object3D;
    readonly overlay: THREE.CSS3DObject | null;
    private htmlOverlay;
    private htmlBody;
    private lineGeometry;
    private lineMaterial;
    private line;
    private arrowGeometry;
    private arrowMaterial;
    private arrow;
    private boundingBox;
    constructor(model: Link, customTemplate?: LinkViewTemplate);
    getBoundingBox(): THREE.Box3;
    update(): void;
    private calculateVertices(source, target);
}
