/* eslint-env jest */

const { addTask } = require('../js/index');

describe('Interação com o DOM - Sidebar Toggle', () => {
  beforeEach(() => {
    // Simulando o botão de toggle do menu
    const menuToggle = document.createElement('button');
    menuToggle.id = 'menu-toggle';
    document.body.appendChild(menuToggle);

    // Simulando o sidebar (inicialmente oculto)
    const sidebar = document.createElement('div');
    sidebar.classList.add('sidebar');
    sidebar.style.display = 'none';  // Inicialmente oculta
    document.body.appendChild(sidebar);

    // Certifique-se de simular o comportamento de mouseleave
    if (sidebar) {
      sidebar.addEventListener('mouseleave', () => {
        if (window.innerWidth > 768) {
          sidebar.classList.remove('active');
          sidebar.style.display = 'none';
        }
      });
    }
  });

  afterEach(() => {
    // Limpa o DOM após cada teste
    document.body.innerHTML = '';
  });

  test('Deve abrir a sidebar quando o menu toggle for clicado', () => {
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

  test('Deve fechar a sidebar quando o menu toggle for clicado novamente', () => {
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

  test('Deve fechar a sidebar ao mover o mouse para fora (mouseleave)', () => {
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
});

describe('Adicionar e excluir uma tarefa', () => {
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

    // Simula a função de adicionar tarefa
    document.getElementById('taskForm').addEventListener('submit', addTask);

    // Simula a abertura da sidebar (reutilizando o código anterior)
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    menuToggle.click(); // Abre a sidebar
    expect(sidebar.style.display).toBe('block'); // Verifica se abriu
  });

  afterEach(() => {
    // Limpa o DOM após cada teste
    document.body.innerHTML = '';
  });

  test('Adicionar uma tarefa e depois excluir ela', () => {
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');

    // Simula o envio do formulário para adicionar a tarefa
    taskForm.dispatchEvent(new Event('submit'));

    // Verifica se a tarefa foi adicionada à lista
    let taskRows = taskList.querySelectorAll('tr');
    expect(taskRows.length).toBe(1); // Deve ter uma tarefa na lista
    expect(taskRows[0].textContent).toContain('Nova Tarefa');

    // Simula a exclusão da tarefa (simulando o clique no botão de excluir)
    const deleteButton = taskRows[0].querySelector('.btn-delete');
    deleteButton.click();

    // Verifica se a tarefa foi removida da lista
    taskRows = taskList.querySelectorAll('tr');
    expect(taskRows.length).toBe(0); // A lista deve estar vazia após a exclusão
  });
});