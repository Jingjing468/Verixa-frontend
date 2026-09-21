const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const certificateId = "CERT-2026-0000001";
const certificateHash =
  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

describe("VerixaCertificateRegistry", function () {
  async function deployRegistry() {
    const [issuer, otherWallet] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory(
      "VerixaCertificateRegistry"
    );
    const registry = await Registry.deploy();
    await registry.waitForDeployment();

    return { registry, issuer, otherWallet };
  }

  it("issues a certificate successfully", async function () {
    const { registry, issuer } = await deployRegistry();

    await expect(registry.issueCertificate(certificateId, certificateHash))
      .to.emit(registry, "CertificateIssued")
      .withArgs(certificateId, certificateHash, issuer.address, anyValue);
  });

  it("reads certificate proof", async function () {
    const { registry, issuer } = await deployRegistry();

    await registry.issueCertificate(certificateId, certificateHash);

    const proof = await registry.getCertificateProof(certificateId);

    expect(proof.certificateId).to.equal(certificateId);
    expect(proof.issuer).to.equal(issuer.address);
    expect(proof.revoked).to.equal(false);
  });

  it("stores the issued hash", async function () {
    const { registry } = await deployRegistry();

    await registry.issueCertificate(certificateId, certificateHash);

    const proof = await registry.getCertificateProof(certificateId);

    expect(proof.certificateHash).to.equal(certificateHash);
  });

  it("rejects duplicate certificate IDs", async function () {
    const { registry } = await deployRegistry();

    await registry.issueCertificate(certificateId, certificateHash);

    await expect(
      registry.issueCertificate(certificateId, certificateHash)
    ).to.be.revertedWithCustomError(registry, "CertificateAlreadyExists");
  });

  it("rejects empty or invalid input", async function () {
    const { registry } = await deployRegistry();

    await expect(
      registry.issueCertificate("", certificateHash)
    ).to.be.revertedWithCustomError(registry, "EmptyCertificateId");

    await expect(
      registry.issueCertificate(certificateId, ethers.ZeroHash)
    ).to.be.revertedWithCustomError(registry, "EmptyCertificateHash");
  });

  it("allows the issuer to revoke a certificate", async function () {
    const { registry, issuer } = await deployRegistry();

    await registry.issueCertificate(certificateId, certificateHash);

    await expect(registry.revokeCertificate(certificateId))
      .to.emit(registry, "CertificateRevoked")
      .withArgs(certificateId, issuer.address, anyValue);
  });

  it("prevents another wallet from revoking a certificate", async function () {
    const { registry, otherWallet } = await deployRegistry();

    await registry.issueCertificate(certificateId, certificateHash);

    await expect(
      registry.connect(otherWallet).revokeCertificate(certificateId)
    ).to.be.revertedWithCustomError(registry, "NotCertificateIssuer");
  });

  it("rejects revoking twice", async function () {
    const { registry } = await deployRegistry();

    await registry.issueCertificate(certificateId, certificateHash);
    await registry.revokeCertificate(certificateId);

    await expect(
      registry.revokeCertificate(certificateId)
    ).to.be.revertedWithCustomError(registry, "CertificateAlreadyRevoked");
  });

  it("rejects revoking an unknown certificate", async function () {
    const { registry } = await deployRegistry();

    await expect(
      registry.revokeCertificate(certificateId)
    ).to.be.revertedWithCustomError(registry, "CertificateNotFound");
  });

  it("reports revoked=true after revocation", async function () {
    const { registry } = await deployRegistry();

    await registry.issueCertificate(certificateId, certificateHash);
    await registry.revokeCertificate(certificateId);

    const proof = await registry.getCertificateProof(certificateId);

    expect(proof.revoked).to.equal(true);
    expect(proof.revokedAt).to.be.greaterThan(0);
  });
});
