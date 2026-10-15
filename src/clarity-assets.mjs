import config from "../clarity.config.json" with { type: "json" };

export function clarityAssets(locale) {
  if (!config.projectId) return "";
  const data = {
    ...config,
    privacyPath: locale === "zh" ? "/zh/privacy/" : "/privacy/",
  };
  return (
    '<script id="clarity-config" type="application/json">' +
    JSON.stringify(data).replace(/</g, "\\u003c") +
    '</script><script src="/clarity-consent.js?v=20261015-1" defer></script>'
  );
}

export function clarityPrivacy(locale) {
  if (!config.projectId) return "";
  const zh = locale === "zh";
  return `<section class="content-section" data-clarity-notice><h2>${zh ? "可选的 Microsoft Clarity 分析" : "Optional Microsoft Clarity analytics"}</h2><p>${zh ? "只有你允许后，Microsoft Clarity 才会记录遮罩后的页面阅读、滚动与点击，制作热图和会话录像，并可能处理设备、连接与第一方分析识别码。联系页、确认页、员工页面及网址含查询参数或井号的页面不会录制；开始操作询价表单时即停止录像，不录制询价内容。" : "Only with your permission, Microsoft Clarity records masked page reading, scrolling and clicks for heatmaps and session recordings, and may process device, connection and first-party analytics identifiers. Contact, confirmation and staff pages, and addresses containing query strings or fragments, are excluded. Recording stops when you start using an enquiry form; enquiry content is excluded."}</p><p>${zh ? "页面底部的 Clarity 分析偏好只控制 Clarity，不改变上述 Google Analytics 设置。你可随时关闭 Clarity，拒绝不影响浏览或联系。我们尊重浏览器的停止跟踪信号。" : "Clarity preferences at the foot of the page control Clarity only and do not change the Google Analytics settings described above. You may turn Clarity off at any time without affecting browsing or contacting us. We respect browser no-tracking signals."}</p><p><a href="https://privacy.microsoft.com/privacystatement">${zh ? "Microsoft 隐私声明" : "Microsoft Privacy Statement"}</a></p></section>`;
}
