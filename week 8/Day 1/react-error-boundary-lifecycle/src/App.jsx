import { Component } from 'react';
import './App.css';
import ErrorBoundary from './ErrorBoundary';

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const weekdayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const getClockParts = (date) => ({
  year: date.getFullYear(),
  month: date.getMonth(),
  weekday: date.getDay(),
  day: date.getDate(),
  hour: date.getHours(),
  minute: date.getMinutes(),
  second: date.getSeconds(),
});

const padTime = (value) => String(value).padStart(2, '0');

class ReactClock extends Component {
  state = getClockParts(new Date());

  componentDidMount() {
    this.clockInterval = window.setInterval(() => {
      this.setState(getClockParts(new Date()));
    }, 1000);
  }

  componentWillUnmount() {
    window.clearInterval(this.clockInterval);
  }

  getOrbitLabels(unit, value, count, label) {
    const slotCount = unit === 'week' ? 5 : 12;

    return Array.from({ length: slotCount }, (_, index) => {
      const offset = index > Math.floor(slotCount / 2) ? index - slotCount : index;
      let orbitValue = value + offset;

      if (unit === 'month') {
        orbitValue = (orbitValue + monthNames.length) % monthNames.length;
      } else if (unit === 'week') {
        orbitValue = ((orbitValue - 1 + 5) % 5) + 1;
      } else if (unit === 'day') {
        orbitValue = ((orbitValue - 1 + count) % count) + 1;
      } else {
        orbitValue = ((orbitValue % count) + count) % count;
      }

      return {
        text: unit === 'month' ? monthNames[orbitValue] : `${orbitValue} ${label}`,
        isCurrent: offset === 0,
      };
    });
  }

  renderOrbit(unit, value, count, label, diameter) {
    const labels = this.getOrbitLabels(unit, value, count, label);

    return (
      <div
        className={`clock-orbit clock-orbit-${unit}`}
        style={{ '--orbit-diameter': diameter }}
        aria-hidden="true"
      >
        {labels.map((item, index) => (
          <span
            className="clock-orbit-slot"
            style={{ '--orbit-angle': `${(index * 360) / labels.length}deg` }}
            key={`${unit}-${index}`}
          >
            <span className={`clock-orbit-label${item.isCurrent ? ' is-current' : ''}`}>
              {item.text}
            </span>
          </span>
        ))}
      </div>
    );
  }

  render() {
    const { year, month, weekday, day, hour, minute, second } = this.state;
    const weekOfMonth = Math.ceil(day / 7);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return (
      <section className="exercise-panel clock-panel">
        <div className="clock-heading">
          <div>
            <p className="clock-eyebrow">A moment in time</p>
            <h2>React Clock</h2>
          </div>
          <span className="clock-live"><span /> LIVE</span>
        </div>

        <div className="clock-stage" role="group" aria-label="Animated compass clock">
          <div className="clock-year">{year}<span> / Year</span></div>
          <div className="clock-month">{monthNames[month].slice(0, 3)}</div>
          <div className="clock-dial">
            <div className="clock-dial-glow" />
            {this.renderOrbit('month', month, 12, 'month', '100%')}
            {this.renderOrbit('week', weekOfMonth, 5, 'week', '84%')}
            {this.renderOrbit('day', day, daysInMonth, 'day', '68%')}
            {this.renderOrbit('hour', hour, 24, 'hr', '52%')}
            {this.renderOrbit('minute', minute, 60, 'min', '36%')}
            {this.renderOrbit('second', second, 60, 'sec', '20%')}

            <div className="clock-center" aria-live="off">
              <p className="clock-date">
                {weekdayNames[weekday]} <span>·</span> {monthNames[month]} {day}, {year}
              </p>
              <time className="clock-time">
                {padTime(hour)}:{padTime(minute)}:{padTime(second)}
              </time>
              <p className="clock-center-caption">LOCAL TIME</p>
            </div>
          </div>
          <p className="clock-hint">A little perspective on every second.</p>
        </div>
      </section>
    );
  }
}

class BuggyCounter extends Component {
  state = { counter: 0 };

  handleClick = () => {
    const nextCounter = this.state.counter + 1;
    this.setState({ counter: nextCounter });

    if (nextCounter >= 5) {
      throw new Error('I crashed!');
    }
  };

  render() {
    return (
      <button className="buggy-counter" onClick={this.handleClick}>
        Counter: {this.state.counter}
      </button>
    );
  }
}

class LifecycleDemo extends Component {
  state = { favoriteColor: 'red' };

  componentDidMount() {
    setTimeout(() => {
      this.setState({ favoriteColor: 'yellow' });
    }, 1000);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('in getSnapshotBeforeUpdate');
    return prevState.favoriteColor;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('after update');
    console.log('Snapshot:', snapshot);
  }

  render() {
    return (
      <div className="lifecycle-demo">
        <h3>Favorite color: {this.state.favoriteColor}</h3>
        <button onClick={() => this.setState({ favoriteColor: 'blue' })}>
          Change favorite color
        </button>
      </div>
    );
  }
}

class Child extends Component {
  componentWillUnmount() {
    window.alert('The Child component has been unmounted.');
  }

  render() {
    return <h1>Hello World!</h1>;
  }
}

class App extends Component {
  state = {
    show: true,
  };

  deleteHeader = () => {
    this.setState({ show: false });
  };

  render() {
    return (
      <div className="app-shell">
        <header className="page-header">
          <h1>React Error Boundary & Lifecycle Exercises</h1>
        </header>

        <ReactClock />

        <section className="exercise-panel">
          <h2>Exercise 1: Error Boundary Simulation</h2>

          <div className="simulation-grid">
            <div className="simulation-box">
              <h3>Simulation 1</h3>
              <ErrorBoundary>
                <BuggyCounter />
                <BuggyCounter />
              </ErrorBoundary>
            </div>

            <div className="simulation-box">
              <h3>Simulation 2</h3>
              <ErrorBoundary>
                <BuggyCounter />
              </ErrorBoundary>
              <ErrorBoundary>
                <BuggyCounter />
              </ErrorBoundary>
            </div>

            <div className="simulation-box danger-box">
              <h3>Simulation 3</h3>
              <BuggyCounter />
            </div>
          </div>
        </section>

        <section className="exercise-panel">
          <h2>Exercise 2: Lifecycle</h2>
          <LifecycleDemo />
        </section>

        <section className="exercise-panel">
          <h2>Exercise 3: Unmounting</h2>
          <div className="unmount-box">
            {this.state.show ? <Child /> : <p>Header deleted</p>}
            <button onClick={this.deleteHeader}>Delete Header</button>
          </div>
        </section>
      </div>
    );
  }
}

export default App;
