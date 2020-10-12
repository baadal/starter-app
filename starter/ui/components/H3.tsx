import React from 'react';
import { Heading, HeadingProps, ComponentWithAs } from '@chakra-ui/react';

const H3: ComponentWithAs<'h2', HeadingProps> = props => {
  const { children, isTruncated, ...rest } = props;
  return (
    <Heading as="h3" size="md" isTruncated={isTruncated ?? false} style={{ fontSize: '150%' }} {...rest}>
      {children}
    </Heading>
  );
};

export default H3;
