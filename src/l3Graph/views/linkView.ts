import * as THREE from 'three';
import { Link } from '../models/link';
import { DiagramElementView } from './diagramElementView';
import { LinkViewTemplate, DEFAULT_LINK_TEMPLATE } from '../templates';
import { vector3DToTreeVector3 } from '../utils';

export class LinkView implements DiagramElementView<Link> {
    public readonly model: Link;
    public readonly mesh: THREE.Object3D;
    public readonly overlay: THREE.CSS3DObject | null;

    private readonly lineMesh: THREE.Object3D;

    private htmlOverlay: HTMLElement;
    private htmlBody: HTMLElement;

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

        // It's implemented this way because:
        // 1 - lines can't have thikness on Windows OS,
        // 2 - There is bug with lines when they are too close to the camera
        // There is simpleLinkView.ts - you can check the behavior
        const lineGeometry1 = new THREE.PlaneGeometry(1, 0.5 * template.thickness, 1, 1);
        const lineMaterial1 = new THREE.MeshBasicMaterial({color: template.color, side: THREE.DoubleSide});
        const line1 = new THREE.Mesh(lineGeometry1, lineMaterial1);
        const line2 = new THREE.Mesh(lineGeometry1, lineMaterial1);
        line2.rotateX(Math.PI / 2);

        this.lineMesh = new THREE.Group();
        this.lineMesh.add(line1);
        this.lineMesh.add(line2);

        this.arrowGeometry = new THREE.ConeGeometry(2, 10, 4);
        this.arrowMaterial = new THREE.MeshBasicMaterial({color: template.color});
        this.arrow = new THREE.Mesh(
            this.arrowGeometry,
            this.arrowMaterial,
        );

        this.mesh = new THREE.Group();
        this.mesh.add(this.lineMesh);
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
        const dist = vector3DToTreeVector3(sourcePos).distanceTo(vector3DToTreeVector3(targetPos));

        const position = vector3DToTreeVector3({
            x: (sourcePos.x + targetPos.x) / 2,
            y: (sourcePos.y + targetPos.y) / 2,
            z: (sourcePos.z + targetPos.z) / 2,
        });

        const lookAtPostion = {
            x: targetPos.x + 0.00001,
            y: targetPos.y + 0.00001,
            z: targetPos.z + 0.00001,
        };
        this.arrow.position.copy(position);
        this.arrow.lookAt(lookAtPostion.x, lookAtPostion.y, lookAtPostion.z);
        this.arrow.rotateX(Math.PI / 2);

        this.lineMesh.position.copy(position);
        this.lineMesh.lookAt(lookAtPostion.x, lookAtPostion.y, lookAtPostion.z);
        this.lineMesh.rotateY(Math.PI / 2);
        this.lineMesh.scale.set(dist, 1, 1);

        // Update overlay
        if (this.overlay) {
            this.overlay.position.copy(position);
        }
    }

    // private calculateVertices(
    //     source: Vector3D,
    //     target: Vector3D,
    // ): THREE.Vector3[] {
    //     return [
    //         new THREE.Vector3(source.x, source.y, source.z),
    //         new THREE.Vector3(target.x, target.y, target.z),
    //     ];
    // }
}
