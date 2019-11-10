import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
    L3Graph,
    applyForceLayout3d,
    MeshObj,
    NodeViewTemplate,
    FocusNodeWidget,
    ReactNodeWidgetView,
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

const NODE_OVERLAY = {id: 'node-overlay', value: <NodeSprite label=''/>};
const WIDGET_OVERLAY = {id: 'test-widget-overlay', value: <WidgetSprite label=''/>};
const rootHtml = document.getElementById('rootHtml');

const CUSTOM_NODE_TEMPLATE_1: NodeViewTemplate<{label: string}> = {
    mesh: () => {
        const shapeNumber = Math.round(Math.random() * 8);
        // const randomSize = 10 + Math.round(Math.random() * 20);
        const size: any = undefined; // {x: randomSize, y: randomSize, z: randomSize};
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
    overlay: NODE_OVERLAY as any,
};

document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(React.createElement(L3Graph, {
        viewOptions: {
            // nodeTemplateProvider: (data: {label: string; types: string[]}) => {
            //     if (data.types.indexOf('l3graph-node-custome') !== -1) {
            //         return CUSTOM_NODE_TEMPLATE_2;
            //     } else {
            //         return CUSTOM_NODE_TEMPLATE_1;
            //     }
            // },
            linkTemplateProvider: () => ({
                color: 'green',
                thickness: 2,
            }),
        },
        onComponentMount: onComponentMount,
    }), rootHtml);

    function onComponentMount(l3graph: L3Graph) {
        const graphElements = generateData(10);
        l3graph.model.graph.addNodes(graphElements.nodes);
        l3graph.model.graph.addLinks(graphElements.links);
        applyForceLayout3d(l3graph.model.graph, 30, 200);

        l3graph.registerWidget({
            getModel: (context: WidgetModelContext) => new FocusNodeWidget({
                ...context,
                widgetId: 'l3graph-react-node-widget',
            } as any) ,
            getView: (context: WidgetViewContext) => new ReactNodeWidgetView({
                model: context.widget as any,
                diagramView: context.diagramView,
                position: 'w',
                overlay: WIDGET_OVERLAY,
            }),
        });
    }
});
