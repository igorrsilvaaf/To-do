/* eslint-env jest */
require('fake-indexeddb/auto');
const { addTask, initializeEventListeners } = require('../js/index');

// Mock para menuItems
const menuItems = [
    { id: 'menu-home', section: 'home-section', title: 'Lista de Tarefas ✏️' },
    { id: 'menu-projects', section: 'projects-section', title: 'Categorias 🗄️' },
    { id: 'menu-notebook', section: 'notebook-section', title: 'Caderno 📓' },
    { id: 'menu-reports', section: 'reports-section', title: 'Relatórios 📊' },
    { id: 'menu-pomodoro', section: 'pomodoro-section', title: 'Pomodoro ⏳' }
];

describe('Test Suite for To-Do List Application', () => {
    beforeEach(() => {
        document.body.innerHTML = '';

        // Criando os elementos do DOM necessários
        menuItems.forEach(item => {
            const menuItem = document.createElement('li');
            menuItem.id = item.id;
            document.body.appendChild(menuItem);
        });

        const menuToggle = document.createElement('button');
        menuToggle.id = 'menu-toggle';
        document.body.appendChild(menuToggle);

        const clearReportsButton = document.createElement('button');
        clearReportsButton.id = 'clearReportsButton';
        document.body.appendChild(clearReportsButton);

        const sidebar = document.createElement('div');
        sidebar.classList.add('sidebar');
        sidebar.style.display = 'none';
        document.body.appendChild(sidebar);

        const taskForm = document.createElement('form');
        taskForm.id = 'taskForm';
        document.body.appendChild(taskForm);

        const taskList = document.createElement('table');
        taskList.id = 'taskList';
        document.body.appendChild(taskList);

        initializeEventListeners(); // Inicializa os eventos de clique
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });
    
    test('Should open the sidebar when the toggle menu is clicked', () => {
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        menuToggle.click();
        
        expect(sidebar.style.display).toBe('block');
        expect(sidebar.classList.contains('active')).toBe(true);
    });
    
    test('Should close the sidebar when the toggle menu is clicked again', () => {
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        menuToggle.click();
        menuToggle.click();
        
        expect(sidebar.style.display).toBe('none');
        expect(sidebar.classList.contains('active')).toBe(false);
    });

    test('Add a task and verify it in the list', () => {
        const taskForm = document.getElementById('taskForm');
        const taskList = document.getElementById('taskList');

        const taskNameInput = document.createElement('input');
        taskNameInput.id = 'taskName';
        taskNameInput.value = 'Nova Tarefa';
        taskForm.appendChild(taskNameInput);

        const taskTypeInput = document.createElement('input');
        taskTypeInput.id = 'taskType';
        taskTypeInput.value = 'Tipo de Tarefa';
        taskForm.appendChild(taskTypeInput);

        const taskDueDateInput = document.createElement('input');
        taskDueDateInput.id = 'taskDueDate';
        taskDueDateInput.value = '2024-12-31';
        taskForm.appendChild(taskDueDateInput);

        const taskResponsibleInput = document.createElement('input');
        taskResponsibleInput.id = 'taskResponsible';
        taskResponsibleInput.value = 'João';
        taskForm.appendChild(taskResponsibleInput);

        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addTask();
        });

        taskForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        let taskRows = taskList.querySelectorAll('tr');
        expect(taskRows.length).toBe(1);
        expect(taskRows[0].textContent).toContain('Nova Tarefa');
    });
});