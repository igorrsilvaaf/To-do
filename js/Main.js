// Função para esconder todas as seções
function hideAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    sections.forEach(section => section.classList.add('hidden'));
}

// Função para mostrar a seção selecionada
function showSection(sectionId) {
    hideAllSections(); // Esconde todas as seções
    document.getElementById(sectionId).classList.remove('hidden'); // Mostra a seção desejada
    document.getElementById(sectionId).classList.add('active');
}

// Função para atualizar o título da página
function setPageTitle(title) {
    document.getElementById('page-title').textContent = title;
}

// Vincular eventos de clique no menu lateral
document.getElementById('menu-home').addEventListener('click', function () {
    showSection('home-section');
    setPageTitle('Home');
});

document.getElementById('menu-projects').addEventListener('click', function () {
    showSection('projects-section');
    setPageTitle('Projetos');
});

document.getElementById('menu-dev-site').addEventListener('click', function () {
    showSection('dev-site-section');
    setPageTitle('Desenvolvimento de Site');
});

document.getElementById('menu-crm').addEventListener('click', function () {
    showSection('crm-section');
    setPageTitle('Integração CRM');
});

document.getElementById('menu-reports').addEventListener('click', function () {
    showSection('reports-section');
    setPageTitle('Relatórios');
});

// Inicializar mostrando a Home
window.addEventListener('load', function () {
    showSection('home-section');
});

// Função para carregar as tarefas do localStorage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => renderTask(task));
}

// Função para salvar as tarefas no localStorage
function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Função para adicionar uma nova tarefa
function addTask(event) {
    event.preventDefault();

    const taskText = document.getElementById('taskName').value;
    const taskType = document.getElementById('taskType').value;
    const taskDueDate = document.getElementById('taskDueDate').value;
    const taskResponsible = document.getElementById('taskResponsible').value;

    if (taskText && taskType && taskDueDate && taskResponsible) {
        const task = {
            id: Date.now(),
            text: taskText,
            type: taskType,
            dueDate: taskDueDate,
            responsible: taskResponsible,
            status: 'Em andamento'
        };

        renderTask(task);

        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        saveTasks(tasks);

        document.getElementById('taskForm').reset();
    }
}

// Função para renderizar a tarefa na tabela
function renderTask(task) {
    const taskList = document.getElementById('taskList');

    const taskRow = document.createElement('tr');
    taskRow.setAttribute('data-id', task.id);

    taskRow.innerHTML = `
        <td>${task.text}</td>
        <td>${task.status}</td>
        <td>${task.type}</td>
        <td>${task.dueDate}</td>
        <td>${task.responsible}</td>
        <td><input type="checkbox" class="btn-complete"></td>
        <td><button class="btn-delete">🗑️</button></td>
    `;

    taskList.appendChild(taskRow);

    taskRow.querySelector('.btn-complete').addEventListener('change', function () {
        task.status = this.checked ? 'Concluída' : 'Em andamento';
        taskRow.children[1].textContent = task.status;
        updateTask(task.id, task);
    });

    taskRow.querySelector('.btn-delete').addEventListener('click', function () {
        taskList.removeChild(taskRow);
        deleteTask(task.id);
    });
}

// Função para atualizar uma tarefa no localStorage
function updateTask(id, updatedTask) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(task => task.id === id);
    tasks[taskIndex] = updatedTask;
    saveTasks(tasks);
}

// Função para deletar uma tarefa
function deleteTask(id) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.id !== id);
    saveTasks(tasks);
}

// Carregar as tarefas ao iniciar a página
window.addEventListener('load', loadTasks);

// Adicionar nova tarefa ao enviar o formulário
document.getElementById('taskForm').addEventListener('submit', addTask);