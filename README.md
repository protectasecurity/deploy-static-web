# Deploy Static Web GitHub Actions

Deploy Static Web GitHub Actions allows you to deploy Static Web projects

## Example usage

```yaml
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: protectasecurity/deploy-static-web@v1
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: 'us-east-1'
```

## Inputs

- `artifact` **Optional** Artifact name to deploy
- `name` **Optional** Web name used to auto assign domain
- `code` **Optional** Standard application code to auto assign domain
- `domain` **Optional** Custom domain to assign to distribution
- `certificate` **Optional** Certificate to use on distribution, required for custom domains

## Environment

- `AWS_ACCESS_KEY_ID` **Required**
- `AWS_SECRET_ACCESS_KEY` **Required**
- `AWS_DEFAULT_REGION` **Required**

## Authors

- [Ronnie Ayala](https://github.com/ronnieacs)