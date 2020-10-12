import React from 'react';
import { Heading, HeadingProps, ComponentWithAs } from '@chakra-ui/react';

const H1: ComponentWithAs<'h2', HeadingProps> = props => {
  const { children, isTruncated, ...rest } = props;
  return (
    <Heading as="h1" size="xl" isTruncated={isTruncated ?? false} {...rest}>
      {children}
    </Heading>
  );
};

export default H1;
