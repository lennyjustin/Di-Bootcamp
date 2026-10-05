import { Component } from 'react';

class Modal extends Component {
  render() {
    return (
      <div className="modal-background" onClick={this.props.onClose}>
        <div
          className="modal-body"
          onClick={(event) => event.stopPropagation()}
        >
          <h2>Something went wrong</h2>
          <p>{this.props.message}</p>
          <button onClick={this.props.onClose}>Close</button>
        </div>
      </div>
    );
  }
}

export default Modal;
