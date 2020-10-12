import React, { useState } from 'react';
import { Button, ButtonProps, ComponentWithAs } from '@chakra-ui/react';

const MyButton: ComponentWithAs<'button', ButtonProps> = props => {
  const { children, onClick, submit, ...rest } = props;
  const [clicked, setClicked] = useState(false);

  const onClickX: React.MouseEventHandler<HTMLButtonElement> = (...args: any) => {
    if (submit) setClicked(true);
    onClick?.apply(args);
  };

  return (
    <Button onClick={onClickX} disabled={clicked} {...rest}>
      {children}
    </Button>
  );
};

export default MyButton;
