import * as cdk from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { DeploymentStage } from './deployment-stage';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 👇 Load GitHub token from AWS Secrets Manager
    const githubToken = cdk.SecretValue.secretsManager('my-github-token');

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'MultiAccountPipeline',
      crossAccountKeys: true, // Required for cross-account deploys
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('nikhilkumarcg/s3-nikhil', 'main', {
          authentication: githubToken
        }),
        commands: ['npm install', 'npx cdk synth']
      })
    });

    // 👇 Grant pipeline permissions to read the GitHub token
    pipeline.pipeline.role?.addToPrincipalPolicy(new PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: [
        `arn:aws:secretsmanager:${this.region}:${this.account}:secret:my-github-token*`
      ]
    }));

    // ✅ Add deployment stages for source accounts
    const sourceAccounts = ['820186421740'];
    for (const accountId of sourceAccounts) {
      pipeline.addStage(new DeploymentStage(this, `SourceDeployment-${accountId}`, {
        env: { account: accountId, region: 'us-east-1' }
      }));
    }

    // ✅ Add deployment stage for centralized account
    pipeline.addStage(new DeploymentStage(this, 'CentralDeployment', {
      env: { account: '156041406847', region: 'us-east-1' }
    }));

    // ✅ Output stack name
    new cdk.CfnOutput(this, 'PipelineStackName', {
      value: this.stackName,
      description: 'Name of the CDK Pipeline Stack'
    });
  }
}
