import React from 'react';
import { NavLink as RouteNavLink, NavLinkProps } from 'react-router-dom';
import styled from '@emotion/styled';

import { linkStyles } from './Link';

const StyledLink = styled.span({
  ...linkStyles,
  '& a.active': {
    borderBottom: '1px solid rebeccapurple',
  },
});

const NavLink: React.FC<NavLinkProps> = props => {
  const { children, ...rest } = props;
  return (
    <StyledLink>
      <RouteNavLink {...rest}>{children}</RouteNavLink>
    </StyledLink>
  );
};

export default NavLink;
