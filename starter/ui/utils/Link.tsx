import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import styled from '@emotion/styled';
import { FaExternalLinkAlt } from 'react-icons/fa';

import colors from 'starter/theme/colors.module.scss';

export const linkStyles = {
  '& a': {
    color: `${colors.linkColor}`,
    textDecoration: 'none',
    borderBottom: `1px solid ${colors.borderColor}`,
  },
  '& a:hover': {
    color: `${colors.linkHoverColor}`,
    borderBottom: `1px solid ${colors.borderHoverColor}`,
  },
};

const StyledLink = styled.span({
  ...linkStyles,
});

const ExternalIcon = styled.div({
  display: 'flex',
  alignItems: 'center',
  fontSize: '65%',
  color: '#888888',
});

const MyLink: React.FC<MyLinkProps> = props => {
  const { children, to, internal, ...rest } = props;
  const isExternal = typeof to === 'string' && (to.startsWith('//') || to.startsWith('http://') || to.startsWith('https://'));

  return (
    <StyledLink>
      {isExternal ? (
        <div style={{ display: 'inline-block' }}>
          <div style={{ display: 'flex' }}>
            {internal ? (
              <a href={to as string}>{children}</a>
            ) : (
              <>
                <a href={to as string} target="_blank" rel="noreferrer">
                  {children}
                </a>
                <span style={{ width: '0.35em' }}>&nbsp;</span>
                <ExternalIcon>
                  <FaExternalLinkAlt />
                </ExternalIcon>
              </>
            )}
          </div>
        </div>
      ) : (
        <Link to={to} {...rest}>
          {children}
        </Link>
      )}
    </StyledLink>
  );
};

export interface MyLinkProps extends LinkProps {
  internal?: boolean;
}

export default MyLink;
