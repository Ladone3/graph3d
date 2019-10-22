import * as THREE from 'three';
import * as React from 'react';

import { Link } from '../../models/graph/link';
import { LinkViewTemplate, DEFAULT_LINK_OVERLAY, enrichOverlay } from '../../customisation';
import {
    multiply,
    sum,
    distance,
} from '../../utils';
import { Vector3D } from '../../models/structures';
import { AbstractOverlayAnchor } from './overlayAnchor';
import { LinkRouter, getPointAlongPolylineByRatio } from '../../utils/linkRouter';
import { DiagramElementView } from '../viewInterface';

const ARROW_LENGTH = 10;

export class LinkView implements DiagramElementView {
    public readonly mesh: THREE.Group;
    public readonly overlayAnchor: LinkOverlayAnchor;
    public polyline: Vector3D[] = [];

    private lines: THREE.Group[];

    private arrowGeometry: THREE.Geometry;
    private arrowMaterial: THREE.MeshBasicMaterial;
    private arrow: THREE.Mesh;
    private boundingBox: THREE.Box3;

    constructor(
        public readonly model: Link,
        public readonly router: LinkRouter,
        private template: LinkViewTemplate,
    ) {
        this.model = model;

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
        this.lines = [];

        // Overlay
        this.overlayAnchor = new LinkOverlayAnchor(this.model, this);
        if (this.model.data) {
            this.overlayAnchor.setOverlay(enrichOverlay(DEFAULT_LINK_OVERLAY, this.model.data), 'c');
        }

        this.update();
    }

    // Not implemented yet
    public getBoundingBox(): THREE.Box3 {
        return this.boundingBox;
    }

    public update() {
        const polyline = this.router.getRout(this.model);
        const lineNumber = polyline.length - 1;

        if (this.lines.length !== lineNumber) {
            for (const line of this.lines) {
                this.mesh.remove(line);
            }
            for (let i = 0; i < lineNumber; i++) {
                const line = createLine(this.template);
                this.lines.push(line);
                this.mesh.add(line);
            }
        }

        this.lines.forEach((line, index) => {
            stretchLineBetween(line, polyline[index], polyline[index + 1]);
        });

        const endPoint = polyline[polyline.length - 1];
        const perEndPoint = polyline[polyline.length - 2];
        const lastSegment = [perEndPoint, endPoint];
        const arrowPosition = getPointAlongPolylineByRatio(lastSegment, 0.5);
        this.arrow.position.set(arrowPosition.x, arrowPosition.y, arrowPosition.z);
        this.arrow.lookAt(endPoint.x, endPoint.y, endPoint.z);
        this.arrow.rotateX(Math.PI / 2);
        this.polyline = polyline;

        // Update overlay
        if (this.overlayAnchor) {
            this.overlayAnchor.update();
        }
    }
}

export class LinkOverlayAnchor extends AbstractOverlayAnchor<Link, LinkView> {
    getModelFittingBox() {
        const polyline = this.meshView.polyline;
        if (polyline.length > 0) {
            const endPoint = polyline[polyline.length - 1];
            const perEndPoint = polyline[polyline.length - 2];
            const lastSegment = [perEndPoint, endPoint];
            const {x, y, z} = getPointAlongPolylineByRatio(lastSegment, 0.5);
            return {x, y, z, width: 0, height: 0, deep: 0};
        } else {
            return {x: 0, y: 0, z: 0, width: 0, height: 0, deep: 0};
        }
    }

    protected overlayedGroup = (props: any) => {
        return <div
            key={`overlay-group-${props.position}`}
            className={`l3g-link-html-overlay l3g-position-${props.position}`}>
            <div className='l3g-link-html-overlay__body'>
                {props.children}
            </div>
        </div>;
    }
}

// It's implemented this way because:
// 1 - lines can't have thikness on Windows OS,
// 2 - There is bug with lines when they are too close to the camera
// There is simpleLinkView.ts - you can check the behavior
function createLine(template: LinkViewTemplate): THREE.Group {
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

function stretchLineBetween(line: THREE.Group, from: Vector3D, to: Vector3D) {
    const mediana = multiply(sum(from, to), 0.5);
    const dist = distance(from, to);

    line.position.set(mediana.x, mediana.y, mediana.z);
    line.lookAt(to.x, to.y, to.z);
    line.rotateY(Math.PI / 2);
    line.scale.set(dist, 1, 1);
}
