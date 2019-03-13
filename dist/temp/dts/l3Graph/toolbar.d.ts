import * as React from 'react';
import { ViewController } from './controllers/viewController';
export interface ToolbarProps {
    viewControllers: ReadonlyArray<ViewController>;
    defaultViewController?: ViewController;
    onChangeViewController: (viewController: ViewController) => void;
    onApplyLayout: () => void;
}
interface State {
    selectedViewController: ViewController | undefined;
}
export declare class Toolbar extends React.Component<ToolbarProps, State> {
    constructor(props: ToolbarProps);
    componentDidMount(): void;
    setViewController(selectedViewController: ViewController): void;
    render(): JSX.Element;
}
export {};
