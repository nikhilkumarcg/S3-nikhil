import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

export class CrossAccountEventBridgeStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the target EventBridge bus in the other account
    const targetEventBusArn = 'arn:aws:events:us-east-1:156041406847:event-bus/eks-bus';

    // Create EventBridge Rule
    const rule = new events.Rule(this, 'CrossAccountRule', {
      eventPattern: {
        source: ['aws.logs'] // Example: Forward CloudWatch Logs events
      }
    });

    // Add Target: Event Bus in another account
    rule.addTarget(new targets.EventBus(events.EventBus.fromEventBusArn(this, 'TargetEventBus', targetEventBusArn)));
  }
}
