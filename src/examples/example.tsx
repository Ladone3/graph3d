import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
    L3Graph,
    applyForceLayout3d,
    MeshObj,
    NodeViewTemplate,
    Node,
    getColorByTypes,
} from '../index';
import { generateData } from './generateData';

require('./example.scss');
const shape3d = require<string>('./portalCube.obj');

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
    mesh: (node: {label: string}) => ({
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
    }),
};

const CUSTOM_NODE_TEMPLATE_2: NodeViewTemplate<{label: string}> = {
    mesh: (node: {label: string}): MeshObj => ({
        obj: shape3d,
    }),
    overlay: {
        get: (node: {label: string}) => {
            return NodeOverlay;
        },
        context: undefined,
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const graphElements = generateData();
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
            }),
        },
        graph: graphElements,
        onComponentMount: onComponentMount,
    }), rootHtml);

    function onComponentMount(graph: L3Graph) {
        applyForceLayout3d(graph.model.graph, 30);
    }
});
