import * as React from 'react';
import { ReactOverlay } from './templates';
import { Node } from '../models/graph/node';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
import { Link } from '../models/graph/link';
export declare const DEFAULT_NODE_OVERLAY: ReactOverlay<Node<GraphDescriptor>>;
export declare const DEFAULT_LINK_OVERLAY: ReactOverlay<Link<GraphDescriptor>>;
export declare function createContextProvider(context: any): React.ComponentClass;
export declare function enrichOverlay<Model>(poorOverlay: ReactOverlay<Model>, data: Model): ReactOverlay<Model>;
