// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ScribeZeroRegistry
/// @notice Non-transferable doctor profile registry for ScribeZero.
contract ScribeZeroRegistry {
    struct PracticeProfile {
        bytes32 rootHash;
        bytes32 artifactHash;
        bytes32 storageTxHash;
        uint64 updatedAt;
        uint64 version;
    }

    mapping(address doctor => PracticeProfile profile) public profiles;

    event PracticeProfileRegistered(
        address indexed doctor,
        bytes32 indexed rootHash,
        bytes32 artifactHash,
        bytes32 storageTxHash,
        uint64 version
    );

    error EmptyRootHash();
    error EmptyArtifactHash();

    function registerPracticeProfile(
        bytes32 rootHash,
        bytes32 artifactHash,
        bytes32 storageTxHash
    ) external {
        if (rootHash == bytes32(0)) revert EmptyRootHash();
        if (artifactHash == bytes32(0)) revert EmptyArtifactHash();

        PracticeProfile storage profile = profiles[msg.sender];
        uint64 nextVersion = profile.version + 1;

        profile.rootHash = rootHash;
        profile.artifactHash = artifactHash;
        profile.storageTxHash = storageTxHash;
        profile.updatedAt = uint64(block.timestamp);
        profile.version = nextVersion;

        emit PracticeProfileRegistered(
            msg.sender,
            rootHash,
            artifactHash,
            storageTxHash,
            nextVersion
        );
    }
}
