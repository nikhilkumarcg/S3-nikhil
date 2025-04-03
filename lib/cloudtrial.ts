import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import { Construct } from 'constructs';

export class CloudTrailStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create an S3 bucket for CloudTrail logs
        const trailBucket = new s3.Bucket(this, 'CloudTrailBucket', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
        });

        // Create a CloudWatch log group
        const logGroup = new logs.LogGroup(this, 'CloudTrailLogGroup', {
            retention: logs.RetentionDays.ONE_YEAR,
        });

        // Create an IAM role for CloudTrail to publish to CloudWatch Logs
        const trailRole = new iam.Role(this, 'CloudTrailRole', {
            assumedBy: new iam.ServicePrincipal('cloudtrail.amazonaws.com'),
        });

        // Grant necessary permissions to CloudTrail
        logGroup.grantWrite(trailRole);
        trailBucket.grantPut(trailRole);
        trailBucket.grantPutAcl(trailRole);

        // Create the CloudTrail
        const trail = new cloudtrail.Trail(this, 's3writeaccesslogs', {
            sendToCloudWatchLogs: true,
            cloudWatchLogGroup: logGroup,
            bucket: trailBucket,
            enableFileValidation: true,
            isMultiRegionTrail: true,
            includeGlobalServiceEvents: true,
            managementEvents: cloudtrail.ReadWriteType.ALL,
        });

        // Add data event selector for S3 write events
        trail.addEventSelector(cloudtrail.DataResourceType.S3_OBJECT, [`arn:aws:s3:::*`], {
            readWriteType: cloudtrail.ReadWriteType.WRITE_ONLY,
        });
    }
}
