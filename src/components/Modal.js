import React from "react";
import { Button, Modal as ReactModal, Form, Row, Col } from "react-bootstrap";

class Modal extends React.Component {
  render() {
    const {
      show,
      size,
      title,
      customTitle,
      body,
      onSubmit,
      customSubmit,
      customButton,
      submitTitle,
      closeTitle,
      onHide,
      onClose,
      onBackDrop,
      centered
    } = this.props;
    return (
      <ReactModal
        show={show}
        onHide={onHide}
        dialogClassName="modal-90w"
        aria-labelledby="example-custom-modal-styling-title"
        centered={centered ? centered : null}
        backdrop={onBackDrop ? onBackDrop : "static"}
        size={size ? size : "md"}
      >
        {title ? (
          <ReactModal.Header
            closeButton
            style={{ border: "none", paddingLeft: "3rem" }}
          >
            <ReactModal.Title id="example-custom-modal-styling-title" style={{
              fontWeight: "bold",
              color: "#000"
            }}>
              {title}
            </ReactModal.Title>
          </ReactModal.Header>
        ) : null}
        {customTitle ? (
          <ReactModal.Header
            closeButton
            style={{ border: "none", paddingLeft: "3rem" }}
          >
            <ReactModal.Title id="example-custom-modal-styling-title" style={{
              fontWeight: "bold",
              color: "#000"
            }}>
              {customTitle}
            </ReactModal.Title>
          </ReactModal.Header>
        ) : null}
        <ReactModal.Body>{body}</ReactModal.Body>
        <ReactModal.Footer
          style={{ border: "none", padding: "2rem 3rem 3.5rem 3rem" }}
        >
          {/* {onHide ? (
            <Button className="btn btn-secondary-semanggi" onClick={onHide}>
              Cancel
            </Button>
          ) : null} */}
          {onClose ? (
            <Button className="btn btn-secondary" onClick={onClose}>
              {closeTitle ? closeTitle : "Cancel"}
            </Button>
          ) : null}
          {onSubmit ? (
            <Button className="btn btn-success" onClick={onSubmit}>
              {submitTitle ? submitTitle : "Submit"}
            </Button>
          ) : null}
          {customButton ? customButton : null}
        </ReactModal.Footer>
      </ReactModal>
    );
  }
}

Modal.defaultProps = {
  show: false,
};

export default Modal;