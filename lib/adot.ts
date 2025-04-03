import * as cdk from 'aws-cdk-lib';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class EksAdotAddonStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Import existing EKS cluster
        const cluster = eks.Cluster.fromClusterAttributes(this, 'MyEksCluster', {
            clusterName: 'adotdemo', // Replace with your EKS cluster name
            kubectlRoleArn: 'arn:aws:iam::156041406847:role/adot_role' // IAM role with EKS access
        });

        // Apply cert-manager manifests manually (instead of Helm)
        const certManagerManifest = cluster.addManifest('CertManagerManifest', {
            apiVersion: 'apiextensions.k8s.io/v1',
            kind: 'CustomResourceDefinition',
            metadata: {
                name: 'certificates.cert-manager.io',
            },
            spec: {
                group: 'cert-manager.io',
                names: { kind: 'Certificate', listKind: 'CertificateList', plural: 'certificates', singular: 'certificate' },
                scope: 'Namespaced',
                versions: [{ name: 'v1', served: true, storage: true }],
            },
        });

        // Create IAM Role for ADOT add-on
        const adotIamRole = new iam.Role(this, 'ADOTIAMRole', {
            assumedBy: new iam.ServicePrincipal('eks.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonPrometheusRemoteWriteAccess'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
            ],
        });

        // Install ADOT add-on (Ensures cert-manager is applied first)
        const adotAddon = new eks.CfnAddon(this, 'ADOTAddon', {
            clusterName: cluster.clusterName,
            addonName: 'adot',
            resolveConflicts: 'OVERWRITE',
            serviceAccountRoleArn: adotIamRole.roleArn,
        });

        adotAddon.node.addDependency(certManagerManifest); // Ensure ADOT installs after cert-manager
    }
}
