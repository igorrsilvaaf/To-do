// Botão da sidebar responsivo
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');

if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        if (sidebar.classList.contains('active')) {
            sidebar.style.display = 'block';
        } else {
            sidebar.style.display = 'none';
        }
    });
}

// Fechar o menu quando o mouse sair dele
if (sidebar) {
    sidebar.addEventListener('mouseleave', () => {
        if (window.innerWidth > 768) { // Fechar apenas em telas maiores se realmente necessário
            sidebar.classList.remove('active');
            sidebar.style.display = 'none';
        }
    });
}


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
    hideAllSections();
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
        section.classList.add('active');
        console.log('Mostrando seção:', sectionId);
        saveActiveSection(sectionId);
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
    { id: 'menu-reports', section: 'reports-section', title: 'Relatórios 📊' },
    { id: 'menu-pomodoro', section: 'pomodoro-section', title: 'Pomodoro ⏳' }
];

menuItems.forEach(item => {
    document.getElementById(item.id).addEventListener('click', function (event) {
        event.stopPropagation();
        event.preventDefault();

        showSection(item.section);
        setPageTitle(item.title);

        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            sidebar.style.display = 'none';
        }

        if (item.id === 'menu-reports') {
            loadReports();
        }
    });
});

// Inicializar mostrando a Home
window.addEventListener('load', function () {
    loadActiveSection();
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'none';
});

// Iniciando o IndexDB
let db;
const request = indexedDB.open('TaskManagerDB', 2);

request.onupgradeneeded = function (event) {
    db = event.target.result;

    // Criação de stores
    if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
        console.log('Store settings criada ...')
    }
}

request.onsuccess = function (event) {
    db = event.target.result;
    loadActiveSection();
    loadTasks();
    loadProjects();
};

request.onerror = function (event) {
    console.error('Erro ao abrir IndexedDB', event.target.errorCode);
    showSection('home-section');
};

let taskLoaded = false;
let projectsLoaded = false;

function loadTasks() {
    if (taskLoaded) return;
    taskLoaded = true;

    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

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
    
    const request = store.get(task.id);
    request.onsuccess = (() => {
        if (!request.result) {
            store.put(task)
        }
    });
}

// Função que cria um objeto de tarefa
export function createTask(taskText, taskType, taskDueDate, taskResponsible, taskProject = '', taskObservation = '') {
    if (!taskText || !taskType || !taskDueDate || !taskResponsible) {
        throw new Error('Todos os campos obrigatórios devem ser preenchidos');
    }

    return {
        id: Date.now(),
        text: taskText,
        type: taskType,
        dueDate: taskDueDate,
        responsible: taskResponsible,
        project: taskProject,
        observation: taskObservation,
        status: 'Pendente'
    };
}

// Função para adicionar uma nova tarefa
export function addTask(event) {
    event.preventDefault();
    const taskText = document.getElementById('taskName').value.trim();
    const taskType = document.getElementById('taskType').value.trim();
    const taskDueDate = new Date(document.getElementById('taskDueDate').value).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).replace(',', ` -- `);
    const taskResponsible = document.getElementById('taskResponsible').value.trim();
    const taskProject = document.getElementById('taskProject').value;
    const taskObservation = document.getElementById('taskObservation').value.trim();

    try {
        const task = createTask(taskText, taskType, taskDueDate, taskResponsible, taskProject, taskObservation);

        renderTask(task);
        saveTask(task);
        saveReport('Adicionada', task);

        document.getElementById('taskForm').reset();
    } catch (error) {
        alert(error.message);
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
        renderTaskColor(this, newStatus);
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

    renderTaskColor(taskRow.querySelector('.status-select'), task.status);
}

// Função para definir a cor do status
function renderTaskColor(element, status) {
    element.classList.remove('status-pendente', 'status-em-andamento', 'status-cancelada', 'status-concluida');
    switch (status) {
        case 'Pendente':
            element.classList.add('status-pendente');
            break;
        case 'Em andamento':
            element.classList.add('status-em-andamento');
            break;
        case 'Cancelada':
            element.classList.add('status-cancelada');
            break;
        case 'Concluída':
            element.classList.add('status-concluida');
            break;
    }
}

// Função para salvar o caderno
function saveActiveSection(sectionId) {
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put({ key: 'activeSection', value: sectionId });

    request.onsuccess = function () {
        console.log('Seção ativa salva com sucesso:', sectionId);
    };

    request.onerror = function () {
        console.error('Erro ao salvar a seção ativa:', request.error);
    };
}

function loadActiveSection() {
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('activeSection');

    request.onsuccess = function () {
        const sectionId = request.result ? request.result.value : 'home-section';
        console.log('Seção ativa carregada:', sectionId);  // Log para verificar a recuperação
        showSection(sectionId);
    };

    request.onerror = function () {
        console.error('Erro ao carregar a seção ativa:', request.error);
        showSection('home-section');
    };
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

// Função para adicionar uma nova categoria
function addProject(event) {
    event.preventDefault();

    const projectName = document.getElementById('projectName').value.trim();
    const projectDueDate = new Date(document.getElementById('projectDueDate').value).toLocaleDateString('pt-BR');

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

// Carrega o arquivo de som
const endSound = new Audio('../sons/notification5.mp3')
endSound.volume = 1.0

// Função para tocar o som
function playSound() {
    endSound.play()
}

// Lógica Pomodoro
let isRunning = false;
let isWorkTime = true;
let workDuration = 25 * 60;
let breakDuration = 5 * 60;
let timer;
let remainingTime = workDuration;
let pomodoroHistory = [];

function updateDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    document.getElementById('timer-display').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startPausePomodoro() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        document.getElementById('start-pause-button').textContent = 'Iniciar';
        releaseWakeLock();
    } else {
        requestWakeLock();
        timer = setInterval(function () {
            remainingTime--;
            updateDisplay();

            if (remainingTime <= 0) {
                clearInterval(timer);
                isRunning = false;
                document.getElementById('start-pause-button').textContent = 'START';
                releaseWakeLock();

                // Registrar o ciclo ANTES de inverter isWorkTime
                const status = isWorkTime ? 'Trabalho' : 'Pausa';

                // Tocar som de alerta quando o ciclo terminar
                playSound();

                // Exibir notificação sem bloquear a execução
                showNotification(`Fim da ${status}, próximo ciclo!`);

                // Adicionar o ciclo ao histórico ANTES de inverter isWorkTime
                pomodoroHistory.push(`Fim da ${status} - ${new Date().toLocaleString()}`);
                updateHistory(); // Atualiza a UI do histórico

                // Agora inverter isWorkTime para preparar o próximo ciclo
                isWorkTime = !isWorkTime;
                remainingTime = isWorkTime ? workDuration : breakDuration;
            }
        }, 1000);
        isRunning = true;
        document.getElementById('start-pause-button').textContent = 'Pausar';
    }
}

function resetPomodoro() {
    clearInterval(timer);
    isRunning = false;
    isWorkTime = true;
    remainingTime = workDuration;
    updateDisplay();
    document.getElementById('start-pause-button').textContent = 'Iniciar';
}

function saveSettings() {
    const workInput = parseInt(document.getElementById('work-time').value);
    const breakInput = parseInt(document.getElementById('break-time').value);
    if (workInput > 0 && breakInput > 0) {
        workDuration = workInput * 60;
        breakDuration = breakInput * 60;
        resetPomodoro();
        alert('Configurações salvas!');
    } else {
        alert('Por favor, insira valores válidos.');
    }
}

function updateHistory() {
    const historyList = document.getElementById('pomodoro-history');
    historyList.innerHTML = '';

    pomodoroHistory.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Ciclo ${pomodoroHistory.length - index}: ${entry}`;
        historyList.appendChild(listItem);
    });
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);  // Notificação dura 4 segundos
}

document.getElementById('start-pause-button').addEventListener('click', startPausePomodoro);
document.getElementById('reset-button').addEventListener('click', resetPomodoro);
document.getElementById('save-settings-button').addEventListener('click', saveSettings);

// Função para requisitar o Wake Lock
let wakeLock = null

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock ativado');
        } else {
            console.log('Wake Lock API não suportada neste dispositivos.')
        }
    } catch (err) {
        console.log(`Falha ao ativar o Wake Lock: ${err.message}`);
    }
}

// Função para liberar o Wake Lock quando o cronômetro parar
function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release();
        wakeLock = null;
        console.log('Wake Lock desativado');
    }
}

// Função para o FullScreen
const fullscreenButton = document.getElementById('fullscreen-button');
const pomodoroContainer = document.querySelector('.pomodoro-container');

fullscreenButton.addEventListener('click', () => {
    pomodoroContainer.classList.toggle('fullscreen');
});

// Theme dark
// Referências aos elementos
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');

// Função para abrir o banco de dados IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('themeDB', 1);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('themeStore')) {
                db.createObjectStore('themeStore', { keyPath: 'id' });
            }
        };

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject('Erro ao abrir o IndexedDB:', event.target.errorCode);
        };
    });
}

// Função para salvar o tema no IndexedDB
function saveThemeToDB(theme) {
    openDB().then(db => {
        const transaction = db.transaction(['themeStore'], 'readwrite');
        const store = transaction.objectStore('themeStore');
        store.put({ id: 'theme', mode: theme });
    });
}

// Função para carregar o tema do IndexedDB
function loadThemeFromDB() {
    return new Promise((resolve, reject) => {
        openDB().then(db => {
            const transaction = db.transaction(['themeStore'], 'readonly');
            const store = transaction.objectStore('themeStore');
            const request = store.get('theme');

            request.onsuccess = function (event) {
                resolve(event.target.result ? event.target.result.mode : null);
            };

            request.onerror = function (event) {
                reject('Erro ao carregar o tema:', event.target.errorCode);
            };
        });
    });
}

// Função para alternar o tema
function toggleTheme() {
    if (document.body.classList.contains('dark-mode')) {
        // Mudar para Light Mode
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        themeText.textContent = "Dark Mode";
        saveThemeToDB('light');
    } else {
        // Mudar para Dark Mode
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        themeText.textContent = "Light Mode";
        saveThemeToDB('dark'); // Salvar o tema no IndexedDB
    }
}

// Função para carregar o tema ao iniciar a página
function loadTheme() {
    loadThemeFromDB().then(savedTheme => {
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            themeText.textContent = "Light Mode";
        } else {
            document.body.classList.add('light-mode');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            themeText.textContent = "Dark Mode";
        }
    }).catch(error => {
        console.error('Erro ao carregar o tema:', error);
    });
}

// Evento de clique para alternar o tema
themeToggle.addEventListener('click', toggleTheme);

// Carregar o tema ao iniciar a página
window.addEventListener('load', loadTheme);

// Funçao para salvar o conteudo do editor de texto
function saveEditorText() {
    const editorText = document.getElementById('editor').innerHTML;
    localStorage.setItem('editorText', editorText);
}

// Função para carregar o conteudo do editor de texto
function loadEditorText() {
    const saveText = localStorage.getItem('editorText');
    if (saveText) {
        document.getElementById('editor').innerHTML = saveText;
    }
}

// Adiciona o evento de salvamento automatico ao editar
function editorAutoSave() {
    const editor = document.getElementById('editor');
    if (editor) {
        editor.addEventListener('input', saveEditorText);
    }
}

window.addEventListener('load', () => {
   loadEditorText();
   editorAutoSave();
});