import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
    L3Graph,
    applyForceLayout3d,
    MeshObj,
    NodeViewTemplate,
    ReactNodeWidget,
    ReactNodeWidgetView,
    Graph,
    WidgetViewContext, WidgetModelContext,
    MeshKind,
} from '../index';
import { generateData } from './generateData';

require('./example.scss');
const cubePortal = require<string>('./portalCube.obj');
const cat3d = require<string>('./cat.obj');
const person3d = require<string>('./dummy_obj.obj');

interface NodeData {
    label: string;
}

class NodeSprite extends React.Component<NodeData> {
    render() {
        const {label} = this.props;

        return <div className='l3graph-node-template'>
            Label: {label} - redefined template.
        </div>;
    }
}

class WidgetSprite extends React.Component<NodeData> {
    render() {
        const {label} = this.props;

        return <div className='l3graph-widget-overlay'>
            Super overlay with label: {label}.
        </div>;
    }
}

const NODE_OVERLAY = {value: <NodeSprite label=''/>};
const WIDGET_OVERLAY = {value: <WidgetSprite label=''/>};
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
    overlay: NODE_OVERLAY,
};

document.addEventListener('DOMContentLoaded', () => {
    const graphElements: Graph = generateData(10);
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
                overlay: WIDGET_OVERLAY,
            }),
            view: (context: WidgetViewContext) => new ReactNodeWidgetView({
                model: context.widget as any,
                graphView: context.graphView,
            }),
        });
    }
});
