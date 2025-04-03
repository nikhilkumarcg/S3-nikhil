import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as grafana from 'aws-cdk-lib/aws-grafana';
import * as iam from 'aws-cdk-lib/aws-iam';

export class GrafanaCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an IAM Role for Grafana
    const grafanaRole = new iam.Role(this, 'GrafanaRole', {
      assumedBy: new iam.ServicePrincipal('grafana.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchReadOnlyAccess'),
      ],
    });

    // Create an AWS Managed Grafana workspace
    const workspace = new grafana.CfnWorkspace(this, 'MyGrafanaWorkspace', {
      name: 'MyGrafanaWorkspace',
      accountAccessType: 'CURRENT_ACCOUNT',
      authenticationProviders: ['AWS_SSO'], // Change if using IAM Identity Center
      permissionType: 'SERVICE_MANAGED',
      roleArn: grafanaRole.roleArn,
      dataSources: ['CLOUDWATCH'], // Enables CloudWatch as a data source
    });

    new cdk.CfnOutput(this, 'GrafanaWorkspaceId', {
      value: workspace.ref,
      description: 'The ID of the created AWS Managed Grafana workspace.',
    });

    new cdk.CfnOutput(this, 'GrafanaWorkspaceURL', {
      value: `https://${workspace.attrEndpoint}`,
      description: 'URL to access the AWS Managed Grafana workspace',
    });
  }
}
