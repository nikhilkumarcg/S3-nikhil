import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Stage } from 'aws-cdk-lib';
import { CloudTrailStack } from './cloudtrialupdated';
import { EventBusDestinationStack } from './eventbusdestination';
import { EventBusStack } from './eventbussrcupdated';
import { GrafanaCdkStack } from './grafana'; // Assuming this exists

const CENTRAL_ACCOUNT_ID = '156041406847';

export class DeploymentStage extends Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    const account = props?.env?.account;
    console.log(`Deploying to account: ${account}`);

    if (account === CENTRAL_ACCOUNT_ID) {
      new EventBusDestinationStack(this, 'EventBusDestinationStack', { env: props?.env ?? {} });
      new GrafanaCdkStack(this, 'GrafanaCdkStack', { env: props?.env ?? {} });
    } else {
      new CloudTrailStack(this, 'CloudTrailStack', { env: props?.env ?? {} });  
      new EventBusStack(this, 'EventBusStack', { env: props?.env ?? {} });
    }
  }
}
