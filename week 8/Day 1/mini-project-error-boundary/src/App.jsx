import { useState } from 'react';
import './App.css';
import ErrorBoundary from './ErrorBoundary';

function ColumnLeft() {
  const [images, setImages] = useState([]);

  const getImages = () => {
    const imageUrls = [
      'https://picsum.photos/id/1015/500/350',
      'https://picsum.photos/id/1035/500/350',
    ];
    setImages(imageUrls);
  };

  return (
    <div className="column left-column">
      <h2>Left Column</h2>
      <button className="primary-btn" onClick={getImages}>
        Get images
      </button>
      <div className="image-grid">
        {images.length > 0 ? (
          images.map((image, index) => (
            <img key={index} src={image} alt={`Sample ${index + 1}`} />
          ))
        ) : (
          <p className="placeholder">No images yet</p>
        )}
      </div>
    </div>
  );
}

function ColumnRight() {
  const [textValue, setTextValue] = useState('{"function":"I live to crash"}');

  const replaceWithObject = () => {
    setTextValue({ function: 'I live to crash' });
  };

  const invokeEventHandler = () => {
    throw new Error('Event handler error');
  };

  return (
    <div className="column right-column">
      <h2>Right Column</h2>
      <p className="description">Some description texts and two buttons.</p>

      <ErrorBoundary>
        <p className="crash-text">{textValue}</p>
      </ErrorBoundary>

      <div className="button-stack">
        <button className="primary-btn" onClick={replaceWithObject}>
          Replace string with object
        </button>
        <button className="secondary-btn" onClick={invokeEventHandler}>
          Invoke event handler
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Error Boundary Demo</h1>
      </header>

      <main className="layout">
        <ColumnLeft />
        <ColumnRight />
      </main>
    </div>
  );
}

export default App;
