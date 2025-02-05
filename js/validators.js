export function validateTask(task) {
    if (!task.text || task.text.trim().length < 3) {
        throw new Error('Nome da tarefa é obrigatório e deve ter pelo menos 3 caracteres');
    }

    if (!task.type) {
        throw new Error('Tipo da tarefa é obrigatório');
    }

    if (!task.dueDate) {
        throw new Error('Data de entrega é obrigatória');
    }

    if (!task.responsible) {
        throw new Error('Responsável é obrigatório');
    }

    return true;
}

export function validateResponsible(responsible) {
    if (!responsible.name || responsible.name.trim().length < 3) {
        throw new Error('Nome do responsável é obrigatório e deve ter pelo menos 3 caracteres');
    }

    if (responsible.email && !isValidEmail(responsible.email)) {
        throw new Error('Email inválido');
    }

    if (responsible.phone && !isValidPhone(responsible.phone)) {
        throw new Error('Telefone inválido');
    }

    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^\d{10,11}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
} 