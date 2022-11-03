import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
export declare const REPOSITORY_REGEX: RegExp;
export declare const ZONE_NAME = "protectasecuritycloud.pe";
export declare class CdkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps);
    artifact(): string;
    name(): string;
    code(): string;
    env(): string;
}
