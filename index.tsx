
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Iniciando carregamento do index.tsx...");

// Captura erros globais de renderização e módulos
window.addEventListener('error', (event) => {
  console.error("Erro de Módulo/Execução:", event.message, "em", event.filename);
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Erro Crítico: Elemento #root não encontrado.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("React tentou renderizar o App.");
  } catch (err) {
    console.error("Falha fatal na montagem do React:", err);
  }
}
