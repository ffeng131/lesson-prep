/* ============================================================
 *  集体备课 · 资源预览页面交互（preview.html）
 * ============================================================ */

(function () {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const DATA = window.MOCK_DATA;
  const params = new URLSearchParams(location.search);

  const state = {
    resourceId: params.get("resourceId") || "r1",
    resourceName: params.get("resourceName") || "资源预览",
    resourceType: params.get("resourceType") || "doc",
    resourceTag: params.get("resourceTag") || "教案",
    resourceSize: params.get("resourceSize") || "1.8 MB",
    nodeId: params.get("nodeId") || "u1-p1",
    kind: params.get("kind") || "group"
  };

  function iconClass(type) {
    const m = { doc: "ic-doc", ppt: "ic-ppt", pdf: "ic-pdf",
                zip: "ic-zip", audio: "ic-audio", video: "ic-video" };
    return m[type] || "ic-other";
  }

  function iconText(type) {
    const m = { doc: "DOC", ppt: "PPT", pdf: "PDF", zip: "ZIP",
                audio: "MP3", video: "MP4" };
    return m[type] || "FILE";
  }

  function showToast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1500);
  }

  function renderHeader() {
    $("#previewTitle").textContent = state.resourceName;
  }

  function renderInfoCard() {
    const html = `
      <div class="preview-info-inner">
        <div class="resource-icon ${iconClass(state.resourceType)}">${iconText(state.resourceType)}</div>
        <div class="preview-info-content">
          <div class="preview-info-name">${state.resourceName}</div>
          <div class="preview-info-meta">
            <span class="tag-chip">${state.resourceTag}</span>
            <span>${state.resourceSize}</span>
          </div>
        </div>
      </div>
    `;
    $("#previewInfo").innerHTML = html;
  }

  function getComments() {
    return DATA.comments[state.resourceId] || DATA.comments.default || [];
  }

  function updateCommentCount() {
    const count = getComments().length;
    $("#commentCount").textContent = count;
  }

  function renderCommentList() {
    const comments = getComments();
    const container = $("#commentList");

    if (comments.length === 0) {
      container.innerHTML = `
        <div class="comment-empty">
          <svg viewBox="0 0 24 24" width="32" height="32"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <p>暂无评论</p>
          <p class="comment-empty-tip">快来发表第一条评论吧</p>
        </div>
      `;
      return;
    }

    container.innerHTML = comments.map(c => {
      const isMe = c.userId === DATA.currentUser.id;
      return `
        <div class="comment-item">
          <div class="comment-avatar">${c.avatar}</div>
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-user">${c.userName}${isMe ? "（本人）" : ""}</span>
              <span class="comment-time">${c.time}</span>
            </div>
            <div class="comment-content">${c.content}</div>
          </div>
        </div>
      `;
    }).join("");
  }

  function openCommentModal() {
    renderCommentList();
    $("#modalComment").classList.add("show");
  }

  function closeCommentModal() {
    $("#modalComment").classList.remove("show");
  }

  function sendComment() {
    const input = $("#commentInput");
    const content = input.value.trim();

    if (!content) {
      showToast("请输入评论内容");
      return;
    }

    // 添加新评论到数据
    const comments = getComments();
    const newComment = {
      id: "c-" + Date.now(),
      userId: DATA.currentUser.id,
      userName: DATA.currentUser.name,
      avatar: DATA.currentUser.avatar,
      content: content,
      time: new Date().toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).replace(/\//g, "-")
    };

    // 确保 comments 数组存在
    if (!DATA.comments[state.resourceId]) {
      DATA.comments[state.resourceId] = [];
    }
    DATA.comments[state.resourceId].push(newComment);

    // 清空输入框
    input.value = "";

    // 重新渲染
    renderCommentList();
    updateCommentCount();

    showToast("评论发送成功");
  }

  function bindEvents() {
    // 返回按钮
    $("#btnBack").addEventListener("click", () => {
      if (window.history.length > 1) window.history.back();
      else window.location.href = "detail.html";
    });

    // 打开评论区
    $("#btnOpenComment").addEventListener("click", openCommentModal);

    // 关闭评论区
    $("#modalComment .modal-mask").addEventListener("click", closeCommentModal);
    $("#modalComment [data-close]").addEventListener("click", closeCommentModal);

    // 发送评论
    $("#btnSendComment").addEventListener("click", sendComment);

    // 输入框回车发送
    $("#commentInput").addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendComment();
      }
    });

    // ---- 9键键盘逻辑 ----
    initT9Keyboard();
  }

  function initT9Keyboard() {
    const keyboard = $("#t9Keyboard");
    const input = $("#commentInput");
    const sheet = $(".modal-comment-sheet");
    if (!keyboard || !input) return;

    let currentKey = null;   // 当前按下的键
    let charIndex = 0;       // 当前键上的字符索引
    let confirmTimer = null; // 确认计时器
    let isSymbolMode = false;

    function showKeyboard() {
      keyboard.classList.add("show");
    }

    function hideKeyboard() {
      confirmPending();
      keyboard.classList.remove("show");
      keyboard.querySelector(".t9-keys").style.display = "";
      const symGrid = keyboard.querySelector(".t9-symbol-grid");
      if (symGrid) symGrid.remove();
      isSymbolMode = false;
      const toolbarLabel = keyboard.querySelector(".t9-toolbar-label");
      if (toolbarLabel) toolbarLabel.textContent = "中文九键";
    }

    function confirmPending() {
      if (currentKey !== null) {
        const chars = currentKey;
        const ch = chars[charIndex % chars.length];
        // 已经直接写入 input，无需再追加
        currentKey = null;
        charIndex = 0;
        if (confirmTimer) { clearTimeout(confirmTimer); confirmTimer = null; }
      }
    }

    function pressKey(chars) {
      if (currentKey === chars) {
        // 同一个键：循环切换字符
        // 先回退上一个待确认的字符
        input.value = input.value.slice(0, -1);
        charIndex = (charIndex + 1) % chars.length;
        input.value += chars[charIndex];
      } else {
        // 不同键：先确认上一个字符，再输入新字符
        confirmPending();
        currentKey = chars;
        charIndex = 0;
        input.value += chars[charIndex];
      }
      // 重置确认计时器
      if (confirmTimer) clearTimeout(confirmTimer);
      confirmTimer = setTimeout(() => {
        currentKey = null;
        charIndex = 0;
        confirmTimer = null;
      }, 800);
    }

    function pressSpace() {
      confirmPending();
      input.value += " ";
    }

    function pressBackspace() {
      if (currentKey !== null) {
        // 如果正在循环选字，先删除待确认字符
        input.value = input.value.slice(0, -1);
        currentKey = null;
        charIndex = 0;
        if (confirmTimer) { clearTimeout(confirmTimer); confirmTimer = null; }
      } else if (input.value.length > 0) {
        input.value = input.value.slice(0, -1);
      }
    }

    function showSymbols() {
      isSymbolMode = true;
      keyboard.querySelector(".t9-keys").style.display = "none";
      const toolbarLabel = keyboard.querySelector(".t9-toolbar-label");
      if (toolbarLabel) toolbarLabel.textContent = "符号";

      const symbols = ["，", "。", "！", "？", "、", "；", "：", """, """, "（", "）", "【", "】", "《", "》", "—", "…", "·", "@", "#", "¥", "&", "*", "+", "-", "/", "\\", "~", "©", "®"];
      let existing = keyboard.querySelector(".t9-symbol-grid");
      if (existing) existing.remove();

      const grid = document.createElement("div");
      grid.className = "t9-symbol-grid";
      grid.innerHTML = symbols.map(s =>
        `<button class="t9-symbol-btn" data-symbol="${s}">${s}</button>`
      ).join("");
      keyboard.querySelector(".t9-keys").after(grid);

      grid.querySelectorAll(".t9-symbol-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          confirmPending();
          input.value += btn.getAttribute("data-symbol");
        });
      });
    }

    function hideSymbols() {
      isSymbolMode = false;
      keyboard.querySelector(".t9-keys").style.display = "";
      const toolbarLabel = keyboard.querySelector(".t9-toolbar-label");
      if (toolbarLabel) toolbarLabel.textContent = "中文九键";
      const symGrid = keyboard.querySelector(".t9-symbol-grid");
      if (symGrid) symGrid.remove();
    }

    // 点击输入框弹出键盘
    input.addEventListener("focus", (e) => {
      e.target.blur(); // 阻止系统键盘
      showKeyboard();
    });
    input.addEventListener("click", (e) => {
      e.preventDefault();
      e.target.blur();
      showKeyboard();
    });

    // 收起键盘按钮
    $("#t9CloseKb").addEventListener("click", hideKeyboard);

    // 字母数字键
    keyboard.querySelectorAll(".t9-key[data-chars]").forEach(btn => {
      btn.addEventListener("click", () => {
        const chars = btn.getAttribute("data-chars");
        if (chars === " ") { pressSpace(); return; }
        pressKey(chars);
      });
    });

    // 功能键 - 退格
    $("#t9Backspace").addEventListener("click", pressBackspace);

    // 功能键 - 符号切换
    $("#t9Symbol").addEventListener("click", () => {
      if (isSymbolMode) hideSymbols();
      else showSymbols();
    });

    // 点击蒙层关闭时同时收起键盘
    const origClose = $("#modalComment .modal-mask");
    if (origClose) {
      origClose.addEventListener("click", hideKeyboard);
    }
    const closeBtn = $("#modalComment [data-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", hideKeyboard);
    }
  }

  function init() {
    renderHeader();
    renderInfoCard();
    updateCommentCount();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();