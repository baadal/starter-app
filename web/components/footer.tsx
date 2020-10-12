import React from 'react';

import { PropsRoot } from 'model/common.model';
import { FooterData } from 'model/pagedata.model';

import layout from 'assets/css/layout.module.scss';
import image from 'assets/images/github.png';

const Footer = (props: FooterProps) => {
  const { footerData } = props;
  const showFooter = footerData?.showFooter;

  if (!showFooter) return null;

  return (
    <footer className={layout.footer}>
      <div className={layout.footerRow}>
        <div className={layout.footerRowItem}>
          <span>Built with</span>{' '}
          <a href="https://starterjs.dev/" target="_blank" rel="noreferrer">
            Starter.js
          </a>
        </div>
        <div className={layout.footerRowItemLast}>
          <div className={layout.ghIcon}>
            <a href="https://github.com/baadal/starter-app" target="_blank" rel="noreferrer">
              <img src={image} alt="github" width="20" height="20" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export interface FooterProps extends PropsRoot {
  footerData: FooterData;
}

export default Footer;
