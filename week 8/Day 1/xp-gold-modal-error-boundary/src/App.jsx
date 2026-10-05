import { Component } from 'react';
import Modal from './Modal';
import ErrorBoundary from './ErrorBoundary';

class App extends Component {
  state = {
    showModal: false,
    errorInfo: null,
  };

  openModal = () => {
    this.setState({ showModal: true });
  };

  closeModal = () => {
    this.setState({ showModal: false });
  };

  triggerError = () => {
    this.setState({ errorInfo: 'A simulated error occurred.' });
    throw new Error('Simulation error');
  };

  render() {
    return (
      <div className="page">
        <ErrorBoundary>
          <button className="open-button" onClick={this.openModal}>
            Open Modal
          </button>

          {this.state.showModal && (
            <Modal
              message={this.state.errorInfo || 'This is a modal error message.'}
              onClose={this.closeModal}
            />
          )}
        </ErrorBoundary>
      </div>
    );
  }
}

export default App;
