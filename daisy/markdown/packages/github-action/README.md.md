# @answerai/daisy-github-action

This package is a GitHub Action that automates the process of running completions using the D.A.I.S.Y library and creating pull requests for code completions. It is part of a larger software application.

## Description

The `@answerai/daisy-github-action` package includes a script that interacts with the GitHub API and the D.A.I.S.Y library to run completions and create pull requests. It is designed to be used as a GitHub Action and can be triggered by events in a GitHub repository.

## Functionality

The package provides the following functionality:

- Setting up the Octokit library with a GitHub token
- Running completions and creating a pull request on GitHub based on changes from the previous run, or all code
- Running the memorization process using the D.A.I.S.Y library
- Generating a pull request message based on the newly created documentation

## Usage

To use the `@answerai/daisy-github-action` package as a GitHub Action, you can include it in your workflow configuration file. Here's an example of how to use it:

```yaml
name: Run Daisy Completions

on:
  push:
    branches:
      - main

jobs:
  daisy-completions:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Run Daisy completions
        uses: answerai/daisy-github-action@v1.0.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          answerai-api-key: ${{ secrets.ANSWERAI_API_KEY}}
```

## Usage

The @answerai/daisy-github-action package allows you to automate running D.A.I.S.Y. on a code repository by creating a GitHub action. It performs completions and memorization tasks using the D.A.I.S.Y. library.

## Configuration

The @answerai/daisy-github-action package can be configured using the following inputs:

## Inputs

| Input | Description | Default Value | | ---------------- | ------------------------------------- | ------------- | | setupGitUser | Set up Git user configuration | true |

## Outputs

The @answerai/daisy-github-action package provides the following outputs:

| Output | Description | | ------------------- | ---------------------------------------------------------------- | | memorized | Indicator of whether the memorization process was successful | | documented | Indicator of whether the documentation process was successful | | pullRequestNumber | The number of the created or updated pull request (if applicable) |
