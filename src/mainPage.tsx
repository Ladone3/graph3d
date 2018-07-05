import * as React from 'react';
import { GraphView } from './graphView';
import { GraphModel } from './model/graphModel';
import { DataProvider, RandomDataProvider } from './data/dataProvider';
import { Vectro2D } from './model/models';

export interface MainPageProps {

}

export interface MainPageState {

}

export class MainPage extends React.Component<MainPageProps, MainPageState> {
    private graph: GraphModel;
    private dataProvider: DataProvider;

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