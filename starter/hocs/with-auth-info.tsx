import React from 'react';
import { withRouter } from 'react-router-dom';
import { Subscription } from 'rxjs';

import { authInfo$ } from 'starter/utils/auth-info';
import { extractAuthInfo } from 'starter/core/services/common.service';
import { PropsRoot } from 'starter/core/model/common.model';
import { AuthInfo } from 'starter/core/model/auth.model';

function withAuthInfo(Component: React.ComponentType<any>): React.ComponentType<any> {
  class WithAuthInfo extends React.Component<WithAuthInfoProps, WithAuthInfoState> {
    private subscription = new Subscription();

    constructor(props: WithAuthInfoProps) {
      super(props);

      const authInfo = extractAuthInfo(this.props);
      this.state = { authInfo };
    }

    componentDidMount() {
      this.subscription.add(
        authInfo$.subscribe(authInfo => {
          this.setState({ authInfo });
        })
      );
    }

    componentWillUnmount() {
      this.subscription.unsubscribe();
    }

    render() {
      return <Component {...this.props} authInfo={this.state.authInfo} />;
    }
  }

  interface WithAuthInfoProps extends PropsRoot {}

  interface WithAuthInfoState {
    authInfo: AuthInfo | null;
  }

  return withRouter(WithAuthInfo);
}

export default withAuthInfo;
