import { useEffect, useState } from 'react';

function Color() {
  const [favoriteColor, setFavoriteColor] = useState('red');

  useEffect(() => {
    window.alert('useEffect reached');
  }, []);

  const changeColor = () => {
    setFavoriteColor('blue');
  };

  return (
    <div className="demo-content">
      <h3 className="favorite-color">My favorite color is {favoriteColor}.</h3>
      <button className="button button-primary" onClick={changeColor} type="button">
        Change favorite color
      </button>
    </div>
  );
}

export default Color;