import PropTypes from "prop-types";
import styles from "./Template3.module.css";

const FeatureItem = ({ content }) => {
  return (
    <li>
      <div className={styles.listCircle}></div>
      <div className={styles.listItem}>{content}</div>
    </li>
  );
};

const Template3 = ({ desc, feature }) => {
  return (
    <div className={styles.content}>
      <div className={styles.desc}>{desc}</div>
      <div className={styles.feature}>
        <span className={styles.featureTitle}>{feature.title}</span>
        <ul className={styles.featureList}>
          {feature.items.map((item, index) => (
            <FeatureItem content={item} key={index}></FeatureItem>
          ))}
        </ul>
      </div>
    </div>
  );
};

Template3.propTypes = {
  desc: PropTypes.string.isRequired,
  feature: PropTypes.any.isRequired,
};

export default Template3;
