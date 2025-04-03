import * as cdk from 'aws-cdk-lib';
import { iamstack } from '../lib/cdk-iam';
import { AccountEventBridgeStack } from '../lib/eventbridge';
import { CrossAccountEventBridgeStack } from '../lib/crossevent';
import { EksAdotAddonStack } from '../lib/adot';  
import { EksYamlStack } from '../lib/Manifest';
import { CloudTrailStack } from '../lib/cdk-s3';
import { EventBusStack1 } from '../lib/eventbussrcupdated';
import { EventBusDestinationStack } from '../lib/eventbusdestination';
import { IamPolicyStack } from '../lib/userpermissions';
import { GrafanaCdkStack } from '../lib/grafana';
import { CloudTrailStack1 } from '../lib/cloudtrialupdated';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();
new PipelineStack(app, 'MultiAccountPipeline', {
  env: { account: '156041406847', region: 'us-east-1' }
});
//new EventBusStack1(app, 'EventBusStack1', {});
//new EventBusDestinationStack(app, 'EventBusDestinationStack', {});
//new GrafanaCdkStack(app, 'GrafanaCdkStack', {});
//new CloudTrailStack1(app, 'CloudTrailStack1', {});
