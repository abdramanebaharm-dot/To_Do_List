// ===== STATE =====
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// ===== DOM ELEMENTS =====
const taskInput  = document.getElementById('taskInput');
const addBtn     = document.getElementById('addBtn');
const taskList   = document.getElementById('taskList');
const taskCount  = document.getElementById('taskCount');
const clearDone  = document.getElementById('clearDone');
const filterBtns = document.querySelectorAll('.filter-btn');

// ===== SAVE TO LOCALSTORAGE =====
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ===== RENDER TASKS =====
function render() {
  const filtered = tasks.filter(t => {
    if (currentFilter === 'active') return !t.done;
    if (currentFilter === 'done')   return t.done;
    return true;
  });

  taskList.innerHTML = '';

  if (filtered.length === 0) {
    taskList.innerHTML = `
      <li class="empty-state">
        <span class="emoji">📝</span>
        Aucune tâche ici !
      </li>`;
  } else {
    filtered.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' done' : '');
      li.dataset.id = task.id;

      li.innerHTML = `
        <input type="checkbox" class="task-check" ${task.done ? 'checked' : ''} title="Marquer comme terminée"/>
        <span class="task-text">${escapeHTML(task.text)}</span>
        <button class="delete-btn" title="Supprimer">✕</button>
      `;

      // Events
      li.querySelector('.task-check').addEventListener('change', () => toggleTask(task.id));
      li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id, li));

      taskList.appendChild(li);
    });
  }

  updateCount();
}

// ===== ADD TASK =====
function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    taskInput.classList.add('shake');
    setTimeout(() => taskInput.classList.remove('shake'), 400);
    return;
  }

  tasks.push({
    id:   Date.now(),
    text: text,
    done: false
  });

  taskInput.value = '';
  taskInput.focus();
  saveTasks();
  render();
}

// ===== TOGGLE TASK =====
function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTasks();
  render();
}

// ===== DELETE TASK =====
function deleteTask(id, li) {
  li.style.transition = 'opacity 0.25s, transform 0.25s';
  li.style.opacity    = '0';
  li.style.transform  = 'translateX(30px)';

  setTimeout(() => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }, 250);
}

// ===== CLEAR DONE =====
function clearDoneTasks() {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  render();
}

// ===== COUNT =====
function updateCount() {
  const remaining = tasks.filter(t => !t.done).length;
  taskCount.textContent = `${remaining} tâche${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}`;
}

// ===== ESCAPE HTML =====
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== EVENTS =====
addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

clearDone.addEventListener('click', clearDoneTasks);

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

// ===== SHAKE ANIMATION (CSS injected) =====
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  .shake { animation: shake 0.4s ease; border-color: #c0392b !important; }
`;
document.head.appendChild(style);

// ===== INIT =====
render();