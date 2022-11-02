import React from "react";
import styles from "../styles/navigation.module.scss";

const Navigation = ({ visible = true }) => {
  return (
    <div className={styles.navigation} style={{ opacity: visible ? 0.9 : 0 }}>
      <h1 className={styles.logo}>The</h1>
      <h1 className={styles.logo}>Collective</h1>
    </div>
  );
};

export default Navigation;
