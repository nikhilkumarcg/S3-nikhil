import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';
import { EksYamlStack } from '../lib/Manifest';
import { DeploymentStage } from '../lib/deployment-stage';
const app = new cdk.App();
 
// new PipelineStack(app, 'MultiAccountPipeline', {
//   env: { account: '156041406847', region: 'us-east-1' }
// });


// Source Account Deployment
new DeploymentStage(app, 'SourceDeployment-820186421740', {
  env: { account: '820186421740', region: 'us-east-1' }
});

// Central Account Deployment
new DeploymentStage(app, 'CentralDeployment', {
  env: { account: '156041406847', region: 'us-east-1' }
});
