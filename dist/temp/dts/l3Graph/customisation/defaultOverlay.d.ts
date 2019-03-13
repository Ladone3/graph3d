import * as React from 'react';
import { ReactOverlay } from '.';
export declare const DEFAULT_LINK_OVERLAY: ReactOverlay;
export declare const DEFAULT_NODE_OVERLAY: ReactOverlay;
export declare function createContextProvider(context: any): React.ComponentClass;
export declare function enrichOverlay<Data>(pooreOverlay: ReactOverlay<Data>, data: Data): ReactOverlay<Data>;
