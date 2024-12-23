---

## Sumário
1. [Introdução](#introdução)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Instalação](#instalação)
4. [Funcionalidades](#funcionalidades)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [Como Contribuir](#como-contribuir)
7. [Licença](#licença)

---

## Introdução

Este projeto é uma aplicação **To-Do List**, que permite ao usuário organizar tarefas, categorias, e utilizar a técnica **Pomodoro** para aumentar a produtividade. Ele também inclui funcionalidades de **relatórios** e **modo escuro/claro**.

O projeto utiliza uma interface moderna e responsiva com recursos de interação fáceis de usar, como um painel lateral, formulários dinâmicos e integração com IndexedDB para armazenamento local das tarefas.

---

## Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando as seguintes tecnologias:

- **HTML5**: Estrutura da página.
- **CSS3**: Estilização e design responsivo.
- **JavaScript (ES6)**: Interatividade e lógica da aplicação.
- **IndexedDB**: Armazenamento local para as tarefas e categorias.
- **FontAwesome**: Ícones para melhorar a UI.
- **Pomodoro Timer**: Técnica de gerenciamento de tempo embutida.

---

## Instalação

### Requisitos

Para rodar este projeto localmente, você precisará de um ambiente que sirva arquivos estáticos, como o **Node.js** com o pacote `http-server` ou apenas abrir o `index.html` diretamente no navegador.

### Passos para rodar o projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/SeuUsuario/ToDoListApp.git
   ```

2. Navegue até o diretório do projeto:
   ```bash
   cd ToDoListApp
   ```

3. Se preferir, você pode instalar um servidor estático localmente com Node.js:
   ```bash
   npm install -g http-server
   ```

4. Inicie o servidor:
   ```bash
   http-server
   ```

5. Abra o navegador no endereço:
   ```bash
   http://localhost:8080
   ```

---

## Funcionalidades

A aplicação oferece as seguintes funcionalidades principais:

### 1. **Lista de Tarefas**
   - Adicione novas tarefas com nome, categoria, tipo, data de entrega, responsável e observação.
   - Marque tarefas como concluídas, exclua ou altere o status.
   - Abaixo está uma captura de tela da interface da lista de tarefas:
   - ![Lista de Tarefas](./Imagens/listaDeTarefas.png)

### 2. **Categorias**
   - Adicione e organize suas tarefas em categorias personalizadas.
   - Abaixo está uma captura de tela da interface de categorias:
   - ![Lista de Tarefas](./Imagens/categorias.png)

### 3. **Relatórios**
   - Gere relatórios automáticos das ações realizadas nas tarefas (adicionar, atualizar status e deletar).
   - Abaixo está uma captura de tela da interface de relatórios:
   - ![Lista de Tarefas](./Imagens/relatorio.png)

### 4. **Pomodoro**
   - Utilize a técnica Pomodoro para gerenciar seu tempo de forma eficiente.
   - Personalize os tempos de trabalho e pausa, com histórico de sessões.
   - Abaixo está uma captura de tela da interface do pomodoro:
   - ![Lista de Tarefas](./Imagens/pomodoro.png)

### 5. **Modo Escuro/Claro**
   - Altere o tema da aplicação para modo claro ou escuro.

---

## Estrutura do Projeto

A estrutura básica do projeto está organizada da seguinte forma:

```
/index.html          -> Estrutura da página HTML.
/js/index.js         -> Lógica principal da aplicação (tarefas, categorias, relatórios, Pomodoro).
/style/Style.css     -> Estilos CSS para a interface.
/Imagens/            -> Recursos de imagem, como logo e ícones.
```

### index.html

O arquivo **index.html** contém a estrutura principal da aplicação, incluindo:
- O painel lateral com navegação entre as seções (Tarefas, Categorias, Caderno, Relatórios e Pomodoro).
- Formulários para criar tarefas e categorias.
- Tabelas para exibir as tarefas e categorias.
  
### index.js

O arquivo **index.js** lida com toda a lógica da aplicação, incluindo:
- Manipulação do DOM para adicionar, atualizar e remover tarefas e categorias.
- Armazenamento das tarefas e categorias no **IndexedDB**.
- Implementação da técnica **Pomodoro** com temporizador.
- Alternância de tema entre modo claro e escuro.
- Funções de relatório que salvam as ações realizadas no **LocalStorage**.

---

## Como Contribuir

Se você quiser contribuir com este projeto, siga as etapas abaixo:

1. Faça um fork do repositório.
2. Crie uma nova branch:
   ```bash
   git checkout -b feature/nova-feature
   ```
3. Faça suas alterações e adicione commits:
   ```bash
   git commit -m 'Adicionar nova feature'
   ```
4. Envie suas alterações para o GitHub:
   ```bash
   git push origin feature/nova-feature
   ```
5. Abra um Pull Request.

---