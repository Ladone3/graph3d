import { GamepadHandler } from '../vrUtils/gamepadHandler';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
export declare class GamepadEditor<Descriptor extends GraphDescriptor> {
    private gamepadHandler;
    constructor(gamepadHandler: GamepadHandler<Descriptor>);
}
