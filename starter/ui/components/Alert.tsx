import React, { MouseEventHandler } from 'react';
import styled from '@emotion/styled';
import { Alert as AlertBox, AlertIcon, AlertTitle, AlertDescription, CloseButton } from '@chakra-ui/react';

const Box = styled.div({
  position: 'absolute',
  top: '13px',
  left: 0,
  right: 0,
  marginLeft: 'auto',
  marginRight: 'auto',
  width: 'fit-content',
});

const Alert: React.FC<AlertProps> = props => {
  if (!props.title && !props.message) {
    return null;
  }

  const status = props.status || 'info';
  const onClose = props.onClose || (() => {});

  return (
    <Box>
      <AlertBox status={status} rounded={6}>
        <AlertIcon />
        {props.title && <AlertTitle mr={2}>{props.title}</AlertTitle>}
        {props.message && <AlertDescription>{props.message}</AlertDescription>}
        <CloseButton ml={15} onClick={onClose} />
      </AlertBox>
    </Box>
  );
};

export default Alert;

export interface AlertProps {
  status?: 'error' | 'success' | 'warning' | 'info';
  title?: string | null;
  message?: string | null;
  onClose?: MouseEventHandler<HTMLButtonElement>;
}
