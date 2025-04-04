import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Stage } from 'aws-cdk-lib';
import { EventBusStack1 } from './eventbussrcupdated';
import { CloudTrailStack1 } from './cloudtrialupdated';
import { EventBusDestinationStack } from './eventbusdestination';
import { GrafanaCdkStack } from './grafana';

export class DeploymentStage extends Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    if (props?.env?.account === '156041406847') {
      new EventBusDestinationStack(this, 'EventBusDestinationStack', { env: props.env });
      //new GrafanaCdkStack(this, 'GrafanaCdkStack', { env: props.env });
    } else {
      new CloudTrailStack1(this, 'CloudTrailStack1', { env: props?.env ?? {} });  
      new EventBusStack1(this, 'EventBusStack1', { env: props?.env ?? {} });
      
    }
  }
}
