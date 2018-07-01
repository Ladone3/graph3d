import { Node } from '../models/node';
import { Link } from '../models/link';

export interface DataProvider {
    getNodes(): Promise<Node[]>;
    getLinks(): Promise<Link[]>;
}
