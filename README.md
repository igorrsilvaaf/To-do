# 📝 To-Do List App

Uma aplicação moderna e intuitiva para gerenciamento de tarefas, combinando produtividade com a técnica Pomodoro.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Sumário
- [Visão Geral](#-visão-geral)
- [Recursos](#-recursos)
- [Tecnologias](#-tecnologias)
- [Começando](#-começando)
- [Arquitetura](#-arquitetura)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## 🎯 Visão Geral

O To-Do List App é uma solução completa para gerenciamento de tarefas e produtividade, combinando uma interface moderna e intuitiva com recursos avançados como timer Pomodoro, categorização de tarefas e geração de relatórios. A aplicação foi projetada pensando em usuários que buscam organizar suas atividades de forma eficiente, mantendo o foco e a produtividade.

### ✨ Principais Diferenciais
- Interface responsiva e intuitiva
- Armazenamento local seguro com IndexedDB
- Suporte a temas claro/escuro
- Sistema completo de categorização
- Timer Pomodoro integrado
- Geração de relatórios detalhados

## 🚀 Recursos

### Gerenciamento de Tarefas
Organize suas atividades com um sistema robusto de gerenciamento de tarefas:
- Criação de tarefas com campos personalizáveis
- Atribuição de responsáveis
- Datas de entrega
- Sistema de status
- Observações detalhadas

![Lista de Tarefas](./Imagens/listaDeTarefas.png)

### Sistema de Categorias
Categorize suas tarefas de forma eficiente:
- Categorias personalizáveis
- Organização hierárquica
- Filtros avançados

![Lista de Tarefas](./Imagens/categorias.png)

### Relatórios Analíticos
Acompanhe seu progresso com relatórios detalhados:
- Histórico de ações
- Métricas de produtividade
- Exportação de dados

![Lista de Tarefas](./Imagens/relatorio.png)

### Timer Pomodoro
Aumente sua produtividade com o timer Pomodoro integrado:
- Intervalos personalizáveis
- Notificações sonoras
- Histórico de sessões
- Estatísticas de uso

![Lista de Tarefas](./Imagens/pomodoro.png)

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- IndexedDB
- Font Awesome

## 🚀 Demo

[Link para a aplicação em produção - se disponível]

## 📋 Funcionalidades

### Lista de Tarefas
- ✅ Gerenciamento completo de tarefas (criar, editar, excluir)
- 🔄 Status dinâmicos com indicadores visuais:
  - 🔵 Pendente (Azul)
  - 🟣 Em andamento (Roxo)
  - 🟢 Concluída (Verde)
  - 🔴 Bloqueada (Vermelho)
- 📅 Data e hora de entrega
- 📝 Campo para observações
- 🏷️ Tipo de tarefa personalizável

### Sistema de Categorias
Categorize suas tarefas de forma eficiente:
- Categorias personalizáveis
- Organização hierárquica
- Filtros avançados

### Gestão de Responsáveis
Sistema completo para gerenciamento de responsáveis:
- Cadastro com nome, e-mail e telefone
- Atribuição de responsáveis às tarefas
- Interface responsiva
- Exclusão simplificada

### Relatórios
Acompanhe todas as atividades:
- Histórico de alterações
- Registro de status
- Log de responsáveis
- Rastreamento de datas

### Timer Pomodoro
Aumente sua produtividade:
- ⏱️ Temporizador configurável
- 🔄 Ciclos de trabalho e pausa
- 📊 Histórico de sessões
- ⚡ Modo tela cheia

### Caderno de Anotações
Mantenha suas anotações organizadas:
- 📝 Editor de texto rico
- 🎨 Formatação completa
- 💾 Salvamento automático
- 📱 Design responsivo

### Interface
- 🌓 Modo escuro/claro
- 📱 Design responsivo
- 💾 Armazenamento local
- 🎯 Interface intuitiva

## 🚦 Começando

### Pré-requisitos
- Navegador moderno com suporte a ES6+
- Node.js (opcional, para servidor local)

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/SEU_USUARIO/todo-list-app.git
```

2. Navegue até o diretório
```bash
cd todo-list-app
```

3. Abra o arquivo index.html no navegador ou use um servidor local
```bash
# Se tiver Python instalado
python -m http.server 8000

# Se tiver Node.js instalado
npx http-server
```

## 🏗 Arquitetura

```
ToDoListApp/
├── 📄 index.html          # Entrada da aplicação
├── 📂 js/
│   └── 📜 index.js       # Lógica principal
├── 📂 style/
│   └── 📜 Style.css      # Estilos globais
└── 📂 Imagens/           # Recursos estáticos
    ├── 🖼️ listaDeTarefas.png
    ├── 🖼️ categorias.png
    ├── 🖼️ relatorio.png
    └── 🖼️ pomodoro.png
```

### Componentes Principais

- **Interface Principal**: Implementada em HTML5 com design responsivo
- **Sistema de Armazenamento**: Utiliza IndexedDB para persistência local
- **Gerenciador de Estados**: Controle centralizado de estados da aplicação
- **Sistema de Temas**: Alternância dinâmica entre temas claro/escuro

## 💡 Como Usar

1. **Tarefas**
   - Adicione tarefas com nome, categoria e responsável
   - Edite tarefas existentes
   - Atualize status com indicadores visuais
   - Gerencie datas de entrega

2. **Categorias**
   - Organize suas tarefas em categorias
   - Gerencie e exclua categorias

3. **Responsáveis**
   - Cadastre responsáveis com informações completas
   - Atribua responsáveis às tarefas
   - Gerencie contatos de forma eficiente

4. **Pomodoro**
   - Configure tempos de trabalho e pausa
   - Use o modo tela cheia
   - Acompanhe seu histórico

## 👥 Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Adicione suas mudanças (`git add .`)
4. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
5. Push a Branch (`git push origin feature/AmazingFeature`)
6. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

Igor da Silva
- GitHub: [@igorrsilvaaf](https://github.com/igorrsilvaaf/)
- LinkedIn: [Linkedin](https://www.linkedin.com/in/igor-da-silva-francisco-b248bb289/)

---

<p align="center">
  Desenvolvido com ❤️ por Igor Silva
</p>

![CI/CD Pipeline](https://github.com/igorrsilvaaf/todo-list/actions/workflows/ci.yml/badge.svg)