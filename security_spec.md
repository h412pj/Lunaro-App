# Security Specification: Shared Family Budget Tracker

This document establishes the security invariants, structural payloads, and tests designed to protect family transactions and user profile information.

## 1. Data Invariants

1. **Transaction Isolation**: A user can only view or write a transaction if they belong to the family associated with that transaction's `familyCode`.
2. **Profile Integrity**: A user can only view or write their own profile document (`/users/{userId}`).
3. **Immutability of Critical Fields**: Fields like `createdAt`, `id`, `familyCode`, and `createdByUser` must match constraints and cannot be updated once a transaction is recorded.
4. **Size and Ranges**: Amounts must be positive, and description strings must be character-limited.

## 2. The "Dirty Dozen" Payloads (Vulnerability Scenarios)

1. **Anonymous / Unauthenticated reads** on transactions collection.
2. **Writing a transaction for another family** (spoofing `familyCode`).
3. **Impersonating a creator** by supplying another user's display name or arbitrary UID inside `createdByUser`.
4. **Setting negative values** for transaction amounts.
5. **Updating fields after transaction creation**, e.g., modifying `createdAt` or changing `familyCode`.
6. **Setting arbitrary system-level flags** such as injecting an `isAdmin` or `role` flag inside a user profile.
7. **Attempting a "Denial of Wallet" attack** by setting 1MB strings for transaction description.
8. **Spoofing email validation status** or reading profile records with unverified email addresses.
9. **Reading other users' profile documents** under the `/users/` collection.
10. **Writing transactions without a familyCode preset** or with an invalid identifier structure.
11. **Submitting invalid timestamp format** values instead of correct server time constraints if required.
12. **Bypassing client query where clauses** to retrieve general system lists.
