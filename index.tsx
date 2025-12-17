
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Captura erros globais de renderização
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Erro Global:", message, "em", source, ":", lineno);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Elemento root não encontrado no DOM!");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Aplicação montada com sucesso.");
  } catch (err) {
    console.error("Falha ao renderizar App:", err);
  }
}
