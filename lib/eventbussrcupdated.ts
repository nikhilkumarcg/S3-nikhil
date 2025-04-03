import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as eventTargets from 'aws-cdk-lib/aws-events-targets';

export class EventBusStack1 extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sourceAccount = cdk.Aws.ACCOUNT_ID;
    const targetAccount = '156041406847'; // Fixed target account
    const region = cdk.Aws.REGION;

    const eventBusArn = `arn:aws:events:${region}:${sourceAccount}:event-bus/default`;
    const targetEventBusArn = `arn:aws:events:${region}:${targetAccount}:event-bus/s3receiverbus`;

    const eventBus = events.EventBus.fromEventBusArn(this, 'DefaultEventBus', eventBusArn);

    new events.CfnEventBusPolicy(this, 'EventBusPolicy', {
      eventBusName: 'default',
      statementId: 'AllowTargetAccountPutEvents',
      action: 'events:PutEvents',
      principal: targetAccount,
    });

    // Create an IAM role for the rule target
    const ruleRole = new iam.Role(this, 'EventBridgeTargetRole', {
      assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
      inlinePolicies: {
        InlinePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['events:PutEvents'],
              resources: [targetEventBusArn],
            }),
          ],
        }),
      },
    });

    // Add trust policy to the role
    ruleRole.assumeRolePolicy?.addStatements(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('events.amazonaws.com')],
        actions: ['sts:AssumeRole'],
        conditions: {
          StringEquals: {
            'aws:SourceArn': `arn:aws:events:${region}:${sourceAccount}:rule/forwards3events`,
            'aws:SourceAccount': sourceAccount,
          },
        },
      })
    );

    // Create the EventBridge Rule
    const rule = new events.Rule(this, 'ForwardS3EventsRule', {
      ruleName: 'forwards3events',
      eventBus: eventBus,
      eventPattern: {
        source: ['aws.s3'],
        detailType: ['AWS API Call via CloudTrail'],
        detail: {
          eventSource: ['s3.amazonaws.com'],
          eventName: ['PutObject'],
        },
      },
    });

    rule.addTarget(new eventTargets.EventBus(events.EventBus.fromEventBusArn(this, 'TargetEventBus', targetEventBusArn), {
      role: ruleRole,
    }));
  }
}
