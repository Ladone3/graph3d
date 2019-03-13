import * as THREE from 'three';
import { Link } from '../models/link';
import { DiagramElementView } from './diagramElementView';
import { LinkViewTemplate } from '../templates';
export declare class LinkView implements DiagramElementView<Link> {
    readonly model: Link;
    readonly mesh: THREE.Object3D;
    readonly overlay: THREE.CSS3DObject | null;
    private readonly lineMesh;
    private htmlOverlay;
    private htmlBody;
    private arrowGeometry;
    private arrowMaterial;
    private arrow;
    private boundingBox;
    constructor(model: Link, customTemplate?: LinkViewTemplate);
    getBoundingBox(): THREE.Box3;
    update(): void;
}
