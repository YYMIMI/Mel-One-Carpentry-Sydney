// Best-effort screening. This is not a complete personal-data detector.
export function containsPersonalDetails(question) {
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(question)
    || /\bmy\s+(?:full\s+)?name\s+is\s+\S|\b(?:full\s+name|my\s+name|my\s+(?:street\s+)?address|home\s+address)\s*[:：=]\s*\S/i.test(question)
    || /(?:姓名|我的名字|我的姓名|我的地址|详细地址|詳細地址|住址|家庭地址)\s*(?:是|为|為|[:：=])\s*\S/u.test(question)
    || /(?:\+?61[\s().-]*)?(?:0?[23478])(?:[\s().-]*\d){8}\b/.test(question)
    || /\b\d{1,5}\s+(?:[A-Za-z][\w'-]*\s+){1,5}(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr|court|ct|crescent|cres|place|pl|terrace|tce)\b/i.test(question)
    || /(?:password|api[\s_-]*key|credit[\s-]*card|passport|tax[\s-]*file|密码|密碼|银行卡|銀行卡|护照|護照)\s*[:：=]/i.test(question)
    || /\b(?:\d[ -]?){13,19}\b/.test(question);
}
