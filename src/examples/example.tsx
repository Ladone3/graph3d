import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
    L3Graph,
    applyForceLayout3d,
    MeshObj,
    NodeViewTemplate,
} from '../index';
import { generateData } from './generateData';

require('./example.scss');
const cubePortal = require<string>('./portalCube.obj');
const cat3d = require<string>('./cat.obj');
const person3d = require<string>('./dummy_obj.obj');

export interface NodeData {
    label: string;
}

export class NodeOverlay extends React.Component<NodeData> {
    render() {
        const {label} = this.props;

        return <div className='o3d-node-template'>
            Label: {label} - redefined template.
        </div>;
    }
}

const rootHtml = document.getElementById('rootHtml');

const CUSTOM_NODE_TEMPLATE_1: NodeViewTemplate<{label: string}> = {
    mesh: (node: {label: string}) => {
        const shapeNumber = Math.round(Math.random() * 9);
        if (shapeNumber === 0) {
            return {
                obj: person3d,
                scale: 0.2,
            };
        } else if (shapeNumber === 1) {
            return {
                obj: cat3d,
                scale: 1,
            };
        } else {
            return {
                shape: [
                    'cube',
                    'sphere',
                    'cone',
                    'cylinder',
                    'dodecahedron',
                    'torus',
                    'tetrahedron',
                    'plane',
                ][Math.round(Math.random() * 7)],
            };
        }
    },
};

const CUSTOM_NODE_TEMPLATE_2: NodeViewTemplate<{label: string}> = {
    mesh: (node: {label: string}): MeshObj => ({
        obj: cubePortal,
    }),
    overlay: {
        get: (node: {label: string}) => {
            return NodeOverlay;
        },
        context: undefined,
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const graphElements = generateData(20);
    ReactDOM.render(React.createElement(L3Graph, {
        viewOptions: {
            nodeTemplateProvider: (types: string[]) => {
                if (types.indexOf('o3d-node-custome') !== -1) {
                    return CUSTOM_NODE_TEMPLATE_2;
                } else {
                    return CUSTOM_NODE_TEMPLATE_1;
                }
            },
            linkTemplateProvider: () => ({
                color: 'green',
                thickness: 2,
            }),
            // simpleLinks: true,
        },
        graph: graphElements,
        onComponentMount: onComponentMount,
    }), rootHtml);

    function onComponentMount(graph: L3Graph) {
        applyForceLayout3d(graph.model.graph, 30);
    }
});
