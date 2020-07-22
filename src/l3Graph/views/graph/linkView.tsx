import * as THREE from 'three';
import * as React from 'react';

import { Link } from '../../models/graph/link';
import { LinkViewTemplate, DEFAULT_LINK_OVERLAY, enrichOverlay } from '../../customization';
import { multiply, sum, distance, vector3dToTreeVector3 } from '../../utils';
import { Vector3d } from '../../models/structures';
import { AbstractOverlayAnchor, OverlayPosition } from './overlayAnchor';
import { LinkRouter, getPointAlongPolylineByRatio } from '../../utils/linkRouter';
import { View } from '../viewInterface';
import { AbstractOverlayAnchor3d, applyOffset } from './overlay3DAnchor';
import { Rendered3dSprite } from '../../utils/htmlToSprite';
import { SELECTION_PADDING } from '../widgets/selectionView';
import { GraphDescriptor } from '../../models/graph/graphDescriptor';

const ARROW_LENGTH = 10;

export class LinkView<Descriptor extends GraphDescriptor> implements View<Link<Descriptor>> {
    public readonly mesh: THREE.Group;
    public readonly overlayAnchor: LinkOverlayAnchor<Descriptor>;
    public readonly overlayAnchor3d: LinkOverlayAnchor3d<Descriptor>;
    public polyline: Vector3d[] = [];

    private lines: THREE.Group[];

    private arrowGeometry: THREE.Geometry;
    private arrowMaterial: THREE.MeshBasicMaterial;
    private arrow: THREE.Mesh;
    private boundingBox: THREE.Box3;

    constructor(
        public readonly model: Link<Descriptor>,
        public readonly router: LinkRouter<Descriptor>,
        private template: LinkViewTemplate<Descriptor>,
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
            this.overlayAnchor.setOverlay(enrichOverlay(
                DEFAULT_LINK_OVERLAY as any,
                this.model
            ), 'c');
        }

        this.overlayAnchor3d = new LinkOverlayAnchor3d(this.model, this, this.overlayAnchor);

        this.update();
    }

    // todo: check if we need this kind of functionality in API
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
        this.overlayAnchor.update();
        this.overlayAnchor3d.update();
}
}

// It is not completed, but for now it's enough
export class LinkOverlayAnchor<Descriptor extends GraphDescriptor> extends
AbstractOverlayAnchor<Link<Descriptor>, LinkView<Descriptor>> {
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

// The same here
export class LinkOverlayAnchor3d<Descriptor extends GraphDescriptor> extends
AbstractOverlayAnchor3d<Link<Descriptor>, LinkView<Descriptor>> {
    forceUpdate() {
        this.meshModel.forceUpdate();
    }

    updatePosition() {
        const fittingBox = this.overlayAnchor.getModelFittingBox();
        this.mesh.position.copy(vector3dToTreeVector3(fittingBox));
    }

    placeSprites(renderedSprites: Rendered3dSprite[]) {
        const spritesByPositions = new Map<OverlayPosition, Rendered3dSprite[]>();
        for (const renderedSprite of renderedSprites) {
            if (!spritesByPositions.has(renderedSprite.position)) {
                spritesByPositions.set(renderedSprite.position, []);
            }
            spritesByPositions.get(renderedSprite.position).push(renderedSprite);
        }

        const fittingBox = this.overlayAnchor.getModelFittingBox();
        const initialOffset = {
            x: fittingBox.x / 2 + SELECTION_PADDING,
            y: fittingBox.y / 2 + SELECTION_PADDING,
            z: 0,
        };
        spritesByPositions.forEach((sprites, position) => {
            let offset = applyOffset({x: 0, y: 0, z: 0}, initialOffset, position);
            for (const renderedSprite of sprites) {
                renderedSprite.sprite.position.set(
                    offset.x, 
                    offset.y, 
                    offset.z, 
                )
                offset = applyOffset(offset, {
                    x: SELECTION_PADDING + renderedSprite.size.x,
                    y: SELECTION_PADDING + renderedSprite.size.y,
                    z: 0,
                }, position);
            }
        });
    }
}

// It's implemented this way because:
// 1 - lines can't have thikness on Windows OS,
// 2 - There is bug with lines when they are too close to the camera
// There is simpleLinkView.ts - you can check the behavior
function createLine<Descriptor extends GraphDescriptor>(template: LinkViewTemplate<Descriptor>): THREE.Group {
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

function stretchLineBetween(line: THREE.Group, from: Vector3d, to: Vector3d) {
    const mediana = multiply(sum(from, to), 0.5);
    const dist = distance(from, to);

    line.position.set(mediana.x, mediana.y, mediana.z);
    line.lookAt(to.x, to.y, to.z);
    line.rotateY(Math.PI / 2);
    line.scale.set(dist, 1, 1);
}
