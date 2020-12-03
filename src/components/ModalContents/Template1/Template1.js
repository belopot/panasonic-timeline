import PropTypes from "prop-types";
import styles from "./Template1.module.css";

const Template1 = ({ image, title, desc }) => {
  return (
    <div className={styles.content}>
      <div className={styles.image}>
        <img src={image}></img>
      </div>
      <div className={styles.detail}>
        <div className={styles.title}>{title}</div>
        <div className={styles.desc}>{desc}</div>
      </div>
    </div>
  );
};

Template1.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
};

export default Template1;
