// ================= API =================
const API_BASE = 'http://127.0.0.1:8000/api';

// ================= DOM =================
const authModal = document.getElementById('authModal');
const app = document.getElementById('app');
const currentUser = document.getElementById('currentUser');
const logoutBtn = document.getElementById('logoutBtn');

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    document.getElementById('loginForm').addEventListener('submit', login);
    document.getElementById('registerForm').addEventListener('submit', register);

    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) addTaskBtn.addEventListener('click', addTask);
});

// ================= AUTH CHECK =================
function checkAuth() {
    const token = localStorage.getItem('access_token');

    if (token) {
        authModal.style.display = 'none';
        app.style.display = 'block';
        loadUserProfile();
    } else {
        authModal.style.display = 'block';
        app.style.display = 'none';
    }
}

// ================= TAB SWITCH =================
function switchTab(tab, e) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(tab + 'Tab').classList.add('active');
    if (e) e.target.classList.add('active');
}

// ================= REGISTER =================
async function register(e) {
    e.preventDefault();

    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const errorDiv = document.getElementById('registerError');

    errorDiv.textContent = '';

    if (password !== passwordConfirm) {
        errorDiv.textContent = 'Пароли не совпадают';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email,
                password,
                password_confirm: passwordConfirm
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const firstError = Object.values(data)[0];
            throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
        }

        localStorage.setItem('access_token', data.tokens.access);
        checkAuth();

    } catch (error) {
        errorDiv.textContent = error.message || 'Ошибка регистрации';
    }
}

// ================= LOGIN =================
async function login(e) {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    errorDiv.textContent = '';

    try {
        const response = await fetch(`${API_BASE}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,   // если backend требует email — заменить на email
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error('Неверные учетные данные');
        }

        localStorage.setItem('access_token', data.tokens.access);
        checkAuth();

    } catch (error) {
        errorDiv.textContent = error.message;
    }
}

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem('access_token');
    checkAuth();
}

// ================= LOAD PROFILE =================
async function loadUserProfile() {
    const token = localStorage.getItem('access_token');

    try {
        const response = await fetch(`${API_BASE}/auth/me/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error();

        const data = await response.json();
        currentUser.textContent = `👤 ${data.username}`;

        loadTasks();

    } catch {
        logout();
    }
}

// ================= LOAD TASKS =================
async function loadTasks() {
    const token = localStorage.getItem('access_token');

    try {
        const response = await fetch(`${API_BASE}/tasks/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error();

        const data = await response.json();

        const todoList = document.getElementById('todo-list');
        const inprogressList = document.getElementById('inprogress-list');
        const doneList = document.getElementById('done-list');

        todoList.innerHTML = '';
        inprogressList.innerHTML = '';
        doneList.innerHTML = '';

        data.results.forEach(task => {
            const el = createTaskElement(task);

            if (task.status === 'todo') todoList.appendChild(el);
            if (task.status === 'in_progress') inprogressList.appendChild(el);
            if (task.status === 'done') doneList.appendChild(el);
        });

    } catch (error) {
        console.error(error);
    }
}

// ================= CREATE TASK =================
function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = 'task-card';
    if (task.status === 'done') div.classList.add('done');

    div.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}</p>
        <p>📅 ${new Date(task.deadline).toLocaleDateString()}</p>
        ${task.status !== 'done' ? `<button class="move-btn">→</button>` : ''}
    `;

    const btn = div.querySelector('.move-btn');
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            moveTask(task.id, task.status);
        });
    }

    return div;
}

// ================= ADD TASK =================
async function addTask() {
    const token = localStorage.getItem('access_token');

    const title = document.getElementById('taskTitleInput').value.trim();
    const description = document.getElementById('taskDescriptionInput').value.trim();
    const deadline = document.getElementById('taskDeadlineInput').value;

    if (!title || !description || !deadline) {
        alert('Заполните все поля');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/tasks/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                description,
                status: 'todo',
                deadline
            })
        });

        if (!response.ok) throw new Error();

        document.getElementById('taskTitleInput').value = '';
        document.getElementById('taskDescriptionInput').value = '';
        document.getElementById('taskDeadlineInput').value = '';

        loadTasks();

    } catch {
        alert('Ошибка при добавлении задачи');
    }
}

// ================= MOVE TASK =================
async function moveTask(taskId, currentStatus) {
    const token = localStorage.getItem('access_token');

    let newStatus = null;
    if (currentStatus === 'todo') newStatus = 'in_progress';
    if (currentStatus === 'in_progress') newStatus = 'done';

    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error();

        loadTasks();

    } catch {
        alert('Ошибка при обновлении задачи');
    }
}
