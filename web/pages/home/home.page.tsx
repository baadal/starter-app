import React from 'react';
import { Link } from 'react-router-dom';
import { FaExternalLinkAlt } from 'react-icons/fa';

import { PropsRoot } from 'model/common.model';
import { HomePageData } from 'model/pagedata.model';

import common from 'assets/css/common.module.scss';
import styles from './home.module.scss';

class Home extends React.Component<HomeProps, HomeState> {
  render() {
    const { pageData } = this.props;
    const title = pageData?.title || '';
    const description = pageData?.description || '';
    const message = pageData?.message || '';
    const siteTitle = pageData?.seo?.siteTitle || '';

    return (
      <>
        <div className={styles.heroBanner}>
          <div className={styles.heroText}>
            <a href="https://starterjs.dev/" target="_blank" rel="noreferrer">
              {siteTitle}
            </a>
            <span className={styles.heroSplit}>&nbsp;&nbsp;&bull;&nbsp;&nbsp;</span>
            <span className={styles.heroSubtext}>{title}</span>
          </div>
          <div className={styles.punchline}>{description}</div>
        </div>
        <div className={common.infoCard}>
          <div>
            Edit this page: <code>web/pages/home/home.page.tsx</code>
          </div>
          <div className={common.infoCardItem}>
            Link to this page: `<Link to="/">Home</Link>`
          </div>
        </div>
        <div className={styles.docsDesc}>
          <a href="https://starterjs.dev/docs" target="_blank" rel="noreferrer">
            <div className={styles.docsItem}>
              <div>Documentation</div>
              <div>&nbsp;&nbsp;</div>
              <div className={styles.docsIcon}>
                <FaExternalLinkAlt />
              </div>
            </div>
          </a>
        </div>
        <div className={styles.bottomMsg}>
          <span className={styles.emojiBig}>🚀</span>
          <span>&nbsp;&nbsp;</span>
          <em>{message}</em>
        </div>
      </>
    );
  }
}

export default Home;

export interface HomeProps extends PropsRoot {
  pageData?: HomePageData | null;
}

export interface HomeState {}
