import * as cdk from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { DeploymentStage } from './deployment-stage';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ✅ Enable cross-account deployments with secure artifact storage
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'MultiAccountPipeline',
      
      // ✅ Enable cross-account artifact encryption
      crossAccountKeys: true,

      // ✅ Define the source and build steps
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('nikhilkumarcg/s3-nikhil', 'main', {
          authentication: cdk.SecretValue.secretsManager('my-s3-token') // 🔥 Added GitHub authentication
        }),
        commands: ['npm install', 'npx cdk synth']
      })
    });

    // ✅ Define source accounts for deployment
    const sourceAccounts = ['820186421740']; // List of source accounts
    sourceAccounts.forEach(accountId => {
      pipeline.addStage(new DeploymentStage(this, `SourceDeployment-${accountId}`, {
        env: { account: accountId, region: 'us-east-1' }
      }));
    });

    // ✅ Add deployment for the centralized account
    pipeline.addStage(new DeploymentStage(this, 'CentralDeployment', {
      env: { account: '156041406847', region: 'us-east-1' }
    }));

    // ✅ Log pipeline creation
    new cdk.CfnOutput(this, 'PipelineStackName', {
      value: this.stackName,
      description: 'Name of the CDK Pipeline Stack',
    });
  }
}
