import { containsPersonalDetails } from "./question-privacy.mjs";

(function serviceQuestions() {
  "use strict";
  if (window.ServiceQAWidget) return;

  const endpoint = "/api/service-qa";
  const script =
    document.currentScript || document.querySelector("script[data-service-qa]");
  const copy = {
    en: {
      entry: "Service assistant",
      title: "Service assistant",
      close: "Close",
      intro:
        "Ask a general service question and see the relevant information on this website.",
      label: "Your service question",
      placeholder: "Ask about a service you saw on this website.",
      help: "For job details, contact details or photographs, use the enquiry form.",
      privacy: "Please keep your question general. Do not include names, phone numbers, email addresses, street addresses or other personal details.",
      privacyAI:
        "If AI answers are available, your question is sent to Google’s free AI service. Do not include names, phone numbers, email addresses, street addresses or other personal details.",
      checking: "Getting the service assistant ready…",
      available: "AI answers use information from this website.",
      fallback:
        "Find answers in this website’s published service information, with links to the relevant pages.",
      submitAI: "Get an AI answer",
      submitSearch: "Find an answer",
      cancel: "Stop",
      clear: "Clear question",
      waiting: "Looking for relevant service information…",
      stopped: "Stopped. You can edit your question and try again.",
      generated: "AI answer from our site information",
      excerpts: "From our published pages",
      excerptIntro:
        "These excerpts come directly from this website. Open a page for its full context.",
      sources: "Pages used",
      unavailable: "No matching site information",
      unavailableText:
        "Try a more specific service question, or contact the team to discuss your property.",
      contact: "Use the enquiry form",
      personal:
        "Remove personal details before asking. Use the enquiry form to share contact or property details.",
      length: "Enter a service question between 2 and 600 characters.",
      failed: "We could not get an answer. Try again, or use the enquiry form.",
      limited:
        "There have been too many questions. Try again later, or use the enquiry form.",
      timeout: "The answer took too long. Try again, or use the enquiry form.",
      unsupported:
        "Service questions are unavailable in this browser. Please use the enquiry form.",
      counter: (length) => `${length} / 600 characters`,
    },
    zh: {
      entry: "服务小助手",
      title: "服务小助手",
      close: "关闭",
      intro: "询问一般服务问题，查看本网站的相关说明。",
      label: "您的服务问题",
      placeholder: "请说明您想了解的服务。",
      help: "具体工程、联系方式或照片，请通过咨询表单发送。",
      privacy: "请只询问一般服务问题，勿输入姓名、电话、电子邮箱、街道地址或其他个人资料。",
      privacyAI:
        "如果 AI 回答可用，您的问题会发送至 Google 的免费 AI 服务。请勿输入姓名、电话、电子邮箱、街道地址或其他个人资料。",
      checking: "服务小助手正在准备…",
      available: "AI 回答以本网站的信息为依据。",
      fallback: "根据本网站已发布的服务内容查找答案，并提供相关页面链接。",
      submitAI: "获取 AI 回答",
      submitSearch: "查找答案",
      cancel: "停止",
      clear: "清空问题",
      waiting: "正在查找相关服务信息…",
      stopped: "已停止。您可以修改问题后再试。",
      generated: "依据本网站信息的 AI 回答",
      excerpts: "本网站已发布的内容",
      excerptIntro: "以下内容直接摘自本网站。打开对应页面可查看完整说明。",
      sources: "参考页面",
      unavailable: "未找到相应的网站信息",
      unavailableText: "请换一个更具体的服务问题，或联系团队讨论您的房屋情况。",
      contact: "前往咨询表单",
      personal: "请先删除个人资料。联系方式或具体地址，请通过咨询表单发送。",
      length: "请输入 2 至 600 个字符的服务问题。",
      failed: "暂时无法取得回答。请重试，或通过咨询表单联系团队。",
      limited: "问题提交过于频繁。请稍后再试，或通过咨询表单联系团队。",
      timeout: "等待回答的时间过长。请重试，或通过咨询表单联系团队。",
      unsupported: "此浏览器暂时无法使用服务问答，请使用咨询表单。",
      counter: (length) => `${length} / 600 个字符`,
    },
  };
  let config = {
    contactEn: script?.dataset.contactEn || "/contact",
    contactZh: script?.dataset.contactZh || "/zh-hans/contact",
    siteOrigin: script?.dataset.siteOrigin || window.location.origin,
  };
  let entry, container, dialog, nodes, previousFocus;
  let language = getLanguage();
  let composing = false,
    pending = false,
    destroyed = false;
  let requestId = 0,
    requestController,
    requestTimer,
    healthController,
    healthTimer;
  let providerConfigured = null;
  let bodyObserver, languageObserver;
  const originalHistory = new Map();

  function getLanguage() {
    return /^\/zh(?:-hans)?(?:\/|$)/i.test(window.location.pathname) ||
      /^zh(?:-|$)/i.test(document.documentElement.lang)
      ? "zh"
      : "en";
  }
  function text() {
    return copy[language];
  }
  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }
  function marker(node, name) {
    node.setAttribute(`data-service-qa-${name}`, "");
    return node;
  }
  function button(name, className) {
    const node = marker(element("button", className), name);
    node.type = "button";
    return node;
  }
  function safeHref(value) {
    if (
      typeof value !== "string" ||
      !value.trim() ||
      /[\u0000-\u0020]/.test(value)
    )
      return null;
    try {
      const url = new URL(value, window.location.origin);
      const expected = new URL(config.siteOrigin, window.location.origin)
        .origin;
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        ![window.location.origin, expected].includes(url.origin)
      )
        return null;
      return url.origin === window.location.origin
        ? url.pathname + url.search + url.hash
        : url.href;
    } catch {
      return null;
    }
  }
  function contactHref() {
    const configured = language === "zh" ? config.contactZh : config.contactEn;
    return safeHref(configured) || "/contact";
  }
  function responseContactHref(value) {
    const fallback = contactHref();
    const candidate = safeHref(value);
    if (!candidate) return fallback;
    const expected = new URL(fallback, window.location.origin);
    const actual = new URL(candidate, window.location.origin);
    return actual.pathname === expected.pathname &&
      actual.search === expected.search &&
      actual.hash === expected.hash
      ? candidate
      : fallback;
  }
  function updateBusy(value) {
    pending = value;
    if (!nodes) return;
    nodes.form.setAttribute("aria-busy", String(value));
    nodes.submit.disabled = value || providerConfigured === null;
    nodes.cancel.hidden = !value;
  }
  function abortAnswer(message = "") {
    requestId += 1;
    window.clearTimeout(requestTimer);
    requestController?.abort();
    requestController = null;
    updateBusy(false);
    if (nodes) nodes.status.textContent = message;
  }
  function clearError() {
    if (!nodes) return;
    nodes.error.textContent = "";
    nodes.question.setAttribute("aria-invalid", "false");
  }
  function showError(message, fieldError = false) {
    nodes.error.textContent = message;
    nodes.question.setAttribute("aria-invalid", String(fieldError));
    if (fieldError) nodes.question.focus();
  }
  function updateCounter() {
    if (!nodes) return;
    const length = Array.from(nodes.question.value).length;
    nodes.counter.textContent = text().counter(length);
    nodes.clear.hidden = length === 0;
    nodes.question.style.height = "auto";
    nodes.question.style.height = `${Math.min(256, Math.max(120, nodes.question.scrollHeight))}px`;
  }
  function updateLabels() {
    if (entry) entry.textContent = text().entry;
    if (!nodes) return;
    dialog.lang = language === "zh" ? "zh-Hans" : "en-AU";
    nodes.title.textContent = text().title;
    nodes.close.textContent = text().close;
    nodes.intro.textContent = text().intro;
    nodes.label.textContent = text().label;
    nodes.question.placeholder = text().placeholder;
    nodes.help.textContent = text().help;
    nodes.privacy.textContent = providerConfigured === true ? text().privacyAI : text().privacy;
    nodes.clear.textContent = text().clear;
    nodes.cancel.textContent = text().cancel;
    nodes.submit.textContent =
      providerConfigured === false ? text().submitSearch : text().submitAI;
    nodes.contact.textContent = text().contact;
    nodes.contact.href = contactHref();
    nodes.availability.textContent =
      providerConfigured === null
        ? text().checking
        : providerConfigured
          ? text().available
          : text().fallback;
    updateCounter();
    updateBusy(pending);
  }
  function refreshLocale() {
    const current = getLanguage();
    if (current === language) return;
    language = current;
    abortAnswer();
    if (nodes) {
      nodes.results.replaceChildren();
      clearError();
    }
    updateLabels();
  }
  function resetQuestion() {
    abortAnswer();
    clearError();
    nodes.question.value = "";
    nodes.results.replaceChildren();
    updateCounter();
  }
  function onDialogClosed() {
    resetQuestion();
    healthController?.abort();
    healthController = null;
    window.clearTimeout(healthTimer);
    if (previousFocus?.isConnected) previousFocus.focus();
    else if (entry?.isConnected) entry.focus();
  }
  function closeDialog() {
    if (!dialog?.open) return;
    dialog.close();
  }
  async function checkHealth() {
    if (providerConfigured !== null || healthController) return;
    const controller = new AbortController();
    healthController = controller;
    const timer = window.setTimeout(() => controller.abort(), 5000);
    healthTimer = timer;
    try {
      const response = await window.fetch(endpoint, {
        method: "GET",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Unavailable");
      const result = await response.json();
      if (
        controller.signal.aborted ||
        destroyed ||
        healthController !== controller
      )
        return;
      providerConfigured =
        result?.providerConfigured === true && result?.freeOnly === true;
    } catch {
      if (destroyed || !dialog?.open || healthController !== controller) return;
      providerConfigured = false;
    } finally {
      window.clearTimeout(timer);
      if (healthController === controller) {
        healthController = null;
        if (!destroyed) updateLabels();
      }
    }
  }
  function buildDialog() {
    dialog = marker(element("dialog", "serviceqa-dialog"), "dialog");
    dialog.id = "serviceqa-dialog";
    dialog.setAttribute("aria-labelledby", "serviceqa-title");
    dialog.setAttribute("aria-describedby", "serviceqa-intro");
    const header = element("div", "serviceqa-header");
    const title = marker(element("h2", "serviceqa-title"), "title");
    title.id = "serviceqa-title";
    const close = button("close", "serviceqa-button serviceqa-close");
    header.append(title, close);
    const scroll = element("div", "serviceqa-scroll");
    const intro = element("p", "serviceqa-intro");
    intro.id = "serviceqa-intro";
    const form = marker(element("form", "serviceqa-form"), "form");
    form.noValidate = true;
    const label = element("label", "serviceqa-label");
    label.htmlFor = "serviceqa-question";
    const question = marker(
      element("textarea", "serviceqa-question"),
      "question",
    );
    question.id = "serviceqa-question";
    question.name = "question";
    question.rows = 4;
    question.maxLength = 1200;
    question.autocomplete = "off";
    question.spellcheck = true;
    question.setAttribute(
      "aria-describedby",
      "serviceqa-help serviceqa-error serviceqa-counter",
    );
    question.setAttribute("aria-invalid", "false");
    const fieldMeta = element("div", "serviceqa-field-meta");
    const counter = element("span", "serviceqa-counter");
    counter.id = "serviceqa-counter";
    const clear = button("clear", "serviceqa-clear");
    clear.hidden = true;
    fieldMeta.append(counter, clear);
    const help = element("p", "serviceqa-help");
    help.id = "serviceqa-help";
    const privacy = marker(element("p", "serviceqa-privacy"), "privacy");
    privacy.id = "serviceqa-privacy";
    const availability = marker(
      element("p", "serviceqa-availability"),
      "availability",
    );
    const error = marker(element("p", "serviceqa-error"), "error");
    error.id = "serviceqa-error";
    error.setAttribute("role", "alert");
    const actions = element("div", "serviceqa-actions");
    const submitButton = button("submit", "serviceqa-button serviceqa-submit");
    submitButton.type = "submit";
    submitButton.setAttribute("aria-describedby", "serviceqa-privacy");
    const cancel = button("cancel", "serviceqa-button serviceqa-stop");
    cancel.hidden = true;
    actions.append(submitButton, cancel);
    const status = marker(element("p", "serviceqa-status"), "status");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    form.append(
      label,
      question,
      fieldMeta,
      help,
      privacy,
      availability,
      error,
      actions,
      status,
    );
    const results = marker(element("section", "serviceqa-results"), "results");
    results.setAttribute("aria-live", "polite");
    results.setAttribute("aria-atomic", "false");
    scroll.append(intro, form, results);
    const footer = element("div", "serviceqa-footer");
    const contact = marker(element("a", "serviceqa-contact"), "contact");
    footer.append(contact);
    dialog.append(header, scroll, footer);
    nodes = {
      title,
      close,
      intro,
      form,
      label,
      question,
      counter,
      clear,
      help,
      privacy,
      availability,
      error,
      submit: submitButton,
      cancel,
      status,
      results,
      contact,
    };
    document.body.append(dialog);
    close.addEventListener("click", closeDialog);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeDialog();
    });
    dialog.addEventListener("close", onDialogClosed);
    form.addEventListener("submit", submitQuestion);
    question.addEventListener("compositionstart", () => {
      composing = true;
    });
    question.addEventListener("compositionend", () => {
      composing = false;
      updateCounter();
    });
    question.addEventListener("keydown", (event) => {
      if (
        event.key === "Enter" &&
        (event.ctrlKey || event.metaKey) &&
        !composing &&
        !event.isComposing &&
        event.keyCode !== 229
      ) {
        event.preventDefault();
        form.requestSubmit
          ? form.requestSubmit()
          : form.dispatchEvent(new Event("submit", { cancelable: true }));
      }
    });
    question.addEventListener("input", () => {
      abortAnswer();
      clearError();
      results.replaceChildren();
      updateCounter();
    });
    cancel.addEventListener("click", () => abortAnswer(text().stopped));
    clear.addEventListener("click", () => {
      resetQuestion();
      question.focus();
    });
    updateLabels();
  }
  function openDialog() {
    refreshLocale();
    previousFocus = document.activeElement;
    if (!dialog) buildDialog();
    updateLabels();
    if (typeof dialog.showModal !== "function") {
      const note = element("p", "serviceqa-help", text().unsupported);
      const contact = element("a", "serviceqa-contact", text().contact);
      contact.href = contactHref();
      note.append(" ", contact);
      container.append(note);
      entry.hidden = true;
      dialog.remove();
      dialog = null;
      nodes = null;
      return;
    }
    if (!dialog.open) dialog.showModal();
    nodes.question.focus();
    checkHealth();
  }
  function renderResult(result) {
    if (
      !result ||
      !["generated", "excerpts", "unavailable"].includes(result.mode)
    )
      throw new Error("Invalid response");
    const sources = [];
    const seen = new Set();
    for (const source of Array.isArray(result.sources) ? result.sources : []) {
      const href = safeHref(source?.url);
      if (
        !href ||
        seen.has(href) ||
        typeof source.title !== "string" ||
        typeof source.excerpt !== "string"
      )
        continue;
      seen.add(href);
      sources.push({
        href,
        title: source.title.slice(0, 200),
        excerpt: source.excerpt.slice(0, 1200),
      });
      if (sources.length === 3) break;
    }
    if (
      result.mode !== "unavailable" &&
      (!sources.length ||
        typeof result.answer !== "string" ||
        !result.answer.trim())
    )
      throw new Error("Missing sources");
    const content = document.createDocumentFragment();
    const heading = element(
      "h3",
      "serviceqa-result-title",
      text()[result.mode],
    );
    content.append(heading);
    const answer = element(
      "p",
      "serviceqa-answer",
      result.mode === "generated"
        ? result.answer.slice(0, 6000)
        : result.mode === "excerpts"
          ? text().excerptIntro
          : text().unavailableText,
    );
    content.append(answer);
    if (sources.length) {
      content.append(element("h4", "serviceqa-source-heading", text().sources));
      const list = element("ol", "serviceqa-sources");
      for (const source of sources) {
        const item = element("li", "serviceqa-source");
        const link = element("a", "serviceqa-source-link", source.title);
        link.href = source.href;
        const excerpt = element("p", "serviceqa-excerpt", source.excerpt);
        item.append(link, excerpt);
        list.append(item);
      }
      content.append(list);
    }
    nodes.results.replaceChildren(content);
    nodes.contact.href = responseContactHref(result.contactUrl);
  }
  async function submitQuestion(event) {
    event.preventDefault();
    if (composing || pending || providerConfigured === null) return;
    refreshLocale();
    clearError();
    const question = nodes.question.value.trim();
    const length = Array.from(question).length;
    if (length < 2 || length > 600) {
      showError(text().length, true);
      return;
    }
    if (containsPersonalDetails(question)) {
      showError(text().personal, true);
      return;
    }
    const id = ++requestId;
    const locale = language;
    const controller = new AbortController();
    requestController = controller;
    let timedOut = false;
    requestTimer = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 20000);
    nodes.results.replaceChildren();
    nodes.status.textContent = text().waiting;
    updateBusy(true);
    try {
      const response = await window.fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ question, language: locale }),
        signal: controller.signal,
      });
      if (id !== requestId || locale !== language || destroyed || !dialog?.open)
        return;
      if (!response.ok) {
        showError(response.status === 429 ? text().limited : text().failed);
        return;
      }
      const result = await response.json();
      if (
        id !== requestId ||
        locale !== language ||
        destroyed ||
        !dialog?.open ||
        controller.signal.aborted
      )
        return;
      renderResult(result);
    } catch {
      if (id !== requestId || locale !== language || destroyed || !dialog?.open)
        return;
      if (!controller.signal.aborted || timedOut)
        showError(timedOut ? text().timeout : text().failed);
    } finally {
      if (id === requestId && !destroyed) {
        window.clearTimeout(requestTimer);
        requestController = null;
        updateBusy(false);
        nodes.status.textContent = "";
      }
    }
  }
  function mount(host, options = {}) {
    if (destroyed) return;
    config = { ...config, ...options };
    refreshLocale();
    if (entry?.isConnected) return entry;
    container?.remove();
    const target =
      host ||
      document.querySelector("[data-service-qa-mount]") ||
      document.querySelector("footer");
    if (!target) return null;
    container = element("div", "serviceqa-entry");
    entry = button("open", "serviceqa-entry-button");
    entry.setAttribute("aria-haspopup", "dialog");
    entry.setAttribute("aria-controls", "serviceqa-dialog");
    entry.textContent = text().entry;
    entry.addEventListener("click", openDialog);
    container.append(entry);
    target.append(container);
    return entry;
  }
  function onRouteChange() {
    if (!destroyed) {
      refreshLocale();
      mount();
    }
  }
  function start() {
    if (destroyed) return;
    mount();
    if (!bodyObserver && document.body) {
      bodyObserver = new MutationObserver(() => {
        if (!entry?.isConnected) mount();
        refreshLocale();
      });
      bodyObserver.observe(document.body, { childList: true, subtree: true });
      languageObserver = new MutationObserver(refreshLocale);
      languageObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang"],
      });
    }
  }
  function destroy() {
    destroyed = true;
    abortAnswer();
    healthController?.abort();
    window.clearTimeout(healthTimer);
    bodyObserver?.disconnect();
    languageObserver?.disconnect();
    document.removeEventListener("DOMContentLoaded", start);
    window.removeEventListener("popstate", onRouteChange);
    window.removeEventListener("hashchange", onRouteChange);
    for (const [name, value] of originalHistory)
      if (window.history[name] === value.wrapper)
        window.history[name] = value.original;
    dialog?.remove();
    container?.remove();
  }
  window.ServiceQAWidget = Object.freeze({ mount, refreshLocale, destroy });
  window.addEventListener("popstate", onRouteChange);
  window.addEventListener("hashchange", onRouteChange);
  for (const name of ["pushState", "replaceState"]) {
    const original = window.history[name];
    const wrapper = function (...args) {
      const result = original.apply(this, args);
      onRouteChange();
      return result;
    };
    originalHistory.set(name, { original, wrapper });
    window.history[name] = wrapper;
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", start);
  else start();
})();
