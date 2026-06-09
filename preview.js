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

    // 输入框聚焦时滚动到底部
    $("#commentInput").addEventListener("focus", () => {
      setTimeout(() => {
        const list = $("#commentList");
        list.scrollTop = list.scrollHeight;
      }, 300);
    });
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