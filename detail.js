/* ============================================================
 *  集体备课 · 详情页交互（detail.html）
 * ============================================================ */

(function () {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const DATA = window.MOCK_DATA;
  const params = new URLSearchParams(location.search);
  const MAX_UPLOAD = 10;

  const state = {
    nodeId: params.get("nodeId") || "u1-p1",
    label:  params.get("label")  || "教学内容",
    path:   (params.get("path") || "教学内容").split("/"),
    groupId: params.get("groupId") || "g1",
    tab:    "group",
    currentTeacherId: DATA.currentUser.id,
    menuTarget: null,
    editTypeTarget: null,
    renameTarget: null
  };

  function getResourceData() {
    return DATA.resources[state.nodeId] || DATA.resources.default;
  }

  function isHost() {
    const res = getResourceData();
    return res.hostId === DATA.currentUser.id;
  }

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

  function closeModal(modalId) {
    $(modalId).classList.remove("show");
  }

  function renderHeader() {
    $("#detailTitle").textContent = state.label;
    const pathEl = $("#detailPath");
    const parts = state.path.map((p, i) => {
      const isLast = i === state.path.length - 1;
      return `<span class="path-part ${isLast ? "cur" : ""}">${p}</span>`;
    }).join('<span class="path-sep">/</span>');
    pathEl.innerHTML = parts;

    const res = getResourceData();
    $("#hostName").textContent = res.hostName || DATA.currentUser.name;
  }

  function renderResourceTypes() {
    const res = getResourceData();
    const displayTypes = ["教案", "课件"];
    const tags = displayTypes.map(t => {
      const exists = res.group.some(r => r.tag === t);
      return `<span class="type-tag ${exists ? "done" : "pending"}">${t}</span>`;
    }).join("");
    $("#resourceTypes").innerHTML = tags;
  }

  function renderResourceCard(item) {
    return `
      <div class="resource-card" data-id="${item.id}">
        <div class="resource-icon ${iconClass(item.type)}">${iconText(item.type)}</div>
        <div class="resource-info">
          <div class="resource-title">${item.name}</div>
          <div class="resource-meta">
            <span class="tag-chip">${item.tag}</span>
            <span>${item.size}</span>
          </div>
        </div>
        <div class="resource-actions">
          <button class="btn-mini" title="在线编辑">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="btn-mini" title="添加为个备资源">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="btn-more" title="更多操作" data-id="${item.id}">
            <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  function renderGroupResources() {
    const res = getResourceData();
    const list = $("#groupResources");
    const items = res.group || [];
    
    if (items.length === 0) {
      list.innerHTML = `<div style="padding: 32px 16px; text-align: center; color: var(--text-sub); font-size: 13px;">主备人未上传集备资源</div>`;
    } else {
      list.innerHTML = items.map(renderResourceCard).join("");
      bindGroupResourceActions();
    }
  }

  function renderPersonalResources() {
    const res = getResourceData();
    const list = $("#personalResources");
    const data = res.personal && res.personal[state.currentTeacherId] || [];
    
    if (data.length === 0) {
      list.innerHTML = `<div style="padding: 32px 16px; text-align: center; color: var(--text-light); font-size: 13px;">暂无个备资源</div>`;
    } else {
      list.innerHTML = data.map(renderResourceCard).join("");
      bindPersonalResourceActions();
    }
  }

  function bindGroupResourceActions() {
    // 资源卡片点击跳转到预览页
    $$(".resource-card", $("#groupResources")).forEach(card => {
      card.addEventListener("click", e => {
        // 如果点击的是操作按钮，不跳转
        if (e.target.closest(".btn-mini") || e.target.closest(".btn-more")) return;
        
        const resourceId = card.getAttribute("data-id");
        const res = getResourceData();
        const item = res.group.find(r => r.id === resourceId);
        if (item) {
          const qs = new URLSearchParams({
            resourceId: item.id,
            resourceName: item.name,
            resourceType: item.type,
            resourceTag: item.tag,
            resourceSize: item.size,
            nodeId: state.nodeId,
            kind: "group"
          }).toString();
          window.location.href = `preview.html?${qs}`;
        }
      });
    });

    // 更多操作按钮
    $$(".btn-more", $("#groupResources")).forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        state.menuTarget = { kind: "group", id: btn.getAttribute("data-id") };
        $("#modalMenu").classList.add("show");
      });
    });
  }

  function bindPersonalResourceActions() {
    // 资源卡片点击跳转到预览页
    $$(".resource-card", $("#personalResources")).forEach(card => {
      card.addEventListener("click", e => {
        // 如果点击的是操作按钮，不跳转
        if (e.target.closest(".btn-mini") || e.target.closest(".btn-more")) return;
        
        const resourceId = card.getAttribute("data-id");
        const res = getResourceData();
        const items = res.personal && res.personal[state.currentTeacherId] || [];
        const item = items.find(r => r.id === resourceId);
        if (item) {
          const qs = new URLSearchParams({
            resourceId: item.id,
            resourceName: item.name,
            resourceType: item.type,
            resourceTag: item.tag,
            resourceSize: item.size,
            nodeId: state.nodeId,
            kind: "personal"
          }).toString();
          window.location.href = `preview.html?${qs}`;
        }
      });
    });

    // 更多操作按钮
    $$(".btn-more", $("#personalResources")).forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        state.menuTarget = { kind: "personal", id: btn.getAttribute("data-id") };
        $("#modalMenu").classList.add("show");
      });
    });
  }

  function isTeacherComplete(teacherId) {
    const res = getResourceData();
    const personal = (res.personal && res.personal[teacherId]) || [];
    const hasLessonPlan = personal.some(r => r.tag === "教案");
    const hasCourseware = personal.some(r => r.tag === "课件");
    return hasLessonPlan && hasCourseware;
  }

  function renderTeacherScroll() {
    const html = DATA.teachers.map(t => {
      const active = t.id === state.currentTeacherId;
      const isMe = t.id === DATA.currentUser.id;
      const complete = isTeacherComplete(t.id);
      const badgeClass = complete ? "status-badge complete" : "status-badge incomplete";
      return `
        <div class="teacher-avatar-item ${active ? "active" : ""}" data-id="${t.id}">
          <div class="teacher-avatar-wrap">
            <div class="teacher-avatar ${active ? "active" : ""}">${t.avatar}</div>
            <span class="${badgeClass}"></span>
          </div>
          <span class="teacher-name ${active ? "active" : ""}">${isMe ? "本人" : t.name}</span>
        </div>
      `;
    }).join("");
    $("#teacherScroll").innerHTML = html;

    $$(".teacher-avatar-item").forEach(el => {
      el.addEventListener("click", () => {
        state.currentTeacherId = el.getAttribute("data-id");
        renderTeacherScroll();
        renderPersonalResourceTypes();
        renderPersonalResources();
        updateUploadArea();
      });
    });
  }

  function renderPersonalResourceTypes() {
    const res = getResourceData();
    const personal = (res.personal && res.personal[state.currentTeacherId]) || [];
    const requiredTypes = ["教案", "课件"];
    const tags = requiredTypes.map(t => {
      const exists = personal.some(r => r.tag === t);
      return `<span class="type-tag ${exists ? "done" : "pending"}">${t}</span>`;
    }).join("");
    $("#personalResourceTypes").innerHTML = tags;
  }

  function hasRequiredResources() {
    const res = getResourceData();
    const groupResources = res.group || [];
    const hasLessonPlan = groupResources.some(r => r.tag === "教案");
    const hasCourseware = groupResources.some(r => r.tag === "课件");
    return hasLessonPlan && hasCourseware;
  }

  function updateCompleteBtn() {
    const btn = $("#btnComplete");
    if (!btn) return;

    const res = getResourceData();
    const groupResources = res.group || [];
    const hasLessonPlan = groupResources.some(r => r.tag === "教案");
    const hasCourseware = groupResources.some(r => r.tag === "课件");

    if (hasLessonPlan && hasCourseware) {
      btn.disabled = false;
      btn.classList.remove("disabled");
    } else {
      btn.disabled = true;
      btn.classList.add("disabled");
    }
  }

  function updateUploadArea() {
    const isMe = state.currentTeacherId === DATA.currentUser.id;
    const bottomBar = $("#bottomBar");
    
    if (state.tab === "group") {
      const canUpload = isHost();
      $("#groupUploadArea").classList.toggle("hide", !canUpload);
      if (canUpload) {
        const count = getResourceData().group.length;
        $("#groupUploadText").textContent = `上传资源（还可上传 ${MAX_UPLOAD - count} / ${MAX_UPLOAD}）`;
      }
      bottomBar.classList.toggle("hide", !isHost());
      updateCompleteBtn();
    } else {
      const canUpload = isMe;
      $("#personalUploadArea").classList.toggle("hide", !canUpload);
      if (canUpload) {
        const res = getResourceData();
        const count = (res.personal && res.personal[state.currentTeacherId] || []).length;
        $("#personalUploadText").textContent = `上传资源（还可上传 ${MAX_UPLOAD - count} / ${MAX_UPLOAD}）`;
      }
      bottomBar.classList.add("hide");
    }
  }

  function switchTab(tab) {
    state.tab = tab;
    $$(".tab-item").forEach(el => el.classList.toggle("active", el.dataset.tab === tab));
    $$(".tab-content").forEach(el => el.classList.remove("active"));
    $(tab === "group" ? "#tabGroup" : "#tabPersonal").classList.add("active");
    updateUploadArea();
  }

  function bindTabs() {
    $$(".tab-item").forEach(el => {
      el.addEventListener("click", () => switchTab(el.dataset.tab));
    });
  }

  function handleFiles(files, kind) {
    const resData = getResourceData();
    const target = kind === "group" 
      ? resData.group 
      : (resData.personal[state.currentTeacherId] || []);

    if (target.length >= MAX_UPLOAD) {
      showToast("已达到最大上传数量");
      return;
    }

    const maxToAdd = MAX_UPLOAD - target.length;
    const filesToAdd = Array.from(files).slice(0, maxToAdd);

    filesToAdd.forEach(file => {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const typeMap = { doc: "doc", docx: "doc", pdf: "pdf",
                        ppt: "ppt", pptx: "ppt", zip: "zip", rar: "zip",
                        mp3: "audio", wav: "audio", mp4: "video" };
      const type = typeMap[ext] || "other";
      const kb = file.size / 1024;
      const sizeText = kb > 1024 ? (kb / 1024).toFixed(1) + " MB" : kb.toFixed(1) + " KB";
      
      const newItem = {
        id: "tmp-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
        name: file.name,
        type, tag: "上传", size: sizeText
      };
      target.push(newItem);
    });

    if (kind === "group") {
      renderGroupResources();
      renderResourceTypes();
    } else {
      renderPersonalResources();
      renderPersonalResourceTypes();
      renderTeacherScroll();
    }
    updateUploadArea();
    showToast(`成功上传 ${filesToAdd.length} 个文件`);
  }

  function bindUploads() {
    $("#fileGroup").addEventListener("change", e => {
      if (e.target.files.length) handleFiles(e.target.files, "group");
      e.target.value = "";
    });
    $("#filePersonal").addEventListener("change", e => {
      if (e.target.files.length) handleFiles(e.target.files, "personal");
      e.target.value = "";
    });
  }

  function bindMenuActions() {
    $$(".menu-item").forEach(el => {
      el.addEventListener("click", () => {
        const action = el.getAttribute("data-action");
        if (!action || !state.menuTarget) {
          $("#modalMenu").classList.remove("show");
          return;
        }

        const { kind, id } = state.menuTarget;
        const res = getResourceData();
        const arr = kind === "group" ? res.group : (res.personal[state.currentTeacherId] || []);
        const idx = arr.findIndex(x => x.id === id);

        if (action === "delete" && idx >= 0) {
          arr.splice(idx, 1);
          if (kind === "group") {
            renderGroupResources();
            renderResourceTypes();
          } else {
            renderPersonalResources();
            renderPersonalResourceTypes();
            renderTeacherScroll();
          }
          updateUploadArea();
          showToast("已删除");
          $("#modalMenu").classList.remove("show");
          state.menuTarget = null;
        } else if (action === "download") {
          showToast("开始下载...");
          $("#modalMenu").classList.remove("show");
          state.menuTarget = null;
        } else if (action === "edit") {
          if (idx >= 0) {
            state.editTypeTarget = { kind, id, currentTag: arr[idx].tag };
            renderTypeGrid(arr[idx].tag);
            $("#modalMenu").classList.remove("show");
            $("#modalEditType").classList.add("show");
          }
        } else if (action === "rename") {
          if (idx >= 0) {
            state.renameTarget = { kind, id, currentName: arr[idx].name };
            $("#renameInput").value = arr[idx].name;
            $("#modalMenu").classList.remove("show");
            $("#modalRename").classList.add("show");
          }
        }
      });
    });

    $("#modalMenu .modal-mask").addEventListener("click", () => {
      $("#modalMenu").classList.remove("show");
      state.menuTarget = null;
    });
  }

  function renderTypeGrid(selectedTag) {
    const html = DATA.resourceTypes.map(t => {
      const active = t === selectedTag;
      return `<button class="type-tag-item ${active ? "active" : ""}" data-type="${t}">${t}</button>`;
    }).join("");
    $("#typeGrid").innerHTML = html;

    $$(".type-tag-item").forEach(el => {
      el.addEventListener("click", () => {
        $$(".type-tag-item").forEach(item => item.classList.remove("active"));
        el.classList.add("active");
        state.editTypeTarget.newTag = el.getAttribute("data-type");
      });
    });
  }

  function bindTypeModalActions() {
    $$("[data-close]", $("#modalEditType")).forEach(el => {
      el.addEventListener("click", () => {
        closeModal("#modalEditType");
        state.editTypeTarget = null;
      });
    });

    $("#btnConfirmType").addEventListener("click", () => {
      if (!state.editTypeTarget) {
        closeModal("#modalEditType");
        return;
      }

      const { kind, id, newTag } = state.editTypeTarget;
      if (!newTag) {
        showToast("请选择资源类型");
        return;
      }

      const res = getResourceData();
      const arr = kind === "group" ? res.group : (res.personal[state.currentTeacherId] || []);
      const idx = arr.findIndex(x => x.id === id);

      if (idx >= 0) {
        arr[idx].tag = newTag;
        if (kind === "group") {
          renderGroupResources();
          renderResourceTypes();
        } else {
          renderPersonalResources();
          renderPersonalResourceTypes();
          renderTeacherScroll();
        }
        showToast("修改成功");
      }

      closeModal("#modalEditType");
      state.editTypeTarget = null;
    });
  }

  function bindRenameModalActions() {
    $$("[data-close]", $("#modalRename")).forEach(el => {
      el.addEventListener("click", () => {
        closeModal("#modalRename");
        state.renameTarget = null;
      });
    });

    $("#btnConfirmRename").addEventListener("click", () => {
      if (!state.renameTarget) {
        closeModal("#modalRename");
        return;
      }

      const newName = $("#renameInput").value.trim();
      if (!newName) {
        showToast("请输入名称");
        return;
      }

      const { kind, id } = state.renameTarget;
      const res = getResourceData();
      const arr = kind === "group" ? res.group : (res.personal[state.currentTeacherId] || []);
      const idx = arr.findIndex(x => x.id === id);

      if (idx >= 0) {
        arr[idx].name = newName;
        if (kind === "group") {
          renderGroupResources();
        } else {
          renderPersonalResources();
        }
        showToast("重命名成功");
      }

      closeModal("#modalRename");
      state.renameTarget = null;
    });
  }

  function renderResourceStatusList() {
    const res = getResourceData();
    const groupResources = res.group || [];
    const container = $("#resourceStatusList");
    
    const html = DATA.resourceTypes.map(type => {
      const matched = groupResources.filter(r => r.tag === type);
      const hasResource = matched.length > 0;
      
      return `
        <div class="resource-status-item">
          <div class="resource-status-icon ${hasResource ? "done" : "pending"}">
            ${hasResource ? "✓" : "!"}
          </div>
          <span class="resource-status-name">${type}</span>
          <span class="resource-status-info">
            ${hasResource ? `${matched.map(r => r.name).join("、")}` : "未上传"}
          </span>
        </div>
      `;
    }).join("");
    
    container.innerHTML = html;
  }

  function bindCompleteBtn() {
    if ($("#btnComplete")) {
      $("#btnComplete").addEventListener("click", () => {
        if ($("#btnComplete").disabled) return;
        renderResourceStatusList();
        $("#modalComplete").classList.add("show");
      });
    }
  }

  function bindCompleteModalActions() {
    $$("[data-close]", $("#modalComplete")).forEach(el => {
      el.addEventListener("click", () => {
        closeModal("#modalComplete");
      });
    });

    $("#btnConfirmComplete").addEventListener("click", () => {
      showToast("已完成集备");
      closeModal("#modalComplete");
      setTimeout(() => window.history.back(), 1500);
    });
  }

  function bindCommon() {
    if ($("#btnBack")) {
      $("#btnBack").addEventListener("click", () => {
        if (window.history.length > 1) window.history.back();
        else window.location.href = "index.html";
      });
    }
  }

  function init() {
    renderHeader();
    renderResourceTypes();
    renderGroupResources();
    renderTeacherScroll();
    renderPersonalResourceTypes();
    renderPersonalResources();
    bindTabs();
    bindUploads();
    bindMenuActions();
    bindTypeModalActions();
    bindRenameModalActions();
    bindCompleteBtn();
    bindCompleteModalActions();
    bindCommon();
    updateUploadArea();
    switchTab("group");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();