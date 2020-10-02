import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
    L3Graph,
    applyForceLayout3d,
    MeshObj,
    ViewTemplate,
    FocusNodeWidget,
    ReactNodeWidgetView,
    WidgetViewContext, WidgetModelContext,
    MeshKind,
    Toolbar,
    ViewController,
    GraphDescriptor,
    OverlayProps,
    NodeOverlayProps,
} from '../index';
import { generateData } from './generateData';

require('./example.scss');
const cubePortal = require<string>('./portalCube.obj');
const cat3d = require<string>('./cat.obj');
const person3d = require<string>('./dummy_obj.obj');

export type CustomGraphDescriptor = GraphDescriptor<{name?: string}, {label?: string}>;

class NodeOverlay extends React.Component<NodeOverlayProps<CustomGraphDescriptor>> {
    render() {
        const {name} = this.props.target.data;

        return <div className='l3graph-node-template'>
            Label: {name}.
        </div>;
    }
}

class WidgetOverlay extends React.Component<NodeOverlayProps<CustomGraphDescriptor>> {
    render() {
        const {name} = this.props.target.data;

        return <div className='l3graph-widget-overlay'>
            Super overlay with label: {name}.
        </div>;
    }
}

const NODE_OVERLAY = {id: 'node-overlay', value: <NodeOverlay/>};
const WIDGET_OVERLAY = {id: 'test-widget-overlay', value: <WidgetOverlay/>};
const rootHtml = document.getElementById('rootHtml');

const CUSTOM_NODE_TEMPLATE_1: ViewTemplate<CustomGraphDescriptor['nodeContentType']> = {
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
    overlay: NODE_OVERLAY,
};

document.addEventListener('DOMContentLoaded', () => {
    let l3Graph: L3Graph;
    mountGraph();

    function mountGraph() {
        ReactDOM.render(React.createElement(L3Graph, {
            viewOptions: {
                nodeTemplateProvider: () => {
                    return CUSTOM_NODE_TEMPLATE_1 as any;
                },
                linkTemplateProvider: () => ({
                    color: 'green',
                    thickness: 2,
                }),
            },
            onComponentMount: onComponentMount,
        }, React.createElement(Toolbar, {
            viewControllers: l3Graph ? l3Graph.getViewControllers() : [],
            selectedViewController: l3Graph ? l3Graph.getViewController() : undefined,
            onChangeViewController: (viewController: ViewController) => {
                l3Graph.setViewController(viewController);
            },
            onApplyLayout: () => {
                applyForceLayout3d(l3Graph.model.graph, 30, 200);
            },
        })), rootHtml);
    }

    function onComponentMount(l3graph: L3Graph) {
        l3Graph = l3graph;
        const graphElements = generateData(10);
        l3graph.model.graph.addNodes(graphElements.nodes);
        l3graph.model.graph.addLinks(graphElements.links);
        applyForceLayout3d(l3graph.model.graph, 30, 200);

        l3graph.registerWidget({
            getModel: (context: WidgetModelContext) =>
                new FocusNodeWidget({
                    ...context,
                    widgetId: 'l3graph-react-node-widget',
                }),
            getView: (
                context: WidgetViewContext<FocusNodeWidget>
            ) => new ReactNodeWidgetView({
                model: context.widget as any,
                diagramView: context.diagramView,
                position: 'w',
                overlay: WIDGET_OVERLAY,
            }),
        });
        mountGraph();
    }
});
