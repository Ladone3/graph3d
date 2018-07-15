import * as React from 'react';
import { GraphView } from './views/graphView';
import { GraphModel } from './models/graphModel';
import { DataProvider, RandomDataProvider } from './data/dataProvider';
import { LayoutLink, LayoutNode, forceLayout } from './layout/layout';
import { Node } from './models/node';

export interface MainPageProps {

}

export interface MainPageState {

}

export class MainPage extends React.Component<MainPageProps, MainPageState> {
    private graph: GraphModel;
    private dataProvider: DataProvider;
    private animationInterval: NodeJS.Timer;

    constructor(props: MainPageProps) {
        super(props);
        this.graph = new GraphModel();
        this.dataProvider = new RandomDataProvider();
        this.dataProvider.getData().then(data => {
            this.graph.setData(data);
        }).catch(error => {
            console.error(error);
        });
    }

    componentDidMount() {
        this.startAnimation();
    }

    componentWillUnmount() {
        this.stopAnimation();
    }

    private onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        let prevPoint = {
            x: event.screenX,
            y: event.screenY,
        };

        window.getSelection().removeAllRanges();

        const _onchange = (e: DragEvent) => {
            const pp: any = e; // instanceof MouseEvent ? event : event.touches[0];

            const newPoint = {
                x: pp.screenX,
                y: pp.screenY,
            };
            // console.log('x: ' + newPoint.x + '; y: ' + newPoint.y);

            const offset = {
                x: newPoint.x - prevPoint.x,
                y: newPoint.y - prevPoint.y,
            };

            prevPoint = newPoint;

            const currentAngle = this.graph.getCameraAngle();
            this.graph.setCameraAngle({
                x: currentAngle.x - offset.x / 300,
                y: currentAngle.y - offset.y / 300,
                z: currentAngle.z - offset.x / 300,
            });
        };

        const _onend = () => {
            document.body.onmousemove = document.body.onmouseup = null;
            document.body.removeEventListener('mousemove', _onchange);
            document.body.removeEventListener('mouseup', _onend);
        };

        document.body.addEventListener('mousemove', _onchange);
        document.body.addEventListener('mouseup', _onend);
    }

    private startAnimation() {
        this.animationInterval = setInterval(() => {
            this.forceLayout();
        }, 60);
    }

    private stopAnimation() {
        clearInterval(this.animationInterval);
    }

    private forceLayout() {
        const { nodes, links } = this.graph.getData();
        const proccessMap: { [ id: string]: LayoutNode } = {};

        const layoutNodes: LayoutNode[] = nodes.map(node => {
            const position = node.getPosition();
            const size = node.getSize();

            const layoutNode = {
                id: node.id,
                x: position.x,
                y: position.y,
                width: size.x,
                height: size.y,
                originalNode: node,
            };

            proccessMap[layoutNode.id] = layoutNode;
            return layoutNode;
        });

        const layoutLinks: LayoutLink[] = links.map(link => {
            return {
                originalLink: link,
                source: proccessMap[link.getSource().id],
                target: proccessMap[link.getTarget().id]
            };
        });

        forceLayout({
            nodes: layoutNodes,
            links: layoutLinks,
            iterations: 1,
            preferredLinkLength: 10,
        });

        for (const layoutNode of layoutNodes) {
            const node = proccessMap[layoutNode.id].originalNode;
            const nodePos = node.getPosition();

            node.setPosition({
                x: layoutNode.x,
                y: layoutNode.y,
                z: Math.round(nodePos.z / 2),
            });
        }
    }

    render() {
        return <div className='o3d-main'>
            <GraphView graphModel={this.graph}></GraphView>
            <div
                className='o3d-main__touch-panel'
                onMouseDown={this.onMouseDown}
            >
            </div>
        </div>;
    }
}