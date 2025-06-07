import React from 'react';
import QRCodeGenerator from './components/QRCodeGenerator';
import './App.css'; // Main application styles

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>QR Code Generator Pro</h1>
      </header>
      <main>
        <QRCodeGenerator />
      </main>
      <footer>
        <p>© {new Date().getFullYear()} QR Code Styler. Built with React & qrcode.react.</p>
      </footer>
    </div>
  );
}

export default App;