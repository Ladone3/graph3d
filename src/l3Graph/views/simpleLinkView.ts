import * as THREE from 'three';
import { Link } from '../models/link';
import { Vector3D } from '../models/primitives';
import { DiagramElementView } from './diagramElementView';
import { LinkViewTemplate, DEFAULT_LINK_TEMPLATE } from '../customisation';
import { vector3DToTreeVector3 } from '../utils';

export class SimpleLinkView implements DiagramElementView<Link> {
    public readonly model: Link;
    public readonly mesh: THREE.Object3D;
    public readonly overlay: THREE.CSS3DObject | null;

    private htmlOverlay: HTMLElement;
    private htmlBody: HTMLElement;

    private lineGeometry: THREE.Geometry;
    private lineMaterial: THREE.LineBasicMaterial;
    private line: THREE.Line;

    private arrowGeometry: THREE.Geometry;
    private arrowMaterial: THREE.MeshBasicMaterial;
    private arrow: THREE.Mesh;
    private boundingBox: THREE.Box3;

    constructor(model: Link, customTemplate?: LinkViewTemplate) {
        this.model = model;
        const template: LinkViewTemplate = {
            ...DEFAULT_LINK_TEMPLATE,
            ...customTemplate,
        };

        this.boundingBox = new THREE.Box3();
        this.lineGeometry = new THREE.Geometry();
        this.lineMaterial = new THREE.LineBasicMaterial({color: template.color});
        this.line = new THREE.Line(this.lineGeometry, this.lineMaterial);

        this.arrowGeometry = new THREE.ConeGeometry(2, 10, 4);
        this.arrowMaterial = new THREE.MeshBasicMaterial({color: template.color});
        this.arrow = new THREE.Mesh(
            this.arrowGeometry,
            this.arrowMaterial,
        );

        this.mesh = new THREE.Group();
        this.mesh.add(this.line);
        this.mesh.add(this.arrow);

        if (this.model.label) {
            this.htmlOverlay = document.createElement('DIV');
            this.htmlOverlay.className = 'o3d-link-html-container';

            this.htmlBody = document.createElement('DIV');
            this.htmlBody.className = 'o3d-link-html-view';
            this.htmlOverlay.appendChild(this.htmlBody);
            this.htmlBody.innerText = this.model.label;

            this.overlay = new THREE.CSS3DSprite(this.htmlOverlay);
        } else {
            this.overlay = null;
        }

        this.update();
    }

    // Not implemented yet
    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        const sourcePos = this.model.source.position;
        const targetPos = this.model.target.position;
        this.lineGeometry.vertices = this.calculateVertices(sourcePos, targetPos);
        this.lineGeometry.verticesNeedUpdate = true;

        const dist = vector3DToTreeVector3(sourcePos).distanceTo(vector3DToTreeVector3(targetPos));

        const position = vector3DToTreeVector3({
            x: (sourcePos.x + targetPos.x) / 2,
            y: (sourcePos.y + targetPos.y) / 2,
            z: (sourcePos.z + targetPos.z) / 2,
        });

        this.arrow.position.copy(position);
        this.arrow.lookAt(targetPos.x + 0.00001, targetPos.y + 0.00001, targetPos.z + 0.00001);
        this.arrow.rotateX(Math.PI / 2);

        // Update overlay
        if (this.overlay) {
            this.overlay.position.copy(position);
        }
    }

    private calculateVertices(
        source: Vector3D,
        target: Vector3D,
    ): THREE.Vector3[] {
        return [
            new THREE.Vector3(source.x, source.y, source.z),
            new THREE.Vector3(target.x, target.y, target.z),
        ];
    }
}
