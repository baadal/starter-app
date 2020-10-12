import React from 'react';

import { AppPropsRoot } from 'starter/core/model/common.model';
import Header from 'components/header';
import Footer from 'components/footer';

import layout from 'assets/css/layout.module.scss';

const Layout: React.FC<AppPropsRoot> = ({ children, ...props }) => (
  <div className={layout.appContainer}>
    <Header {...props} />
    <div className={layout.appBody}>{children}</div>
    <Footer {...props} />
  </div>
);

export default Layout;
