#!/bin/bash

echo "Injecting environment variables..."

envsubst < scripts/environment.prod.template.ts > src/environments/environment.ts

echo "Building Angular app..."

npm run build -- --configuration production
