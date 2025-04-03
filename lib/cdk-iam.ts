import * as cdk from 'aws-cdk-lib';
import { Grant } from 'aws-cdk-lib/aws-iam';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class iamstack extends cdk.Stack 
{
  constructor(scope: Construct, id: string, props?: cdk.StackProps)
  {
    super(scope, id, props);
    const policy = new iam.Policy(this, 'Mys3Policy', {
      policyName: 'mys3policy',
        statements: [
            new iam.PolicyStatement({
            actions: ['s3:getObject', 's3:ListAllMyBuckets','s3:ListBucket','s3:getObject'],
            effect: iam.Effect.ALLOW,
            resources: ['arn:aws:s3:::*/*'],
            }),
        ],
    });
}}
