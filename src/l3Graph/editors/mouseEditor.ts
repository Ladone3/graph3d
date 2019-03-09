import * as THREE from 'three';

import { handleDragging, vector3DToTreeVector3, treeVector3ToVector3D } from '../utils';
import { Node } from '../models/node';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { Vector2D } from '../models/primitives';
import { ArrowHelper } from '../models/arrowHelper';
import { Element } from '../models/graphModel';

const WHEEL_SPEED = 0.25;

export class MouseEditor {
    private raycaster: THREE.Raycaster;
    private arrowHelper: ArrowHelper;

    constructor(
        private diagramhModel: DiagramModel,
        private diagramView: DiagramView,
    ) {
        this.raycaster = new THREE.Raycaster();
        this.arrowHelper = new ArrowHelper();
        this.diagramhModel.widgets.registerWidget(this.arrowHelper);
    }

    onMouseDown(event: MouseEvent) {
        const clickPoint = this.calcRay(event);
        const draggedNode = this.getIntersectedObject(clickPoint);
        if (draggedNode) {
            const nodeTreePos = vector3DToTreeVector3(draggedNode.position);
            const cameraPos = this.diagramView.camera.position;
            let distanceToNode = nodeTreePos.distanceTo(cameraPos);

            this.diagramhModel.selection = new Set<Element>([draggedNode]);
            this.arrowHelper.focusNode = draggedNode;

            const onWheel = (wheelEvent: Event) => {
                const e = wheelEvent as MouseWheelEvent;
                distanceToNode -= (e.deltaX || e.deltaY || e.deltaZ) * WHEEL_SPEED;
                wheelEvent.stopPropagation();
                draggedNode.position = this.diagramView.mouseTo3dPos(e, distanceToNode);
            };
            document.body.addEventListener('mousewheel', onWheel);

            handleDragging(event, (dragEvent) => {
                draggedNode.position = this.diagramView.mouseTo3dPos(dragEvent, distanceToNode);
            }, () => {
                this.arrowHelper.focusNode = undefined;
                document.body.removeEventListener('mousewheel', onWheel);
            });

            return false;
        }
        return true;
    }

    private getIntersectedObject(viewDirection: THREE.Vector3): Node | undefined {
        const meshes: THREE.Object3D[] = [];
        const nodeMeshMap: Node[] = [];

        this.diagramhModel.nodes.forEach(node => {
            const nodeView = this.diagramView.graphView.views.get(node.id);

            if (nodeView.mesh) {
                if (nodeView.mesh instanceof THREE.Group) {
                    for (const obj of nodeView.mesh.children) {
                        meshes.push(obj);
                        nodeMeshMap.push(node);
                    }
                } else {
                    meshes.push(nodeView.mesh);
                    nodeMeshMap.push(node);
                }
            }
            if (nodeView.overlay) {
                meshes.push(nodeView.overlay);
                nodeMeshMap.push(node);
            }
        });

        this.raycaster.set(
            this.diagramView.camera.position,
            viewDirection.sub(this.diagramView.camera.position).normalize()
        );
        const intersects = this.raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const selectedMesh = intersects[0].object;
            const index = meshes.indexOf(selectedMesh);
            return nodeMeshMap[index];
        }
    }

    calcRay(event: MouseEvent): THREE.Vector3 {
        const view = this.diagramView;
        const bbox = view.meshHtmlContainer.getBoundingClientRect();
        const position: Vector2D = {
            x: event.clientX - bbox.left,
            y: event.clientY - bbox.top,
        };
        const screenParameters = view.screenParameters;
        const vector = new THREE.Vector3(
            (position.x / screenParameters.WIDTH) * 2 - 1,
            1 - (position.y / screenParameters.HEIGHT) * 2,
            1
        );
        return vector.unproject(view.camera);
    }
}
