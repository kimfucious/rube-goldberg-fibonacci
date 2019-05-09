# The Rube Goldburg Fibonacci Calculator

![self-operating napkin](https://upload.wikimedia.org/wikipedia/commons/a/a9/Rube_Goldberg%27s_%22Self-Operating_Napkin%22_%28cropped%29.gif)

This repo is a demonstration of how to use multiple Docker containers as micro-services to build an web application.

It is intentionally, ridiculously over-engineered for demonstration purposes.

The concept is simple: Enter a number, and the app will provide the value from the Fibonacci sequence at the index of the number that was entered.

This could all be done much simpler, but that's not the point of this demonstration.

The app is composed of the following modules:

1. Client: a React application
2. Server: an Express server API that communicates to backend Redis and Postgres
3. Worker: a server that runs a single function that calculates the Fibonacci value
4. Nginx: provides access to the front end Client app and backend API
5. Postgres: a database server that persistently stores indexes that have been entered
6. Redis: an in memory database that stores the calculated values of previously entered indexes

Each of these `services`, some of which are `micro services`, run in their own Docker container or as a specifc Kubernetes `deployment`.

This demo can be run locally on a dev machine, using Docker Compose and/or Kubernetes (kubectl), and on Google Kubernetes Engine.

## To Run Locally in developer mode with Docker Compose (not Kubernetes)

### Prerequisites

1. [Docker](https://docs.docker.com/install/)
2. [Docker Compose](https://docs.docker.com/compose/install/)

### 1) Clone this repo

```shell
git clone https://github.com/kimfucious/rube-goldberg-fibonacci.git
```

### 2) Change into the directory where you cloned this repo

### 3) Run Docker Compose

```shell
docker-compose up
```

The first time this runs, it takes a while.

When it's done, you're looking for a few key lines of code to ensure that Docker Compose ran successfully.

The main block is the main one to watch out for, which should be at the bottom, indicating that the client app is now running:

```shell
client_1    | Compiled successfully!
client_1    |
client_1    | You can now view client in the browser.
client_1    |
client_1    |   Local:            http://localhost:3000/
client_1    |   On Your Network:  http://172.28.0.3:3000/
client_1    |
client_1    | Note that the development build is not optimized.
client_1    | To create a production build, use npm run build.
client_1    |
```

> :point_up: Although the client is running on port 3000, per the above, the Ngnix container is serving it up on port 1234, as http://localhost:1234.

### 4) View the running Docker containers

Open a **new** terminal window, leaving the Docker Compose terminal running, and run the following command:

```shell
docker ps
```

This should show something like the below (with different container IDs and time data):

```shell
CONTAINER ID        IMAGE                          COMMAND                  CREATED             STATUS              PORTS                  NAMES
02514a41755f        postgres:latest                "docker-entrypoint.s…"   4 minutes ago       Up 4 minutes        5432/tcp               rubegoldbergfibonacci_postgres_1
ce28a9f9fe29        rubegoldbergfibonacci_nginx    "nginx -g 'daemon of…"   4 minutes ago       Up 4 minutes        0.0.0.0:1234->80/tcp   rubegoldbergfibonacci_nginx_1
9c6066f150cc        redis:latest                   "docker-entrypoint.s…"   4 minutes ago       Up 4 minutes        6379/tcp               rubegoldbergfibonacci_redis_1
56fe4d2efcc2        rubegoldbergfibonacci_worker   "npm run dev"            4 minutes ago       Up 4 minutes                               rubegoldbergfibonacci_worker_1
5ab7a5bd4d15        rubegoldbergfibonacci_client   "npm run start"          4 minutes ago       Up 4 minutes                               rubegoldbergfibonacci_client_1
24b76b73258e        rubegoldbergfibonacci_api      "npm run dev"            4 minutes ago       Up 4 minutes                               rubegoldbergfibonacci_api_1
```

### 5) View the running web app in a browser

Open http://localhost:1234 in your browser of choice

### Shutting down the app

To shut the app down, when it has been started with Docker Compose, press `CTRL+C`.

You can confirm that the containers have stopped by running `docker ps`.

## :warning: Everything below this line is a work in progress and most likely won't work

## To Run Locally with Kubernetes

### Prerequisites

1. [Docker](https://docs.docker.com/install/)
2. [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
3. [kubernetes/ingress-nginx](https://kubernetes.github.io/ingress-nginx/deploy/#contents)

:point_up: There are a number of ways to get `kubectl` running in a local environment. And they are too numerous to list here, esp. for different operating systems. Here are some resources that might help:

1. [Minikube](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
2. [Docker for Desktop Mac](https://docs.docker.com/docker-for-mac/install/)
3. [Docker for Desktop Windows](https://docs.docker.com/docker-for-windows/kubernetes/)

The bottom line is that you need to be able to run `kubectl` from the command line of your operating system in order to perform the following steps.

> :point_up: The following documentation is written around `Docker for Desktop`, so refer to the above documentation references, if you're using MiniKube or something else.

### 1) Clone this repo

```shell
git clone https://github.com/kimfucious/rube-goldberg-fibonacci.git
```

### 2) Change into the directory where you cloned this repo

### 3) Run `kubernetes/ingress-nginx` prerequisite generic deployment command

```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/mandatory.yaml
```

This should result in the following output:

```shell
namespace/ingress-nginx created
configmap/nginx-configuration created
configmap/tcp-services created
configmap/udp-services created
serviceaccount/nginx-ingress-serviceaccount created
clusterrole.rbac.authorization.k8s.io/nginx-ingress-clusterrole created
role.rbac.authorization.k8s.io/nginx-ingress-role created
rolebinding.rbac.authorization.k8s.io/nginx-ingress-role-nisa-binding created
clusterrolebinding.rbac.authorization.k8s.io/nginx-ingress-clusterrole-nisa-binding created
deployment.apps/nginx-ingress-controller created
```

### 5) Create kubectl secret for Postgres

```shell
kubectl create secret generic pgpassword --from-literal PGPASSWORD=pgpassword123
```

should result in:

```shell
secret/pgpassword created
```

### 6) Run `kubectl apply` on the k8s-local directory

```shell
kubectl apply -f k8s-local/
```

```shell
kubectl get pods
```

```shell
kubectl get services
```

## Clean up

### If you're lazy and you don't care that you're deleting all containers on your system

> :point_up: Be sure you're okay with removing **everything**, before running this command!

Read more about `docker system prune` [here](https://docs.docker.com/engine/reference/commandline/system_prune/) to be sure.

```shell
docker system prune --all
```

### If you want to be more selective in your container deletion

#### View all stopped Docker containers

```shell
docker container ls -f 'status=exited'
```

#### Look for the entries matching the `IMAGE` names in the resulting list

```shell
CONTAINER ID        IMAGE                          COMMAND                  CREATED             STATUS                         PORTS                NAMES
02514a41755f        postgres:latest                "docker-entrypoint.s…"   32 minutes ago      Exited (0) 12 minutes ago                           rubegoldbergfibonacci_postgres_1
ce28a9f9fe29        rubegoldbergfibonacci_nginx    "nginx -g 'daemon of…"   32 minutes ago      Exited (0) 12 minutes ago                           rubegoldbergfibonacci_nginx_1
9c6066f150cc        redis:latest                   "docker-entrypoint.s…"   32 minutes ago      Exited (0) 12 minutes ago                           rubegoldbergfibonacci_redis_1
56fe4d2efcc2        rubegoldbergfibonacci_worker   "npm run dev"            32 minutes ago      Exited (143) 12 minutes ago                         rubegoldbergfibonacci_worker_1
5ab7a5bd4d15        rubegoldbergfibonacci_client   "npm run start"          32 minutes ago      Exited (0) 12 minutes ago                           rubegoldbergfibonacci_client_1
24b76b73258e        rubegoldbergfibonacci_api      "npm run dev"            32 minutes ago      Exited (143) 12 minutes ago                         rubegoldbergfibonacci_api_1
```

#### Use the `CONTAINER ID` to remove the container(s)

You can remove one or more containers with the `docker rm` command

```shell
docker rm 02514a41755f ce28a9f9fe29
```

#### List all Docker images

```shell
docker images
```

#### Look for the entries matching the `IMAGE ID` names in the resulting list

```shell
REPOSITORY                     TAG                 IMAGE ID            CREATED              SIZE
rubegoldbergfibonacci_api      latest              315bf9a28525        About a minute ago   97.9MB
rubegoldbergfibonacci_nginx    latest              7ca782d6e7f1        2 minutes ago        109MB
rubegoldbergfibonacci_client   latest              60fd1047640c        2 minutes ago        384MB
rubegoldbergfibonacci_worker   latest              a196823e7433        5 minutes ago        90.9MB
redis                          latest              a4fe14ff1981        16 hours ago         95MB
nginx                          latest              53f3fd8007f7        18 hours ago         109MB
postgres                       latest              3eda284d1840        18 hours ago         312MB
```

#### Use the `IMAGE ID` to remove the container(s)

You can remove one or more images with the `docker rmi` command

```shell
docker rmi 02514a41755f 7ca782d6e7f1
```
