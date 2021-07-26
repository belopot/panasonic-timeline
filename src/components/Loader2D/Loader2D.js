import React from "react"
import styles from "./Loader2D.module.css"
import classnames from "classnames"

const Loader2D = ({ show }) => {
  return <div className={classnames(styles.loader2d, show ? styles.show : styles.hidden)}></div>
}

export default Loader2D
