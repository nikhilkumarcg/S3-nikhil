import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class IamPolicyStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Define SendEventBridgeEventsPolicy
        const sendEventBridgePolicy = new iam.Policy(this, "SendEventBridgeEventsPolicy", {
            policyName: "SendEventBridgeEventsPolicy",
            statements: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ["events:PutEvents"],
                    resources: ["arn:aws:events:us-east-1:820186421740:event-bus/default"]
                })
            ]
        });

        // Define S3ForwarderPolicy
        const s3ForwarderPolicy = new iam.Policy(this, "S3ForwarderPolicy", {
            policyName: "S3ForwarderPolicy",
            statements: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: ["events:PutEvents"],
                    resources: ["arn:aws:events:us-east-1:156041406847:event-bus/s3receiverbus"]
                })
            ]
        });

        // Get the existing IAM User
        const user = iam.User.fromUserName(this, "mainUser", "root");

        // Attach both policies to the user
        user.attachInlinePolicy(sendEventBridgePolicy);
        user.attachInlinePolicy(s3ForwarderPolicy);
    }
}
