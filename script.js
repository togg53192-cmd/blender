const state = {
  timer: {
    minutes: 25,
    secondsLeft: 25 * 60,
    running: false,
    intervalId: null,
  },
  stats: {
    focusMinutes: 0,
    completedSessions: 0,
    completedTasks: 0,
  },
  streak: 0,
  subjects: [],
  friends: [],
  sessionCode: null,
  tasks: [],
};

const ui = {
  timerDisplay: document.getElementById('timerDisplay'),
  startTimerBtn: document.getElementById('startTimerBtn'),
  pauseTimerBtn: document.getElementById('pauseTimerBtn'),
  resetTimerBtn: document.getElementById('resetTimerBtn'),
  focusModeBtn: document.getElementById('focusModeBtn'),
  streakCount: document.getElementById('streakCount'),
  subjectForm: document.getElementById('subjectForm'),
  subjectInput: document.getElementById('subjectInput'),
  subjectGoalInput: document.getElementById('subjectGoalInput'),
  subjectList: document.getElementById('subjectList'),
  generateCodeBtn: document.getElementById('generateCodeBtn'),
  sessionCode: document.getElementById('sessionCode'),
  joinForm: document.getElementById('joinForm'),
  friendNameInput: document.getElementById('friendNameInput'),
  joinCodeInput: document.getElementById('joinCodeInput'),
  friendList: document.getElementById('friendList'),
  taskForm: document.getElementById('taskForm'),
  taskInput: document.getElementById('taskInput'),
  taskPriority: document.getElementById('taskPriority'),
  taskList: document.getElementById('taskList'),
  notesArea: document.getElementById('notesArea'),
  saveNotesBtn: document.getElementById('saveNotesBtn'),
  notesStatus: document.getElementById('notesStatus'),
  focusMinutes: document.getElementById('focusMinutes'),
  completedSessions: document.getElementById('completedSessions'),
  completedTasks: document.getElementById('completedTasks'),
  activeFriends: document.getElementById('activeFriends'),
};

const priorityRank = {
  High: 3,
  Medium: 2,
  Low: 1,
};

function updateTimerDisplay() {
  const mins = String(Math.floor(state.timer.secondsLeft / 60)).padStart(2, '0');
  const secs = String(state.timer.secondsLeft % 60).padStart(2, '0');
  ui.timerDisplay.textContent = `${mins}:${secs}`;
}

function updateStats() {
  ui.focusMinutes.textContent = state.stats.focusMinutes;
  ui.completedSessions.textContent = state.stats.completedSessions;
  ui.completedTasks.textContent = state.stats.completedTasks;
  ui.activeFriends.textContent = state.friends.length;
  ui.streakCount.textContent = `${state.streak} day${state.streak === 1 ? '' : 's'}`;
}

function startTimer() {
  if (state.timer.running) {
    return;
  }

  state.timer.running = true;
  state.timer.intervalId = setInterval(() => {
    state.timer.secondsLeft -= 1;
    updateTimerDisplay();

    if (state.timer.secondsLeft <= 0) {
      clearInterval(state.timer.intervalId);
      state.timer.running = false;
      state.stats.completedSessions += 1;
      state.stats.focusMinutes += state.timer.minutes;
      state.streak += 1;
      updateStats();
      alert('✅ Focus session complete. Great work!');
    }
  }, 1000);
}

function pauseTimer() {
  if (!state.timer.running) {
    return;
  }

  clearInterval(state.timer.intervalId);
  state.timer.running = false;
}

function resetTimer(minutes = state.timer.minutes) {
  pauseTimer();
  state.timer.minutes = minutes;
  state.timer.secondsLeft = minutes * 60;
  updateTimerDisplay();
}

function renderSubjects() {
  ui.subjectList.innerHTML = '';
  state.subjects.forEach((subject) => {
    const item = document.createElement('li');
    item.className = 'list-item';
    item.innerHTML = `
      <div>
        <strong>${subject.name}</strong>
        <small>Goal: ${subject.goal}h • Progress: ${subject.progress}h</small>
      </div>
      <div>
        <button class="chip" data-id="${subject.id}" data-action="log-hour">+1h</button>
        <button class="danger" data-id="${subject.id}" data-action="delete">Delete</button>
      </div>
    `;
    ui.subjectList.appendChild(item);
  });
}

function renderFriends() {
  ui.friendList.innerHTML = '';
  state.friends.forEach((friend) => {
    const item = document.createElement('li');
    item.className = 'list-item';
    item.innerHTML = `<span>${friend.name} joined <strong>${friend.code}</strong></span><span>🟢 Active</span>`;
    ui.friendList.appendChild(item);
  });
  updateStats();
}

function renderTasks() {
  ui.taskList.innerHTML = '';
  state.tasks
    .sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority])
    .forEach((task) => {
      const item = document.createElement('li');
      item.className = 'list-item';
      item.innerHTML = `
        <div class="${task.done ? 'task-done' : ''}">
          <strong>${task.text}</strong>
          <small>Priority: ${task.priority}</small>
        </div>
        <div>
          <button class="success" data-id="${task.id}" data-action="toggle">
            ${task.done ? 'Undo' : 'Done'}
          </button>
          <button class="danger" data-id="${task.id}" data-action="delete">Delete</button>
        </div>
      `;
      ui.taskList.appendChild(item);
    });
}

function generateSessionCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let index = 0; index < 6; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  state.sessionCode = code;
  ui.sessionCode.textContent = code;
}

function saveNotes() {
  localStorage.setItem('study-notes', ui.notesArea.value);
  ui.notesStatus.textContent = `Saved at ${new Date().toLocaleTimeString()}`;
}

function loadNotes() {
  const notes = localStorage.getItem('study-notes');
  if (notes) {
    ui.notesArea.value = notes;
    ui.notesStatus.textContent = 'Loaded saved notes';
  }
}

function bindEvents() {
  ui.startTimerBtn.addEventListener('click', startTimer);
  ui.pauseTimerBtn.addEventListener('click', pauseTimer);
  ui.resetTimerBtn.addEventListener('click', () => resetTimer());

  document.querySelectorAll('.chip[data-minutes], .chip[data-break]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const minutes = Number(event.target.dataset.minutes || event.target.dataset.break);
      resetTimer(minutes);
    });
  });

  ui.focusModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('focus-mode');
    ui.focusModeBtn.textContent =
      ui.focusModeBtn.textContent === 'Focus Mode' ? 'Exit Focus' : 'Focus Mode';
  });

  ui.subjectForm.addEventListener('submit', (event) => {
    event.preventDefault();
    state.subjects.push({
      id: crypto.randomUUID(),
      name: ui.subjectInput.value.trim(),
      goal: Number(ui.subjectGoalInput.value),
      progress: 0,
    });

    ui.subjectInput.value = '';
    ui.subjectGoalInput.value = '';
    renderSubjects();
  });

  ui.subjectList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) {
      return;
    }

    const { id, action } = button.dataset;
    const target = state.subjects.find((subject) => subject.id === id);
    if (!target) {
      return;
    }

    if (action === 'log-hour') {
      target.progress += 1;
    }

    if (action === 'delete') {
      state.subjects = state.subjects.filter((subject) => subject.id !== id);
    }

    renderSubjects();
  });

  ui.generateCodeBtn.addEventListener('click', generateSessionCode);

  ui.joinForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = ui.friendNameInput.value.trim();
    const inputCode = ui.joinCodeInput.value.trim().toUpperCase();

    if (!state.sessionCode) {
      alert('Generate a session code first.');
      return;
    }

    if (inputCode !== state.sessionCode) {
      alert('Invalid code. Ask your friend for the latest room code.');
      return;
    }

    state.friends.push({
      name,
      code: inputCode,
    });

    ui.friendNameInput.value = '';
    ui.joinCodeInput.value = '';
    renderFriends();
  });

  ui.taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    state.tasks.push({
      id: crypto.randomUUID(),
      text: ui.taskInput.value.trim(),
      priority: ui.taskPriority.value,
      done: false,
    });
    ui.taskInput.value = '';
    renderTasks();
  });

  ui.taskList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) {
      return;
    }

    const { id, action } = button.dataset;
    const task = state.tasks.find((entry) => entry.id === id);
    if (!task) {
      return;
    }

    if (action === 'toggle') {
      const previous = task.done;
      task.done = !task.done;
      if (!previous && task.done) {
        state.stats.completedTasks += 1;
      }
      if (previous && !task.done) {
        state.stats.completedTasks = Math.max(0, state.stats.completedTasks - 1);
      }
      updateStats();
    }

    if (action === 'delete') {
      if (task.done) {
        state.stats.completedTasks = Math.max(0, state.stats.completedTasks - 1);
      }
      state.tasks = state.tasks.filter((entry) => entry.id !== id);
      updateStats();
    }

    renderTasks();
  });

  ui.saveNotesBtn.addEventListener('click', saveNotes);

  ui.notesArea.addEventListener('input', () => {
    ui.notesStatus.textContent = 'Unsaved changes';
  });
}

function init() {
  updateTimerDisplay();
  updateStats();
  loadNotes();
  bindEvents();
}

init();
