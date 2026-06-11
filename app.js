/* ============================================================
 *  集体备课 · 主页面交互（index.html）
 *  - 备课组切换弹层
 *  - 目录树渲染（默认全部展开）
 *  - 叶子节点跳转到详情页
 * ============================================================ */

(function () {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const DATA = window.MOCK_DATA;
  const state = {
    currentGroupId: "g1",
    currentSchoolId: "s1",
    currentCampus: "演示校区",
    currentPlanId: "p1"
  };

  /* ---------- 状态标识渲染 ---------- */
  function renderStatusTags(statusArr) {
    if (!statusArr || statusArr.length === 0) return "";
    const map = { "集": "s-ji", "个": "s-ge", "思": "s-si" };
    return statusArr.map(s =>
      `<span class="status-tag ${map[s] || ""}">${s}</span>`
    ).join("");
  }

  /* ---------- 目录树：递归渲染，全部展开 ---------- */
  function flattenTree(nodes, level = 0, rows = []) {
    nodes.forEach(node => {
      const isLeaf = !node.children || node.children.length === 0;
      rows.push({ ...node, _level: level, _isLeaf: isLeaf });
      if (!isLeaf) {
        flattenTree(node.children, level + 1, rows);
      }
    });
    return rows;
  }

  function renderTree() {
    const nodes = DATA.trees[state.currentGroupId] || [];
    const flat  = flattenTree(nodes, 0, []);
    const container = $("#treeList");

    if (flat.length === 0) {
      container.innerHTML = `
        <div style="padding: 48px 20px; text-align: center;">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px;">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18M9 3v18"/>
          </svg>
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 6px;">暂未创建教学规划</div>
          <div style="font-size: 13px; color: #9ca3af;">备课组长可在电脑端设置教学计划</div>
        </div>
      `;
      return;
    }

    container.innerHTML = flat.map(row => {
      const indentHtml = row._level > 0
        ? `<span class="tree-indent" style="margin-left:${row._level * 16}px"></span>`
        : "";
      const dotOrArrow = row._isLeaf
        ? `<span class="tree-dot"></span>`
        : ``;
      // 只有叶子节点显示状态标识
      const rightContent = row._isLeaf
        ? `<div class="tree-right">${renderStatusTags(row.status)}<svg class="arrow-right" viewBox="0 0 24 24" width="14" height="14"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
        : ``;

      return `
        <div class="tree-row level-${row._level} ${row._isLeaf ? "leaf" : ""}" data-id="${row.id}" data-label="${row.label}">
          <div class="tree-left">
            ${indentHtml}
            ${dotOrArrow}
            <span class="tree-label">${row.label}</span>
          </div>
          ${rightContent}
        </div>
      `;
    }).join("");

    // 绑定点击：叶子节点跳转到详情页
    $$(".tree-row.leaf", container).forEach(el => {
      el.addEventListener("click", () => {
        const id    = el.getAttribute("data-id");
        const label = el.getAttribute("data-label");
        const path  = buildPath(id);
        const qs = new URLSearchParams({
          nodeId: id,
          label: label,
          path: path.join("/"),
          groupId: state.currentGroupId
        }).toString();
        window.location.href = `detail.html?${qs}`;
      });
    });
  }

  // 从根节点查找路径
  function buildPath(nodeId) {
    const nodes = DATA.trees[state.currentGroupId] || [];
    const path = [];
    function dfs(list) {
      for (const n of list) {
        path.push(n.label);
        if (n.id === nodeId) return true;
        if (n.children && dfs(n.children)) return true;
        path.pop();
      }
      return false;
    }
    dfs(nodes);
    return path;
  }

  /* ---------- 学校/校区渲染 ---------- */
  function renderSchoolHeader() {
    const school = DATA.schools.find(s => s.id === state.currentSchoolId) || DATA.schools[0];
    $("#schoolText").textContent = `${school.name}（${state.currentCampus}）`;
  }

  /* ---------- 教学计划渲染 ---------- */
  function renderPlanHeader() {
    const plan = DATA.teachingPlans.find(p => p.id === state.currentPlanId) || DATA.teachingPlans[0];
    $("#planName").textContent = plan.name;
    
    const statusEl = $("#planStatus");
    statusEl.textContent = plan.status;
    statusEl.className = "plan-status";
    
    if (plan.status === "进行中") {
      statusEl.classList.add("status-progress");
    } else if (plan.status === "未开始") {
      statusEl.classList.add("status-pending");
    } else if (plan.status === "已结束") {
      statusEl.classList.add("status-done");
    }
  }

  /* ---------- 学校/校区切换弹层 ---------- */
  function renderSchoolList() {
    const container = $("#schoolList");
    let html = "";
    
    DATA.schools.forEach(school => {
      html += `
        <div class="school-section">
          <div class="school-section-title">${school.name}</div>
          <div class="campus-list">
            ${school.campuses.map(campus => {
              const isActive = state.currentSchoolId === school.id && state.currentCampus === campus;
              return `
                <div class="campus-item ${isActive ? "active" : ""}" data-school="${school.id}" data-campus="${campus}">
                  ${campus}
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;

    $$(".campus-item", container).forEach(el => {
      el.addEventListener("click", () => {
        state.currentSchoolId = el.getAttribute("data-school");
        state.currentCampus = el.getAttribute("data-campus");
        renderSchoolHeader();
        closeModal();
      });
    });
  }

  /* ---------- 教学计划切换弹层 ---------- */
  function renderPlanList() {
    const container = $("#planList");
    const current = state.currentPlanId;

    container.innerHTML = DATA.teachingPlans.map(plan => {
      const isActive = plan.id === current;
      const statusClass = plan.status === "进行中" ? "status-progress" : 
                         plan.status === "未开始" ? "status-pending" : "status-done";
      return `
        <div class="plan-item ${isActive ? "active" : ""}" data-id="${plan.id}">
          <div class="plan-item-name">${plan.name}</div>
          <span class="plan-item-status ${statusClass}">${plan.status}</span>
        </div>
      `;
    }).join("");

    $$(".plan-item", container).forEach(el => {
      el.addEventListener("click", () => {
        state.currentPlanId = el.getAttribute("data-id");
        renderPlanHeader();
        closeModal();
      });
    });
  }

  /* ---------- 备课组头部渲染 ---------- */
  function renderGroupHeader() {
    const group = DATA.groups.find(g => g.id === state.currentGroupId) || DATA.groups[0];
    const isHost = group.hostId === DATA.currentUser.id;

    $("#groupName").textContent = group.name;

    const leaderEl = $("#groupLeader");
    if (isHost) {
      leaderEl.textContent = "组长";
      leaderEl.classList.remove("hide");
    } else {
      leaderEl.classList.add("hide");
    }

    // 进度
    $("#progressFill").style.width = group.progress + "%";
    $("#progressText").textContent  = group.progress + "%";
  }

  /* ---------- 备课组切换弹层 ---------- */
  function renderGroupList() {
    const container = $("#groupList");
    const current   = state.currentGroupId;

    container.innerHTML = DATA.groups.map(g => {
      const isHost   = g.hostId === DATA.currentUser.id;
      const isActive = g.id === current;
      return `
        <div class="group-item ${isActive ? "active" : ""}" data-id="${g.id}">
          <div class="group-item-left">
            <div style="min-width:0">
              <div class="group-item-name">
                ${g.name}
                ${isHost ? `<span class="group-item-tag host">组长</span>` : ""}
                ${isActive ? `<span class="group-item-tag current">当前</span>` : ""}
              </div>
              <div class="group-item-sub">个备进度 ${g.progress}%</div>
            </div>
          </div>
        </div>
      `;
    }).join("");

    $$(".group-item", container).forEach(el => {
      el.addEventListener("click", () => {
        state.currentGroupId = el.getAttribute("data-id");
        renderGroupHeader();
        renderTree();
        closeModal();
      });
    });
  }

  function openModal(type) {
    if (type === "school") {
      renderSchoolList();
      $("#modalSchool").classList.add("show");
    } else if (type === "plan") {
      renderPlanList();
      $("#modalPlan").classList.add("show");
    } else {
      renderGroupList();
      $("#modalGroup").classList.add("show");
    }
  }
  function closeModal() {
    $("#modalSchool").classList.remove("show");
    $("#modalPlan").classList.remove("show");
    $("#modalGroup").classList.remove("show");
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    $("#btnSchoolSwitcher").addEventListener("click", () => openModal("school"));
    $("#btnPlanSwitcher").addEventListener("click", () => openModal("plan"));
    $("#btnGroupSwitcher").addEventListener("click", () => openModal("group"));
    
    $("#modalSchool .modal-mask").addEventListener("click", closeModal);
    $("#modalSchool [data-close]").addEventListener("click", closeModal);
    
    $("#modalPlan .modal-mask").addEventListener("click", closeModal);
    $("#modalPlan [data-close]").addEventListener("click", closeModal);
    
    $("#modalGroup .modal-mask").addEventListener("click", closeModal);
    $("#modalGroup [data-close]").addEventListener("click", closeModal);

    // 返回按钮（小程序 H5 场景，兼容无返回的情况）
    if ($("#btnBack")) {
      $("#btnBack").addEventListener("click", () => {
        if (window.history.length > 1) window.history.back();
      });
    }
  }

  /* ---------- 初始化 ---------- */
  function init() {
    // 支持从 URL 指定参数
    const params = new URLSearchParams(location.search);
    if (params.get("groupId")) state.currentGroupId = params.get("groupId");
    if (params.get("schoolId")) state.currentSchoolId = params.get("schoolId");
    if (params.get("campus")) state.currentCampus = params.get("campus");
    if (params.get("planId")) state.currentPlanId = params.get("planId");

    renderSchoolHeader();
    renderPlanHeader();
    renderGroupHeader();
    renderTree();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
