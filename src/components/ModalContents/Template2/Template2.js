import PropTypes from "prop-types";
import styles from "./Template2.module.css";

const Template2 = ({ image, desc }) => {
  return (
    <div className={styles.content}>
      <div className={styles.image}>
        <img src={image}></img>
      </div>
      <div className={styles.desc}>{desc}</div>
    </div>
  );
};

Template2.propTypes = {
  image: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
};

export default Template2;
