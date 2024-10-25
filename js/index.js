/* Botão da sidebar responsivo */
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

/* Fechar o menu quando o mouse sair dele */
if (sidebar) {
    sidebar.addEventListener('mouseleave', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
            sidebar.style.display = 'none';
        }
    });
}


/**
 * Esconde todas as seções da página.
 * Seleciona todos os elementos com a classe `.section`, remove a classe `active` e
 * adiciona a classe `hidden` a cada um deles, tornando as seções invisíveis na interface.
 */
function hideAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });
}

/**
 * Exibe a seção selecionada pelo ID.
 * Primeiramente, esconde todas as seções da página chamando `hideAllSections()`.
 * Em seguida, busca a seção correspondente ao `sectionId` informado. Se encontrada,
 * remove a classe `hidden` e adiciona a classe `active` para exibi-la na interface.
 * Também registra a seção ativa atual chamando `saveActiveSection(sectionId)`.
 *
 * @param {string} sectionId - ID da seção a ser exibida.
 */
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

/* Função para atualizar o título da página */
function setPageTitle(title) {
    document.getElementById('page-title').textContent = title;
}

/* Vincular eventos de clique no menu lateral */
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

/* Inicializar mostrando a Home */
window.addEventListener('load', function () {
    loadActiveSection();
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'none';
});

/* Iniciando o IndexedDB */
let db;
const request = indexedDB.open('TaskManagerDB', 5);

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
    }
    if (!db.objectStoreNames.contains('notebook')) {
        db.createObjectStore('notebook', { keyPath: 'id' });
        console.log('Store "notebook" criado com sucesso');
    }
}

request.onsuccess = function (event) {
    db = event.target.result;
    loadActiveSection();
    loadTasks();
    loadProjects();
    loadNotebookContent();
    enableNotebookAutoSave();
};

request.onerror = function (event) {
    console.error('Erro ao abrir IndexedDB', event.target.errorCode);
    showSection('home-section');
};

/**
 * Carrega e exibe todas as tarefas armazenadas.
 * Verifica se as tarefas já foram carregadas (`taskLoaded`). Caso não tenham sido, marca `taskLoaded` como `true`
 * para evitar carregamentos duplicados. Limpa o elemento `taskList` para garantir que não haja duplicação na lista.
 * Em seguida, cria uma transação de leitura no *object store* `tasks` do `IndexedDB` e solicita todos os registros.
 * Quando a solicitação é bem-sucedida, chama `renderTask` para cada tarefa, exibindo-as na interface.
 */
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

/**
 * Carrega e exibe todos os projetos armazenados no IndexedDB.
 * Verifica se os projetos já foram carregados (`projectsLoaded`). Caso não tenham sido, marca `projectsLoaded` como `true`
 * para evitar carregamentos duplicados. Limpa o elemento `projectList` para evitar duplicação na interface.
 * Em seguida, cria uma transação de leitura no *object store* `projects` do `IndexedDB` e solicita todos os registros.
 * Quando a solicitação é bem-sucedida, chama `renderProject` para cada projeto, exibindo-os na interface,
 * e invoca `loadProjectsInSelect` para atualizar a lista de projetos disponíveis em um campo de seleção.
 */
function loadProjects() {
    if (projectsLoaded) return;
    projectsLoaded = true;

    const projectList = document.getElementById('projectList');
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

/**
 * Salva uma nova tarefa no IndexedDB, caso ainda não exista.
 * Inicia uma transação de leitura e escrita no *object store* `tasks` do `IndexedDB`.
 * Primeiro, verifica se uma tarefa com o mesmo `id` já existe, usando `store.get(task.id)`.
 * Se nenhuma tarefa for encontrada (`!request.result`), adiciona a nova tarefa ao *store* chamando `store.put(task)`.
 *
 * @param {Object} task - Objeto da tarefa a ser salva, contendo pelo menos um `id` único.
 */
function saveTask(task) {
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    
    const request = store.get(task.id);
    request.onsuccess = (() => {
        if (!request.result) {
            store.put(task)
        }
    })
}

/**
 * Cria um objeto de tarefa com os dados fornecidos.
 *
 * Verifica se todos os campos obrigatórios (`taskText`, `taskType`, `taskDueDate`, `taskResponsible`) foram preenchidos.
 * Caso algum campo obrigatório esteja faltando, lança um erro.
 * Gera um `id` único baseado na data atual e define o status inicial como "Pendente".
 *
 * @param {string} taskText - Descrição da tarefa.
 * @param {string} taskType - Tipo ou categoria da tarefa.
 * @param {string} taskDueDate - Data de vencimento da tarefa.
 * @param {string} taskResponsible - Pessoa responsável pela tarefa.
 * @param {string} [taskProject=''] - (Opcional) Projeto ao qual a tarefa pertence.
 * @param {string} [taskObservation=''] - (Opcional) Observações adicionais sobre a tarefa.
 * @returns {Object} Objeto de tarefa contendo `id`, `text`, `type`, `dueDate`, `responsible`, `project`, `observation` e `status`.
 * @throws {Error} Se algum dos campos obrigatórios estiver ausente.
 */
function createTask(taskText, taskType, taskDueDate, taskResponsible, taskProject = '', taskObservation = '') {
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

/**
 * Adiciona uma nova tarefa com os dados do formulário.
 * Previne o comportamento padrão do formulário, coleta e formata os dados dos campos de entrada.
 * Em seguida, tenta criar uma nova tarefa usando `createTask`. Se a tarefa for criada com sucesso,
 * ela é renderizada na interface com `renderTask`, salva no IndexedDB com `saveTask` e registrada
 * no histórico de atividades com `saveReport`. Ao final, o formulário é resetado.
 * Em caso de erro na criação da tarefa, exibe uma mensagem de alerta com o erro.
 * @param {Event} event - O evento de envio do formulário que dispara a função.
 */
function addTask(event) {
    event.preventDefault();
    const taskText = document.getElementById('taskName').value.trim();
    const taskType = document.getElementById('taskType').value.trim();
    const taskDueDate = new Date(document.getElementById('taskDueDate').value).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).replace(',', ` -- `)
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

/**
 * Renderiza uma tarefa na tabela de tarefas, incluindo controles de status, conclusão e exclusão.
 * Cria uma nova linha (`<tr>`) para a tarefa fornecida e insere os dados nos elementos de `<td>`.
 * Adiciona um menu suspenso para seleção de status, um botão de exclusão e uma caixa de seleção para
 * marcar a tarefa como concluída. Em seguida, anexa a linha ao elemento `taskList`.
 * Eventos:
 * - **Alteração de Status**: Atualiza o status da tarefa quando o usuário altera a seleção, salva a alteração no banco
 *   de dados e registra a atualização no histórico.
 * - **Conclusão da Tarefa**: Marca a tarefa como concluída e a remove da lista quando a caixa de seleção é marcada.
 * - **Exclusão da Tarefa**: Remove a tarefa da lista ao clicar no botão de exclusão e a deleta do banco de dados.
 * @param {Object} task - Objeto de tarefa contendo `id`, `text`, `type`, `dueDate`, `responsible`, `project`, `observation` e `status`.
 */
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

/**
 * Define a cor do elemento com base no status da tarefa.
 * Remove quaisquer classes de cor de status previamente aplicadas no elemento.
 * Em seguida, adiciona uma nova classe de cor específica ao status atual da tarefa.
 * As classes de cor são:
 * - `status-pendente` para tarefas pendentes.
 * - `status-em-andamento` para tarefas em andamento.
 * - `status-cancelada` para tarefas canceladas.
 * - `status-concluida` para tarefas concluídas.
 * @param {HTMLElement} element - Elemento HTML ao qual será aplicada a cor de status.
 * @param {string} status - Status atual da tarefa, que determina a cor (e.g., "Pendente", "Em andamento").
 */
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

/**
 * Carrega e exibe a última seção ativa salva no IndexedDB.
 * Inicia uma transação de leitura no *object store* `settings` e busca o item com a chave `activeSection`.
 * Se o item existir, exibe a seção correspondente ao `sectionId` salvo; caso contrário, exibe a seção padrão (`home-section`).
 * Em caso de sucesso, registra o `sectionId` carregado no console para verificação.
 * Em caso de erro, exibe uma mensagem de erro no console e carrega a seção padrão `home-section`.
 */
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

/**
 * Salva um relatório de alteração no armazenamento local (`localStorage`).
 * Recupera a lista atual de relatórios do `localStorage` (ou cria uma nova lista, caso não exista).
 * Cria um objeto `report` contendo informações sobre a ação realizada, o texto da tarefa, o responsável,
 * a data e o status atual da tarefa. Adiciona o novo relatório à lista e salva a lista atualizada no `localStorage`.
 * @param {string} action - Ação realizada na tarefa (e.g., "Adicionada", "Atualizada", "Deletada").
 * @param {Object} task - Objeto da tarefa alterada, contendo `text`, `responsible` e `status`.
 */
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

/**
 * Carrega e exibe os relatórios de alterações armazenados no `localStorage`.
 * Recupera a lista de relatórios do `localStorage`. Para cada relatório, cria uma nova linha de tabela (`<tr>`)
 * contendo as informações da ação, descrição da tarefa, responsável, data e status. Em seguida, adiciona a linha
 * criada à tabela de relatórios (`reportsList`) para exibição na interface.
 * Caso não existam relatórios no `localStorage`, exibe uma tabela vazia.
 */
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

/**
 * Limpa todos os relatórios armazenados no `localStorage` após confirmação do usuário.
 *
 * Exibe uma janela de confirmação para o usuário. Se o usuário confirmar, remove o item `reports`
 * do `localStorage`, chama `loadReports()` para atualizar a interface com uma lista de relatórios vazia,
 * e exibe uma mensagem de sucesso informando que o relatório foi limpo.
 */
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

/**
 * Deleta uma tarefa do `IndexedDB` com base no ID fornecido.
 * Inicia uma transação de leitura e escrita no *object store* `tasks` e solicita a exclusão
 * da tarefa que corresponde ao `id` fornecido.
 * @param {number} id - O identificador único da tarefa a ser deletada.
 */
function deleteTask(id) {
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    store.delete(id);
}

/**
 * Carrega todos os projetos armazenados no `IndexedDB` e exibe-os em um campo de seleção.
 * Limpa o campo de seleção (`taskProject`) e insere uma opção padrão "Categoria". Em seguida,
 * inicia uma transação de leitura no *object store* `projects` e recupera todos os projetos.
 * Para cada projeto, cria um elemento `<option>` com o nome do projeto, que é então adicionado
 * ao campo de seleção.
 */
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

/**
 * Salva um projeto no `IndexedDB`, caso ainda não exista.
 * Inicia uma transação de leitura e escrita no *object store* `projects` do `IndexedDB`.
 * Verifica se um projeto com o mesmo `id` já existe, utilizando `store.get(project.id)`.
 * Se nenhum projeto for encontrado (`!request.result`), adiciona o novo projeto ao *store* usando `store.put(project)`.
 * @param {Object} project - Objeto do projeto a ser salvo, contendo pelo menos uma propriedade `id` única.
 */
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

/**
 * Adiciona uma nova categoria de projeto com os dados inseridos no formulário.
 * - Impede o comportamento padrão do formulário (recarregar a página).
 * - Captura o nome do projeto e a data de vencimento dos campos de entrada, formatando a data para o padrão brasileiro (`pt-BR`).
 * - Verifica se ambos os campos estão preenchidos. Se sim:
 *   1. Cria um objeto `project` com um `id` único (timestamp), `name`, e `dueDate`.
 *   2. Chama `renderProject` para exibir o novo projeto na interface.
 *   3. Usa `saveProject` para armazenar o projeto no `IndexedDB`.
 *   4. Chama `loadProjectsInSelect` para atualizar o campo de seleção de projetos com o novo projeto.
 *   5. Reseta o formulário (`projectForm`), deixando-o pronto para uma nova entrada.
 * - Caso algum campo esteja vazio, exibe uma mensagem de alerta para o usuário preencher todos os campos.
 * @param {Event} event - O evento de envio do formulário, necessário para prevenir o recarregamento da página.
 */
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

/**
 * Renderiza um projeto na tabela de projetos, incluindo um botão de exclusão.
 * - Cria uma nova linha (`<tr>`) para o projeto com o nome e a data de vencimento.
 * - Insere um botão de exclusão que permite remover o projeto da interface e do `IndexedDB`.
 * - Anexa a linha criada ao elemento `projectList` na interface.
 * Evento:
 * - **Exclusão do Projeto**: Ao clicar no botão de exclusão (`btn-delete-project`), remove a linha do projeto
 *   da tabela e chama `deleteProject` para excluir o projeto do banco de dados.
 * @param {Object} project - Objeto do projeto contendo `id`, `name` e `dueDate`.
 */
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

/**
 * Atualiza a exibição do temporizador no formato "MM:SS".
 * - Calcula os minutos e segundos restantes com base no valor de `remainingTime`.
 * - Formata minutos e segundos como strings de dois dígitos, preenchendo com zero à esquerda, se necessário.
 * - Atualiza o elemento `timer-display` na interface para mostrar o tempo formatado.
 */
function updateDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    document.getElementById('timer-display').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Inicia ou pausa o temporizador do Pomodoro, alternando entre os ciclos de trabalho e pausa.
 * - Se o temporizador já estiver em execução (`isRunning`), pausa o ciclo:
 *   1. Para o intervalo (`clearInterval`).
 *   2. Define `isRunning` como `false`.
 *   3. Atualiza o botão para exibir "Iniciar".
 *   4. Libera o bloqueio de tela com `releaseWakeLock`.
 * - Se o temporizador não estiver em execução, inicia um novo ciclo:
 *   1. Solicita o bloqueio de tela com `requestWakeLock` para manter o dispositivo ativo.
 *   2. Configura o temporizador para atualizar a cada segundo, decrementando `remainingTime` e chamando `updateDisplay`.
 *   3. Quando `remainingTime` chega a zero, conclui o ciclo atual:
 *      - Para o temporizador (`clearInterval`) e define `isRunning` como `false`.
 *      - Atualiza o botão para exibir "START".
 *      - Libera o bloqueio de tela.
 *      - Registra o ciclo como "Trabalho" ou "Pausa" no histórico.
 *      - Toca um som de alerta (`playSound`) e exibe uma notificação com `showNotification`.
 *      - Armazena o histórico (`pomodoroHistory`) e chama `updateHistory` para atualizar a interface.
 *      - Alterna `isWorkTime` para iniciar o próximo ciclo e redefine `remainingTime` para a duração apropriada (`workDuration` ou `breakDuration`).
 * A função alterna entre as opções "Iniciar" e "Pausar" no botão, conforme o estado do temporizador.
 */
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

/**
 * Redefine o temporizador do Pomodoro para o ciclo inicial de trabalho.
 * - Para o temporizador ativo (`clearInterval`).
 * - Define `isRunning` como `false` para indicar que o temporizador está pausado.
 * - Reinicia o ciclo para o modo de trabalho (`isWorkTime` como `true`).
 * - Redefine `remainingTime` para a duração padrão de trabalho (`workDuration`).
 * - Atualiza a exibição do temporizador chamando `updateDisplay`.
 * - Altera o botão de controle para "Iniciar" para indicar que o temporizador está pronto para iniciar.
 */
function resetPomodoro() {
    clearInterval(timer);
    isRunning = false;
    isWorkTime = true;
    remainingTime = workDuration;
    updateDisplay();
    document.getElementById('start-pause-button').textContent = 'Iniciar';
}

/**
 * Salva as configurações de duração do Pomodoro para trabalho e pausa.
 * - Lê os valores de entrada dos campos `work-time` (tempo de trabalho) e `break-time` (tempo de pausa),
 *   convertendo-os para inteiros.
 * - Verifica se ambos os valores são positivos:
 *   - Se válidos, atualiza `workDuration` e `breakDuration` com os novos tempos em segundos.
 *   - Redefine o temporizador chamando `resetPomodoro` para aplicar as novas configurações.
 *   - Exibe uma mensagem de confirmação ("Configurações salvas!").
 *   - Se os valores forem inválidos ou negativos, exibe uma mensagem de erro solicitando valores válidos.
 */
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

/**
 * Atualiza a lista de histórico do Pomodoro na interface.
 * - Limpa o conteúdo atual do elemento `pomodoro-history` para evitar duplicação.
 * - Itera sobre o array `pomodoroHistory`, que contém os registros de ciclos concluídos.
 *   Para cada entrada no histórico:
 *   - Cria um item de lista (`<li>`) exibindo o número do ciclo (do mais recente ao mais antigo) e a descrição do evento.
 *   - Adiciona o item criado ao elemento `pomodoro-history`.
 */
function updateHistory() {
    const historyList = document.getElementById('pomodoro-history');
    historyList.innerHTML = '';

    pomodoroHistory.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Ciclo ${pomodoroHistory.length - index}: ${entry}`;
        historyList.appendChild(listItem);
    });
}

/**
 * Exibe uma notificação com uma mensagem personalizada na interface.
 * - Define o conteúdo de texto do elemento `notification` com a mensagem fornecida.
 * - Adiciona a classe `show` ao elemento, tornando-o visível na interface.
 * - Após 4 segundos, remove a classe `show` para ocultar a notificação automaticamente.
 * @param {string} message - A mensagem a ser exibida na notificação.
 */
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


/**
 * Solicita o bloqueio de tela (Wake Lock) para manter a tela ativa enquanto o temporizador está em execução.
 * - Verifica se a API `wakeLock` é suportada no navegador.
 *   - Se suportada, solicita o Wake Lock do tipo `screen` para manter a tela ativa e armazena a instância em `wakeLock`.
 *   - Exibe uma mensagem de confirmação no console ("Wake Lock ativado").
 *   - Se a API não for suportada, exibe uma mensagem no console informando que o recurso não está disponível.
 * - Em caso de falha ao solicitar o Wake Lock, captura e exibe o erro no console.
 * @async
 * @returns {Promise<void>}
 */
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

/**
 * Libera o bloqueio de tela (Wake Lock) para permitir que a tela possa desligar automaticamente.
 * - Verifica se existe uma instância ativa de `wakeLock`.
 *   - Se sim, chama `release()` para liberar o Wake Lock e define `wakeLock` como `null`.
 *   - Exibe uma mensagem de confirmação no console ("Wake Lock desativado").
 * - Essa função é utilizada quando o cronômetro para, permitindo que a tela volte a desligar automaticamente.
 */
function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release();
        wakeLock = null;
        console.log('Wake Lock desativado');
    }
}

/**
 * Alterna o modo de tela cheia para o contêiner do Pomodoro ao clicar no botão de tela cheia.
 * - Seleciona o botão de tela cheia (`fullscreen-button`) e o contêiner do Pomodoro (`pomodoro-container`).
 * - Adiciona um evento de clique ao botão:
 *   - Ao clicar, alterna a classe `fullscreen` no contêiner `pomodoroContainer`,
 *     permitindo que ele entre ou saia do modo de tela cheia.
 * Esse recurso é utilizado para ampliar a visualização do temporizador na tela.
 */
const fullscreenButton = document.getElementById('fullscreen-button');
const pomodoroContainer = document.querySelector('.pomodoro-container');

fullscreenButton.addEventListener('click', () => {
    pomodoroContainer.classList.toggle('fullscreen');
});

/* --------------- Theme dark --------------- */
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');

/**
 * Abre ou inicializa o banco de dados `IndexedDB` chamado `themeDB` e retorna uma instância dele.
 * - Cria uma nova `Promise` que tenta abrir o banco de dados `themeDB` na versão 1.
 * - Durante a atualização (`onupgradeneeded`), verifica se os *object stores* `themeStore` e `notebook` já existem:
 *   - Se `themeStore` não existir, ele é criado com a chave primária `id`.
 *   - Se `notebook` não existir, ele também é criado com a chave primária `id`, e um log de confirmação é exibido.
 * - No sucesso da operação (`onsuccess`), resolve a `Promise` com o objeto de banco de dados (`db`).
 * - Em caso de erro (`onerror`), rejeita a `Promise` com uma mensagem de erro descrevendo o problema.
 * @returns {Promise<IDBDatabase>} Uma `Promise` que resolve com a instância do banco de dados aberto.
 */
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('themeDB', 1);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('themeStore')) {
                db.createObjectStore('themeStore', { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains('notebook')) {
                db.createObjectStore('notebook', { keyPath: 'id' });
                console.log('Store "notebook" criada');
            }
        };

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject(new Error(`Erro ao abrir o IndexedDB: ${event.target.errorCode}`));
        };
    });
}

/**
 * Salva o tema selecionado no `IndexedDB` para persistência de configurações de interface.
 * - Abre o banco de dados `themeDB` chamando `openDB()`, que retorna uma `Promise` com a instância do banco.
 * - Inicia uma transação de leitura e escrita no *object store* `themeStore`.
 * - Salva o tema atual como um objeto com o formato `{ id: 'theme', mode: theme }` no `themeStore`,
 *   onde `id` é a chave primária, e `mode` representa o tema selecionado (e.g., "dark" ou "light").
 * @param {string} theme - O tema a ser salvo, geralmente "dark" ou "light".
 */
function saveThemeToDB(theme) {
    openDB().then(db => {
        const transaction = db.transaction(['themeStore'], 'readwrite');
        const store = transaction.objectStore('themeStore');
        store.put({ id: 'theme', mode: theme });
    });
};

/**
 * Carrega o tema salvo no `IndexedDB` e retorna o valor através de uma `Promise`.
 * - Abre o banco de dados `themeDB` chamando `openDB()`, que retorna uma `Promise` com a instância do banco.
 * - Inicia uma transação de leitura no *object store* `themeStore` e tenta recuperar o item com a chave `theme`.
 * - Em caso de sucesso (`onsuccess`), verifica se o tema está armazenado:
 *   - Se estiver, resolve a `Promise` com o valor de `mode` (o tema salvo).
 *   - Se o tema não estiver presente, resolve a `Promise` com `null`.
 * - Em caso de erro (`onerror`), rejeita a `Promise` com uma mensagem de erro.
 * - Captura qualquer erro ao abrir o banco de dados e rejeita a `Promise` com o erro encontrado.
 * @returns {Promise<string|null>} Uma `Promise` que resolve com o tema salvo (e.g., "dark" ou "light") ou `null` se não houver tema salvo.
 */
function loadThemeFromDB() {
    return new Promise((resolve, reject) => {
        openDB().then(db => {
            const transaction = db.transaction(['themeStore'], 'readonly');
            const store = transaction.objectStore('themeStore');
            const request = store.get('theme');

            request.onsuccess = function (event) {
                resolve(event.target.result ? event.target.result.mode : null);
            };

            request.onerror = function () {
                reject(new Error('Erro ao carregar o tema do IndexedDB'));
            };
        }).catch(error => {
            reject(error);
        });
    });
};

/**
 * Alterna o tema da interface entre o modo claro e o modo escuro e salva a preferência no `IndexedDB`.
 * - Verifica se o `body` contém a classe `dark-mode`:
 *   - Se sim (modo escuro ativo), alterna para o modo claro:
 *     - Remove `dark-mode` e adiciona `light-mode` ao `body`.
 *     - Atualiza os ícones e o texto indicativo de tema para "Dark Mode".
 *     - Salva a preferência de tema ("light") no `IndexedDB` chamando `saveThemeToDB`.
 *   - Se não (modo claro ativo), alterna para o modo escuro:
 *     - Remove `light-mode` e adiciona `dark-mode` ao `body`.
 *     - Atualiza os ícones e o texto indicativo de tema para "Light Mode".
 *     - Salva a preferência de tema ("dark") no `IndexedDB` chamando `saveThemeToDB`.
 * Essa função garante que a interface reflita a preferência de tema e que a escolha do usuário seja persistida.
 */
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

/**
 * Carrega o tema salvo no `IndexedDB` ao iniciar a página e aplica-o à interface.
 * - Chama `loadThemeFromDB` para obter o tema salvo, retornado como uma `Promise`.
 * - Se o tema salvo for "dark":
 *   - Adiciona a classe `dark-mode` ao `body`.
 *   - Atualiza o ícone e o texto para indicar a opção "Light Mode".
 * - Caso contrário, define o tema para "light" por padrão:
 *   - Adiciona a classe `light-mode` ao `body`.
 *   - Atualiza o ícone e o texto para indicar a opção "Dark Mode".
 * - Em caso de erro ao carregar o tema do `IndexedDB`, exibe o erro no console.
 * Essa função é executada no carregamento da página para garantir que o tema escolhido pelo usuário
 * seja aplicado imediatamente.
 */
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
};

themeToggle.addEventListener('click', toggleTheme);
window.addEventListener('load', loadTheme);

/**
 * Salva a seção ativa atual no `IndexedDB` para restaurá-la posteriormente.
 * - Inicia uma transação de leitura e escrita no *object store* `settings`.
 * - Insere ou atualiza a entrada `activeSection` com a chave `key: 'activeSection'` e o valor do `sectionId` fornecido.
 * - Em caso de sucesso (`onsuccess`), exibe uma mensagem de confirmação no console indicando que a seção foi salva.
 * - Em caso de erro (`onerror`), exibe uma mensagem de erro no console.
 * @param {string} sectionId - O identificador da seção ativa que deve ser salva.
 */
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

/**
 * Salva o conteúdo atual do caderno no `IndexedDB` para persistência.
 * - Verifica se a instância do banco de dados (`db`) está disponível; se não, a função retorna sem ação.
 * - Inicia uma transação de leitura e escrita no *object store* `notebook`.
 * - Cria um objeto `notebookEntry` com `id: 1` e o conteúdo do caderno fornecido (`content`).
 *   - `id: 1` é utilizado para garantir que sempre exista uma única entrada de conteúdo para o caderno.
 * - Salva ou atualiza `notebookEntry` no *object store* `notebook`.
 * - Em caso de sucesso (`onsuccess`), exibe uma mensagem de confirmação no console.
 * - Em caso de erro (`onerror`), exibe uma mensagem de erro no console com detalhes do problema.
 * @param {string} content - O conteúdo do caderno a ser salvo.
 */
function saveNotebookContent(content) {
    if (!db) return;
    const transaction = db.transaction(['notebook'], 'readwrite');
    const store = transaction.objectStore('notebook');
    
    const notebookEntry = {
        id: 1,
        content: content
    };
    
    const request = store.put(notebookEntry);
    
    request.onsuccess = function () {
        console.log('Conteúdo do caderno salvo com sucesso.');
    };
    
    request.onerror = function () {
        console.error('Erro ao salvar o conteúdo do caderno:', request.error);
    };
}

/**
 * Habilita o salvamento contínuo do conteúdo do caderno, ativando-o após a inicialização.
 * - Adiciona um evento `input` ao elemento `editor`, que representa o editor do caderno.
 * - A cada alteração de entrada no editor, captura o conteúdo atual em HTML (`innerHTML`) e chama `saveNotebookContent`
 *   para salvá-lo no `IndexedDB`, permitindo que o conteúdo seja salvo automaticamente conforme o usuário digita.
 * Essa função é geralmente chamada após a inicialização para garantir que o salvamento automático funcione de forma contínua.
 */
function enableNotebookAutoSave() {
    document.getElementById('editor').addEventListener('input', function() {
        const notebookContent = document.getElementById('editor').innerHTML;
        saveNotebookContent(notebookContent);
    });
}

/**
 * Carrega o conteúdo salvo do caderno do `IndexedDB` e o exibe no editor.
 * - Inicia uma transação de leitura no *object store* `notebook` para buscar o conteúdo salvo com `id: 1`.
 * - Em caso de sucesso (`onsuccess`), verifica se o conteúdo existe:
 *   - Se o conteúdo for encontrado, insere-o no elemento `editor` na interface, exibindo-o para o usuário.
 *   - Se não houver conteúdo salvo, exibe uma mensagem informativa no console.
 * - Em caso de erro (`onerror`), exibe uma mensagem de erro no console com detalhes do problema.
 */
function loadNotebookContent() {
    
    const transaction = db.transaction(['notebook', 'readonly']);
    const store = transaction.objectStore('notebook');
    const request = store.get(1);

    request.onsuccess = function () {
        const result = request.result;
        if (result && result.content) {
            document.getElementById('editor').innerHTML = result.content;
        } else {
            console.log('Nenhum conteúdo salvo encontrado para o caderno.');
        }
    };

    request.onerror = function () {
        console.error('Erro ao carregar o conteúdo do caderno:', request.error);
    };
}

document.getElementById('editor').addEventListener('input', function() {
    const notebookContent = document.getElementById('editor').innerHTML;
    saveNotebookContent(notebookContent);
});

window.addEventListener('load', function () {
    loadNotebookContent();
});