import * as THREE from 'three';
import { getColorByTypes } from '../utils/colorUtils';
import { DefaultNodeOverlay } from './defaultOverlay';
import { NodeViewTemplate, TemplateProvider } from '.';

export const DEFAULT_NODE_TEMPLATE: NodeViewTemplate<{label: string}> = {
    mesh: (data: {label: string}) => {
        const sphereGeometry = new THREE.SphereGeometry(10, 15, 15);
        const sphereMaterial = new THREE.MeshPhongMaterial({color: Math.random() * 0xffffff});
        // getColorByTypes(node.types)
        // THREE.MeshLambertMaterial({color: 'green'});
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.x = 0;
        sphere.position.y = 0;
        sphere.position.z = 0;

        return sphere;
    },
    overlay: {
        get: (data: {label: string}) => {
            return DefaultNodeOverlay;
        },
        context: undefined,
    },
};

export const DEFAULT_NODE_TEMPLATE_PROVIDER: TemplateProvider = (types: string[]) => {
    return DEFAULT_NODE_TEMPLATE;
};
