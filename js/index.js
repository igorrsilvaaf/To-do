// Botão da sidebar responsivo
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');

menuToggle.addEventListener('click', function () {
    sidebar.classList.toggle('active');
    if (sidebar.classList.contains('active')) {
        sidebar.style.display = 'block';
    } else {
        sidebar.style.display = 'none';
    }
});

// Fechar o menu quando o mouse sair dele
sidebar.addEventListener('mouseleave', function () {
    if (window.innerWidth > 768) { // Fechar apenas em telas maiores se realmente necessário
        sidebar.classList.remove('active');
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
    if (section) {
        section.classList.remove('hidden'); // Mostra a seção desejada
        section.classList.add('active');
    } else {
        console.error(`Seção com ID ${sectionId} não encontrada.`);
    }

}

// Função para atualizar o título da página
function setPageTitle(title) {
    document.getElementById('page-title').textContent = title;
}

// Vincular eventos de clique no menu lateral
const menuItems = [
    { id: 'menu-home', section: 'home-section', title: 'Lista de Tarefas ✏️' },
    { id: 'menu-projects', section: 'projects-section', title: 'Categorias 🗄️' },
    { id: 'menu-notebook', section: 'notebook-section', title: 'Caderno 📓' },
    { id: 'menu-reports', section: 'reports-section', title: 'Relatórios 📊' }
];

menuItems.forEach(item => {
    document.getElementById(item.id).addEventListener('click', function (event) {
        event.stopPropagation(); // Impede que o evento clique se propague para outros elementos
        event.preventDefault(); // Evita comportamentos padrão indesejados

        console.log("Clicou em: ", item.id);
        showSection(item.section);
        setPageTitle(item.title);

        if (window.innerWidth <= 768) {
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
    sidebar.style.display = 'none';
});

// Iniciando o IndexDB
let db;
const request = indexedDB.open('TaskManagerDB', 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;

    // Criação de stores
    if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
    }
}

request.onsuccess = function (event) {
    db = event.target.result;
    loadTasks();
    loadProjects();
};

request.onerror = function (event) {
    console.error('Erro ao abrir IndexedDB', event.target.errorCode);
};

// Variáveis de controle para carregamento de dados
let taskLoaded = false;
let projectsLoaded = false;

// Função para carregar tarefas do IndexedDB
function loadTasks() {
    if (taskLoaded) return;
    taskLoaded = true;

    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Limpa a lista de tarefas para evitar duplicação

    const transaction = db.transaction(['tasks'], 'readonly');
    const store = transaction.objectStore('tasks');
    const request = store.getAll();

    request.onsuccess = function () {
        const tasks = request.result;
        tasks.forEach(task => renderTask(task));
    };
}

// Função para carregar projetos do IndexedDB
function loadProjects() {
    if (projectsLoaded) return;
    projectsLoaded = true;

    const projectList = document.getElementById('projectList');
    projectList.innerHTML = ''; // Limpa a lista de projetos para evitar duplicação

    const transaction = db.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');
    const request = store.getAll();

    request.onsuccess = function () {
        const projects = request.result;
        projects.forEach(project => renderProject(project));
        loadProjectsInSelect(); // Atualiza a seleção de projetos no formulário de tarefas
    };
}

// Função para salvar as tarefas no IndexDB
function saveTask(task) {
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');

    store.put(task);
}

// Função para adicionar uma nova tarefa
function addTask(event) {
    event.preventDefault();
    const taskText = document.getElementById('taskName').value.trim();
    const taskType = document.getElementById('taskType').value.trim();
    const taskDueDate = new Date(document.getElementById('taskDueDate').value).toLocaleDateString('pt-BR');
    const taskResponsible = document.getElementById('taskResponsible').value.trim();
    const taskProject = document.getElementById('taskProject').value;
    const taskObservation = document.getElementById('taskObservation').value.trim();

    if (taskText && taskType && taskDueDate && taskResponsible) {
        const task = {
            id: Date.now(),
            text: taskText,
            type: taskType,
            dueDate: taskDueDate,
            responsible: taskResponsible,
            project: taskProject,
            observation: taskObservation,
            status: 'Pendente'
        };

        renderTask(task);
        saveTask(task);
        saveReport('Adicionada', task);
        document.getElementById('taskForm').reset();
    } else {
        alert("Preencha todos os campos corretamente!");
    }
}

// Função para renderizar a tarefa na tabela
function renderTask(task) {
    const taskList = document.getElementById('taskList');

    const taskRow = document.createElement('tr');
    taskRow.setAttribute('data-id', task.id);

    taskRow.innerHTML = `
        <td>${task.text}</td>
        <td>
            <select class="status-select">
                <option value="Pendente" ${task.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                <option value="Em andamento" ${task.status === 'Em andamento' ? 'selected' : ''}>Em andamento</option>
                <option value="Cancelada" ${task.status === 'Cancelada' ? 'selected' : ''}>Cancelada</option>
                <option value="Concluída" ${task.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
            </select>
        </td>
        <td>${task.type}</td>
        <td>${task.project}</td>
        <td>${task.dueDate}</td>
        <td>${task.responsible}</td>
        <td class="observation-cell">${task.observation}</td>
        <td><input type="checkbox" class="btn-complete" ${task.status === 'Concluída' ? 'checked' : ''}></td>
        <td><button class="btn-delete">🗑️</button></td>
    `;

    taskList.appendChild(taskRow);

    taskRow.querySelector('.status-select').addEventListener('change', function () {
        const newStatus = this.value;
        task.status = newStatus;
        updateTask(task.id, task);
        saveReport('Status atualizado para ' + newStatus, task);
    });

    taskRow.querySelector('.btn-complete').addEventListener('change', function () {
        if (this.checked) {
            task.status = 'Concluída';
            saveReport('Concluída e removida da lista', task);
            taskList.removeChild(taskRow);
            deleteTask(task.id);
        }
    });

    taskRow.querySelector('.btn-delete').addEventListener('click', function () {
        taskList.removeChild(taskRow);
        saveReport('Deletada', task);
        deleteTask(task.id);
    });
}

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

// Função para limpar os relatórios
function clearReports() {
    const confirmClear = confirm("Você tem certeza que deseja limpar o relatório?");
    if (confirmClear) {
        localStorage.removeItem('reports');
        loadReports();
        alert("Relatório limpo com sucesso.");
    }
}

document.getElementById('clearReportsButton').addEventListener('click', clearReports);

// Função para atualizar uma tarefa no IndexedDB
function updateTask(id, updatedTask) {
    saveTask(updatedTask);
}

// Função para deletar uma tarefa no IndexedDB
function deleteTask(id) {
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    store.delete(id);
}

// Função para carregar os projetos no campo de seleção
function loadProjectsInSelect() {
    const projectSelect = document.getElementById('taskProject');
    projectSelect.innerHTML = '<option value="" disabled selected>Categoria</option>';

    const transaction = db.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');
    const request = store.getAll();

    request.onsuccess = function () {
        const projects = request.result;
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.name;
            option.textContent = project.name;
            projectSelect.appendChild(option);
        });
    };
}

// Função para salvar projetos no IndexedDB
function saveProject(project) {
    const transaction = db.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');

    const request = store.get(project.id);
    request.onsuccess = function () {
        if (!request.result) {
            store.put(project);
        }
    };
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
        saveProject(project);
        loadProjectsInSelect();
        document.getElementById('projectForm').reset();
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

    projectRow.querySelector('.btn-delete-project').addEventListener('click', function () {
        projectList.removeChild(projectRow);
        deleteProject(project.id);
    });
}

// Função para deletar um projeto no IndexedDB
function deleteProject(id) {
    const transaction = db.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');
    store.delete(id);
}

// Carregar as tarefas e projetos ao iniciar a página
window.addEventListener('load', function () {
    loadTasks();
    loadProjects();
});

// Adicionar nova tarefa ao enviar o formulário
document.getElementById('taskForm').addEventListener('submit', addTask);

// Adicionar novo projeto ao enviar o formulário
document.getElementById('projectForm').addEventListener('submit', addProject);
