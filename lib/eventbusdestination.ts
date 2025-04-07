import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as eventTargets from 'aws-cdk-lib/aws-events-targets';

export class EventBusDestinationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const destinationAccount = cdk.Aws.ACCOUNT_ID;
    const region = cdk.Aws.REGION;

    // Create a new EventBridge event bus
    const eventBus = new events.EventBus(this, 'S3ReceiverEventBus', {
      eventBusName: 's3receiverbus',
    });

    // List of source account IDs
    const sourceAccounts = ['820186421740', '156041406847']; // Add more source accounts as needed

    // Add a policy statement for each source account
    sourceAccounts.forEach(accountId => {
      eventBus.addToResourcePolicy(new iam.PolicyStatement({
        sid: `AllowEventsFromSourceAccount${accountId}`,
        effect: iam.Effect.ALLOW,
        principals: [new iam.AccountPrincipal(accountId)],
        actions: ['events:PutEvents'],
        resources: [`arn:aws:events:${region}:${destinationAccount}:event-bus/s3receiverbus`],
      }));
    });

    // Create CloudWatch Log Group
    const logGroup = new logs.LogGroup(this, 'S3ReceiverLogGroup', {
      logGroupName: '/aws/events/receivers3accesslogs',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Adjust as needed
    });

    // Create the EventBridge Rule
    const rule = new events.Rule(this, 'SendToCloudWatchRule', {
      ruleName: 'sendtocloudwatch',
      eventBus: eventBus,
      eventPattern: {
        source: ['aws.s3'],
      },
    });

    // Set the CloudWatch Log Group as the target
    rule.addTarget(new eventTargets.CloudWatchLogGroup(logGroup));
  }
}
