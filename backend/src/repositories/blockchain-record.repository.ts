import { pool } from "../config/database.js";

export type BlockchainRecord = {
  id: string;
  certificate_id: string;
  network: string;
  transaction_hash: string;
  block_number: string | null;
  contract_address: string | null;
  certificate_hash: string;
  created_at: Date;
};

export type CreateBlockchainRecordInput = {
  certificateDatabaseId: string;
  network: string;
  transactionHash: string;
  blockNumber: number | null;
  contractAddress: string;
  certificateHash: string;
};

export const findBlockchainRecordByCertificateId = async (
  certificateDatabaseId: string
): Promise<BlockchainRecord | null> => {
  const result = await pool.query<BlockchainRecord>(
    `
      SELECT
        id,
        certificate_id,
        network,
        transaction_hash,
        block_number::text AS block_number,
        contract_address,
        certificate_hash,
        created_at
      FROM blockchain_records
      WHERE certificate_id = $1
      LIMIT 1
    `,
    [certificateDatabaseId]
  );

  return result.rows[0] ?? null;
};

export const createBlockchainRecord = async (
  input: CreateBlockchainRecordInput
): Promise<BlockchainRecord> => {
  const result = await pool.query<BlockchainRecord>(
    `
      INSERT INTO blockchain_records (
        certificate_id,
        network,
        transaction_hash,
        block_number,
        contract_address,
        certificate_hash
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (certificate_id) DO NOTHING
      RETURNING
        id,
        certificate_id,
        network,
        transaction_hash,
        block_number::text AS block_number,
        contract_address,
        certificate_hash,
        created_at
    `,
    [
      input.certificateDatabaseId,
      input.network,
      input.transactionHash,
      input.blockNumber,
      input.contractAddress,
      input.certificateHash,
    ]
  );

  const record = result.rows[0];

  if (record) {
    return record;
  }

  const existingRecord = await findBlockchainRecordByCertificateId(
    input.certificateDatabaseId
  );

  if (!existingRecord) {
    throw new Error("Blockchain record creation failed");
  }

  return existingRecord;
};
