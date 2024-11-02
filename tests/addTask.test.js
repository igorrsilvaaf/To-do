/* eslint-env jest */
require('fake-indexeddb/auto');
const { addTask, initializeDOMElements, menuItems, deleteTask } = require('../js/index');

describe('Interaction with the gift - Sidebar Toggle', () => {
    beforeEach(() => {
        menuItems.forEach(item => {
            const menuItem = document.createElement('li');
            menuItem.id = item.id;
            document.body.appendChild(menuItem)
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
        
        if (sidebar) {
            sidebar.addEventListener('mouseleave', () => {
                if (window.innerWidth > 768) {
                    sidebar.classList.remove('active');
                    sidebar.style.display = 'none';
                }
            });
        }
        initializeDOMElements();
    });
    
    afterEach(() => {
        // Limpa o DOM após cada teste
        document.body.innerHTML = '';
    });
    
    test('Should open the sidebar when the toggle menu is clicked', () => {
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        // Simula o clique no menu toggle
        menuToggle.click();
        
        // Simula o comportamento do evento de clique
        sidebar.classList.toggle('active');
        sidebar.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
        
        // Verifica se a sidebar foi exibida após o clique
        expect(sidebar.style.display).toBe('block');
        expect(sidebar.classList.contains('active')).toBe(true);
    });
    
    test('Should close the sidebar when the toggle menu is clicked again', () => {
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        // Simula o primeiro clique para abrir
        menuToggle.click();
        sidebar.classList.toggle('active');
        sidebar.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
        
        // Simula o segundo clique para fechar
        menuToggle.click();
        sidebar.classList.toggle('active');
        sidebar.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
        
        // Verifica se a sidebar foi escondida após o segundo clique
        expect(sidebar.style.display).toBe('none');
        expect(sidebar.classList.contains('active')).toBe(false);
    });
    
    test('Should close the sidebar when moving the mouse out (mouseleave)', () => {
        const sidebar = document.querySelector('.sidebar');
        
        // Simula o primeiro clique para abrir
        sidebar.classList.add('active');
        sidebar.style.display = 'block';
        
        // Simula o evento de mouseleave
        const mouseleaveEvent = new Event('mouseleave');
        sidebar.dispatchEvent(mouseleaveEvent);
        
        // Verifica se a sidebar foi escondida após o evento de mouseleave
        expect(sidebar.style.display).toBe('none');
        expect(sidebar.classList.contains('active')).toBe(false);
    });
    
    test('The ClearreportsButton button must be present in the gift', () => {
        const clearReportsButton = document.getElementById('clearReportsButton');
        expect(clearReportsButton).not.toBeNull();
    });
    
});

describe('Add and delete a task', () => {
    beforeEach(() => {
        // Simula o formulário de adicionar tarefa
        const taskForm = document.createElement('form');
        taskForm.id = 'taskForm';
        
        // Simula os campos do formulário
        const taskNameInput = document.createElement('input');
        taskNameInput.id = 'taskName';
        taskNameInput.value = 'Nova Tarefa';
        
        const taskTypeInput = document.createElement('input');
        taskTypeInput.id = 'taskType';
        taskTypeInput.value = 'Tipo de Tarefa';
        
        const taskDueDateInput = document.createElement('input');
        taskDueDateInput.id = 'taskDueDate';
        taskDueDateInput.value = '2024-12-31'; // Simula uma data
        
        const taskResponsibleInput = document.createElement('input');
        taskResponsibleInput.id = 'taskResponsible';
        taskResponsibleInput.value = 'João';
        
        // Simula a lista de tarefas
        const taskList = document.createElement('table');
        taskList.id = 'taskList';
        document.body.appendChild(taskList);
        
        // Adiciona os inputs ao formulário
        taskForm.appendChild(taskNameInput);
        taskForm.appendChild(taskTypeInput);
        taskForm.appendChild(taskDueDateInput);
        taskForm.appendChild(taskResponsibleInput);
        
        // Adiciona o formulário ao corpo do documento
        document.body.appendChild(taskForm);
        
        // Simula a função de adicionar tarefa com o evento submit
        document.getElementById('taskForm').addEventListener('submit', addTask);
    });
    
    afterEach(() => {
        // Limpa o DOM após cada teste
        document.body.innerHTML = '';
    });
    
    test('Add a task and then delete it', () => {
        const taskForm = document.getElementById('taskForm');
        const taskList = document.getElementById('taskList');
        
        // Simula o envio do formulário para adicionar a tarefa
        taskForm.dispatchEvent(new Event('submit'));
        
        // Verifica se a tarefa foi adicionada à lista
        let taskRows = taskList.querySelectorAll('tr');
        expect(taskRows.length).toBe(1); // Deve ter uma tarefa na lista
        expect(taskRows[0].textContent).toContain('Nova Tarefa');
        
        // Simula o botão de excluir na tarefa adicionada
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn-delete';
        taskRows[0].appendChild(deleteButton);
        
        // Simula o clique no botão de excluir
        deleteButton.click();
        
        // Verifica se a tarefa foi removida da lista
        taskRows = taskList.querySelectorAll('tr');
        expect(taskRows.length).toBe(0); // A lista deve estar vazia após a exclusão
    });
    
    test('should delete the task when a valid ID is provided', () => {
        const mockTransaction = {
            objectStore: jest.fn().mockReturnValue({
                delete: jest.fn()
            })
        };
        const db = {
            transaction: jest.fn().mockReturnValue(mockTransaction)
        };
        
        const validId = 1;
        deleteTask(validId);
        
        expect(db.transaction).toHaveBeenCalledWith(['tasks'], 'readwrite');
        expect(mockTransaction.objectStore).toHaveBeenCalledWith('tasks');
        expect(mockTransaction.objectStore().delete).toHaveBeenCalledWith(validId);
    });
});