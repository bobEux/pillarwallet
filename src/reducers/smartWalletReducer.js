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
import {
  SET_SMART_WALLET_SDK_INIT,
  SET_SMART_WALLET_ACCOUNTS,
  SET_SMART_WALLET_CONNECTED_ACCOUNT,
  SET_SMART_WALLET_UPGRADE_STATUS,
  SET_SMART_WALLET_DEPLOYMENT_DATA,
  RESET_SMART_WALLET,
  SET_SMART_WALLET_LAST_SYNCED_PAYMENT_ID,
  SET_SMART_WALLET_LAST_SYNCED_TRANSACTION_ID,
  START_SMART_WALLET_DEPLOYMENT,
  RESET_SMART_WALLET_DEPLOYMENT,
  ADD_SMART_WALLET_CONNECTED_ACCOUNT_DEVICE,
  SET_SMART_WALLET_DEPLOYMENT_ESTIMATE,
  SET_GETTING_SMART_WALLET_DEPLOYMENT_ESTIMATE,
  SET_CHECKING_SMART_WALLET_SESSION,
} from 'constants/smartWalletConstants';

// types
import type {
  SmartWalletAccount,
  ConnectedSmartWalletAccount,
  SmartWalletDeploymentError,
} from 'models/SmartWalletAccount';
import type { EstimatedTransactionFee } from 'models/Transaction';


export type SmartWalletReducerState = {
  sdkInitialized: boolean,
  connectedAccount: $Shape<ConnectedSmartWalletAccount>,
  accounts: SmartWalletAccount[],
  upgrade: {
    status: ?string,
    deploymentEstimate: ?{
      raw: Object,
      formatted: EstimatedTransactionFee,
    },
    gettingDeploymentEstimate: boolean,
    deploymentStarted: boolean,
    deploymentData: {
      hash: ?string,
      error: ?SmartWalletDeploymentError,
    },
  },
  lastSyncedTransactionId: ?number,
  lastSyncedPaymentId: ?number,
  isCheckingSmartWalletSession: boolean,
};

export type SmartWalletReducerAction = {
  type: string,
  payload?: any,
};

export const initialState = {
  sdkInitialized: false,
  connectedAccount: {},
  accounts: [],
  upgrade: {
    status: null,
    deploymentEstimate: null,
    gettingDeploymentEstimate: false,
    deploymentStarted: false,
    deploymentData: {
      hash: null,
      error: null,
    },
  },
  lastSyncedTransactionId: null,
  lastSyncedPaymentId: null,
  isCheckingSmartWalletSession: false,
};

export default function smartWalletReducer(
  state: SmartWalletReducerState = initialState,
  action: SmartWalletReducerAction,
): SmartWalletReducerState {
  switch (action.type) {
    case SET_SMART_WALLET_SDK_INIT:
      return {
        ...state,
        // $FlowFixMe: flow update to 0.122
        sdkInitialized: action.payload,
      };
    case SET_SMART_WALLET_ACCOUNTS:
      return {
        ...state,
        // $FlowFixMe: flow update to 0.122
        accounts: action.payload,
      };
    case SET_SMART_WALLET_CONNECTED_ACCOUNT:
      return {
        ...state,
        // $FlowFixMe: flow update to 0.122
        connectedAccount: action.payload,
      };
    case SET_SMART_WALLET_UPGRADE_STATUS:
      return {
        ...state,
        upgrade: {
          ...state.upgrade,
          status: action.payload,
        },
      };
    case SET_SMART_WALLET_DEPLOYMENT_DATA:
      return {
        ...state,
        upgrade: {
          ...state.upgrade,
          // $FlowFixMe: flow update to 0.122
          deploymentData: {
            ...action.payload,
          },
        },
      };
    case SET_SMART_WALLET_LAST_SYNCED_PAYMENT_ID:
      return {
        ...state,
        lastSyncedPaymentId: action.payload || initialState.lastSyncedPaymentId,
      };
    case SET_SMART_WALLET_LAST_SYNCED_TRANSACTION_ID:
      return {
        ...state,
        lastSyncedTransactionId: action.payload || initialState.lastSyncedTransactionId,
      };
    case RESET_SMART_WALLET:
      return { ...initialState };
    case START_SMART_WALLET_DEPLOYMENT:
      return {
        ...state,
        upgrade: {
          ...state.upgrade,
          deploymentStarted: true,
        },
      };
    case RESET_SMART_WALLET_DEPLOYMENT:
      return {
        ...state,
        upgrade: {
          ...state.upgrade,
          deploymentStarted: false,
        },
      };
    case ADD_SMART_WALLET_CONNECTED_ACCOUNT_DEVICE:
      return {
        ...state,
        connectedAccount: {
          ...state.connectedAccount,
          devices: [
            ...state.connectedAccount.devices,
            action.payload,
          ],
        },
      };
    case SET_SMART_WALLET_DEPLOYMENT_ESTIMATE:
      return {
        ...state,
        upgrade: {
          ...state.upgrade,
          deploymentEstimate: action.payload,
          gettingDeploymentEstimate: false,
        },
      };
    case SET_GETTING_SMART_WALLET_DEPLOYMENT_ESTIMATE:
      return {
        ...state,
        upgrade: {
          ...state.upgrade,
          // $FlowFixMe: flow update to 0.122
          gettingDeploymentEstimate: action.payload,
        },
      };
    case SET_CHECKING_SMART_WALLET_SESSION:
      return {
        ...state,
        // $FlowFixMe: flow update to 0.122
        isCheckingSmartWalletSession: action.payload,
      };
    default:
      return state;
  }
}
