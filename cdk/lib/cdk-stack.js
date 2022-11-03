"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdkStack = exports.ZONE_NAME = exports.REPOSITORY_REGEX = void 0;
const cdk = require("aws-cdk-lib");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
const aws_s3_deployment_1 = require("aws-cdk-lib/aws-s3-deployment");
const path = require("path");
const aws_cloudfront_1 = require("aws-cdk-lib/aws-cloudfront");
const aws_cloudfront_origins_1 = require("aws-cdk-lib/aws-cloudfront-origins");
const aws_certificatemanager_1 = require("aws-cdk-lib/aws-certificatemanager");
const aws_route53_1 = require("aws-cdk-lib/aws-route53");
exports.REPOSITORY_REGEX = /^protectasecurity\/([a-z]{4})-(.+)$/gm;
exports.ZONE_NAME = 'protectasecuritycloud.pe';
class CdkStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const env = this.env();
        const name = this.name();
        const code = this.code();
        const customDomainName = process.env.INPUT_DOMAIN;
        const customCertificateArn = process.env.INPUT_CERTIFICATE;
        if (customDomainName && !customCertificateArn) {
            throw Error('certificate is required for custom domain');
        }
        const generatedDomainName = `${name}.${code}.${env}.${exports.ZONE_NAME}`;
        const domainName = customDomainName !== null && customDomainName !== void 0 ? customDomainName : generatedDomainName;
        const bucket = new aws_s3_1.Bucket(this, 'Bucket');
        const originAccessIdentity = new aws_cloudfront_1.OriginAccessIdentity(this, 'Identity');
        bucket.grantRead(originAccessIdentity);
        const zone = aws_route53_1.HostedZone.fromLookup(this, 'Zone', { domainName: exports.ZONE_NAME });
        let certificate;
        if (customDomainName && customCertificateArn) {
            certificate = aws_certificatemanager_1.Certificate.fromCertificateArn(this, 'Certificate', customCertificateArn);
        }
        else {
            certificate = new aws_certificatemanager_1.Certificate(this, 'Certificate', {
                domainName: domainName,
                validation: aws_certificatemanager_1.CertificateValidation.fromDns(zone),
            });
        }
        const distribution = new aws_cloudfront_1.Distribution(this, 'Distribution', {
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: new aws_cloudfront_origins_1.S3Origin(bucket, { originAccessIdentity }),
            },
            certificate: certificate,
            domainNames: [domainName]
        });
        if (!customDomainName) {
            new aws_route53_1.CnameRecord(this, 'Record', {
                zone: zone,
                recordName: domainName,
                domainName: distribution.distributionDomainName,
                deleteExisting: true
            });
        }
        new aws_s3_deployment_1.BucketDeployment(this, 'Deployment', {
            destinationBucket: bucket,
            sources: [aws_s3_deployment_1.Source.asset(path.resolve(this.artifact()))],
            distribution: distribution,
            distributionPaths: ['/*'],
        });
    }
    artifact() {
        var _a;
        const workspace = (_a = process.env.GITHUB_WORKSPACE) !== null && _a !== void 0 ? _a : '';
        return `${workspace}/dist`;
    }
    name() {
        const name = process.env.INPUT_NAME;
        if (name)
            return name;
        const repository = process.env.GITHUB_REPOSITORY;
        if (repository && exports.REPOSITORY_REGEX.test(repository)) {
            return repository.substring(22, repository.length);
        }
        return 'web';
    }
    code() {
        const code = process.env.INPUT_CODE;
        if ((code === null || code === void 0 ? void 0 : code.length) === 4)
            return code;
        const repository = process.env.GITHUB_REPOSITORY;
        if (repository && exports.REPOSITORY_REGEX.test(repository)) {
            return repository.substring(17, 21);
        }
        throw Error('application code cannot be inferred');
    }
    env() {
        const branch = process.env.GITHUB_REF_NAME;
        switch (branch) {
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
exports.CdkStack = CdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2RrLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2RrLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUVuQywrQ0FBNEM7QUFDNUMscUVBQXlFO0FBQ3pFLDZCQUE2QjtBQUM3QiwrREFBZ0Y7QUFDaEYsK0VBQThEO0FBQzlELCtFQUFzRztBQUN0Ryx5REFBa0U7QUFHckQsUUFBQSxnQkFBZ0IsR0FBRyx1Q0FBdUMsQ0FBQztBQUMzRCxRQUFBLFNBQVMsR0FBRywwQkFBMEIsQ0FBQTtBQUVuRCxNQUFhLFFBQVMsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNyQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN2QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDekIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3pCLE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUM7UUFDbEQsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDO1FBQzNELElBQUcsZ0JBQWdCLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUM1QyxNQUFNLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1NBQzFEO1FBQ0QsTUFBTSxtQkFBbUIsR0FBRyxHQUFJLElBQUssSUFBSyxJQUFLLElBQUssR0FBSSxJQUFLLGlCQUFVLEVBQUUsQ0FBQTtRQUN6RSxNQUFNLFVBQVUsR0FBRyxnQkFBZ0IsYUFBaEIsZ0JBQWdCLGNBQWhCLGdCQUFnQixHQUFFLG1CQUFtQixDQUFDO1FBRXpELE1BQU0sTUFBTSxHQUFHLElBQUks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QkFBaUIsQ0FBQztRQUNqRCxJQUFHLFVBQVUsSUFBSSx3QkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDbEQsT0FBTyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNyQztRQUVELE1BQU0sS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELEdBQUc7UUFDRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQztRQUMzQyxRQUFPLE1BQU0sRUFBRTtZQUNiLEtBQUssTUFBTTtnQkFDVCxPQUFPLEtBQUssQ0FBQztZQUNmLEtBQUssU0FBUztnQkFDWixPQUFPLEtBQUssQ0FBQztZQUNmLEtBQUssU0FBUztnQkFDWixPQUFPLEtBQUssQ0FBQztZQUNmO2dCQUNFLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0gsQ0FBQztDQUNGO0FBcEdELDRCQW9HQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IEJ1Y2tldCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgeyBCdWNrZXREZXBsb3ltZW50LCBTb3VyY2UgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMtZGVwbG95bWVudCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBEaXN0cmlidXRpb24sIE9yaWdpbkFjY2Vzc0lkZW50aXR5IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnQnO1xuaW1wb3J0IHsgUzNPcmlnaW4gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udC1vcmlnaW5zJztcbmltcG9ydCB7IENlcnRpZmljYXRlLCBDZXJ0aWZpY2F0ZVZhbGlkYXRpb24sIElDZXJ0aWZpY2F0ZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXInO1xuaW1wb3J0IHsgQ25hbWVSZWNvcmQsIEhvc3RlZFpvbmUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtcm91dGU1Myc7XG5cblxuZXhwb3J0IGNvbnN0IFJFUE9TSVRPUllfUkVHRVggPSAvXnByb3RlY3Rhc2VjdXJpdHlcXC8oW2Etel17NH0pLSguKykkL2dtO1xuZXhwb3J0IGNvbnN0IFpPTkVfTkFNRSA9ICdwcm90ZWN0YXNlY3VyaXR5Y2xvdWQucGUnXG5cbmV4cG9ydCBjbGFzcyBDZGtTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IGVudiA9IHRoaXMuZW52KCk7XG4gICAgY29uc3QgbmFtZSA9IHRoaXMubmFtZSgpO1xuICAgIGNvbnN0IGNvZGUgPSB0aGlzLmNvZGUoKTtcbiAgICBjb25zdCBjdXN0b21Eb21haW5OYW1lID0gcHJvY2Vzcy5lbnYuSU5QVVRfRE9NQUlOO1xuICAgIGNvbnN0IGN1c3RvbUNlcnRpZmljYXRlQXJuID0gcHJvY2Vzcy5lbnYuSU5QVVRfQ0VSVElGSUNBVEU7XG4gICAgaWYoY3VzdG9tRG9tYWluTmFtZSAmJiAhY3VzdG9tQ2VydGlmaWNhdGVBcm4pIHtcbiAgICAgIHRocm93IEVycm9yKCdjZXJ0aWZpY2F0ZSBpcyByZXF1aXJlZCBmb3IgY3VzdG9tIGRvbWFpbicpO1xuICAgIH1cbiAgICBjb25zdCBnZW5lcmF0ZWREb21haW5OYW1lID0gYCR7IG5hbWUgfS4keyBjb2RlIH0uJHsgZW52IH0uJHsgWk9ORV9OQU1FIH1gXG4gICAgY29uc3QgZG9tYWluTmFtZSA9IGN1c3RvbURvbWFpbk5hbWU/P2dlbmVyYXRlZERvbWFpbk5hbWU7XG5cbiAgICBjb25zdCBidWNrZXQgPSBuZXcgQnVja2V0KHRoaXMsICdCdWNrZXQnKTtcbiAgICBcbiAgICBjb25zdCBvcmlnaW5BY2Nlc3NJZGVudGl0eSA9IG5ldyBPcmlnaW5BY2Nlc3NJZGVudGl0eSh0aGlzLCAnSWRlbnRpdHknKTtcbiAgICBidWNrZXQuZ3JhbnRSZWFkKG9yaWdpbkFjY2Vzc0lkZW50aXR5KTtcblxuICAgIGNvbnN0IHpvbmUgPSBIb3N0ZWRab25lLmZyb21Mb29rdXAodGhpcywgJ1pvbmUnLHsgZG9tYWluTmFtZTogWk9ORV9OQU1FIH0pO1xuXG4gICAgbGV0IGNlcnRpZmljYXRlOiBJQ2VydGlmaWNhdGVcbiAgICBpZihjdXN0b21Eb21haW5OYW1lICYmIGN1c3RvbUNlcnRpZmljYXRlQXJuKSB7XG4gICAgICBjZXJ0aWZpY2F0ZSA9IENlcnRpZmljYXRlLmZyb21DZXJ0aWZpY2F0ZUFybih0aGlzLCAnQ2VydGlmaWNhdGUnLCBjdXN0b21DZXJ0aWZpY2F0ZUFybik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNlcnRpZmljYXRlID0gbmV3IENlcnRpZmljYXRlKHRoaXMsICdDZXJ0aWZpY2F0ZScsIHtcbiAgICAgICAgZG9tYWluTmFtZTogZG9tYWluTmFtZSxcbiAgICAgICAgdmFsaWRhdGlvbjogQ2VydGlmaWNhdGVWYWxpZGF0aW9uLmZyb21EbnMoem9uZSksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBkaXN0cmlidXRpb24gPSAgbmV3IERpc3RyaWJ1dGlvbih0aGlzLCAnRGlzdHJpYnV0aW9uJywge1xuICAgICAgZGVmYXVsdFJvb3RPYmplY3Q6ICdpbmRleC5odG1sJyxcbiAgICAgIGRlZmF1bHRCZWhhdmlvcjoge1xuICAgICAgICBvcmlnaW46IG5ldyBTM09yaWdpbihidWNrZXQsIHtvcmlnaW5BY2Nlc3NJZGVudGl0eX0pLFxuICAgICAgfSxcbiAgICAgIGNlcnRpZmljYXRlOiBjZXJ0aWZpY2F0ZSxcbiAgICAgIGRvbWFpbk5hbWVzOiBbZG9tYWluTmFtZV1cbiAgICB9KTtcblxuICAgIGlmKCFjdXN0b21Eb21haW5OYW1lKSB7XG4gICAgICBuZXcgQ25hbWVSZWNvcmQodGhpcywgJ1JlY29yZCcsIHtcbiAgICAgICAgem9uZTogem9uZSxcbiAgICAgICAgcmVjb3JkTmFtZTogZG9tYWluTmFtZSxcbiAgICAgICAgZG9tYWluTmFtZTogZGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWUsXG4gICAgICAgIGRlbGV0ZUV4aXN0aW5nOiB0cnVlXG4gICAgICB9KTsgIFxuICAgIH1cblxuICAgIG5ldyBCdWNrZXREZXBsb3ltZW50KHRoaXMsICdEZXBsb3ltZW50Jywge1xuICAgICAgZGVzdGluYXRpb25CdWNrZXQ6IGJ1Y2tldCxcbiAgICAgIHNvdXJjZXM6IFtTb3VyY2UuYXNzZXQocGF0aC5yZXNvbHZlKHRoaXMuYXJ0aWZhY3QoKSkpXSxcbiAgICAgIGRpc3RyaWJ1dGlvbjogZGlzdHJpYnV0aW9uLFxuICAgICAgZGlzdHJpYnV0aW9uUGF0aHM6IFsnLyonXSxcbiAgICB9KTtcbiAgfVxuXG4gIGFydGlmYWN0KCk6IHN0cmluZyB7XG4gICAgY29uc3Qgd29ya3NwYWNlID0gcHJvY2Vzcy5lbnYuR0lUSFVCX1dPUktTUEFDRT8/Jyc7XG4gICAgcmV0dXJuIGAkeyB3b3Jrc3BhY2UgfS9kaXN0YFxuICB9XG5cbiAgbmFtZSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IG5hbWUgPSBwcm9jZXNzLmVudi5JTlBVVF9OQU1FO1xuICAgIGlmKG5hbWUpIHJldHVybiBuYW1lO1xuXG4gICAgY29uc3QgcmVwb3NpdG9yeSA9IHByb2Nlc3MuZW52LkdJVEhVQl9SRVBPU0lUT1JZO1xuICAgIGlmKHJlcG9zaXRvcnkgJiYgUkVQT1NJVE9SWV9SRUdFWC50ZXN0KHJlcG9zaXRvcnkpKSB7XG4gICAgICByZXR1cm4gcmVwb3NpdG9yeS5zdWJzdHJpbmcoMjIsIHJlcG9zaXRvcnkubGVuZ3RoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gJ3dlYic7XG4gIH1cblxuICBjb2RlKCk6IHN0cmluZyB7XG4gICAgY29uc3QgY29kZSA9IHByb2Nlc3MuZW52LklOUFVUX0NPREU7XG4gICAgaWYoY29kZT8ubGVuZ3RoID09PSA0KSByZXR1cm4gY29kZTtcblxuICAgIGNvbnN0IHJlcG9zaXRvcnkgPSBwcm9jZXNzLmVudi5HSVRIVUJfUkVQT1NJVE9SWTtcbiAgICBpZihyZXBvc2l0b3J5ICYmIFJFUE9TSVRPUllfUkVHRVgudGVzdChyZXBvc2l0b3J5KSkge1xuICAgICAgcmV0dXJuIHJlcG9zaXRvcnkuc3Vic3RyaW5nKDE3LCAyMSk7XG4gICAgfVxuXG4gICAgdGhyb3cgRXJyb3IoJ2FwcGxpY2F0aW9uIGNvZGUgY2Fubm90IGJlIGluZmVycmVkJyk7XG4gIH1cblxuICBlbnYoKTogc3RyaW5nIHtcbiAgICBjb25zdCBicmFuY2ggPSBwcm9jZXNzLmVudi5HSVRIVUJfUkVGX05BTUU7XG4gICAgc3dpdGNoKGJyYW5jaCkge1xuICAgICAgY2FzZSAnbWFpbic6XG4gICAgICAgIHJldHVybiAncHJkJzsgXG4gICAgICBjYXNlICdzdGFnaW5nJzpcbiAgICAgICAgcmV0dXJuICdzdGcnOyBcbiAgICAgIGNhc2UgJ3Rlc3RpbmcnOlxuICAgICAgICByZXR1cm4gJ3Fhcyc7IFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdkZXYnO1xuICAgIH1cbiAgfVxufVxuIl19