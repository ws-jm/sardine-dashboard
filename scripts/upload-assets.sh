#!/bin/bash

set -e

#for testing use only
export ASSET_BUCKET=dev-sardine-dashboard-assets
export const PROJECT_ID=indigo-computer-272415

printf "\nDeploy start ${PROJECT_ID}\n"

printf "\n\nRebuilding assets...\n"
pushd frontend && npm install && npm run build && popd

# printf "\n\nUploading sourcemaps to sentry...\n"
# ./scripts/upload_sourcemap_to_sentry.sh

printf "\n\nUploading assets to google cloud...\n"
# -Z sent gzip encodeing to all the files that can be encoded in that way.
# -D for daisy chain to modify the cache-control as i am uploading the file
# -m parallel upload.
# -h adds metadata. 
gsutil -m -D -h "Cache-control:public, max-age=1800" cp -R public-read -Z frontend/build/.  gs://${ASSET_BUCKET}/dashboard-assets/

# printf "\n\nInvalidating CDN cache (this will take a while) ...\n"
# gcloud --project ${PROJECT_ID} compute url-maps invalidate-cdn-cache ${LOADBALANCER_NAME} \
#     --path "/assets/loader.min.js"

printf "\n Upload successful! \n"

