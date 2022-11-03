import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from "path";
import { Distribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Certificate, CertificateValidation, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { CnameRecord, HostedZone } from 'aws-cdk-lib/aws-route53';


export const REPOSITORY_REGEX = /^protectasecurity\/([a-z]{4})-(.+)$/gm;
export const BASE_ZONE_NAME = 'protectasecuritycloud.pe'

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = this.env();
    const name = this.name();
    const code = this.code();
    const customDomainName = process.env.INPUT_DOMAIN;
    const customCertificateArn = process.env.INPUT_CERTIFICATE;
    if(customDomainName && !customCertificateArn) {
      throw Error('certificate is required for custom domain');
    }
    const zoneName = `${ code }.${ env }.${ BASE_ZONE_NAME }`
    const generatedDomainName = `${ name }.${ zoneName }`
    const domainName = customDomainName? customDomainName:generatedDomainName;

    const bucket = new Bucket(this, 'Bucket');
    
    const originAccessIdentity = new OriginAccessIdentity(this, 'Identity');
    bucket.grantRead(originAccessIdentity);

    const zone = HostedZone.fromLookup(this, 'Zone',{ domainName: zoneName });

    let certificate: ICertificate
    if(customDomainName && customCertificateArn) {
      certificate = Certificate.fromCertificateArn(this, 'Certificate', customCertificateArn);
    } else {
      certificate = new Certificate(this, 'Certificate', {
        domainName: domainName,
        validation: CertificateValidation.fromDns(zone),
      });
    }

    const distribution =  new Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new S3Origin(bucket, {originAccessIdentity}),
      },
      certificate: certificate,
      domainNames: [domainName]
    });

    if(!customDomainName) {
      new CnameRecord(this, 'Record', {
        zone: zone,
        recordName: name,
        domainName: distribution.distributionDomainName,
        deleteExisting: true
      });  
    }

    new BucketDeployment(this, 'Deployment', {
      destinationBucket: bucket,
      sources: [Source.asset(path.resolve(this.artifact()))],
      distribution: distribution,
      distributionPaths: ['/*'],
    });
  }

  artifact(): string {
    const workspace = process.env.GITHUB_WORKSPACE??'.';
    return `${ workspace }/dist`
  }

  name(): string {
    const name = process.env.INPUT_NAME;
    if(name) return name;

    const repository = process.env.GITHUB_REPOSITORY;
    if(repository && REPOSITORY_REGEX.test(repository)) {
      return repository.substring(22, repository.length);
    }

    return 'web';
  }

  code(): string {
    const code = process.env.INPUT_CODE;
    if(code?.length === 4) return code;

    const repository = process.env.GITHUB_REPOSITORY;
    if(repository && REPOSITORY_REGEX.test(repository)) {
      return repository.substring(17, 21);
    }

    throw Error('application code cannot be inferred');
  }

  env(): string {
    const branch = process.env.GITHUB_REF_NAME;
    switch(branch) {
      case 'main':
        return 'prd'; 
      case 'staging':
        return 'stg'; 
      case 'testing':
        return 'qas'; 
      default:
        return 'dev';
    }
  }
}
