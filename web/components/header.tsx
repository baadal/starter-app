import React from 'react';

import { NavLink, H4 } from 'starter/ui';
import { PropsRoot } from 'model/common.model';
import { HeaderData } from 'model/pagedata.model';

import layout from 'assets/css/layout.module.scss';

const Header = (props: HeaderProps) => {
  const { headerData, authInfo } = props;
  const showHeader = headerData?.showHeader;

  if (!showHeader) return null;

  return (
    <header className={layout.header}>
      <nav>
        <NavLink to="/" exact activeClassName="active">
          Home
        </NavLink>
        <span>&nbsp;&nbsp;&nbsp;</span>
        <NavLink to="/about" exact activeClassName="active">
          About
        </NavLink>
      </nav>
      <div className={layout.panelRight}>
        <H4>{authInfo ? '🦊' : '🐼'}</H4>
      </div>
    </header>
  );
};

export interface HeaderProps extends PropsRoot {
  headerData: HeaderData;
}

export default Header;
