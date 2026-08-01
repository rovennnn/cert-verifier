import { expect } from "chai";
import { ethers } from "hardhat";
import type { CertificateRegistry } from "../typechain-types";

function hashOf(text: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(text));
}

describe("CertificateRegistry", function () {
  async function deploy() {
    const [owner, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CertificateRegistry");
    const registry = (await Factory.deploy()) as unknown as CertificateRegistry;
    await registry.waitForDeployment();
    return { registry, owner, other };
  }

  it("sets the deployer as owner", async function () {
    const { registry, owner } = await deploy();
    expect(await registry.owner()).to.equal(owner.address);
  });

  it("lets the owner issue a certificate and anyone verify it", async function () {
    const { registry, other } = await deploy();
    const hash = hashOf("demo-certificate-1");

    await expect(registry.issueCertificate(hash, "Ada Lovelace", "Sample Certificate"))
      .to.emit(registry, "CertificateIssued");

    const [valid, , recipient, title] = await registry.connect(other).verify(hash);
    expect(valid).to.equal(true);
    expect(recipient).to.equal("Ada Lovelace");
    expect(title).to.equal("Sample Certificate");
  });

  it("reports unissued hashes as not valid", async function () {
    const { registry } = await deploy();
    const [valid] = await registry.verify(hashOf("never-issued"));
    expect(valid).to.equal(false);
  });

  it("rejects issuance from a non-owner account", async function () {
    const { registry, other } = await deploy();
    const hash = hashOf("demo-certificate-2");

    await expect(
      registry.connect(other).issueCertificate(hash, "Someone", "Title")
    ).to.be.revertedWithCustomError(registry, "NotAuthorized");
  });

  it("rejects issuing the same hash twice", async function () {
    const { registry } = await deploy();
    const hash = hashOf("demo-certificate-3");

    await registry.issueCertificate(hash, "Grace Hopper", "Sample Certificate");

    await expect(
      registry.issueCertificate(hash, "Grace Hopper", "Sample Certificate")
    ).to.be.revertedWithCustomError(registry, "AlreadyIssued");
  });

  it("tracks total and recent certificates", async function () {
    const { registry } = await deploy();
    await registry.issueCertificate(hashOf("a"), "A", "T");
    await registry.issueCertificate(hashOf("b"), "B", "T");
    await registry.issueCertificate(hashOf("c"), "C", "T");

    expect(await registry.totalCertificates()).to.equal(3n);

    const recent = await registry.recentHashes(2);
    expect(recent.length).to.equal(2);
    expect(recent[0]).to.equal(hashOf("c"));
    expect(recent[1]).to.equal(hashOf("b"));
  });

  it("only lets the owner transfer ownership", async function () {
    const { registry, other } = await deploy();
    await registry.transferOwnership(other.address);
    expect(await registry.owner()).to.equal(other.address);
  });
});
