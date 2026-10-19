import {services} from '../src/content.mjs';
import {createEnquiryHandler} from '../server/enquiry.mjs';
const handler=createEnquiryHandler({serviceLabels:Object.fromEntries(services.map(s=>[s.id,{en:s.en.h1,zh:s.zh.h1}]))});
export default {fetch(request){return handler(request,process.env);}};
