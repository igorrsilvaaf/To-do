// Mock do DOM para testes
document.body.innerHTML = `
    <div id="taskList"></div>
    <form id="taskForm">
        <input id="taskName" type="text" />
        <input id="taskType" type="text" />
        <input id="taskDueDate" type="datetime-local" />
        <input id="taskResponsible" type="text" />
        <input id="taskProject" type="text" />
        <textarea id="taskObservation"></textarea>
        <button type="submit">Adicionar Tarefa</button>
    </form>

    <form id="responsavelForm">
        <input id="responsavelName" type="text" />
        <input id="responsavelEmail" type="email" />
        <input id="responsavelTelefone" type="tel" />
        <button type="submit">Adicionar Responsável</button>
    </form>
`;

// Mock do IndexedDB
const indexedDB = import('fake-indexeddb');
global.indexedDB = indexedDB;

// Mock de funções globais
global.alert = jest.fn();
global.confirm = jest.fn(); 