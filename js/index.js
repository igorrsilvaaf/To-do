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

export function initializeMenuItems() {
    const menuItems = [
        { id: 'menu-home', section: 'home-section', title: 'Lista de Tarefas ✏️' },
        { id: 'menu-projects', section: 'projects-section', title: 'Categorias 🗄️' },
        { id: 'menu-responsaveis', section: 'responsaveis-section', title: 'Responsáveis 👥' },
        { id: 'menu-notebook', section: 'notebook-section', title: 'Caderno 📓' },
        { id: 'menu-reports', section: 'reports-section', title: 'Relatórios 📊' },
        { id: 'menu-pomodoro', section: 'pomodoro-section', title: 'Pomodoro ⏳' }
    ];

    menuItems.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            element.addEventListener('click', function (event) {
                event.stopPropagation();
                event.preventDefault();
                showSection(item.section);
                setPageTitle(item.title);

                if (window.innerWidth <= 768) {
                    const sidebar = document.querySelector('.sidebar');
                    if (sidebar) {
                        sidebar.classList.remove('active');
                        sidebar.style.display = 'none';
                    }
                }

                if (item.id === 'menu-reports') {
                    loadReports();
                }
            });
        }
    });
}

// Inicializar mostrando a Home
window.addEventListener('load', function () {
    loadActiveSection();
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'none';
});

let db;

export function initializeIndexedDB() {
    const request = indexedDB.open('TaskManagerDB', 4);

    request.onupgradeneeded = function (event) {
        db = event.target.result;

        if (!db.objectStoreNames.contains('tasks')) {
            db.createObjectStore('tasks', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('projects')) {
            db.createObjectStore('projects', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('responsaveis')) {
            db.createObjectStore('responsaveis', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
        }
    };

    request.onsuccess = function (event) {
        db = event.target.result;
        loadActiveSection();
        loadTasks();
        loadProjects();
        loadResponsaveis();
    };

    request.onerror = function (event) {
        console.error('Erro ao abrir IndexedDB', event.target.errorCode);
        showSection('home-section');
    };
}

let taskLoaded = false;
let projectsLoaded = false;
let responsaveisLoaded = false;

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

    const projectList = document.getElementById('projectsTable');
    projectList.innerHTML = '';

    const transaction = db.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');
    const request = store.getAll();

    request.onsuccess = function () {
        const projects = request.result;
        projects.forEach(project => renderProject(project));
        loadProjectsInSelect();
    };
}

// Função para salvar as tarefas no IndexDB
function saveTask(task) {
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    store.put(task);
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

// Função para adicionar/atualizar uma tarefa
export function addTask(event) {
    event.preventDefault();
    const form = event.target;
    const editingId = form.getAttribute('data-editing');

    const taskText = document.getElementById('taskName').value.trim();
    const taskType = document.getElementById('taskType').value.trim();
    const taskDueDate = new Date(document.getElementById('taskDueDate').value).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).replace(',', ` -- `);
    const taskResponsible = document.getElementById('taskResponsible').value;
    const taskProject = document.getElementById('taskProject').value;
    const taskObservation = document.getElementById('taskObservation').value.trim();

    try {
        const task = {
            id: editingId ? parseInt(editingId) : Date.now(),
            text: taskText,
            type: taskType,
            dueDate: taskDueDate,
            responsible: taskResponsible,
            project: taskProject,
            observation: taskObservation,
            status: editingId ? document.querySelector(`tr[data-id="${editingId}"] .status-select`).value : 'Pendente'
        };

        // Salvar no IndexedDB
        const transaction = db.transaction(['tasks'], 'readwrite');
        const store = transaction.objectStore('tasks');
        
        const request = store.put(task);
        
        request.onsuccess = function() {
            if (editingId) {
                const oldRow = document.querySelector(`tr[data-id="${editingId}"]`);
                if (oldRow) {
                    oldRow.remove();
                }
                saveReport('Tarefa Editada', task);
            } else {
                saveReport('Tarefa Adicionada', task);
            }

            renderTask(task);
        };

        // Resetar formulário
        form.reset();
        form.removeAttribute('data-editing');
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.textContent = 'Adicionar Tarefa';

    } catch (error) {
        alert(error.message);
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
    reports.unshift(report); // Adiciona no início do array para mostrar mais recentes primeiro
    localStorage.setItem('reports', JSON.stringify(reports));
    
    // Atualizar a interface se estiver na seção de relatórios
    const reportsSection = document.getElementById('reports-section');
    if (reportsSection.classList.contains('active')) {
        loadReports();
    }
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

export function initializeClearReportsButton() {
    const clearReportsButton = document.getElementById('clearReportsButton');
    if (clearReportsButton) {
        clearReportsButton.addEventListener('click', clearReports);
    }
}

// Função para deletar uma tarefa
function deleteTask(id, taskRow) {
    const confirmDelete = confirm("Tem certeza que deseja excluir esta tarefa?");
    if (confirmDelete) {
        const task = {
            text: taskRow.cells[0].textContent,
            responsible: taskRow.cells[5].textContent,
            status: taskRow.cells[1].textContent
        };
        
        // Remover do DOM
        taskRow.remove();
        
        // Remover do IndexedDB
        const transaction = db.transaction(['tasks'], 'readwrite');
        const store = transaction.objectStore('tasks');
        store.delete(id);

        // Salvar no relatório
        saveReport('Tarefa Excluída', task);
    }
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
    const projectList = document.getElementById('projectsTable');

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
        loadProjectsInSelect();
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
export function initializeTaskForm() {
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', addTask)
    }
}

// Adicionar novo projeto ao enviar o formulário
export function initializeProjectForm() {
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', addProject)
    }
}

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

export function resetPomodoro() {
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

export function initializeStartPauseButton() {
    const startPauseButton  = document.getElementById('start-pause-button');
    if (startPauseButton ) {
        startPauseButton.addEventListener('click', startPausePomodoro)
    }
}

export function initializeResetButton() {
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', resetPomodoro)
    }
}

export function initializeSaveSettingsButton() {
    const saveSettingsButton = document.getElementById('save-settings-button');
    if (saveSettingsButton) {
        saveSettingsButton.addEventListener('click', saveSettings)
    }
}

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

if (fullscreenButton && pomodoroContainer) {
    fullscreenButton.addEventListener('click', () => {
        pomodoroContainer.classList.toggle('fullscreen')
    })
}

// Theme dark
// Referências aos elementos
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');

export function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', themeToggle)
    }
}

if (typeof window !== 'undefined') {
    initializeThemeToggle();
    window.addEventListener('load', loadTheme);
}

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

// Funções para gerenciar responsáveis
function loadResponsaveis() {
    if (responsaveisLoaded) return;
    responsaveisLoaded = true;

    const responsaveisTable = document.getElementById('responsaveisTable');
    responsaveisTable.innerHTML = '';

    const transaction = db.transaction(['responsaveis'], 'readonly');
    const store = transaction.objectStore('responsaveis');
    const request = store.getAll();

    request.onsuccess = function () {
        const responsaveis = request.result;
        responsaveis.forEach(responsavel => renderResponsavel(responsavel));
        loadResponsaveisInSelect();
    };
}

function saveResponsavel(responsavel) {
    const transaction = db.transaction(['responsaveis'], 'readwrite');
    const store = transaction.objectStore('responsaveis');
    store.put(responsavel);
}

function addResponsavel(event) {
    event.preventDefault();
    const responsavelName = document.getElementById('responsavelName').value.trim();
    const responsavelEmail = document.getElementById('responsavelEmail').value.trim();
    const responsavelTelefone = document.getElementById('responsavelTelefone').value.trim();

    if (responsavelName) {
        const responsavel = {
            id: Date.now(),
            name: responsavelName,
            email: responsavelEmail,
            telefone: responsavelTelefone
        };

        renderResponsavel(responsavel);
        saveResponsavel(responsavel);
        document.getElementById('responsavelForm').reset();
        loadResponsaveisInSelect();
    }
}

function renderResponsavel(responsavel) {
    const responsaveisTable = document.getElementById('responsaveisTable');
    
    const responsavelRow = document.createElement('tr');
    responsavelRow.setAttribute('data-id', responsavel.id);

    responsavelRow.innerHTML = `
        <td>${responsavel.name}</td>
        <td>${responsavel.email}</td>
        <td>${responsavel.telefone}</td>
        <td><button class="btn-delete">🗑️</button></td>
    `;

    responsaveisTable.appendChild(responsavelRow);

    responsavelRow.querySelector('.btn-delete').addEventListener('click', function() {
        responsaveisTable.removeChild(responsavelRow);
        deleteResponsavel(responsavel.id);
        loadResponsaveisInSelect();
    });
}

function deleteResponsavel(id) {
    const transaction = db.transaction(['responsaveis'], 'readwrite');
    const store = transaction.objectStore('responsaveis');
    store.delete(id);
}

function loadResponsaveisInSelect() {
    const responsavelSelect = document.getElementById('taskResponsible');
    responsavelSelect.innerHTML = '<option value="" disabled selected>Selecione um responsável</option>';

    const transaction = db.transaction(['responsaveis'], 'readonly');
    const store = transaction.objectStore('responsaveis');
    const request = store.getAll();

    request.onsuccess = function () {
        const responsaveis = request.result;
        responsaveis.forEach(responsavel => {
            const option = document.createElement('option');
            option.value = responsavel.name;
            option.textContent = responsavel.name;
            responsavelSelect.appendChild(option);
        });
    };
}

// Inicializar o formulário de responsáveis
export function initializeResponsavelForm() {
    const responsavelForm = document.getElementById('responsavelForm');
    if (responsavelForm) {
        responsavelForm.addEventListener('submit', addResponsavel);
    }
}

// Inicializa os componentes apenas no ambiente do navegador
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
    initializeMenuItems();
    initializeIndexedDB();
    initializeClearReportsButton();
    initializeProjectForm();
    initializeTaskForm();
    initializeResponsavelForm();
    initializeStartPauseButton();
    initializeSaveSettingsButton();
    initializeResetButton();
}

function renderTask(task) {
    const taskList = document.getElementById('taskList');
    
    // Remover linha existente se estiver editando
    const existingRow = document.querySelector(`tr[data-id="${task.id}"]`);
    if (existingRow) {
        existingRow.remove();
    }
    
    const taskRow = document.createElement('tr');
    taskRow.setAttribute('data-id', task.id);

    // Criar select para status
    const statusSelect = `
        <select class="status-select">
            <option value="Pendente" ${task.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
            <option value="Em andamento" ${task.status === 'Em andamento' ? 'selected' : ''}>Em andamento</option>
            <option value="Concluída" ${task.status === 'Concluída' ? 'selected' : ''}>Concluída</option>
            <option value="Bloqueada" ${task.status === 'Bloqueada' ? 'selected' : ''}>Bloqueada</option>
        </select>
    `;

    taskRow.innerHTML = `
        <td>${task.text}</td>
        <td class="status-${task.status.toLowerCase().replace(' ', '-')}">${statusSelect}</td>
        <td>${task.type}</td>
        <td>${task.project}</td>
        <td>${task.dueDate}</td>
        <td>${task.responsible}</td>
        <td>${task.observation}</td>
        <td class="action-column">
            <button class="btn-complete" title="Marcar como concluída">✅</button>
        </td>
        <td class="action-column">
            <button class="btn-edit" title="Editar tarefa">✏️</button>
        </td>
        <td class="action-column">
            <button class="btn-delete" title="Excluir tarefa">🗑️</button>
        </td>
    `;

    taskList.appendChild(taskRow);

    // Adicionar event listener para o select de status
    const select = taskRow.querySelector('.status-select');
    select.addEventListener('change', function() {
        updateTaskStatus(task.id, this.value);
    });

    // Outros event listeners
    taskRow.querySelector('.btn-edit').addEventListener('click', function() {
        editTask(task);
    });

    taskRow.querySelector('.btn-complete').addEventListener('click', function() {
        completeTask(task.id, taskRow);
    });

    taskRow.querySelector('.btn-delete').addEventListener('click', function() {
        deleteTask(task.id, taskRow);
    });
}

function updateTaskStatus(taskId, newStatus) {
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    const request = store.get(taskId);

    request.onsuccess = function() {
        const task = request.result;
        if (task) {
            const oldStatus = task.status;
            task.status = newStatus;
            store.put(task);

            // Atualizar a célula de status
            const statusCell = document.querySelector(`tr[data-id="${taskId}"] td:nth-child(2)`);
            statusCell.className = `status-${newStatus.toLowerCase().replace(' ', '-')}`;
            
            // Salvar no relatório
            saveReport(`Status alterado de ${oldStatus} para ${newStatus}`, task);
        }
    };
}

// Função para editar tarefa
function editTask(task) {
    const form = document.getElementById('taskForm');
    const submitButton = form.querySelector('button[type="submit"]');

    // Preencher o formulário com os dados da tarefa
    document.getElementById('taskName').value = task.text;
    document.getElementById('taskType').value = task.type;
    document.getElementById('taskProject').value = task.project;
    document.getElementById('taskResponsible').value = task.responsible;
    document.getElementById('taskObservation').value = task.observation;
    
    // Converter a data para o formato aceito pelo input datetime-local
    const [date, time] = task.dueDate.split(' -- ');
    const [day, month, year] = date.split('/');
    const [hour, minute] = time.trim().split(':');
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    document.getElementById('taskDueDate').value = formattedDate;

    // Garantir que os selects estejam com as opções corretas
    const projectSelect = document.getElementById('taskProject');
    const responsibleSelect = document.getElementById('taskResponsible');

    // Garantir que a categoria existe no select
    if (!Array.from(projectSelect.options).some(option => option.value === task.project)) {
        const option = new Option(task.project, task.project);
        projectSelect.add(option);
    }
    projectSelect.value = task.project;

    // Garantir que o responsável existe no select
    if (!Array.from(responsibleSelect.options).some(option => option.value === task.responsible)) {
        const option = new Option(task.responsible, task.responsible);
        responsibleSelect.add(option);
    }
    responsibleSelect.value = task.responsible;

    // Modificar o botão de submit e adicionar ID da tarefa sendo editada
    submitButton.textContent = 'Atualizar Tarefa';
    form.setAttribute('data-editing', task.id);

    // Rolar até o formulário
    form.scrollIntoView({ behavior: 'smooth' });
}

function completeTask(taskId, taskRow) {
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    const request = store.get(taskId);

    request.onsuccess = function() {
        const task = request.result;
        if (task) {
            task.status = 'Concluída';
            store.put(task);
            
            // Atualizar o select
            const statusSelect = document.querySelector(`tr[data-id="${taskId}"] .status-select`);
            statusSelect.value = 'Concluída';
            statusSelect.className = `status-select status-concluida`;
            
            // Salvar no relatório
            saveReport('Tarefa Concluída', task);
        }
    };
}