# Security policy

## Supported versions

Security fixes are released for the latest minor version of `@fatdevcon/utilities`. Please upgrade before reporting an issue you found on an older release.

## Reporting a vulnerability

Please do not open a public issue for a security problem. Report it privately through GitHub:

1. Open the [Security tab](https://github.com/PhanHoangQuocTu/fatdevcon-utilities/security) of the repository.
2. Choose **Report a vulnerability** and describe what you found, how to reproduce it and the affected versions.

You can expect an acknowledgement within a few days. Confirmed issues are fixed in a patch release and credited in the changelog unless you prefer otherwise.

## Supply-chain posture

- **No runtime dependencies.** `npm install @fatdevcon/utilities` adds exactly one package.
- **Readable, unminified build output**, so the published files can be audited directly.
- **No install scripts**, and no use of `eval`, the network, the file system, child processes or environment variables.
- **Safe path helpers.** `setByPath` and `deepMerge` refuse `__proto__`, `constructor` and `prototype` keys.
- Releases are published from CI with [npm provenance](https://docs.npmjs.com/generating-provenance-statements) when a release is created on GitHub.
