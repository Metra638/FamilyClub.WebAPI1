#!/bin/bash

helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx --force-update
helm repo update

helm install ingress-nginx-test ingress-nginx/ingress-nginx \
  --namespace ingress-nginx-test \
  --create-namespace \
  --set controller.ingressClassResource.name=nginx-test \
  --set controller.ingressClassResource.controllerValue=k8s.io/ingress-nginx-test \
  --set controller.ingressClass=nginx-test \
  --set controller.electionID=ingress-nginx-test-leader \
  --set controller.admissionWebhooks.enabled=false \
  --set controller.resources.requests.cpu=0 \
  --set controller.resources.requests.memory=0 \
  --set controller.resources.limits.cpu=100m \
  --set controller.resources.limits.memory=128Mi \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-internal"=true \
  --set controller.service.externalTrafficPolicy=Local

INTERNAL_IP=""
while [ -z "$INTERNAL_IP" ]; do
  INTERNAL_IP=$(kubectl get svc -n ingress-nginx-test ingress-nginx-test-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
  sleep 5
done
echo "Internal IP: $INTERNAL_IP"
