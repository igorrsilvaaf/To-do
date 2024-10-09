// Botão da sidebar responsivo
const menuToggle = document.getElementById('menu-toggle');
menuToggle.addEventListener('click', function () {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
    if (sidebar.classList.contains('active')) {
        sidebar.style.display = 'block';
    } else {
        sidebar.style.display = 'none';
    }
});

// Função para esconder todas as seções
function hideAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });
}

// Função para mostrar a seção selecionada
function showSection(sectionId) {
    hideAllSections(); // Esconde todas as seções
    const section = document.getElementById(sectionId);
    section.classList.remove('hidden'); // Mostra a seção desejada
    section.classList.add('active');
}

// Função para atualizar o título da página
function setPageTitle(title) {
    document.getElementById('page-title').textContent = title;
}

// Vincular eventos de clique no menu lateral
const menuItems = [
    { id: 'menu-home', section: 'home-section', title: 'Home' },
    { id: 'menu-projects', section: 'projects-section', title: 'Projetos' },
    { id: 'menu-dev-site', section: 'dev-site-section', title: 'Desenvolvimento de Site' },
    { id: 'menu-reports', section: 'reports-section', title: 'Relatórios' }
];

menuItems.forEach(item => {
    document.getElementById(item.id).addEventListener('click', function () {
        showSection(item.section);
        setPageTitle(item.title);
        if (window.innerWidth <= 768) {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.remove('active'); // Fecha o menu ao clicar em um item no modo mobile
            sidebar.style.display = 'none';
        }
        if (item.id === 'menu-reports') {
            loadReports(); // Carrega os relatórios ao clicar no menu Relatórios
        }
    });
});

// Inicializar mostrando a Home
window.addEventListener('load', function () {
    showSection('home-section');
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'block';
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
    const taskText = document.getElementById('taskName').value.trim();
    const taskType = document.getElementById('taskType').value.trim();
    const taskDueDate = new Date(document.getElementById('taskDueDate').value).toLocaleDateString('pt-BR');
    const taskResponsible = document.getElementById('taskResponsible').value.trim();
    const taskProject = document.getElementById('taskProject').value;

    if (taskText && taskType && taskDueDate && taskResponsible) {
        const task = {
            id: Date.now(),
            text: taskText,
            type: taskType,
            dueDate: taskDueDate,
            responsible: taskResponsible,
            project: taskProject,
            status: 'Em andamento'
        };

        renderTask(task);

        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        saveTasks(tasks);
        saveReport('Adicionada', task);

        document.getElementById('taskForm').reset();
    } else {
        alert("Preencha todos os campos corretamente!");
    }
}

// Função para aplicar a cor correta ao status
function applyStatusColor(taskRow, status) {
    const statusCell = taskRow.children[1]; // Coluna do status

    // Remove classes anteriores
    statusCell.classList.remove('status-in-progress', 'status-completed');

    // Adiciona a classe correta com base no status
    if (status === 'Em andamento') {
        statusCell.classList.add('status-in-progress');
    } else if (status === 'Concluída') {
        statusCell.classList.add('status-completed');
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
        <td>${task.project}</td>
        <td>${task.dueDate}</td>
        <td>${task.responsible}</td>
        <td><input type="checkbox" class="btn-complete"></td>
        <td><button class="btn-delete">🗑️</button></td>
    `;

    taskList.appendChild(taskRow);
    applyStatusColor(taskRow, task.status);

    taskRow.querySelector('.btn-complete').addEventListener('change', function () {
        const newStatus = this.checked ? 'Concluída' : 'Em andamento';
        task.status = newStatus;
        taskRow.children[1].textContent = task.status;
        applyStatusColor(taskRow, task.status);
        updateTask(task.id, task);
        saveReport('Status atualizado para ' + newStatus, task);
    });

    taskRow.querySelector('.btn-delete').addEventListener('click', function () {
        taskList.removeChild(taskRow);
        saveReport('Deletada', task);
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

// Função para carregar os projetos no campo de seleção
function loadProjectsInSelect() {
    const projectSelect = document.getElementById('taskProject');
    projectSelect.innerHTML = '<option value="" disabled selected>Selecione um Projeto</option>'; // Limpa o select antes de adicionar novos projetos
    const projects = JSON.parse(localStorage.getItem('projects')) || [];

    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.name; // O valor será o nome do projeto
        option.textContent = project.name; // O texto também será o nome do projeto
        projectSelect.appendChild(option); // Adiciona o projeto no campo de seleção
    });
}

// Função para carregar os projetos do localStorage
function loadProjects() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    projects.forEach(project => renderProject(project));
    loadProjectsInSelect();
}

// Função para salvar os projetos no localStorage
function saveProjects(projects) {
    localStorage.setItem('projects', JSON.stringify(projects));
}

// Função para adicionar um novo projeto
function addProject(event) {
    event.preventDefault();

    const projectName = document.getElementById('projectName').value.trim();
    const projectDueDate = document.getElementById('projectDueDate').value;

    if (projectName && projectDueDate) {
        const project = {
            id: Date.now(),
            name: projectName,
            dueDate: projectDueDate
        };

        renderProject(project);

        const projects = JSON.parse(localStorage.getItem('projects')) || [];
        projects.push(project);
        saveProjects(projects);

        document.getElementById('projectForm').reset();
        loadProjectsInSelect();
    } else {
        alert("Preencha todos os campos do projeto corretamente!");
    }
}

// Função para renderizar um projeto na tabela
function renderProject(project) {
    const projectList = document.getElementById('projectList');

    const projectRow = document.createElement('tr');
    projectRow.setAttribute('data-id', project.id);

    projectRow.innerHTML = `
        <td>${project.name}</td>
        <td>${project.dueDate}</td>
        <td><button class="btn-delete-project">🗑️</button></td>
    `;

    projectList.appendChild(projectRow);

    // Evento para excluir o projeto
    projectRow.querySelector('.btn-delete-project').addEventListener('click', function () {
        projectList.removeChild(projectRow);
        deleteProject(project.id);
    });
}

// Função para deletar um projeto
function deleteProject(id) {
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    projects = projects.filter(project => project.id !== id);
    saveProjects(projects);
}

// Carregar os projetos ao iniciar a página
window.addEventListener('load', loadProjects);

// Adicionar novo projeto ao enviar o formulário
document.getElementById('projectForm').addEventListener('submit', addProject);

// Função para salvar relatórios de alterações
function saveReport(action, task) {
    const reports = JSON.parse(localStorage.getItem('reports')) || [];
    const report = {
        action,
        taskText: task.text,
        taskResponsible: task.responsible,
        date: new Date().toLocaleString('pt-BR'),
        status: task.status
    };
    reports.push(report);
    localStorage.setItem('reports', JSON.stringify(reports));
}

// Função para carregar relatórios
function loadReports() {
    const reportsSection = document.getElementById('reports-section');
    let reportsTable = document.getElementById('reportsTable');

    if (!reportsTable) {
        reportsTable = document.createElement('table');
        reportsTable.id = 'reportsTable';
        reportsTable.classList.add('reports-table');
        reportsTable.innerHTML = `
            <thead>
                <tr>
                    <th>Ação</th>
                    <th>Tarefa</th>
                    <th>Responsável</th>
                    <th>Data</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody id="reportsList"></tbody>
        `;
        const reportsContainer = document.createElement('div');
        reportsContainer.classList.add('reports-table-container');
        reportsContainer.appendChild(reportsTable);
        reportsSection.appendChild(reportsContainer);
    }

    const reportsList = document.getElementById('reportsList');
    reportsList.innerHTML = '';

    const reports = JSON.parse(localStorage.getItem('reports')) || [];
    reports.forEach(report => {
        const reportRow = document.createElement('tr');
        reportRow.innerHTML = `
            <td>${report.action}</td>
            <td>${report.taskText}</td>
            <td>${report.taskResponsible}</td>
            <td>${report.date}</td>
            <td>${report.status}</td>
        `;
        reportsList.appendChild(reportRow);
    });
}