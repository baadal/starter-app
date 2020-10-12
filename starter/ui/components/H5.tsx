import React from 'react';
import { Heading, HeadingProps, ComponentWithAs } from '@chakra-ui/react';

const H5: ComponentWithAs<'h2', HeadingProps> = props => {
  const { children, isTruncated, ...rest } = props;
  return (
    <Heading as="h5" size="sm" isTruncated={isTruncated ?? false} {...rest}>
      {children}
    </Heading>
  );
};

export default H5;
