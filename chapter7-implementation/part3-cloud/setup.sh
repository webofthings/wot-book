#!/bin/bash          
## This file is a set of cURL requests used in Chapter 7 of the Book "Building the Web of Things" by Guinard & Trifa (bit.ly/wotbook)

# Ensure we are running bash, if not run in bash
if [ -z "$BASH_VERSION" ]
then
    exec bash "$0" "$@"
fi

SERVER="https://api.evrythng.com"
[ -z "$EVRYTHNG_API_KEY" ] && EVRYTHNG_API_KEY=$1

mkdir -p payloads

# Extract JSON content
function parse_json()
{
    echo $1 | \
    sed -e 's/[{}]/''/g' | \
    sed -e 's/", "/'\",\"'/g' | \
    sed -e 's/" ,"/'\",\"'/g' | \
    sed -e 's/" , "/'\",\"'/g' | \
    sed -e 's/","/'\"---SEPARATOR---\"'/g' | \
    awk -F=':' -v RS='---SEPARATOR---' "\$1~/\"$2\"/ {print}" | \
    sed -e "s/\"$2\"://" | \
    tr -d "\n\t" | \
    sed -e 's/\\"/"/g' | \
    sed -e 's/\\\\/\\/g' | \
    sed -e 's/^[ \t]*//g' | \
    sed -e 's/^"//'  -e 's/"$//'
}


#####
##### Step 0 - Let's create a config.json file which will be used later
#####
echo "{" > config.json
echo '  "operatorApiKey":"'$EVRYTHNG_API_KEY'",' >> config.json


#####
##### Step 1 - 1. Create a Project
#####
curl -X POST "$SERVER/projects" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "name": "Web of Things Book", "description": "My First WoT Project" }' > payloads/project.json

# Parse the response to get the project ID
PROJECT=`cat payloads/project.json`
PROJECT_ID=`parse_json "$PROJECT" id`

# Store the project ID in our config.json file
echo "Created Project ID: $PROJECT_ID"
echo "RESULT: $PROJECT"
echo '  "projectId":"'$PROJECT_ID'",' >> config.json


#####
##### Step 1 - 2. Let's create an application within this project
#####
curl -X POST "$SERVER/projects/$PROJECT_ID/applications" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "name": "My Awesome WoT App", "description": "My First WoT Client Application","tags":["WoT","device","plug","energy"], "socialNetworks": {} }' > payloads/app.json

# Parse the response to get the app ID and app API key
APP=`cat payloads/app.json`
APP_ID=`parse_json "$APP" id`
APP_API_KEY=`parse_json "$APP" appApiKey`

# Store the app ID and app API key in our config.json file
echo "Created App ID: $APP_ID"
echo "RESULT: $APP"
echo '  "appId":"'$APP_ID'",' >> config.json
echo '  "appApiKey":"'$APP_API_KEY'",' >> config.json




#####
##### Step 2 - 1. Let's now create a product within this project
#####
curl -X POST "$SERVER/products?project=$PROJECT_ID" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "fn": "WoT Smart Plug", "description": "A Web-connected Smart Plug","tags":["WoT","device","energy"],"photos":["https://webofthings.github.io/files/plug.jpg"] }' > payloads/product.json

# Parse the response to get the product ID
PRODUCT=`cat payloads/product.json`
PRODUCT_ID=`parse_json "$PRODUCT" id`

# Store the product ID in our config.json file
echo "Created Product ID: $PRODUCT_ID"
echo "RESULT: $PRODUCT"
echo '  "productId":"'$PRODUCT_ID'",' >> config.json


# Find this product in this project - You should see your product here
curl -X GET "$SERVER/products/$PRODUCT_ID?project=$PROJECT_ID" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Accept: application/json" 




#####
##### Step 2 - 2. Let's now create a thng (an instance of the product) within this project
#####
curl -X POST "$SERVER/thngs?project=$PROJECT_ID" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "name": "My WoT Plug", "product":"'$PRODUCT_ID'", "description": "My own Smart Plug","tags":["WoT","device","plug","energy"] }' > payloads/thng.json


# Parse the response to get the thng ID
THNG=`cat payloads/thng.json`
THNG_ID=`parse_json "$THNG" id`


# Store the thng ID in our config.json file
echo "Created Thng ID: $THNG_ID"
echo "RESULT: $THNG"
echo '  "thngId":"'$THNG_ID'",' >> config.json



#####
##### Step 3 - Let's now create an API Key for this device
#####
curl -X POST "$SERVER/auth/evrythng/thngs" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "thngId": "'$THNG_ID'" }' > payloads/deviceApiKey.json

# Parse the response to get the device API Key
THNG_API=`cat payloads/deviceApiKey.json`
THNG_API_KEY=`parse_json "$THNG_API" thngApiKey`


# Store the device API Key in our config.json file
echo '  "thngApiKey":"'$THNG_API_KEY'"' >> config.json

# Close the file
echo '}' >> config.json




#####
##### Step 4 - Let's update two properties of this thng
#####
curl -X POST "$SERVER/thngs/$THNG_ID/properties" \
     -H "Authorization: $THNG_API_KEY" \
     -H "Content-Type: application/json" \
     -d '[
        	{
	          "key": "status",
	          "value": true
	        },
	        {
	          "key": "power",
	          "value": 71
	        }
	     ]'


# Let's update this Thng a few times with random values
for i in {1..5} 
do 
	curl -X POST "$SERVER/thngs/$THNG_ID/properties" \
	     -H "Authorization: $THNG_API_KEY" \
	     -H "Content-Type: application/json" \
	     -d '[{"key": "voltage","value": '$(( $RANDOM%200 ))'},{"key": "current","value": '$(( $RANDOM%100 ))'},{"key": "power","value": '$(( $RANDOM%400 ))'}]'
	sleep 2     
done



#####
##### Section 7.4.3 - Let's use actions to control our plug
#####

# First, we create a new action type 
# NOTE: obviously, this would fail if you have already run the script and this action type already exists in your account!
curl -X POST "$SERVER/actions?project=$PROJECT_ID" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "name": "_setStatus", "description": "Changes the Status of the Thng","tags":["WoT","device"] }' > payloads/setStatus.json


# Creates a new instance of this action type (= sends a command to the device)
curl -X POST "$SERVER/actions/_setStatus?project=$PROJECT_ID" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "type": "_setStatus", "thng":"'$THNG_ID'", "customFields": {"status":false} }'

#####
##### Section 7.4.4 - Let's create a redirection for this app
#####
curl -X POST "https://tn.gg/redirections" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{ "type": "thng", "evrythngId":"'$THNG_ID'", "defaultRedirectUrl":"http://webofthings.github.io/wot-book/plug.html?thngId={evrythngId}&key='$EVRYTHNG_API_KEY'" }'
