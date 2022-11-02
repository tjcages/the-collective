import React, { useState } from "react";
import styles from "../styles/home.module.scss";

import Map from "../components/Map";
import Navigation from "./Navigation";

const Home = () => {
  const [selfIsOpened, setSelfIsOpened] = useState(false);
  const [title, setTitle] = useState("");

  const header = "{ Vincent Van Gogh }";
  return (
    <>
      <div className={styles.main}>
        <div className={`${styles.pageContent} ${selfIsOpened && styles.open}`}>
          <div className={styles.header}>
            <h1 className={styles.title}>{header}</h1>
            <div className={styles.details}>
              <p className={styles.description}>Paris</p>
              <p className={styles.description}>May 1887</p>
              <p className={styles.description}>Oil on Canvas</p>
            </div>
          </div>
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>{title}</h1>
          </div>
        </div>
        <div className={styles.imageContent}>
          <Map
            selfIsOpened={selfIsOpened}
            openProject={(open, projectTitle) => {
              setSelfIsOpened(open);
              setTitle(projectTitle);
            }}
          />
        </div>
        <Navigation />
      </div>
    </>
  );
};

export default Home;
