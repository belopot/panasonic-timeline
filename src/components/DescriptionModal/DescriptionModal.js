import PropTypes from "prop-types";
import Modal from "react-modal";
import styles from "./DescriptionModal.module.css";
import Template1 from "../ModalContents/Template1";

const DescriptionModal = ({
  modalIsOpen,
  onRequestClose,
  appRootId,
  modalData,
}) => {
  Modal.setAppElement(appRootId);

  let content = <></>;
  //Set Content
  switch (modalData.template) {
    case "template1":
      content = (
        <Template1 image={modalData.image} title={modalData.title} desc={modalData.desc}></Template1>
      );
      break;
    default:
      break;
  }

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={onRequestClose}
      className={styles.descriptionModal}
      overlayClassName={styles.descriptionModalOverlay}
    >
      <button
        type="button"
        onClick={onRequestClose}
        aria-label="Close modal"
        className={styles.descriptionModalCloseBtn}
      ></button>
      {content}
    </Modal>
  );
};

DescriptionModal.propTypes = {
  modalIsOpen: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  appRootId: PropTypes.string.isRequired,
  modalData: PropTypes.any.isRequired,
};

export default DescriptionModal;
