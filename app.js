const nodes = [
  { id: "bio", name: "生物医药", type: "上游", stage: "upstream", x: 145, y: 130, color: "#176b53" },
  { id: "diagnostics", name: "检测与数据", type: "上游", stage: "upstream", x: 325, y: 95, color: "#2f628f" },
  { id: "devices", name: "智能硬件", type: "中游", stage: "midstream", x: 535, y: 120, color: "#2f8177" },
  { id: "care", name: "医疗照护", type: "中游", stage: "midstream", x: 705, y: 225, color: "#a64238" },
  { id: "home", name: "居家养老", type: "下游", stage: "downstream", x: 585, y: 390, color: "#b9832f" },
  { id: "finance", name: "养老金融", type: "下游", stage: "downstream", x: 370, y: 445, color: "#594f9c" },
  { id: "city", name: "适老城市", type: "支撑", stage: "support", x: 170, y: 360, color: "#47713d" },
  { id: "talent", name: "人才标准", type: "支撑", stage: "support", x: 410, y: 270, color: "#8a5a37" },
];

const links = [
  ["bio", "diagnostics"],
  ["diagnostics", "devices"],
  ["devices", "care"],
  ["care", "home"],
  ["home", "finance"],
  ["finance", "city"],
  ["city", "bio"],
  ["diagnostics", "talent"],
  ["talent", "care"],
  ["talent", "home"],
  ["devices", "home"],
  ["bio", "care"],
];

const companies = [
  {
    name: "康复机器人企业",
    node: "devices",
    stage: "midstream",
    location: "硬件 / 软件 / 服务",
    need: "寻找康复机构、临床验证、医保支付研究伙伴",
    tags: ["机器人", "康复", "运动功能"],
  },
  {
    name: "连续健康监测平台",
    node: "diagnostics",
    stage: "upstream",
    location: "AI / 传感器 / 数据",
    need: "寻找可穿戴设备厂商、体检中心、慢病管理渠道",
    tags: ["检测", "数据", "慢病"],
  },
  {
    name: "细胞与再生医学团队",
    node: "bio",
    stage: "upstream",
    location: "研发 / 临床 / 注册",
    need: "寻找转化医学平台、伦理合规支持、长期随访队列",
    tags: ["再生医学", "临床研究", "健康寿命"],
  },
  {
    name: "社区医养结合机构",
    node: "care",
    stage: "midstream",
    location: "医疗 / 护理 / 康复",
    need: "寻找远程医疗系统、护理人才、康复设备供应商",
    tags: ["医养结合", "护理", "康复"],
  },
  {
    name: "适老化家居解决方案",
    node: "home",
    stage: "downstream",
    location: "家装 / IoT / 服务",
    need: "寻找地产、物业、保险和居家评估合作方",
    tags: ["适老家居", "安全", "居家养老"],
  },
  {
    name: "养老金融与长护险服务商",
    node: "finance",
    stage: "downstream",
    location: "保险 / 资管 / 支付",
    need: "寻找健康管理数据、服务履约网络、风险模型伙伴",
    tags: ["长期护理", "保险", "支付"],
  },
  {
    name: "年龄友好城市运营方",
    node: "city",
    stage: "support",
    location: "城市更新 / 交通 / 公共服务",
    need: "寻找适老设施供应商、社区运营方、评估指标体系",
    tags: ["城市", "公共服务", "无障碍"],
  },
  {
    name: "护理人才培训平台",
    node: "talent",
    stage: "support",
    location: "教育 / 标准 / 认证",
    need: "寻找养老机构、医院、职业院校和课程共建伙伴",
    tags: ["人才", "标准", "培训"],
  },
];

const resources = [
  {
    kind: "全球倡议",
    title: "WHO：联合国健康老龄化十年 2021-2030",
    summary: "适合跟踪健康老龄化、长期照护、年龄友好社区和利益相关方协作框架。",
    node: "city",
    stage: "support",
    url: "https://www.who.int/initiatives/decade-of-healthy-ageing",
  },
  {
    kind: "市场报告",
    title: "AARP：Global Longevity Economy Outlook",
    summary: "提供 50 岁以上人口消费、GDP、就业和劳动收入影响的全球视角。",
    node: "finance",
    stage: "downstream",
    url: "https://www.aarp.org/pri/topics/work-finances-retirement/economics-aging/global-longevity-economy/",
  },
  {
    kind: "共建模板",
    title: "企业记录建议字段",
    summary: "企业名称、所在节点、产品能力、合作需求、城市、来源链接、更新时间、贡献人。",
    node: "talent",
    stage: "support",
    url: "./README.md",
  },
  {
    kind: "数据方向",
    title: "健康寿命、功能能力和服务可及性指标",
    summary: "建议围绕健康寿命、慢病负担、照护供给、支付方式和适老城市建设持续补充。",
    node: "diagnostics",
    stage: "upstream",
    url: "./README.md",
  },
];

const stageLabels = {
  upstream: "上游",
  midstream: "中游",
  downstream: "下游",
  support: "支撑",
};

const state = {
  filter: "all",
  query: "",
  selectedNode: null,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function includesQuery(item) {
  if (!state.query) return true;
  const haystack = JSON.stringify(item).toLowerCase();
  return haystack.includes(state.query.toLowerCase());
}

function matchesFilters(item) {
  const stageMatch = state.filter === "all" || item.stage === state.filter;
  const nodeMatch = !state.selectedNode || item.node === state.selectedNode;
  return stageMatch && nodeMatch && includesQuery(item);
}

function drawMap() {
  const linkLayer = $("#linkLayer");
  const nodeLayer = $("#nodeLayer");
  linkLayer.innerHTML = "";
  nodeLayer.innerHTML = "";

  links.forEach(([fromId, toId]) => {
    const from = nodes.find((node) => node.id === fromId);
    const to = nodes.find((node) => node.id === toId);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2 - 35;
    path.setAttribute("class", "link");
    path.setAttribute("d", `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`);
    linkLayer.appendChild(path);
  });

  nodes.forEach((node) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const type = document.createElementNS("http://www.w3.org/2000/svg", "text");

    const visibleByStage = state.filter === "all" || node.stage === state.filter;
    const selected = state.selectedNode === node.id;
    group.setAttribute("class", `node-button${visibleByStage ? "" : " is-dimmed"}${selected ? " is-selected" : ""}`);
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", `筛选 ${node.name}`);
    group.setAttribute("transform", `translate(${node.x} ${node.y})`);

    circle.setAttribute("r", "58");
    circle.setAttribute("fill", node.color);
    label.setAttribute("y", "2");
    label.textContent = node.name;
    type.setAttribute("class", "node-type");
    type.setAttribute("y", "24");
    type.textContent = node.type;

    group.append(circle, label, type);
    group.addEventListener("click", () => selectNode(node.id));
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectNode(node.id);
      }
    });
    nodeLayer.appendChild(group);
  });
}

function selectNode(nodeId) {
  state.selectedNode = state.selectedNode === nodeId ? null : nodeId;
  render();
}

function renderCompanies() {
  const grid = $("#companyGrid");
  const filtered = companies.filter(matchesFilters);
  grid.innerHTML = filtered.length
    ? filtered
        .map(
          (company) => `
            <article class="company-card">
              <div>
                <h3>${company.name}</h3>
                <p>${company.need}</p>
              </div>
              <div class="tags">
                <span class="tag stage-badge">${stageLabels[company.stage]}</span>
                ${company.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
              </div>
              <div class="company-meta">
                <span>${company.location}</span>
                <span>${nodes.find((node) => node.id === company.node).name}</span>
              </div>
            </article>
          `,
        )
        .join("")
    : '<div class="empty">没有匹配结果。可以换一个关键词，或点击图谱节点取消筛选。</div>';
}

function renderResources() {
  const list = $("#resourceList");
  const filtered = resources.filter(matchesFilters);
  list.innerHTML = filtered.length
    ? filtered
        .map(
          (resource) => `
            <article class="resource-row">
              <div class="resource-kind">${resource.kind}</div>
              <div>
                <h3>${resource.title}</h3>
                <p>${resource.summary}</p>
              </div>
              <a href="${resource.url}" target="${resource.url.startsWith("http") ? "_blank" : "_self"}" rel="noreferrer">打开</a>
            </article>
          `,
        )
        .join("")
    : '<div class="empty">当前筛选下暂无资源。欢迎在开源仓库中补充。</div>';
}

function renderStats() {
  $("#nodeCount").textContent = nodes.length;
  $("#companyCount").textContent = companies.filter(matchesFilters).length;
  $("#resourceCount").textContent = resources.filter(matchesFilters).length;
}

function render() {
  drawMap();
  renderCompanies();
  renderResources();
  renderStats();
}

function bindEvents() {
  $("#searchInput").addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    render();
  });

  $$(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      state.selectedNode = null;
      $$(".segment").forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    });
  });
}

bindEvents();
render();
