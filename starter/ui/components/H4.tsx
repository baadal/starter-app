import React from 'react';
import { Heading, HeadingProps, ComponentWithAs } from '@chakra-ui/react';

const H4: ComponentWithAs<'h2', HeadingProps> = props => {
  const { children, isTruncated, ...rest } = props;
  return (
    <Heading as="h4" size="md" isTruncated={isTruncated ?? false} {...rest}>
      {children}
    </Heading>
  );
};

export default H4;
