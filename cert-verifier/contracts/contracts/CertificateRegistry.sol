// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CertificateRegistry
/// @notice Registers a document's hash on-chain so anyone can later verify
///         that document is authentic and untampered, without trusting a
///         central database. Only the contract owner (the issuer) can
///         register new certificates; anyone can verify one for free.
contract CertificateRegistry {
    address public owner;

    struct Certificate {
        address issuer;
        string recipient;
        string title;
        uint256 issuedAt;
        bool exists;
    }

    mapping(bytes32 => Certificate) private certificates;
    bytes32[] private certificateHashes;

    event CertificateIssued(
        bytes32 indexed hash,
        address indexed issuer,
        string recipient,
        string title,
        uint256 issuedAt
    );
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotAuthorized();
    error AlreadyIssued();
    error InvalidOwner();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotAuthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Registers a certificate hash on-chain. Reverts if this exact
    ///         hash has already been issued (certificates are immutable).
    function issueCertificate(
        bytes32 hash,
        string calldata recipient,
        string calldata title
    ) external onlyOwner {
        if (certificates[hash].exists) revert AlreadyIssued();

        certificates[hash] = Certificate({
            issuer: msg.sender,
            recipient: recipient,
            title: title,
            issuedAt: block.timestamp,
            exists: true
        });
        certificateHashes.push(hash);

        emit CertificateIssued(hash, msg.sender, recipient, title, block.timestamp);
    }

    /// @notice Read-only lookup. Anyone can call this for free (it's a view
    ///         function, no gas cost off-chain) to verify a certificate hash.
    function verify(
        bytes32 hash
    )
        external
        view
        returns (
            bool valid,
            address issuer,
            string memory recipient,
            string memory title,
            uint256 issuedAt
        )
    {
        Certificate memory cert = certificates[hash];
        return (cert.exists, cert.issuer, cert.recipient, cert.title, cert.issuedAt);
    }

    function totalCertificates() external view returns (uint256) {
        return certificateHashes.length;
    }

    /// @notice Returns up to `limit` most recently issued certificate hashes,
    ///         most recent first. Used to power a "recently issued" demo list.
    function recentHashes(uint256 limit) external view returns (bytes32[] memory) {
        uint256 total = certificateHashes.length;
        uint256 count = limit < total ? limit : total;
        bytes32[] memory result = new bytes32[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = certificateHashes[total - 1 - i];
        }
        return result;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidOwner();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
