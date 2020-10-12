import React from 'react';
import styled from '@emotion/styled';

import { Link, H3 } from 'starter/ui';
import { NotFoundPageData } from 'model/pagedata.model';

import common from 'assets/css/common.module.scss';

const StyledDiv = styled.div({
  textAlign: 'center',
  marginTop: '4rem',
});

const NotFound = (props: NotFoundProps) => {
  const { pageData } = props;
  const title = pageData?.title || '';
  const description = pageData?.description || '';
  const message = pageData?.message || '';

  return (
    <StyledDiv>
      <H3 className={common.alertTitle}>{title}</H3>
      <div className={common.vspace2} />
      <div>{description}</div>
      <div className={common.vspace} />
      <Link to="/">
        <small>{message}</small>
      </Link>
    </StyledDiv>
  );
};

export interface NotFoundProps {
  pageData: NotFoundPageData | null;
}

export default NotFound;
