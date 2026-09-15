// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract VerixaCertificateRegistry {
    struct CertificateProof {
        string certificateId;
        bytes32 certificateHash;
        address issuer;
        uint256 issuedAt;
        bool revoked;
        uint256 revokedAt;
    }

    mapping(string certificateId => CertificateProof proof) private certificateProofs;
    mapping(string certificateId => bool exists) private certificateExists;

    event CertificateIssued(
        string certificateId,
        bytes32 certificateHash,
        address issuer,
        uint256 issuedAt
    );

    event CertificateRevoked(
        string certificateId,
        address issuer,
        uint256 revokedAt
    );

    error EmptyCertificateId();
    error EmptyCertificateHash();
    error CertificateAlreadyExists();
    error CertificateNotFound();
    error NotCertificateIssuer();
    error CertificateAlreadyRevoked();

    function issueCertificate(
        string calldata certificateId,
        bytes32 certificateHash
    ) external {
        if (bytes(certificateId).length == 0) {
            revert EmptyCertificateId();
        }

        if (certificateHash == bytes32(0)) {
            revert EmptyCertificateHash();
        }

        if (certificateExists[certificateId]) {
            revert CertificateAlreadyExists();
        }

        certificateProofs[certificateId] = CertificateProof({
            certificateId: certificateId,
            certificateHash: certificateHash,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revoked: false,
            revokedAt: 0
        });
        certificateExists[certificateId] = true;

        emit CertificateIssued(
            certificateId,
            certificateHash,
            msg.sender,
            block.timestamp
        );
    }

    function getCertificateProof(
        string calldata certificateId
    ) external view returns (CertificateProof memory) {
        if (!certificateExists[certificateId]) {
            revert CertificateNotFound();
        }

        return certificateProofs[certificateId];
    }

    function certificateExistsById(
        string calldata certificateId
    ) external view returns (bool) {
        return certificateExists[certificateId];
    }

    function revokeCertificate(string calldata certificateId) external {
        if (!certificateExists[certificateId]) {
            revert CertificateNotFound();
        }

        CertificateProof storage proof = certificateProofs[certificateId];

        if (proof.issuer != msg.sender) {
            revert NotCertificateIssuer();
        }

        if (proof.revoked) {
            revert CertificateAlreadyRevoked();
        }

        proof.revoked = true;
        proof.revokedAt = block.timestamp;

        emit CertificateRevoked(certificateId, msg.sender, block.timestamp);
    }
}
