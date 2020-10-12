import React from 'react';
import { Global } from '@emotion/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import Cookies from 'js-cookie';

import App from 'web/app';
import withInitialData from 'starter/hocs/with-initial-data';
import { renewAccessToken } from 'starter/utils/auth-info';
import { COOKIE_AUTH_SESSION_STATUS } from 'starter/utils/auth-cookie';
import { AppPropsRoot } from 'starter/core/model/common.model';
import { AuthInfo } from 'starter/core/model/auth.model';

import colors from 'starter/theme/colors.module.scss';

// The ordering of the following files' styles is retained, however in order to guarantee the ordering
// we can add/import the following files in another file and import that file here
import 'starter/theme/starter-theme.scss';
import 'web/assets/css/theme/_global.scss';

const diagnoseApp = async (authInfo: AuthInfo | null) => {
  const currAuthSess = Cookies.get(COOKIE_AUTH_SESSION_STATUS);
  if (authInfo && currAuthSess) {
    const expiry = authInfo.token_expiry || 0;
    const diff = expiry * 1000 - Date.now();
    if (diff < 5000) {
      await renewAccessToken();
    }
  }
};

const customTheme = extendTheme({
  styles: {
    global: {
      body: {
        background: '',
      },
    },
  },
});

const globalStyles: any = {
  body: {
    color: colors.textColor,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    maxWidth: '700px',
    margin: '0 auto',
  },
};

class AppMain extends React.Component<AppPropsRoot> {
  componentDidMount() {
    this.appHeartbeat();
  }

  appHeartbeat() {
    setTimeout(() => {
      void diagnoseApp(this.props.authInfo);
      this.appHeartbeat();
    }, 15000);
  }

  render() {
    return (
      <ChakraProvider theme={customTheme}>
        <Global styles={globalStyles} />
        <App {...this.props} />
      </ChakraProvider>
    );
  }
}

export default withInitialData(AppMain);
