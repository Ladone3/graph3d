import * as THREE from 'three';
import { Link } from '../models/link';
import { Vector3D } from '../models/primitives';
import { DiagramElementView } from './diagramElementView';
import { LinkViewTemplate } from '../templates';
import { vector3DToTreeVector3 } from '../utils/utils';

export const LINE_COLOR = 0x0000ff;

export class LinkView implements DiagramElementView {
    private model: Link;
    private template: LinkViewTemplate;

    private lineGeometry: THREE.Geometry;
    private lineMaterial: THREE.LineBasicMaterial;
    private line: THREE.Line;

    private arrowGeometry: THREE.Geometry;
    private arrowMaterial: THREE.MeshBasicMaterial;
    private arrow: THREE.Mesh;

    private group: THREE.Object3D;

    private boundingBox: THREE.Box3;

    constructor(model: Link, template?: LinkViewTemplate) {
        this.model = model;
        this.template = template;
        this.init();
    }

    public getMesh(): THREE.Object3D {
        return this.group;
    }

    public getOverlay(): THREE.CSS3DObject | undefined {
        return undefined;
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

        const position = vector3DToTreeVector3({
            x: (sourcePos.x + targetPos.x) / 2,
            y: (sourcePos.y + targetPos.y) / 2,
            z: (sourcePos.z + targetPos.z) / 2,
        });
        this.arrow.position.copy(position);

        this.arrow.lookAt(targetPos.x + 0.00001, targetPos.y + 0.00001, targetPos.z + 0.00001);
        this.arrow.rotateX(Math.PI / 2);
    }

    private init() {
        this.boundingBox = new THREE.Box3();
        this.lineGeometry = new THREE.Geometry();
        this.lineMaterial = new THREE.LineBasicMaterial({color: LINE_COLOR});
        this.line = new THREE.Line(this.lineGeometry, this.lineMaterial);

        this.arrowGeometry = new THREE.ConeGeometry(2, 10, 4);
        this.arrowMaterial = new THREE.MeshBasicMaterial({color: LINE_COLOR});
        this.arrow = new THREE.Mesh(
            this.arrowGeometry,
            this.arrowMaterial,
        );

        this.group = new THREE.Group();
        this.group.add(this.line);
        this.group.add(this.arrow);

        this.update();
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
