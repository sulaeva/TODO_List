document.addEventListener('DOMContentLoaded', function () {
    const authModal = document.getElementById('authModal');
    const app = document.getElementById('app');

    // === Проверка авторизации ===
    function checkAuth() {
        const token = localStorage.getItem('accessToken');
        if (token) {
            authModal.style.display = 'none';
            app.style.display = 'block';
            loadUserData();
            loadTasks();
        } else {
            authModal.style.display = 'block';
            app.style.display = 'none';
        }
    }

    // === Переключение вкладок ===
    window.switchTab = function (tabName, e) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(`${tabName}Tab`).classList.add('active');
        if (e) e.target.classList.add('active');
    };

    // === Вход ===
    async function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = '';

        try {
            const res = await fetch('/api/auth/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('accessToken', data.tokens.access);
                location.reload();
            } else {
                const err = await res.json();
                errorDiv.textContent = err.detail || 'Неверный логин или пароль';
            }
        } catch (err) {
            errorDiv.textContent = 'Ошибка подключения к серверу';
        }
    }

    // === Регистрация ===
    async function handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        const errorDiv = document.getElementById('registerError');
        errorDiv.textContent = '';

        if (password !== passwordConfirm) {
            errorDiv.textContent = 'Пароли не совпадают';
            return;
        }

        try {
            const res = await fetch('/api/auth/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('accessToken', data.tokens.access);
                location.reload();
            } else {
                const err = await res.json();
                errorDiv.textContent = err.detail || 'Ошибка регистрации';
            }
        } catch (err) {
            errorDiv.textContent = 'Ошибка подключения к серверу';
        }
    }

    // === Выход ===
    function handleLogout() {
        localStorage.removeItem('accessToken');
        location.reload();
    }

    // === Загрузка профиля ===
    async function loadUserData() {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch('/api/auth/me/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const user = await res.json();
                document.getElementById('currentUser').textContent = `👤 ${user.username}`;
            }
        } catch (e) {
            console.error('Не удалось загрузить профиль');
            handleLogout(); // если токен просрочен
        }
    }

    // === Загрузка задач ===
    async function loadTasks() {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch('/api/tasks/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                renderTasks(data.results || data);
            }
        } catch (e) {
            console.error('Не удалось загрузить задачи');
        }
    }

    // === Отображение задач ===
    function renderTasks(tasks) {
        const lists = {
            todo: document.getElementById('todo-list'),
            in_progress: document.getElementById('inprogress-list'),
            done: document.getElementById('done-list')
        };

        // Очистка
        Object.values(lists).forEach(list => list.innerHTML = '');

        tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';
            if (task.status === 'done') card.classList.add('done');

            const deadline = task.deadline ? new Date(task.deadline).toLocaleDateString() : '—';

            card.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description?.substring(0, 60)}${(task.description?.length > 60) ? '...' : ''}</p>
                <p>📅 ${deadline}</p>
                ${task.status !== 'done' ? '<button class="move-btn">→</button>' : ''}
            `;

            const btn = card.querySelector('.move-btn');
            if (btn) {
                btn.addEventListener('click', () => moveTask(task.id, task.status));
            }

            lists[task.status]?.appendChild(card);
        });
    }

    // === Добавление задачи ===
    async function addTask() {
        const token = localStorage.getItem('accessToken');
        const title = document.getElementById('taskTitleInput').value.trim();
        const description = document.getElementById('taskDescriptionInput').value.trim();
        const deadline = document.getElementById('taskDeadlineInput').value;

        if (!title || !description || !deadline) {
            alert('Заполните все поля');
            return;
        }

        try {
            const res = await fetch('/api/tasks/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description, status: 'todo', deadline })
            });

            if (res.ok) {
                document.getElementById('taskTitleInput').value = '';
                document.getElementById('taskDescriptionInput').value = '';
                document.getElementById('taskDeadlineInput').value = '';
                loadTasks();
            } else {
                alert('Ошибка при добавлении задачи');
            }
        } catch (e) {
            alert('Ошибка сети');
        }
    }

    // === Перемещение задачи ===
    async function moveTask(taskId, currentStatus) {
        const token = localStorage.getItem('accessToken');
        let newStatus = null;

        if (currentStatus === 'todo') newStatus = 'in_progress';
        else if (currentStatus === 'in_progress') newStatus = 'done';
        else return;

        try {
            const res = await fetch(`/api/tasks/${taskId}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                loadTasks();
            }
        } catch (e) {
            alert('Ошибка при обновлении задачи');
        }
    }

    // === Назначение обработчиков ===
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('addTaskBtn')?.addEventListener('click', addTask);

    // === Запуск ===
    checkAuth();
});