import * as THREE from 'three';

import { handleDragging, vector3DToTreeVector3, treeVector3ToVector3D } from '../utils';
import { Node } from '../models/node';
import { Selection } from '../models/selection';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { Vector3D, Vector2D } from '../models/primitives';

export class MouseEditor {
    private raycaster: THREE.Raycaster;
    private selection: Selection;

    constructor(
        private diagramhModel: DiagramModel,
        private diagramView: DiagramView,
    ) {
        this.raycaster = new THREE.Raycaster();
        this.selection = new Selection();
        this.diagramhModel.widgets.registerWidget(this.selection);
    }

    onMouseDown(event: MouseEvent) {
        const clickPoint = this.calcRay(event);
        const draggedNode = this.getIntersectedObject(clickPoint);
        const helperPlane = this.diagramView.helperPlane;
        if (draggedNode) {
            this.diagramView.helperPlane.position.copy(vector3DToTreeVector3(draggedNode.position));
            helperPlane.lookAt(this.diagramView.camera.position);
            this.selection.focusNode = draggedNode;
            this.diagramView.renderGraph();

            let planeIntersects = this.raycaster.intersectObject(helperPlane);
            const startPoint = new THREE.Vector3().copy(
                planeIntersects[0].point
            ).sub(helperPlane.position);

            handleDragging(event, (dragEvent, offset) => {
                helperPlane.position.copy(vector3DToTreeVector3(draggedNode.position));
                const newDirection = this.calcRay(dragEvent);

                this.raycaster.set(
                    this.diagramView.camera.position,
                    newDirection.sub(this.diagramView.camera.position).normalize(),
                );

                planeIntersects = this.raycaster.intersectObject(helperPlane);
                const curPoint = planeIntersects[0].point.sub(startPoint);
                draggedNode.position = treeVector3ToVector3D(curPoint);
            }, () => {
                this.selection.focusNode = undefined;
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
