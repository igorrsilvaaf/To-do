import { validateTask, validateResponsible } from '../../js/validators.js';

describe('Validações de Tarefas', () => {
    describe('Validação de Nome', () => {
        test('Deve aceitar nome válido', () => {
            const task = {
                text: 'Nova Tarefa',
                type: 'Desenvolvimento',
                dueDate: '01/01/2024 -- 10:00',
                responsible: 'Igor',
                project: 'Projeto 1'
            };
            expect(validateTask(task)).toBeTruthy();
        });

        test('Deve rejeitar nome vazio', () => {
            const task = { text: '', type: 'Desenvolvimento' };
            expect(() => validateTask(task)).toThrow('Nome da tarefa é obrigatório');
        });

        test('Deve rejeitar nome muito curto', () => {
            const task = { text: 'ab', type: 'Desenvolvimento' };
            expect(() => validateTask(task)).toThrow('deve ter pelo menos 3 caracteres');
        });
    });

    describe('Validação de Tipo', () => {
        test('Deve rejeitar tipo vazio', () => {
            const task = { text: 'Tarefa Test', type: '' };
            expect(() => validateTask(task)).toThrow('Tipo da tarefa é obrigatório');
        });
    });

    describe('Validação de Data', () => {
        test('Deve rejeitar data vazia', () => {
            const task = { 
                text: 'Tarefa Test', 
                type: 'Desenvolvimento',
                dueDate: ''
            };
            expect(() => validateTask(task)).toThrow('Data de entrega é obrigatória');
        });
    });
});

describe('Validações de Responsáveis', () => {
    describe('Validação de Nome', () => {
        test('Deve aceitar nome válido', () => {
            const responsible = {
                name: 'Igor Silva',
                email: 'igor@email.com',
                phone: '11999999999'
            };
            expect(validateResponsible(responsible)).toBeTruthy();
        });

        test('Deve rejeitar nome vazio', () => {
            const responsible = { name: '', email: 'igor@email.com' };
            expect(() => validateResponsible(responsible)).toThrow('Nome do responsável é obrigatório');
        });

        test('Deve rejeitar nome muito curto', () => {
            const responsible = { name: 'Ig', email: 'igor@email.com' };
            expect(() => validateResponsible(responsible)).toThrow('deve ter pelo menos 3 caracteres');
        });
    });

    describe('Validação de Email', () => {
        test('Deve aceitar email válido', () => {
            const responsible = {
                name: 'Igor Silva',
                email: 'igor@email.com'
            };
            expect(validateResponsible(responsible)).toBeTruthy();
        });

        test('Deve rejeitar email inválido', () => {
            const responsible = {
                name: 'Igor Silva',
                email: 'email-invalido'
            };
            expect(() => validateResponsible(responsible)).toThrow('Email inválido');
        });

        test('Deve aceitar responsável sem email', () => {
            const responsible = { name: 'Igor Silva' };
            expect(validateResponsible(responsible)).toBeTruthy();
        });
    });

    describe('Validação de Telefone', () => {
        test('Deve aceitar telefone válido', () => {
            const responsible = {
                name: 'Igor Silva',
                phone: '11999999999'
            };
            expect(validateResponsible(responsible)).toBeTruthy();
        });

        test('Deve rejeitar telefone inválido', () => {
            const responsible = {
                name: 'Igor Silva',
                phone: '123'
            };
            expect(() => validateResponsible(responsible)).toThrow('Telefone inválido');
        });

        test('Deve aceitar responsável sem telefone', () => {
            const responsible = { name: 'Igor Silva' };
            expect(validateResponsible(responsible)).toBeTruthy();
        });
    });
}); 