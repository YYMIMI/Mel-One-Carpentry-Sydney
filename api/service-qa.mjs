import corpus from '../service-qa-server/corpus.json' with {type:'json'};
import {createServiceQaNodeHandler} from '../service-qa-server/service-qa-node.mjs';
export default createServiceQaNodeHandler(corpus);
