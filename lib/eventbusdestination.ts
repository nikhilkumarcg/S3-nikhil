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

    // Define the first source account to be added dynamically
    const sourceAccount = '820186421740'; // Ensure this is a valid AWS account number

    const policyStatement = new iam.PolicyStatement({
      sid: `AllowEventsFromSourceAccount${sourceAccount}`,
      effect: iam.Effect.ALLOW,
      principals: [new iam.AccountPrincipal(sourceAccount)],
      actions: ['events:PutEvents'],
      resources: [`arn:aws:events:${region}:${destinationAccount}:event-bus/s3receiverbus`],
    });

    eventBus.addToResourcePolicy(policyStatement);

    // Create CloudWatch Log Group
    const logGroup = new logs.LogGroup(this, 'S3ReceiverLogGroup', {
      logGroupName: '/aws/events/receivers3accesslogs',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change this based on your retention requirements
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
