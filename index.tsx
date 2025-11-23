import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppwriteProvider } from "./context/AppwriteContext";

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppwriteProvider>
      <App />
    </AppwriteProvider>
  </React.StrictMode>
);
