import * as React from 'react';
import { ReactOverlay, OverlayProps } from './templates';
import { Node } from '../models/graph/node';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
import { Link } from '../models/graph/link';

class DefaultLinkOverlayClass extends React.Component<OverlayProps<Node<GraphDescriptor>>> {
    render() {
        const {label} = this.props.target.data;
        return <div className='l3graph-link-html-view'>
            {label}
        </div>;
    }
}

class DefaultNodeOverlayClass extends React.Component<OverlayProps<Link<GraphDescriptor>>> {
    render() {
        const {label} = this.props.target.data;
        return <div className='l3graph-default-node-view'>
            {label}
        </div>;
    }
}

export const DEFAULT_NODE_OVERLAY: ReactOverlay<Node<GraphDescriptor>> = {
    id: 'node-overlay',
    value: <DefaultNodeOverlayClass/>,
};
export const DEFAULT_LINK_OVERLAY: ReactOverlay<Link<GraphDescriptor>> = {
    id: 'link-overlay',
    value: <DefaultLinkOverlayClass/>,
};

export function createContextProvider(context: any): React.ComponentClass {
    class ContextProvider extends React.Component {
        public static childContextTypes: any;
        getChildContext() {
            return context;
        }
        render() {
            return <div>{this.props.children}</div>;
        }
    }
    ContextProvider.childContextTypes = {};
    Object.keys(context).forEach(key => {
        ContextProvider.childContextTypes[key] = React.PropTypes.any.isRequired;
    });
    return ContextProvider;
}

export function enrichOverlay<Model>(
    poorOverlay: ReactOverlay<Model>,
    data: Model,
): ReactOverlay<Model> {
    const overlayProps: OverlayProps<Model> = {
        ...poorOverlay.value.props,
        target: data,
    };

    return {
        ...poorOverlay,
        value: React.cloneElement(poorOverlay.value, overlayProps),
    };
}
