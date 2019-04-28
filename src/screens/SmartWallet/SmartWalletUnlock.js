// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2019 Stiftung Pillar Project

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
import * as React from 'react';
import type { NavigationScreenProp } from 'react-navigation';
import { connect } from 'react-redux';
import { SMART_WALLET } from 'constants/navigationConstants';
import { Container } from 'components/Layout';
import CheckPin from 'components/CheckPin';
import Header from 'components/Header';
import { initSmartWalletSdkAction } from 'actions/walletActions';
import { resetIncorrectPasswordAction } from 'actions/authActions';

type Props = {
  navigation: NavigationScreenProp<*>,
  resetIncorrectPassword: () => Function,
  initSmartWalletSdk: Function,
}

type State = {
  isChecking: boolean,
};

class SmartWalletUnlock extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isChecking: false,
    };
  }

  handleSdkInit = (pin: string, wallet: Object) => {
    const { initSmartWalletSdk, navigation } = this.props;
    this.setState({
      isChecking: true,
    }, async () => {
      await initSmartWalletSdk(wallet);
      navigation.navigate(SMART_WALLET, {});
    });
  };

  handleBack = () => {
    const { navigation, resetIncorrectPassword } = this.props;
    navigation.goBack(null);
    resetIncorrectPassword();
  };

  render() {
    const { isChecking } = this.state;
    return (
      <Container>
        <Header
          onBack={this.handleBack}
          title="enter pincode"
        />
        <CheckPin onPinValid={this.handleSdkInit} isChecking={isChecking} />
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  initSmartWalletSdk: (wallet: Object) => dispatch(initSmartWalletSdkAction(wallet)),
  resetIncorrectPassword: () => dispatch(resetIncorrectPasswordAction()),
});


export default connect(null, mapDispatchToProps)(SmartWalletUnlock);
