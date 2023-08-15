# Build the AWS backend.
back-build:
	cd .\Backend && \
	sam build -t ./template.yaml && \
	cd ..

# Deploy the AWS Backend.
back-deploy:
	cd .\Backend && \
	sam deploy --config-env default && \
	cd ..

# Build and Deploy the AWS Backend.
backend: back-build back-deploy

# Replace the API Gateway Endpoint URL in the necessary frontend files.
baseurl:
	python ./Scripts/replaceBaseURL.py ./Scripts/backendLink.txt ./Frontend/src/pages/api.js
# ./Scripts/backendLink.txt -> Contains the API Gateway Endpoint URL.
# ./Frontend/src/pages/api.js -> Path to the file containing endpoint URL for the frontend. Set to null by default.

# Replace the POC details in the Homepage.js file.
poc:
	python ./Scripts/replacePOC.py ./Scripts/POC.txt ./Frontend/src/pages/Homepage.js
# ./Scripts/POC.txt -> Contains the POC details.
# ./Frontend/src/pages/Homepage.js -> Path to the Homepage file containing POC details. Set to null by default.

# Initalise the Platform website.
platform-init:
	cd ./Frontend && \
	npm install && \
	cd ..

# Deploy the Platform website.
platform-deploy:
	cd ./Frontend && \
	npm run deploy && \
	cd ..

# Initalise the Frontend.
frontend-init: baseurl poc platform-init

# Deploy the Frontend.
frontend-deploy: baseurl poc platform-deploy

# Initalise and Deploy the Frontend.
frontend: baseurl poc platform-init platform-deploy

# Process the experimental data.
summary:
	python -m pip install --upgrade -r ./Data-Processing/pythonRequirements.txt --no-cache-dir
	python ./Data-Processing/cleandata.py ./Data-Processing/runTable.csv ./Data-Processing/runTransitionTable.csv ./Data-Processing/experiment.json
	python ./Data-Processing/prelim_scores.py ./Data-Processing/experiment.json ./Data-Processing/metrics.json
	python ./Data-Processing/dumpdata.py ./Data-Processing/metrics.json ./Data-Processing/summary.csv
# ./Data-Processing/pythonRequirements.txt ->  Contains the list of required external Python packages.
# ./Data-Processing/runTable.csv ->  Contains the mapping of userId and runId.
# ./Data-Processing/runTransitionTable.csv ->  Contains the mapping of runId and its actions.
# ./Data-Processing/experiment.json -> Contains all the data pertaining to the experiment.
# ./Data-Processing/metrics.json -> Contains the metrics generated after analysis of the experiment.
# ./Data-Processing/analysis.csv -> Contains final analysis of the experiment metrics.
