#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
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


new CdkStack(app, 'StaticWebStack', {
  stackName: repository.split('/')[1]
});