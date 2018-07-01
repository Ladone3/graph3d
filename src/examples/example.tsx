import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { L3Graph, Node, applyForceLayout3d } from '../index';
import { RandomDataProvider } from './randomDataProvider';

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

document.addEventListener('DOMContentLoaded', () => {
    const dataProvider = new RandomDataProvider();
    ReactDOM.render(React.createElement(L3Graph, {
        viewOptions: {
            nodeTemplates: {
                'o3d-node-custome': {
                    mesh: () => ({obj: shape3d, colors: ['whitesmoke']}),
                    overlay: {
                        get: () => NodeOverlay,
                    },
                },
            },
            linkTemplates: {},
        },
        onComponentMount: onComponentMount,
    }), rootHtml);

    function onComponentMount(graph: L3Graph) {
        Promise.all([
            dataProvider.getNodes(),
            dataProvider.getLinks(),
        ]).then(([nodes, links]) => {
            graph.model.graph.addElements(nodes);
            graph.model.graph.addElements(links);

            applyForceLayout3d(graph.model.graph, 30);
        });
    }
});
