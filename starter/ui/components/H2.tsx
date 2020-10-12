import React from 'react';
import { Heading, HeadingProps, ComponentWithAs } from '@chakra-ui/react';

const H2: ComponentWithAs<'h2', HeadingProps> = props => {
  const { children, isTruncated, ...rest } = props;
  return (
    <Heading as="h2" size="lg" isTruncated={isTruncated ?? false} {...rest}>
      {children}
    </Heading>
  );
};

export default H2;
