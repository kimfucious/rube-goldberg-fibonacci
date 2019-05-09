docker build -t kimfucious/fib-client:latest -t kimfucious/fib-client:$SHA -f ./client/Dockerfile ./client
docker build -t kimfucious/fib-server:latest -t kimfucious/fib-server:$SHA -f ./server/Dockerfile ./server
docker build -t kimfucious/fib-worker:latest -t kimfucious/fib-worker:$SHA -f ./worker/Dockerfile ./worker
docker push kimfucious/fib-client:latest
docker push kimfucious/fib-server:latest
docker push kimfucious/fib-worker:latest
docker push kimfucious/fib-client:$SHA
docker push kimfucious/fib-server:$SHA
docker push kimfucious/fib-worker:$SHA
kubectl apply -f k8s
kubectl set image deployments/client-deployment client=kimfucious/fib-client:$SHA
kubectl set image deployments/server-deployment server=kimfucious/fib-server:$SHA
kubectl set image deployments/worker-deployment worker=kimfucious/fib-worker:$SHA