import PropTypes from "prop-types";
import Modal from "react-modal";
import styles from "./DescriptionModal.module.css";
import Template2 from "../ModalContents/Template2";
import Template3 from "../ModalContents/Template3";

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
    case "template2":
      content = (
        <Template2 image={modalData.image} desc={modalData.desc}></Template2>
      );
      break;
    case "template3":
      content = (
        <Template3 desc={modalData.desc} feature={modalData.feature}></Template3>
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
      <div className={styles.descriptionModalTitle}>{modalData.title}</div>
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
