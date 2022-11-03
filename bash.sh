# invocar local
sls invoke local -f img-analysis --path request.json

# fazer deploy
sls deploy

# invocar na aws
sls invoke -f img-analysis --path request.json

