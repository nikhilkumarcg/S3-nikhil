import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline-stack';
import { EksYamlStack } from '../lib/Manifest';
import { DeploymentStage } from '../lib/deployment-stage';
import { CloudTrailStack } from '../lib/cloudtrialupdated';
import { EventBusStack } from '../lib/eventbussrcupdated';
import { EventBusDestinationStack } from '../lib/eventbusdestination';
import { GrafanaCdkStack } from '../lib/grafana'; // Assuming this exists
const app = new cdk.App();
 
// new DeploymentStage(app, 'SourceDeployment-820186421740', {
//   env: { account: '820186421740', region: 'us-east-1' }
// });

// //Central Account Deployment
// new DeploymentStage(app, 'CentralDeployment', {
//   env: { account: '156041406847', region: 'us-east-1' }
// });

// new PipelineStack(app, 'MultiAccountPipeline', {
//   env: { account: '156041406847', region: 'us-east-1' }
// });



