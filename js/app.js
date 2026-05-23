// ===============================
// TaskFlow JS Pro
// Bu loyihada asosiy ishlar JavaScript bilan qilinadi:
// 1. Ma'lumotlarni array ichida saqlash
// 2. localStorage bilan browserga saqlash
// 3. DOM orqali HTMLga chiqarish
// 4. Search, filter, sort qilish
// 5. CRUD: create, read, update, delete
// 6. Dark / light mode
// 7. Dynamic statistics
// ===============================

const STORAGE_KEY = "taskflow-js-pro-tasks";
const THEME_KEY = "taskflow-js-pro-theme";

const defaultTasks = [
  {
    id: crypto.randomUUID(),
    title: "GitHub repository yaratish",
    description: "Loyihani GitHubga joylash uchun yangi repository ochish.",
    status: "done",
    priority: "high",
    deadline: getDateAfterDays(0),
    createdAt: Date.now() - 400000
  },
  {
    id: crypto.randomUUID(),
    title: "JavaScript CRUD yozish",
    description: "Task qo‘shish, o‘chirish va tahrirlash funksiyalarini yozish.",
    status: "progress",
    priority: "high",
    deadline: getDateAfterDays(2),
    createdAt: Date.now() - 300000
  },
  {
    id: crypto.randomUUID(),
    title: "Responsive design qilish",
    description: "Mobile va desktop ekranlar uchun chiroyli ko‘rinish berish.",
    status: "todo",
    priority: "medium",
    deadline: getDateAfterDays(4),
    createdAt: Date.now() - 200000
  },
  {
    id: crypto.randomUUID(),
    title: "README.md yozish",
    description: "GitHub sahifasida loyiha haqida ma'lumot chiqishi uchun README yozish.",
    status: "todo",
    priority: "low",
    deadline: getDateAfterDays(5),
    createdAt: Date.now() - 100000
  }
];

let tasks = loadTasks();
let currentView = "dashboard";

const elements = {
  statsGrid: document.querySelector("#statsGrid"),
  taskList: document.querySelector("#taskList"),
  taskCountText: document.querySelector("#taskCountText"),
  searchInput: document.querySelector("#searchInput"),
  filterStatus: document.querySelector("#filterStatus"),
  sortTasks: document.querySelector("#sortTasks"),
  modalOverlay: document.querySelector("#modalOverlay"),
  openModalBtn: document.querySelector("#openModalBtn"),
  closeModalBtn: document.querySelector("#closeModalBtn"),
  taskForm: document.querySelector("#taskForm"),
  taskId: document.querySelector("#taskId"),
  taskTitle: document.querySelector("#taskTitle"),
  taskDescription: document.querySelector("#taskDescription"),
  taskStatus: document.querySelector("#taskStatus"),
  taskPriority: document.querySelector("#taskPriority"),
  taskDeadline: document.querySelector("#taskDeadline"),
  modalTitle: document.querySelector("#modalTitle"),
  themeBtn: document.querySelector("#themeBtn"),
  pageTitle: document.querySelector("#pageTitle"),
  percentText: document.querySelector("#percentText"),
  circleProgress: document.querySelector("#circleProgress"),
  circleValue: document.querySelector("#circleValue"),
  miniChart: document.querySelector("#miniChart"),
  focusText: document.querySelector("#focusText")
};

init();

function init() {
  setSavedTheme();
  renderApp();
  addEvents();
}

function addEvents() {
  elements.openModalBtn.addEventListener("click", openCreateModal);
  elements.closeModalBtn.addEventListener("click", closeModal);
  elements.modalOverlay.addEventListener("click", closeModalByOverlay);
  elements.taskForm.addEventListener("submit", handleFormSubmit);
  elements.searchInput.addEventListener("input", renderTasks);
  elements.filterStatus.addEventListener("change", renderTasks);
  elements.sortTasks.addEventListener("change", renderTasks);
  elements.themeBtn.addEventListener("click", toggleTheme);

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");
      currentView = btn.dataset.view;
      elements.pageTitle.textContent = btn.textContent;
      renderApp();
    });
  });
}

function renderApp() {
  renderStats();
  renderTasks();
  renderProgress();
  renderChart();
  updateFocusText();
}

function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);

  if (!savedTasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTasks));
    return defaultTasks;
  }

  return JSON.parse(savedTasks);
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getDateAfterDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function getStatistics() {
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "done").length;
  const progress = tasks.filter((task) => task.status === "progress").length;
  const todo = tasks.filter((task) => task.status === "todo").length;
  const high = tasks.filter((task) => task.priority === "high").length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return { total, done, progress, todo, high, percent };
}

function renderStats() {
  const stats = getStatistics();

  const cards = [
    { label: "Total Tasks", value: stats.total, icon: "📌" },
    { label: "Done", value: stats.done, icon: "✅" },
    { label: "In Progress", value: stats.progress, icon: "⚡" },
    { label: "High Priority", value: stats.high, icon: "🔥" }
  ];

  elements.statsGrid.innerHTML = cards.map((card) => {
    return `
      <article class="stat-card">
        <div>
          <p>${card.label}</p>
          <h3>${card.value}</h3>
        </div>
        <span class="stat-icon">${card.icon}</span>
      </article>
    `;
  }).join("");
}

function getVisibleTasks() {
  const searchValue = elements.searchInput.value.toLowerCase().trim();
  const statusValue = elements.filterStatus.value;
  const sortValue = elements.sortTasks.value;

  let visibleTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchValue) ||
      task.description.toLowerCase().includes(searchValue);

    const matchesStatus = statusValue === "all" || task.status === statusValue;

    return matchesSearch && matchesStatus;
  });

  if (sortValue === "newest") {
    visibleTasks.sort((a, b) => b.createdAt - a.createdAt);
  }

  if (sortValue === "oldest") {
    visibleTasks.sort((a, b) => a.createdAt - b.createdAt);
  }

  if (sortValue === "priority") {
    const priorityScore = { high: 3, medium: 2, low: 1 };
    visibleTasks.sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);
  }

  return visibleTasks;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();

  elements.taskCountText.textContent = `${visibleTasks.length} ta vazifa`;

  if (currentView === "analytics") {
    elements.taskList.innerHTML = `
      <div class="empty-state">
        <h3>Analytics bo‘limi</h3>
        <p>O‘ng panelda vazifalar statistikasi JavaScript orqali hisoblanmoqda.</p>
      </div>
    `;
    return;
  }

  if (currentView === "about") {
    elements.taskList.innerHTML = `
      <div class="empty-state">
        <h3>About Project</h3>
        <p>Bu project GitHub portfolio uchun. Ko‘p qismi JS: CRUD, localStorage, filter, search, sort, theme va statistics.</p>
      </div>
    `;
    return;
  }

  if (visibleTasks.length === 0) {
    elements.taskList.innerHTML = `
      <div class="empty-state">
        <h3>Vazifa topilmadi</h3>
        <p>Yangi task qo‘shing yoki filter/searchni o‘zgartiring.</p>
      </div>
    `;
    return;
  }

  elements.taskList.innerHTML = visibleTasks.map((task) => {
    return `
      <article class="task-card">
        <div class="task-top">
          <div>
            <h4>${escapeHTML(task.title)}</h4>
            <div class="badges">
              <span class="badge ${task.status}">${formatStatus(task.status)}</span>
              <span class="badge ${task.priority}">${task.priority}</span>
              <span class="badge">📅 ${task.deadline || "No deadline"}</span>
            </div>
          </div>

          <div class="task-actions">
            <button class="icon-btn" onclick="changeTaskStatus('${task.id}')" title="Status o'zgartirish">↻</button>
            <button class="icon-btn" onclick="openEditModal('${task.id}')" title="Edit">✎</button>
            <button class="icon-btn" onclick="deleteTask('${task.id}')" title="Delete">🗑</button>
          </div>
        </div>

        <p>${escapeHTML(task.description || "Tavsif yozilmagan.")}</p>
      </article>
    `;
  }).join("");
}

function formatStatus(status) {
  const names = {
    todo: "Todo",
    progress: "Progress",
    done: "Done"
  };

  return names[status] || status;
}

function openCreateModal() {
  elements.modalTitle.textContent = "Yangi vazifa";
  elements.taskForm.reset();
  elements.taskId.value = "";
  elements.taskDeadline.value = getDateAfterDays(1);
  elements.modalOverlay.classList.add("show");
}

function openEditModal(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;

  elements.modalTitle.textContent = "Vazifani tahrirlash";
  elements.taskId.value = task.id;
  elements.taskTitle.value = task.title;
  elements.taskDescription.value = task.description;
  elements.taskStatus.value = task.status;
  elements.taskPriority.value = task.priority;
  elements.taskDeadline.value = task.deadline;

  elements.modalOverlay.classList.add("show");
}

function closeModal() {
  elements.modalOverlay.classList.remove("show");
}

function closeModalByOverlay(event) {
  if (event.target === elements.modalOverlay) {
    closeModal();
  }
}

function handleFormSubmit(event) {
  event.preventDefault();

  const id = elements.taskId.value;
  const taskData = {
    title: elements.taskTitle.value.trim(),
    description: elements.taskDescription.value.trim(),
    status: elements.taskStatus.value,
    priority: elements.taskPriority.value,
    deadline: elements.taskDeadline.value
  };

  if (id) {
    updateTask(id, taskData);
  } else {
    createTask(taskData);
  }

  closeModal();
}

function createTask(taskData) {
  const newTask = {
    id: crypto.randomUUID(),
    ...taskData,
    createdAt: Date.now()
  };

  tasks.unshift(newTask);
  saveTasks();
  renderApp();
}

function updateTask(id, taskData) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, ...taskData };
    }

    return task;
  });

  saveTasks();
  renderApp();
}

function deleteTask(id) {
  const isConfirm = confirm("Bu vazifani o‘chirmoqchimisiz?");
  if (!isConfirm) return;

  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderApp();
}

function changeTaskStatus(id) {
  const statusOrder = ["todo", "progress", "done"];

  tasks = tasks.map((task) => {
    if (task.id !== id) return task;

    const currentIndex = statusOrder.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;

    return {
      ...task,
      status: statusOrder[nextIndex]
    };
  });

  saveTasks();
  renderApp();
}

function renderProgress() {
  const stats = getStatistics();
  const degree = Math.round((stats.percent / 100) * 360);

  elements.percentText.textContent = `${stats.percent}%`;
  elements.circleValue.textContent = `${stats.percent}%`;
  elements.circleProgress.style.background = `conic-gradient(var(--primary) ${degree}deg, var(--border) ${degree}deg)`;
}

function renderChart() {
  const stats = getStatistics();
  const total = stats.total || 1;

  const rows = [
    { label: "Todo", value: stats.todo },
    { label: "Progress", value: stats.progress },
    { label: "Done", value: stats.done }
  ];

  elements.miniChart.innerHTML = rows.map((row) => {
    const width = Math.round((row.value / total) * 100);

    return `
      <div class="chart-row">
        <span>${row.label}</span>
        <div class="bar"><span style="width:${width}%"></span></div>
        <b>${row.value}</b>
      </div>
    `;
  }).join("");
}

function updateFocusText() {
  const stats = getStatistics();

  if (stats.todo === 0 && stats.progress === 0) {
    elements.focusText.textContent = "Hamma vazifa bajarildi";
    return;
  }

  elements.focusText.textContent = `${stats.todo + stats.progress} ta aktiv vazifa`;
}

function toggleTheme() {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  elements.themeBtn.textContent = isDark ? "☀️" : "🌙";
}

function setSavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    elements.themeBtn.textContent = "☀️";
  }
}

function escapeHTML(text) {
  return text.replace(/[&<>"']/g, (char) => {
    const symbols = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return symbols[char];
  });
}

// HTML onclick ishlashi uchun funksiyalarni windowga biriktiryapmiz
window.openEditModal = openEditModal;
window.deleteTask = deleteTask;
window.changeTaskStatus = changeTaskStatus;
