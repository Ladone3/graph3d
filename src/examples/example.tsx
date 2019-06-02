import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
    L3Graph,
    applyForceLayout3d,
    MeshObj,
    NodeViewTemplate,
} from '../index';
import { generateData } from './generateData';
import { MeshKind } from '../l3Graph/customisation';

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
        const shapeNumber = Math.round(Math.random() * 8);
        if (shapeNumber === 0) {
            return {
                type: MeshKind.Obj,
                markup: person3d,
            };
        } else if (shapeNumber === 1) {
            return {
                type: MeshKind.Obj,
                markup: cat3d,
            };
        } else {
            return {
                type: MeshKind.Primitive,
                shape: [
                    'cube',
                    'sphere',
                    'cone',
                    'cylinder',
                    'dodecahedron',
                    'torus',
                    'tetrahedron',
                ][Math.round(Math.random() * 6)] as any,
            };
        }
    },
};

const CUSTOM_NODE_TEMPLATE_2: NodeViewTemplate<{label: string}> = {
    mesh: (node: {label: string}): MeshObj => ({
        type: MeshKind.Obj,
        markup: cubePortal,
    }),
    overlay: {
        get: (node: {label: string}) => {
            return NodeOverlay;
        },
        context: undefined,
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const graphElements = generateData(5);
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
        applyForceLayout3d(graph.model.graph, 30, 100);
    }
});
