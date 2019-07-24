import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
    L3Graph,
    applyForceLayout3d,
    MeshObj,
    NodeViewTemplate,
    ReactNodeWidget,
    ReactNodeWidgetView,
} from '../index';
import { generateData } from './generateData';
import { MeshKind } from '../l3Graph/customisation';
import { WidgetViewContext, WidgetModelContext } from '../l3Graph/models/widgets';

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

        return <div className='l3graph-node-template'>
            Label: {label} - redefined template.
        </div>;
    }
}

export class WidgetOverlay extends React.Component<NodeData> {
    render() {
        const {label} = this.props;

        return <div className='l3graph-widget-overlay'>
            Super overlay with label: {label}.
        </div>;
    }
}

const rootHtml = document.getElementById('rootHtml');

const CUSTOM_NODE_TEMPLATE_1: NodeViewTemplate<{label: string}> = {
    mesh: () => {
        const shapeNumber = Math.round(Math.random() * 8);
        const randomSize = 10 + Math.round(Math.random() * 20);
        const size = {x: randomSize, y: randomSize, z: randomSize};
        if (shapeNumber === 0) {
            return {
                type: MeshKind.Obj,
                markup: person3d,
                size,
            };
        } else if (shapeNumber === 1) {
            return {
                type: MeshKind.Obj,
                markup: cat3d,
                size,
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
                size,
            };
        }
    },
};

const CUSTOM_NODE_TEMPLATE_2: NodeViewTemplate<{label: string}> = {
    mesh: (): MeshObj => ({
        type: MeshKind.Obj,
        markup: cubePortal,
    }),
    overlay: {
        get: () => {
            return NodeOverlay;
        },
        context: undefined,
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const graphElements = generateData(10);
    ReactDOM.render(React.createElement(L3Graph, {
        viewOptions: {
            nodeTemplateProvider: (types: string[]) => {
                if (types.indexOf('l3graph-node-custome') !== -1) {
                    return CUSTOM_NODE_TEMPLATE_2;
                } else {
                    return CUSTOM_NODE_TEMPLATE_1;
                }
            },
            linkTemplateProvider: () => ({
                color: 'green',
                thickness: 2,
            }),
        },
        graph: graphElements,
        onComponentMount: onComponentMount,
    }), rootHtml);

    function onComponentMount(l3graph: L3Graph) {
        applyForceLayout3d(l3graph.model.graph, 30, 100);
        l3graph.registerWidget({
            model: (context: WidgetModelContext) => new ReactNodeWidget({
                ...context,
                widgetId: 'l3graph-react-node-widget',
                overlay: {
                    get: () => {
                        return WidgetOverlay;
                    },
                    context: undefined,
                },
            }),
            view: (context: WidgetViewContext) => new ReactNodeWidgetView({
                model: context.widget as any,
                graphView: context.graphView,
            }),
        });
    }
});
