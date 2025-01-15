// Import React and ReactDOM
import React from 'react';
import ReactDOM from 'react-dom/client';

// Define the main App component
function App() {
  return (
    <div>
      <h1>Hello, World!</h1>
    </div>
  );
}

// Render the App component into the root element
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
