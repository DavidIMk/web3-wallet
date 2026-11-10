import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  getAddress,
  parseEther,
  type Address,
  type Hash,
} from 'viem'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { Icon } from '../../components/Icon'
import { validateEthTransfer } from '../../lib/transfer'
import { toFriendlyWeb3Error } from '../../web3/errors'
import { useActivity } from '../activity/useActivity'

interface SendEthFormProps {
  address: Address
  balanceWei?: bigint
  onConfirmed: () => void
}

interface SubmittedDraft {
  to: Address
  valueWei: bigint
}

export function SendEthForm({ address, balanceWei, onConfirmed }: SendEthFormProps) {
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const submittedDraft = useRef<SubmittedDraft | null>(null)
  const recordedHash = useRef<Hash | null>(null)
  const finalizedHash = useRef<Hash | null>(null)
  const send = useSendTransaction()
  const receipt = useWaitForTransactionReceipt({
    chainId: sepolia.id,
    hash: send.data,
    query: { enabled: Boolean(send.data) },
  })
  const { record, updateStatus } = useActivity()

  useEffect(() => {
    const hash = send.data
    const draft = submittedDraft.current
    if (!hash || !draft || recordedHash.current === hash) return

    recordedHash.current = hash
    record({
      chainId: sepolia.id,
      from: address,
      hash,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      to: draft.to,
      valueWei: draft.valueWei.toString(),
    })
  }, [address, record, send.data])

  useEffect(() => {
    const hash = send.data
    if (!hash || finalizedHash.current === hash) return

    if (receipt.isSuccess) {
      finalizedHash.current = hash
      const status = receipt.data.status === 'success' ? 'confirmed' : 'failed'
      updateStatus(hash, status, receipt.data.blockNumber.toString())
      if (status === 'confirmed') onConfirmed()
    } else if (receipt.isError) {
      finalizedHash.current = hash
      updateStatus(hash, 'unknown')
    }
  }, [onConfirmed, receipt.data, receipt.isError, receipt.isSuccess, send.data, updateStatus])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const error = validateEthTransfer(to.trim(), amount.trim(), balanceWei)
    setValidationError(error)
    if (error) return

    const recipient = getAddress(to.trim())
    const valueWei = parseEther(amount.trim())
    submittedDraft.current = { to: recipient, valueWei }
    finalizedHash.current = null
    recordedHash.current = null
    send.mutate({ chainId: sepolia.id, to: recipient, value: valueWei })
  }

  function reset() {
    send.reset()
    submittedDraft.current = null
    finalizedHash.current = null
    recordedHash.current = null
    setTo('')
    setAmount('')
    setValidationError(null)
  }

  const sendError = send.error ? toFriendlyWeb3Error(send.error) : null
  const receiptError = receipt.error ? toFriendlyWeb3Error(receipt.error) : null
  const isConfirming = Boolean(send.data) && receipt.isPending
  const isBusy = send.isPending || isConfirming

  return (
    <section className="feature-card" aria-labelledby="send-eth-title">
      <header className="feature-header">
        <div className="feature-icon"><Icon name="send" /></div>
        <div>
          <p className="eyebrow">Signed by MetaMask</p>
          <h2 id="send-eth-title">Send test ETH</h2>
        </div>
      </header>

      <form className="send-form" onSubmit={submit}>
        <label htmlFor="recipient">Recipient address</label>
        <input
          autoComplete="off"
          disabled={isBusy}
          id="recipient"
          onChange={(event) => setTo(event.target.value)}
          placeholder="0x…"
          spellCheck="false"
          value={to}
        />

        <div className="label-row">
          <label htmlFor="amount">Amount</label>
          <span>ETH</span>
        </div>
        <div className="amount-input">
          <input
            autoComplete="off"
            disabled={isBusy}
            id="amount"
            inputMode="decimal"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.001"
            value={amount}
          />
          <span>ETH</span>
        </div>

        {validationError ? <p className="notice notice-error" role="alert">{validationError}</p> : null}
        {sendError ? <p className="notice notice-error" role="alert">{sendError.message}</p> : null}
        {receiptError ? <p className="notice notice-error" role="alert">{receiptError.message}</p> : null}

        {send.data ? (
          <div className={`transaction-progress ${receipt.isSuccess && receipt.data.status === 'success' ? 'transaction-progress-success' : ''}`} aria-live="polite">
            <span className="status-dot" />
            <div>
              <strong>
                {receipt.isSuccess
                  ? receipt.data.status === 'success'
                    ? 'Transaction confirmed'
                    : 'Transaction reverted'
                  : receipt.isError
                    ? 'Confirmation unavailable'
                    : 'Waiting for confirmation'}
              </strong>
              <a
                href={`${sepolia.blockExplorers.default.url}/tx/${send.data}`}
                rel="noreferrer"
                target="_blank"
              >View transaction <Icon name="external" size={13} /></a>
            </div>
          </div>
        ) : null}

        {receipt.isSuccess || receipt.isError ? (
          <button className="button button-secondary button-wide" onClick={reset} type="button">
            Start another transaction
          </button>
        ) : (
          <button className="button button-primary button-wide" disabled={isBusy} type="submit">
            <Icon name="send" size={18} />
            {send.isPending ? 'Confirm in wallet…' : isConfirming ? 'Confirming…' : 'Review in MetaMask'}
          </button>
        )}
      </form>
    </section>
  )
}
