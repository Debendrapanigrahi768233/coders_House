import React from 'react'
import styles from './Button.module.css'

const Button = ({text,icon,onClick}) => {
  return (
    <div>
        <button onClick={onClick} className={styles.button}>
            <span>{text}</span>
            <img className={styles.arrow} src={`/images/${icon}.png`} alt="arrow" />
        </button>
    </div>
  )
}

export default Button