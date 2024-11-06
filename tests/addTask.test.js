import { addTask } from '../js/index.js';
import createTask from '../js/index.js'; 
import '../js/index.js'; 

jest.mock('../js/index.js'); // Mock da função createTask

describe('Teste unitário da função addTask', () => {
  beforeEach(() => {
    // Configurar o DOM antes de cada teste
    document.body.innerHTML = `
      <input id="taskName" value="Tarefa de teste" />
      <input id="taskType" value="Tipo A" />
      <input id="taskDate" value="01/12/2023 -- 10:00" />
      <input id="taskResponsible" value="Responsável Teste" />
      <input id="taskProject" value="Projeto X" />
      <input id="taskNotes" value="Observação de teste" />
      <button id="addTaskButton">Adicionar Tarefa</button>
    `;

    // Mock do global alert
    global.alert = jest.fn();
  });

  test('deve criar e salvar uma nova tarefa com sucesso', () => {
    const mockEvent = { preventDefault: jest.fn() };

    // Chamar a função addTask
    addTask(mockEvent);

    // Verificar se createTask foi chamado com os argumentos corretos
    expect(createTask).toHaveBeenCalledWith(
      'Tarefa de teste',
      'Tipo A',
      '01/12/2023 -- 10:00',
      'Responsável Teste',
      'Projeto X',
      'Observação de teste'
    );
  });

  test('deve exibir um alerta quando campos obrigatórios estão faltando', () => {
    // Limpar os valores dos campos obrigatórios
    document.getElementById('taskName').value = '';
    document.getElementById('taskType').value = '';
    
    const mockEvent = { preventDefault: jest.fn() }; // Simulando um evento

    // Chamar a função addTask
    addTask(mockEvent);

    // Verificar se alert foi chamado com a mensagem de erro
    expect(global.alert).toHaveBeenCalledWith('Todos os campos obrigatórios devem ser preenchidos');
  });
});