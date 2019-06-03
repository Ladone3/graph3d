import * as THREE from 'three';
import { Link } from '../models/link';
import { DiagramElementView } from './diagramElementView';
import { LinkViewTemplate, DEFAULT_LINK_TEMPLATE } from '../customisation';
import {
    vector3DToTreeVector3,
    normalize,
    multiply,
    sum,
    sub,
    normalRight,
    normalUp,
    inverse,
    distance,
} from '../utils';
import { LinkGroup } from '../models/graphModel';
import { Vector3D } from '../models/primitives';

const LINK_OFFSET = 30;
const ARROW_LENGTH = 10;

export class LinkView implements DiagramElementView<Link> {
    public readonly model: Link;
    public readonly group: LinkGroup;
    public readonly mesh: THREE.Group;
    public readonly overlay: THREE.CSS3DObject | null;

    private readonly lines: THREE.Group[];

    private htmlOverlay: HTMLElement;
    private htmlBody: HTMLElement;

    private arrowGeometry: THREE.Geometry;
    private arrowMaterial: THREE.MeshBasicMaterial;
    private arrow: THREE.Mesh;
    private boundingBox: THREE.Box3;

    constructor(
        model: Link,
        group: LinkGroup,
        customTemplate?: LinkViewTemplate,
    ) {
        this.model = model;
        this.group = group;
        const template: LinkViewTemplate = {
            ...DEFAULT_LINK_TEMPLATE,
            ...customTemplate,
        };

        this.boundingBox = new THREE.Box3();

        // Mesh
        this.mesh = new THREE.Group();
        this.arrowGeometry = new THREE.ConeGeometry(2, ARROW_LENGTH, 4);
        this.arrowMaterial = new THREE.MeshBasicMaterial({color: template.color});
        this.arrow = new THREE.Mesh(
            this.arrowGeometry,
            this.arrowMaterial,
        );
        this.mesh.add(this.arrow);
        if (group.links.length > 1) {
            this.lines = [this.createLine(template), this.createLine(template)];
            this.mesh.add(this.lines[0]);
            this.mesh.add(this.lines[1]);
        } else {
            this.lines = [this.createLine(template)];
            this.mesh.add(this.lines[0]);
        }

        // Overlay
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
        const mediana = multiply(sum(sourcePos, targetPos), 0.5);

        let overlayPosition: Vector3D;
        if (this.lines.length === 1) {
            this.stretchLineBetween(this.lines[0], sourcePos, targetPos);
            overlayPosition = mediana;
            this.arrow.position.set(mediana.x, mediana.y, mediana.z);
            this.arrow.lookAt(targetPos.x, targetPos.y, targetPos.z);
            this.arrow.rotateX(Math.PI / 2);
        } else {
            const linkIndex = this.group.links.indexOf(this.model);
            const groupSize = this.group.links.length;
            const inverseDirection = this.model.source.id === this.group.targetId;
            const angle = (2 * Math.PI / groupSize) * (linkIndex + 1);
            // Calculate the kink point
            const originalDirection = normalize(sub(sourcePos, targetPos));
            const direction = inverseDirection ? inverse(originalDirection) : originalDirection;
            const dirRight = normalRight(direction);
            const dirUp = normalUp(direction);
            const offsetDir = normalize(sum(
                multiply(dirRight, Math.cos(angle)),
                multiply(dirUp, Math.sin(angle)),
            ));
            const offset = multiply(offsetDir, groupSize > 1 ? LINK_OFFSET : 0);
            const kinkPoint = sum(mediana, offset);
            // Move arrow
            this.arrow.position.set(kinkPoint.x, kinkPoint.y, kinkPoint.z);
            // Stretch lines
            this.stretchLineBetween(
                this.lines[0],
                sourcePos,
                kinkPoint,
            );
            this.stretchLineBetween(
                this.lines[1],
                kinkPoint,
                targetPos,
            );
            // Orient arrow
            const mediana2 = multiply(sum(kinkPoint, targetPos), 0.5);
            this.arrow.position.set(mediana2.x, mediana2.y, mediana2.z);
            this.arrow.lookAt(targetPos.x, targetPos.y, targetPos.z);
            this.arrow.rotateX(Math.PI / 2);
            // Set overlay position
            overlayPosition = kinkPoint;
        }

        // Update overlay
        if (this.overlay) {
            this.overlay.position.set(overlayPosition.x, overlayPosition.y, overlayPosition.z);
        }
    }

    // It's implemented this way because:
    // 1 - lines can't have thikness on Windows OS,
    // 2 - There is bug with lines when they are too close to the camera
    // There is simpleLinkView.ts - you can check the behavior
    private createLine(template: LinkViewTemplate): THREE.Group {
        const lineGeometry = new THREE.PlaneGeometry(1, 0.5 * template.thickness, 1, 1);
        const lineMaterial = new THREE.MeshBasicMaterial({color: template.color, side: THREE.DoubleSide});
        const line1 = new THREE.Mesh(lineGeometry, lineMaterial);
        const line2 = new THREE.Mesh(lineGeometry, lineMaterial);
        line2.rotateX(Math.PI / 2);

        const lineMesh = new THREE.Group();
        lineMesh.add(line1);
        lineMesh.add(line2);

        return lineMesh;
    }

    private stretchLineBetween(line: THREE.Group, from: Vector3D, to: Vector3D) {
        const mediana = multiply(sum(from, to), 0.5);
        const dist = distance(from, to);

        line.position.set(mediana.x, mediana.y, mediana.z);
        line.lookAt(to.x, to.y, to.z);
        line.rotateY(Math.PI / 2);
        line.scale.set(dist, 1, 1);
    }
}
