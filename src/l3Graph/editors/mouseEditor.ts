import * as THREE from 'three';

import { handleDragging, vector3DToTreeVector3, treeVector3ToVector3D } from '../utils';
import { Node } from '../models/node';
import { Selection } from '../models/selection';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';

export class MouseEditor {
    private raycaster: THREE.Raycaster;
    private helperPlane: THREE.Mesh;
    private selection: Selection;

    constructor(
        private diagramhModel: DiagramModel,
        private diagramView: DiagramView,
    ) {
        this.raycaster = new THREE.Raycaster();
        this.helperPlane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(500, 500, 8, 8),
            new THREE.MeshBasicMaterial({alphaTest: 0, visible: false}),
        );
        this.diagramView.scene.add(this.helperPlane);
        this.selection = new Selection();
        this.diagramhModel.widgets.registerWidget(this.selection);
    }

    onMouseDown(event: MouseEvent) {
        const viewDirection = this.getViewDirection(event);
        const draggedNode = this.getIntersectedObject(viewDirection);

        if (draggedNode) {
            this.helperPlane.position.copy(vector3DToTreeVector3(draggedNode.position));
            this.helperPlane.lookAt(this.diagramView.camera.position);
            this.selection.focusNode = draggedNode;
            this.diagramView.renderGraph();

            let planeIntersects = this.raycaster.intersectObject(this.helperPlane);
            const startPoint = new THREE.Vector3().copy(
                planeIntersects[0].point
            ).sub(this.helperPlane.position);

            handleDragging(event, (dragEvent, offset) => {
                this.helperPlane.position.copy(vector3DToTreeVector3(draggedNode.position));
                const newDirection = this.getViewDirection(dragEvent);

                this.raycaster.set(
                    this.diagramView.camera.position,
                    newDirection.sub(this.diagramView.camera.position).normalize(),
                );

                planeIntersects = this.raycaster.intersectObject(this.helperPlane);
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

    private getViewDirection(event: MouseEvent) {
        const screenParameters = this.diagramView.screenParameters;
        const bbox = this.diagramView.meshHtmlContainer.getBoundingClientRect();
        const mpouseX = event.clientX - bbox.left;
        const mpouseY = event.clientY - bbox.top;
        const vector = new THREE.Vector3(
            (mpouseX / screenParameters.WIDTH) * 2 - 1,
            1 - (mpouseY / screenParameters.HEIGHT) * 2,
            1
        );

        return vector.unproject(this.diagramView.camera);
    }
}
