import { useState } from 'react';

function Phone() {
  const [brand] = useState('Samsung');
  const [model] = useState('Galaxy S20');
  const [color, setColor] = useState('black');
  const [year] = useState(2020);

  const changeColor = () => {
    setColor('blue');
  };

  return (
    <div className="demo-content">
      <dl className="phone-details">
        <div><dt>Brand</dt><dd>{brand}</dd></div>
        <div><dt>Model</dt><dd>{model}</dd></div>
        <div><dt>Color</dt><dd>{color}</dd></div>
        <div><dt>Year</dt><dd>{year}</dd></div>
      </dl>
      <button className="button button-primary" onClick={changeColor} type="button">
        Change color to blue
      </button>
    </div>
  );
}

export default Phone;