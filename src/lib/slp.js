/*
  This library handles SLP token stuff.
*/

const BCHJS = require('@psf/bch-js')
const bchjs = new BCHJS()

const BchUtil = require('bch-util')
const bchUtil = new BchUtil({ bchjs })

// let _this

class Slp {
  constructor (constructorConig) {
    this.bchjs = bchjs
    this.bchUtil = bchUtil

    // _this = this
  }

  // Create a new SLP token class.
  // Note: This method creates fixed-cap (no minting baton) Token Type 1 SLP tokens.
  // This function return a hex string of a tx, ready to broadcast to the network.
  // The tokenConfig object is expected to have the following properties:
  // {
  //   name: 'SLP Test Token',
  //   ticker: 'SLPTEST',
  //   documentUrl: 'https://FullStack.cash',
  //   qty: 100,
  //   wif: "L5EDpCV9UURj6FhMo7CZk4QsH95orcVsm2qjKirngaXgeA3A6ZhZ"
  // }
  // Assumptions:
  // - token has no minting baton.
  // - token has no decimal precision. Whole tokens only.
  // - no documentHash
  // - wif is used to pay for transaction.
  async createTokenType1 (tokenConfig) {
    try {
      // Deconstruct the property from the config object.
      const { name, ticker, documentUrl, qty, wif } = tokenConfig

      const keyPair = this.bchjs.ECPair.fromWIF(wif)
      const cashAddress = this.bchjs.ECPair.toCashAddress(keyPair)

      // Get the UTXOs associated with the cash address.
      const data = await this.bchjs.Electrumx.utxo(cashAddress)
      const utxos = data.utxos

      // Throw an error if there are no UTXOs to pay for the transaction.
      if (!utxos.length) {
        throw new Error('No UTXOs available :(\nExiting.')
      }

      // Hydrate the utxos with SLP token information.
      const tokenUtxos = await this.bchjs.SLP.Utils.tokenUtxoDetails(utxos)

      // Filter out the BCH-only UTXOs. Ignore the token UTXOs.
      const bchUtxos = utxos.filter((utxo, index) => !tokenUtxos[index].isValid)

      // Throw an error if there are no BCH-only UTXOs to pay for the transaction.
      if (!bchUtxos.length) {
        throw new Error('Wallet does not have a BCH UTXO to pay miner fees.')
      }

      // Find the largest UTXO, and use that to pay tx fees.
      const bchUtxo = this.bchUtil.util.findBiggestUtxo(bchUtxos)

      const originalAmount = bchUtxo.value
      const vout = bchUtxo.tx_pos
      const txid = bchUtxo.tx_hash

      const transactionBuilder = new bchjs.TransactionBuilder()

      // add input with txid and index of vout
      transactionBuilder.addInput(txid, vout)

      // Set the transaction fee. Manually set for ease of example.
      const txFee = 550

      // amount to send back to the sending address.
      // Subtract two dust transactions for minting baton and tokens.
      const DUST = 546
      const remainder = originalAmount - DUST - txFee

      // Generate SLP config object
      const genesisObj = {
        name,
        ticker,
        documentUrl,
        decimals: 0,
        initialQty: qty,
        documentHash: '',
        mintBatonVout: null
      }

      // Generate the OP_RETURN entry for an SLP GENESIS transaction.
      const script = bchjs.SLP.TokenType1.generateGenesisOpReturn(genesisObj)

      // OP_RETURN needs to be the first output in the transaction.
      transactionBuilder.addOutput(script, 0)

      // Send dust transaction representing the tokens.
      transactionBuilder.addOutput(
        bchjs.Address.toLegacyAddress(cashAddress),
        546
      )

      // add output to send BCH remainder of UTXO.
      transactionBuilder.addOutput(cashAddress, remainder)

      // Sign the transaction with the HD node.
      let redeemScript
      transactionBuilder.sign(
        0,
        keyPair,
        redeemScript,
        transactionBuilder.hashTypes.SIGHASH_ALL,
        originalAmount
      )

      // build tx
      const tx = transactionBuilder.build()
      // output rawhex
      const hex = tx.toHex()

      return hex
    } catch (err) {
      console.error('Error in slp.js/createTokenType1()')
      throw err
    }
  }

  // Broadcast a transaction to the network. Returns the TXID.
  async broadcastTx (hex) {
    try {
      const txidStr = await this.bchjs.RawTransactions.sendRawTransaction(hex)

      return txidStr
    } catch (err) {
      console.error('Error in slp.js/broadcastTx()')
      throw err
    }
  }
}

module.exports = Slp
