import React from 'react';
import baseLoadable from '@loadable/component';

import { Loader } from 'starter/ui';

const FallbackComponent = () => <Loader />;

// NOTE: The loadable component name must be `loadable` for it to get detected
// Ref: https://loadable-components.com/docs/babel-plugin/#loadable-detection
export const loadable = (func: any) => baseLoadable(func, { fallback: <FallbackComponent /> });
