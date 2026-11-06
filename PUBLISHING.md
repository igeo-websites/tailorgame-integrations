# Authorized release setup

The owner approved MIT publication of these public integration files as `tailorgame-sdk` on npm and PyPI. The separate source repository [igeo-websites/tailorgame-integrations](https://github.com/igeo-websites/tailorgame-integrations) is public; its [initial commit](https://github.com/igeo-websites/tailorgame-integrations/commit/37ff3b1ff6a690386eb197deaf64d40076dc273c) was verified on November 6, 2026. The application repository remains private. npm and PyPI packages are still unpublished, awaiting publisher authentication and configuration. Those accounts are needed only to publish packages, not to play games or use the public API.

## Verify without registry authentication

In GitHub Actions, manually run **Publish Tailorgame SDKs** on `main` with the exact committed version (currently `1.0.0`) and `registry: verify`. This is the default selection. It runs release-identity checks, JavaScript/Python tests, package builds, metadata validation, and artifact upload. The `publish-npm` and `publish-pypi` jobs are skipped. No registry publisher setup, npm/PyPI login, or publishing environment approval is needed for this mode; the build job has only `contents: read` permission.

Download `sdk-release-candidates` to inspect its contents and SHA-256 list. A successful verification run establishes that CI can build the packages; it does not publish them or prove registry authentication works.

## One-time publisher configuration

The public repository contains the reviewed source and `.github/workflows/publish.yml`. Before registry publication, create the GitHub environments `npm` and `pypi`, each with a deployment branch restriction to `main`. Required reviewers are optional unless the organization already requires them; this release is already authorized. The workflow builds artifacts before either publishing job, and the uploaded `sdk-release-candidates` artifact includes its SHA-256 list.

Configure the registries with these exact values:

| Setting | npm | PyPI |
| --- | --- | --- |
| Package/project | `tailorgame-sdk` | `tailorgame-sdk` |
| Provider | GitHub Actions | GitHub |
| Owner | `igeo-websites` | `igeo-websites` |
| Repository | `tailorgame-integrations` | `tailorgame-integrations` |
| Workflow filename | `publish.yml` | `publish.yml` |
| Environment | `npm` | `pypi` |

For npm, an owner must authenticate and establish ownership of the package. npm's documented publisher setup lives in the package settings; if the new package has no settings yet, publish the first reviewed tarball using the owner's authenticated npm session, then configure trusted publishing for later versions. Do not publish an empty placeholder to claim the name. Enable direct publishing for the trusted publisher used by this workflow. The workflow uses npm 11.5.1+ on a GitHub-hosted runner with `id-token: write`, and no npm token secret. The npm documentation currently says a new trusted publisher must complete its first successful publish within two days; create it when the next release is ready.

For PyPI, the owner can create a [pending trusted publisher](https://pypi.org/manage/account/publishing/) before the project exists. Register the values above with project name `tailorgame-sdk`; the first successful trusted upload creates it. A PyPI account with its required authentication setup is necessary. No PyPI token needs to be stored in GitHub.

Registry configuration and authentication are separate from source preparation. Do not put passwords, tokens, `.npmrc`, or `.pypirc` into this repository. The workflow has not been run merely because the file exists.

## Release

1. Commit matching versions and approved package contents to `main`. Keep the public SDK version constants, declarations, npm manifest and Python metadata aligned.
2. In GitHub Actions, manually run **Publish Tailorgame SDKs** with the exact stable `x.y.z` version and explicitly select `npm`, `pypi`, or `all` to publish. The default `verify` selection only builds and tests. No push or pull-request event triggers publication. Select only the registry that still needs this version; for example, choose `pypi` if the first npm version was already published during bootstrap.
3. Let the build/test job complete and inspect its artifacts and checksum summary. If an environment has configured required reviewers, complete that existing GitHub review step. Each publisher uploads the already-built artifact rather than rebuilding in the publishing job; the workflow itself does not introduce another required human approval.
4. Verify both the registry metadata and a clean install from each selected registry. Update documentation from “not yet published” only after that succeeds. Record the registry links and version; do not infer registry success from a GitHub commit or a local build.

The package name checks recorded in `release-manifest.json` are historical and do not reserve names. If a registry rejects ownership or authentication, resolve that specific account configuration before retrying. Never substitute another registry or package name silently.

## Primary documentation

- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [PyPI pending trusted publishers](https://docs.pypi.org/trusted-publishers/creating-a-project-through-oidc/)
- [PyPI trusted publisher fields](https://docs.pypi.org/trusted-publishers/adding-a-publisher/)
- [PyPA GitHub Actions publishing guide](https://packaging.python.org/en/latest/guides/publishing-package-distribution-releases-using-github-actions-ci-cd-workflows/)
- [MIT license text](https://opensource.org/license/mit)
