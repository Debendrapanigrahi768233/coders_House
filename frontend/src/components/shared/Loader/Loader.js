import React from "react";
import Card from "../Card/Card";
import styles from "./Loader.module.css";

const Loader = ({ message }) => {
  return (
    <div className="cardWrapper">
      <Card>
        <svg
          className={styles.spinner}
          width="39"
          height="39"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M39 19.5A19.5 19.5 0 1 1 19.5 0v3.388A16.112 16.112 0 1 0 35.612 19.5H39Z"
            fill="#F7F5F5"
          />
          <path
            d="M19.5 0A19.5 19.5 0 1 1 0 19.5h3.388A16.112 16.112 0 1 0 19.5 3.388V0Z"
            fill="#1C40FC"
          />
        </svg>
        <span className={styles.message}>{message}</span>
      </Card>
    </div>
  );
};

export default Loader;
