import React from 'react';
import styled from '@emotion/styled';

const StyledDiv = styled.div({
  color: 'olive',
  marginTop: '3.5rem',
  textAlign: 'center',
});

const Loader: React.FC = () => {
  return <StyledDiv>Loading...</StyledDiv>;
};

export default Loader;
