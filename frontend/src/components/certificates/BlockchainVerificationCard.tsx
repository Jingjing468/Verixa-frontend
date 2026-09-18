import { ArrowUpRight, Copy, ShieldCheck, Link2, Hash, Globe, Box } from 'lucide-react'
import type { BlockchainRecord } from '../../types/certificate'

interface Props {
  blockchain: BlockchainRecord
  onCopy: (text: string, message: string) => void
}

export default function BlockchainVerificationCard({ blockchain, onCopy }: Props) {
  return (
    <article className="detail-card blockchain-card">
      <div className="blockchain-heading">
        <span>
          <ShieldCheck size={21} />
        </span>
        <div>
          <h2>Blockchain Verification</h2>
          <p>
            <i /> {blockchain.verified ? 'Recorded on Blockchain' : 'Not anchored on blockchain'}
          </p>
        </div>
      </div>

      <div className="blockchain-data">
        <div>
          <small>Network</small>
          <b>
            <Globe size={12} className="inline-icon" /> {blockchain.network}
          </b>
        </div>
        <div>
          <small>Transaction Hash</small>
          <b>{blockchain.transactionHash}</b>
          <button onClick={() => onCopy(blockchain.transactionHash, 'Transaction hash copied')} aria-label="Copy transaction hash">
            <Copy size={13} />
          </button>
        </div>
        <div>
          <small>Block Number</small>
          <b>
            <Box size={12} className="inline-icon" /> {blockchain.blockNumber.toLocaleString()}
          </b>
        </div>
        <div className="hash-row">
          <small>
            Certificate Hash
            <em>Used to confirm that the certificate data has not been modified.</em>
          </small>
          <b>{blockchain.certificateHash}</b>
          <button onClick={() => onCopy(blockchain.certificateHash, 'Certificate hash copied')} aria-label="Copy certificate hash">
            <Copy size={13} />
          </button>
        </div>
        <div>
          <small>Verification Status</small>
          <b className="hash-match">
            <Hash size={12} className="inline-icon" /> {blockchain.verified ? 'Recorded hash' : 'Not available'}
          </b>
        </div>
      </div>

      {blockchain.verified && /^0x[0-9a-fA-F]{64}$/.test(blockchain.transactionHash) ? (
        <a className="blockchain-button" href={`https://sepolia.etherscan.io/tx/${blockchain.transactionHash}`} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={15} /> View Transaction</a>
      ) : <button className="blockchain-button" disabled title="This certificate has no blockchain transaction">No transaction available</button>}
    </article>
  )
}
