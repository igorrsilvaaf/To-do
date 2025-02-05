import { validateTask, validateResponsible } from '../js/validators.js';

describe('Validações de Tarefas', () => {
    test('Deve validar uma tarefa corretamente', () => {
        const task = {
            text: 'Nova Tarefa',
            type: 'Desenvolvimento',
            dueDate: '01/01/2024 -- 10:00',
            responsible: 'Igor',
            project: 'Projeto 1',
            observation: 'Teste'
        };
        expect(validateTask(task)).toBeTruthy();
    });

    test('Deve rejeitar tarefa sem nome', () => {
        const task = {
            text: '',
            type: 'Desenvolvimento'
        };
        expect(() => validateTask(task)).toThrow('Nome da tarefa é obrigatório');
    });
});

describe('Validações de Responsáveis', () => {
    test('Deve validar um responsável corretamente', () => {
        const responsible = {
            name: 'Igor Silva',
            email: 'igor@email.com',
            phone: '11999999999'
        };
        expect(validateResponsible(responsible)).toBeTruthy();
    });

    test('Deve rejeitar email inválido', () => {
        const responsible = {
            name: 'Igor Silva',
            email: 'email-invalido',
            phone: '11999999999'
        };
        expect(() => validateResponsible(responsible)).toThrow('Email inválido');
    });
}); 