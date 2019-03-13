import * as THREE from 'three';
import { Link } from '../models/link';
import { DiagramElementView } from './diagramElementView';
import { LinkViewTemplate } from '../templates';
import { LinkGroup } from '../models/graphModel';
export declare class LinkView implements DiagramElementView<Link> {
    readonly model: Link;
    readonly group: LinkGroup;
    readonly mesh: THREE.Group;
    readonly overlay: THREE.CSS3DObject | null;
    private readonly lines;
    private htmlOverlay;
    private htmlBody;
    private arrowGeometry;
    private arrowMaterial;
    private arrow;
    private boundingBox;
    constructor(model: Link, group: LinkGroup, customTemplate?: LinkViewTemplate);
    getBoundingBox(): THREE.Box3;
    update(): void;
    private createLine(template);
    private stretchLineBetween(line, from, to);
}
