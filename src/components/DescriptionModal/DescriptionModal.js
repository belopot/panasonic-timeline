import { AnimatePresence, motion } from "framer-motion"
import styled from "styled-components"
import Template1 from "components/ModalContents/Template1"

const DescriptionModal = ({ modalIsOpen, onRequestClose, modalData }) => {
  let content = <></>
  //Set Content
  switch (modalData.template) {
    case "template1":
      content = (
        <Template1
          image={modalData.image}
          title={modalData.title}
          desc={modalData.desc}
        ></Template1>
      )
      break
    default:
      break
  }

  return (
    <AnimatePresence>
      {modalIsOpen && (
        <Holder
          transition={{ duration: 0.3 }}
          initial={{ y: 50, opacity: 0 }}
          exit={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Container>
            <CloseButton type="button" onClick={onRequestClose} />
            {content}
          </Container>
        </Holder>
      )}
    </AnimatePresence>
  )
}

export default DescriptionModal

const Holder = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #00000099;
`

const Container = styled.div`
  position: relative;
  padding: 3em;
  background-color: #000000ff;
  border-radius: 15px;
  max-width: 900px;
`

const CloseButton = styled.button`
  position: absolute;
  top: 1em;
  right: 1em;
  width: 30px;
  height: 30px;
  outline: none;
  border: 2px solid rgb(177, 177, 177);
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0);
  cursor: pointer;
  &:before {
    content: " ";
    position: absolute;
    display: block;
    background-color: rgb(177, 177, 177);
    width: 2px;
    left: 12px;
    top: 5px;
    bottom: 5px;
    transform: rotate(45deg);
  }
  &:after {
    content: " ";
    position: absolute;
    display: block;
    background-color: rgb(177, 177, 177);
    height: 2px;
    top: 12px;
    left: 5px;
    right: 5px;
    transform: rotate(45deg);
  }
`
