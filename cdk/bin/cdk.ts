#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
// @ts-ignore
import * as sh from 'shorthash';
import { CdkStack } from '../lib/cdk-stack';

const repository = process.env.GITHUB_REPOSITORY;
if(!repository) {
  throw Error('GITHUB_REPOSITORY must be configured')
}
const workspace = process.env.GITHUB_WORKSPACE;
if(!workspace) {
  throw Error('GITHUB_WORKSPACE must be configured')
}
const refname = process.env.GITHUB_REF_NAME;
if(!refname) {
  throw Error('GITHUB_REF_NAME must be configured')
}

const app = new cdk.App();

let stackName = repository.split('/')[1];
const customDomain = process.env.INPUT_DOMAIN;
if(customDomain) {
  const hash = sh.unique(customDomain);
  stackName = `${stackName}-${hash}`;
}

new CdkStack(app, 'StaticWebStack', {
  stackName: stackName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  }
});