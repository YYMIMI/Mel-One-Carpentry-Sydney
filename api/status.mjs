import {mailConfig,json} from '../server/enquiry.mjs';
export default {fetch(request){return ['GET','HEAD'].includes(request.method)?json({configured:!!mailConfig(process.env)}):json({configured:false},405,{Allow:'GET, HEAD'});}};
