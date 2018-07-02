import * as React from 'react';
import { GraphView } from './graphView';
import { GraphModel } from './model/graphModel';
import { DataProvider, RandomDataProvider } from './data/dataProvider';

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

    render() {
        return <div className='o3d-main'>
            <GraphView graphModel={this.graph}></GraphView>
        </div>;
    }
}
