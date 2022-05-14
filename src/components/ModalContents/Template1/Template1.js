import styles from "./Template1.module.css"
import { LazyLoadImage } from "react-lazy-load-image-component"
import "react-lazy-load-image-component/src/effects/blur.css"

const Template1 = ({ image, title, desc }) => {
  return (
    <div className={styles.content}>
      <div className={styles.image}>
        <LazyLoadImage alt={styles.title} effect="blur" src={image} />
      </div>
      <div className={styles.detail}>
        <div className={styles.title}>{title}</div>
        <div className={styles.desc}>{desc}</div>
      </div>
    </div>
  )
}

export default Template1
