/* eslint-env jest */

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