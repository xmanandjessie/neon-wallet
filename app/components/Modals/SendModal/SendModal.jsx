// @flow
import React, { Component } from 'react'

import BaseModal from '../BaseModal'
import SendDisplay from './SendDisplay'
import ConfirmDisplay from './ConfirmDisplay'

import { obtainTokenBalance, isToken, validateTransactionBeforeSending } from '../../../core/wallet'
import { ASSETS } from '../../../core/constants'

const DISPLAY_MODES = {
  SEND: 'SEND',
  CONFIRM: 'CONFIRM'
}

type Props = {
    neo: number,
    gas: number,
    tokens: Object,
    showErrorNotification: Function,
    hideModal: Function,
    togglePane: Function,
    sendTransaction: Function,
}

type State = {
  sendAmount: ?number,
  sendAdress: ?string,
  symbol: string,
  display: $Values<typeof DISPLAY_MODES>,
  balance: number
}

class SendModal extends Component<Props, State> {
  canvas: ?HTMLCanvasElement
  state = {
    sendAmount: '',
    sendAddress: '',
    symbol: ASSETS.NEO,
    display: DISPLAY_MODES.SEND,
    balance: this.props.neo
  }

  openAndValidate = () => {
    const { neo, gas, tokens, showErrorNotification } = this.props
    const { sendAddress, sendAmount, symbol } = this.state
    const tokenBalance = isToken(symbol) && obtainTokenBalance(tokens, symbol)
    const { error, valid } = validateTransactionBeforeSending(neo, gas, tokenBalance, symbol, sendAddress, sendAmount)
    if (valid) {
      this.setState({ display: DISPLAY_MODES.CONFIRM })
    } else {
      showErrorNotification({ message: error })
    }
  }

  confirmTransaction = () => {
    const { sendTransaction, hideModal } = this.props
    const { sendAddress, sendAmount, symbol } = this.state
    sendTransaction(sendAddress, sendAmount, symbol).then(() => {
      this.resetForm()
      hideModal()
    })
  }

  cancelTransaction = () => {
    this.resetForm()
  }

  resetForm = () => {
    this.setState({
      sendAmount: '',
      sendAddress: '',
      symbol: ASSETS.NEO,
      display: DISPLAY_MODES.SEND
    })
  }

  getBalance = (symbol: string) => {
    const { neo, gas, tokens } = this.props

    if (symbol === ASSETS.NEO) {
      return neo
    } else if (symbol === ASSETS.GAS) {
      return gas
    } else {
      return obtainTokenBalance(tokens, symbol)
    }
  }

  onChangeHandler = (name: string, value: string, updateBalance: false) => {
    let newState = {
      [name]: value
    }
    if (updateBalance) {
      newState = {
        ...newState,
        balance: this.getBalance(value)
      }
    }
    this.setState(newState)
  }

  render () {
    const { hideModal, tokens } = this.props
    const { display } = this.state

    return (
      <BaseModal
        title='Send'
        hideModal={hideModal}
        style={{
          content: {
            width: '460px',
            height: '410px'
          }
        }}
      >
        {display === DISPLAY_MODES.SEND
          ? <SendDisplay
            openAndValidate={this.openAndValidate}
            getBalanceForSymbol={this.getBalanceForSymbol}
            onChangeHandler={this.onChangeHandler}
            tokens={tokens}
            {...this.state}
          />
          : <ConfirmDisplay
            confirmTransaction={this.confirmTransaction}
            cancelTransaction={this.cancelTransaction}
            {...this.state}
          />}
      </BaseModal>
    )
  }
}

export default SendModal