# Kubernetes-Web-Application

In this project I deploying a Web Application in AWS Elastic Kubernetes Service (EKS).

Below are the series of steps I took in order to complete this project.


### Tools and Platforms Used:

- AWS Console
- AWS CLI
- Visual Studio
- Command Line
- Ubuntu Server
- Docker
- Git Repository
- AWS Elastic Kubernetes Service
- AWS Elastic Container Repository
- AWS EC2
- IAM Roles and Policies
- Load Balancer
- Auto-Scaling

### Initial Setup

To get this project going, I started by opening up the AWS console, logging in as under my root account, and creating a new IAM user with AdministratorAccess policy assigned. It is a security best practice to refrain from using the root account whenever possible, and to create users with appropiate privelleges instead.

Additionally, I enabled MFA with a virtual device for the newly created IAM user. In line with the previous security best practice, enabling MFA for all accounts is highly recommended to enhanced account security.

After everything with the user account was successfully set up, I signed into the AWS console with the appropiate login credentials.

### Creating an Access Key

Once logged into the console, I navigated to security credentials in the top right hand corner under my account name.
From here  I selected "Create Access Key" and downloaded it to my machine

<img width="824" alt="image" src="https://github.com/aasif287/Deploy-a-Web-Application-in-AWS-Elastic-Kubernetes-Service/assets/155476415/ee1f028d-f467-4101-b220-c7bca88713a8">


This access key will be needed later for managing our resources from the CLI

### Creating a new policy

Next under "Policies" I created a new policy named "PortfolioProject01". Below is the template used for this policy:

```{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "autoscaling:DescribeAutoScalingGroups",
                "autoscaling:DescribeAutoScalingInstances",
                "autoscaling:DescribeLaunchConfigurations",
                "autoscaling:DescribeTags",
                "autoscaling:SetDesiredCapacity",
                "autoscaling:TerminateInstanceInAutoScalingGroup",
                "ec2:DescribeLaunchTemplateVersions"
            ],
            "Resource": "*",
            "Effect": "Allow"
        }
    ]
}
 ```

### Creating a new roles

In the IAM console, I selected "create role > AWS Service > Use Case: EKS > EKS-Cluster"
Role name: project_eks_role
Selected "create role"

<img width="840" alt="image" src="https://github.com/aasif287/Deploy-a-Web-Application-in-AWS-Elastic-Kubernetes-Service/assets/155476415/836ac85f-85b1-4388-9d55-8700ea3befa2">



Next I created another role and selected: "create role > AWS Service > Use Case: EC2 > EC2 
Assigned the following policies:

- amazoneksworkernodepolicy
- amazonec2containerregistryreadonly
- amazonEKS_CNI_Policy
- PortfolioProject01

*Notice the last policy is the one we created earlier.

Named new role "projectnode_role"
Selected "create role"

<img width="875" alt="Screenshot 2024-01-25 200403" src="https://github.com/aasif287/Deploy-a-Web-Application-in-AWS-Elastic-Kubernetes-Service/assets/155476415/790508a4-3bf6-4216-a947-5898a9a8831f">
<img width="926" alt="Screenshot 2024-01-25 200358" src="https://github.com/aasif287/Deploy-a-Web-Application-in-AWS-Elastic-Kubernetes-Service/assets/155476415/bba70851-9cf2-4217-9782-cdf76eeca50a">



### Creating EC2 key pair

After the roles were created I naviaged back to EC@ dashboard > selected region US-East-1 "N.Virginia" > click key pair > create key pair > named key pair "PortfolioProject01_KeyPair" > pem file format for use with OpenSSH > create key pair

This key pair will be used for authentication purposes later.
<img width="733" alt="Screenshot 2024-01-25 200552" src="https://github.com/aasif287/Deploy-a-Web-Application-in-AWS-Elastic-Kubernetes-Service/assets/155476415/d4575951-3593-4bb9-b793-905aaf69dcec">


### Coniguring AWS credentials in CLI

Before beginning this step, AWS CLI must be installed for the correct OS

Open Commmand line > Type "aws configure" > enter the access key ID ( created and downloaded earlier) > enter secret access key > region name: US-East-1 > output format: json

The AWS CLI is now properly configured

<img width="663" alt="Screenshot 2024-01-25 201734" src="https://github.com/aasif287/Deploy-a-Web-Application-in-AWS-Elastic-Kubernetes-Service/assets/155476415/1b1a11e3-09e4-454e-b5cb-fc279db4aed7">

*This command was performed on my windows desktop for demonstration purposes, the remainder of the project will be in my Ubuntu cloud enviornment

### Elastic Container Registry

In the AWS Console I navigated to Elastic Container Registry > confirmed US-East-1 region > clicked create repository > selected private visibility > named my project "portfolioproject01website"
Create Repository

<img width="750" alt="Screenshot 2024-01-25 202102" src="https://github.com/aasif287/Deploy-a-Web-Application-in-AWS-Elastic-Kubernetes-Service/assets/155476415/559647c6-7010-495e-94cb-74c736676b9d">



### Build Image and Run Container

In this next step I opened up a terminal and cloned a Git respitory to my home folder on my Ubuntu machine. This repository houses our nodeJS javascript "web-container-application".
This is a simple image where NodeJS is installed and the application is exposed on port 8089

<img width="595" alt="image" src="https://github.com/aasif287/Deploy-a-Web-Application-in-AWS-Elastic-Kubernetes-Service/assets/155476415/0066d069-1eea-4723-a4b7-ca59ec7b2c40">



Next I opened Visual Studio Code > Selected "Open Folder" > chose the application folder

All files loaded into VS code

Next I went to the Docker file and opened up the VS code terminal to create our image. In the terminal typed the following: 

```
sudo docker build -f Dockerfile -t portfolioproject01website:latest .
 ```
*Builds image


```
sudo docker images
 ```
*Checks a list of images


```
sudo docker run -p 8089:8089 profolioproject01website:latest
 ```
*Runs Image


```
sudo docker ps
 ```
*Checks that container is running


```
sudo docker stop d6d5b227049a
 ```
*Stops the container. The number is the container ID number


<img width="521" alt="image" src="https://github.com/aasif287/Deploy-a-Web-Application-in-AWS-Elastic-Kubernetes-Service/assets/155476415/c8f49889-c1e8-4ec6-b6c7-dfedc0b842ec">


<img width="508" alt="image" src="https://github.com/aasif287/Deploy-a-Web-Application-in-AWS-Elastic-Kubernetes-Service/assets/155476415/f3a9a4de-aa62-408b-af01-700a965b783b">



###  Pushing container to the AWS Elastic Container Repository

Next I pushed the container to ECR which would allow me to use the image in Kubernetes service. To accomplish this I performed the following actions:

Open AWS > Elastic Container Repository > website repository > select "view push commands" 

Copy and pasted the first command in the VS Code terminal: 
```
aws ecr get-login-password --region us-east-1 |sudo docker login --username AWS --password-stdin [MY ACCOUNT ID].dkr.ecr.us-east-1.amazonaws.com
 ```

Copy and pasted the third command in the VS Code terminal: 
```
sudo docker tag portfolioproject01website:latest [MY ACCOUNT NUMBER].dkr.ecr.us-east-1.amazonaws.com/portfolioproject01website:latest
 ```

Copy and pasted the fourth command in the VS Code terminal: 
```
sudo docker push [MY ACCOUNT NUMBER].dkr.ecr.us-east-1.amazonaws.com/portfolioproject01website:latest
 ```

<img width="554" alt="image" src="https://github.com/aasif287/Deploy-a-Web-Application-in-AWS-Elastic-Kubernetes-Service/assets/155476415/20946a43-1cdd-4665-99b6-ecce7d4bfa6f">



### Creating Kubernetes Cluster

Next I needed to create my Kubernetes cluster. To do this I:

Navigated to EKS in the AWS Console and click create cluster > named cluster "portfolioproject01_cluster" > selected "PortfolioProject01_EKSrole" (created earlier) > kept default vpc configuration > selected subnets "us-east-1a" and "us-east-1b" > selected default security group > selected "public cluster endpoint access" > selected "create cluster"

Cluster successfully created


### Creating a Node Group

In the cluster under the configurations section, clicked "compute" > add node group > name node group "portfolioproject01_nodegroup" > assign the IAM node role
Configured the following Node group compute options:
- Amazon Linux 2 (AL2_x86_64) AMI type
- On-Demand capacity
- Instance type: t3.medium
- Disk size: 20GiB
- Maximum size: 4 nodes

<img width="425" alt="image" src="https://github.com/aasif287/Deploy-a-Web-Application-in-AWS-Elastic-Kubernetes-Service/assets/155476415/b42ffef0-dd86-4bf6-ae82-37aef45b3f0a">



Configured network by specifying the subnets our nodes will run and and assigned key pair created earlier to node group

<img width="403" alt="image" src="https://github.com/aasif287/Deploy-a-Web-Application-in-AWS-Elastic-Kubernetes-Service/assets/155476415/e8bb17fb-d6be-40f4-9d35-b35ae6b63e21">



### Deploying Application in Kubernetes Cluster

Opened terminal window and typed: 

```
aws eks --region us-east-1 update-kubeconfig --name portfolioproject01_cluster
 ```

In Visual Studio code opened the deployment.yaml file (See repository for code)

In terminal typed:

```
kubectl apply -f deployment.yaml
 ```
In the AWS EC2 Load balancer > copied DNS name > pasted in search engine and added :8089 to the end.
Pressed Search
Application is successfully running in our EKS cluster.
In EKS > clusters > workloads, the wesbite deployment is running in our cluster

### Scaling the Elastic Kubernetes Cluster

In VS code opened "cluster-autoscaler.yaml" (see repository for code)

In VS code terminal typed: 

```
kubectl apply -f cluster-autoscale.yaml
 ```

This deploys the auto scaler.
The permissions needed for autoscaling were already defined previous in the Policy and IAM role
In thecluster workloads in AWS Console there is now a cluster-autoscaler deployment!


Checked to see if the autoscaler is working by opening the deployment.yaml file and changing the replicas from "5" to "30"
In terminal typed: 

```
kubectl apply -f deployment.yaml
 ```

Under the cluster workload in AWS more pods have been deployed.
In the Node, instead of 2 nodes, there is now 4 nodes which is the maximum amount that we defined previously.

Scaling is properly configured for the Elastic Kubernetes Cluster!

### Cleaning up the enviornment

Deleted all resources to avoid accumulating cost.
