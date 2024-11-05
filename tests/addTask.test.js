// Importar a função addTask e as dependências que serão mockadas
import { addTask, createTask, renderTask, saveTask, saveReport } from './index';

// Mock das funções dependentes para isolar a função addTask
jest.mock('./index', () => ({
  createTask: jest.fn(),
  renderTask: jest.fn(),
  saveTask: jest.fn(),
  saveReport: jest.fn(),
  addTask: jest.requireActual('./index').addTask,  // Importa a função real para o teste
}));

describe('Teste unitário da função addTask', () => {
  beforeEach(() => {
    // Limpar mocks e configurar o DOM antes de cada teste
    jest.clearAllMocks();

    // Configurar elementos DOM simulados para o teste
    document.body.innerHTML = `
      <form id="taskForm">
        <input id="taskName" value="Tarefa de teste" />
        <input id="taskType" value="Tipo A" />
        <input id="taskDueDate" value="2023-12-01T10:00" />
        <input id="taskResponsible" value="Responsável Teste" />
        <input id="taskProject" value="Projeto X" />
        <input id="taskObservation" value="Observação de teste" />
      </form>
      <div id="taskList"></div>
    `;
  });

  test('deve criar e salvar uma nova tarefa com sucesso', () => {
    // Mock do evento para evitar o comportamento padrão do formulário
    const mockEvent = { preventDefault: jest.fn() };

    // Objeto de tarefa mockado que a função createTask deverá retornar
    const mockTask = {
      id: 123,
      text: 'Tarefa de teste',
      type: 'Tipo A',
      dueDate: '01/12/2023 -- 10:00',
      responsible: 'Responsável Teste',
      project: 'Projeto X',
      observation: 'Observação de teste',
      status: 'Pendente'
    };

    // Configurar o retorno esperado para createTask
    createTask.mockReturnValue(mockTask);

    // Executar a função addTask
    addTask(mockEvent);

    // Verificar se createTask foi chamada com os argumentos corretos
    expect(createTask).toHaveBeenCalledWith(
      'Tarefa de teste',
      'Tipo A',
      '01/12/2023 -- 10:00',
      'Responsável Teste',
      'Projeto X',
      'Observação de teste'
    );

    // Verificar se renderTask foi chamada com a nova tarefa
    expect(renderTask).toHaveBeenCalledWith(mockTask);

    // Verificar se saveTask foi chamada com a nova tarefa
    expect(saveTask).toHaveBeenCalledWith(mockTask);

    // Verificar se saveReport foi chamada para registrar a tarefa adicionada
    expect(saveReport).toHaveBeenCalledWith('Adicionada', mockTask);

    // Verificar se o formulário foi resetado
    expect(document.getElementById('taskName').value).toBe('');
    expect(document.getElementById('taskType').value).toBe('');
    expect(document.getElementById('taskDueDate').value).toBe('');
    expect(document.getElementById('taskResponsible').value).toBe('');
    expect(document.getElementById('taskObservation').value).toBe('');
  });

  test('deve exibir um alerta quando campos obrigatórios estão faltando', () => {
    // Remover o valor de um campo obrigatório para simular entrada inválida
    document.getElementById('taskName').value = '';

    // Mock do alert para evitar que o teste quebre ao exibir o alerta
    global.alert = jest.fn();

    // Executar a função addTask
    const mockEvent = { preventDefault: jest.fn() };
    addTask(mockEvent);

    // Verificar se alert foi chamado com a mensagem de erro
    expect(global.alert).toHaveBeenCalledWith('Todos os campos obrigatórios devem ser preenchidos');
  });
});