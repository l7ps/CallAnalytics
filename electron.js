
const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');

// Registra o esquema 'app' como privilegiado.
// Isso deve ser feito antes do evento 'ready' do app.
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }
]);

// Envolve a lógica principal em uma função assíncrona para usar await para importação dinâmica
async function startApp() {
  // Importa dinamicamente electron-is-dev
  // Módulos ESM frequentemente exportam uma propriedade `default`.
  const importedIsDev = await import('electron-is-dev');
  const isDev = importedIsDev.default;

  function createWindow() {
    const win = new BrowserWindow({
      width: 1280,
      height: 800,
      icon: path.join(__dirname, 'assets', 'icon.png'), // Mantém .png conforme arquivo original do projeto
      webPreferences: {
        nodeIntegration: true, // Cuidado: Considere alternativas mais seguras para produção (contextBridge)
        contextIsolation: false, // Cuidado: Considere alternativas mais seguras para produção
        // webSecurity: false, // Pode ser necessário para carregar recursos locais com o protocolo customizado em alguns casos, mas use com cautela.
      },
    });

    if (isDev) {
      win.loadURL('http://localhost:9002'); // Garanta que esta porta corresponda ao seu servidor de desenvolvimento Next.js
      win.webContents.openDevTools();
    } else {
      // Carrega os arquivos estáticos exportados do Next.js usando o protocolo customizado
      win.loadURL('app://index.html');
    }
  }

  // Este método será chamado quando o Electron terminar
  // a inicialização e estiver pronto para criar janelas do navegador.
  app.whenReady().then(() => {
    // Configura o manipulador para o protocolo 'app'
    // Isso deve ser feito após o app estar 'ready' e o esquema ter sido registrado como privilegiado.
    protocol.registerFileProtocol('app', (request, callback) => {
      // request.url será algo como 'app://index.html' ou 'app://_next/static/css/main.css'
      let relativePath = request.url.slice('app://'.length);
      
      // Remove query parameters ou hash se existirem, para obter o caminho do arquivo puro
      relativePath = relativePath.split('?')[0].split('#')[0];

      const absolutePath = path.join(__dirname, 'out', relativePath);
      callback({ path: absolutePath });
    });

    createWindow();

    app.on('activate', () => {
      // No macOS é comum recriar uma janela no aplicativo quando o
      // ícone do dock é clicado e não há outras janelas abertas.
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  // Encerra quando todas as janelas são fechadas, exceto no macOS.
  app.on('window-all-closed', () => {
    // No macOS, é comum aplicativos e suas barras de menu
    // permanecerem ativos até que o usuário saia explicitamente com Cmd + Q.
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

// Chama a função assíncrona para iniciar o aplicativo
startApp().catch((err) => {
  console.error('Falha ao iniciar a aplicação Electron:', err);
  // Opcionalmente, mostre um diálogo de erro para o usuário aqui, se necessário, usando o módulo dialog do Electron.
  // Exemplo: dialog.showErrorBox('Erro na Aplicação', 'Falha ao iniciar. Verifique os logs.');
  if (app.isReady()) { // Só chame app.quit() se o app estiver pronto, para evitar erros
    app.quit();
  } else {
    process.exit(1); // Saída forçada se o app nem sequer inicializou
  }
});
