import { ExternalLink, CheckCircle2, Hash, Network, Box, FileCheck2 } from 'lucide-react'
import type { VerificationResult } from '../../types/verification'

interface Props {
  cert: VerificationResult
}

function BlockchainProofCard({ cert }: Props) {
  const { blockchain } = cert

  return (
    <div className="vr-blockchain">
      <div className="vr-blockchain-header">
        <h3>
          <ExternalLink size={15} />
          Blockchain Verification
        </h3>
        {blockchain.hashMatched && (
          <span className="vr-blockchain-match">
            <CheckCircle2 size={13} />
            Hash Matched
          </span>
        )}
      </div>

      <div className="vr-blockchain-grid">
        <div className="vr-blockchain-field">
          <span className="vr-blockchain-icon green">
            <CheckCircle2 size={14} />
          </span>
          <div>
            <small>Verification</small>
            <strong>Hash Matched</strong>
          </div>
        </div>

        <div className="vr-blockchain-field">
          <span className="vr-blockchain-icon blue">
            <Network size={14} />
          </span>
          <div>
            <small>Network</small>
            <strong>{blockchain.network}</strong>
          </div>
        </div>

        <div className="vr-blockchain-field">
          <span className="vr-blockchain-icon purple">
            <Hash size={14} />
          </span>
          <div>
            <small>Transaction Hash</small>
            <strong className="vr-blockchain-hash">{blockchain.transactionHash}</strong>
          </div>
        </div>

        <div className="vr-blockchain-field">
          <span className="vr-blockchain-icon slate">
            <Box size={14} />
          </span>
          <div>
            <small>Block Number</small>
            <strong>#{blockchain.blockNumber.toLocaleString()}</strong>
          </div>
        </div>

        <div className="vr-blockchain-field full">
          <span className="vr-blockchain-icon slate">
            <FileCheck2 size={14} />
          </span>
          <div>
            <small>Certificate Hash</small>
            <strong className="vr-blockchain-hash">{blockchain.certificateHash}</strong>
          </div>
        </div>
      </div>

      <button className="vr-blockchain-link">
        <ExternalLink size={13} />
        View Transaction
      </button>

      <p className="vr-blockchain-note">
        The blockchain record confirms that this certificate data has not been modified.
      </p>
    </div>
  )
}

export default BlockchainProofCard
