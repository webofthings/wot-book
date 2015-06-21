#!/bin/bash          
## This file is a set of cURL requests used in Chapter 7 of the Book "Building the Web of Things" by Guinard & Trifa (bit.ly/wotbook)
SERVER="https://api.evrythng.com"
[ -z "$EVRYTHNG_API_KEY" ] && EVRYTHNG_API_KEY="PUT-YOUR-OPERATOR-API-KEY-HERE"

# Ultra basic script to extract json content
function parse_json()
{
    echo $1 | \
    sed -e 's/[{}]/''/g' | \
    sed -e 's/", "/'\",\"'/g' | \
    sed -e 's/" ,"/'\",\"'/g' | \
    sed -e 's/" , "/'\",\"'/g' | \
    sed -e 's/","/'\"---SEPERATOR---\"'/g' | \
    awk -F=':' -v RS='---SEPERATOR---' "\$1~/\"$2\"/ {print}" | \
    sed -e "s/\"$2\"://" | \
    tr -d "\n\t" | \
    sed -e 's/\\"/"/g' | \
    sed -e 's/\\\\/\\/g' | \
    sed -e 's/^[ \t]*//g' | \
    sed -e 's/^"//'  -e 's/"$//'
}


# Create a config.json file
echo "{" > config.json
echo '  "operatorApiKey":"'$EVRYTHNG_API_KEY'",' >> config.json

# Create a Project
curl -X POST "$SERVER/projects" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "name": "Web of Things Book", "description": "My First WoT Project" }' > project.json

PROJECT=`cat project.json`
PROJECT_ID=`parse_json "$PROJECT" id`

echo "Created Project ID: $PROJECT_ID"
echo "RESULT: $PROJECT"

echo '  "projectId":"'$PROJECT_ID'",' >> config.json

# Create a Custom Action in this project
curl -X POST "$SERVER/actions?project=$PROJECT_ID" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "name": "_setStatus", "description": "Changes the Status of the Thng","tags":["WoT","device"] }' > setStatus.json


# Create a Product
curl -X POST "$SERVER/products?project=$PROJECT_ID" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "fn": "WoT Smart Plug", "description": "A Web-connected Smart Plug","tags":["WoT","device","energy"],"photos":["https://cdn1.vox-cdn.com/thumbor/pMsZTT_Oci8Y_0MHX0nuzSXc9vQ=/cdn0.vox-cdn.com/uploads/chorus_asset/file/2905920/iSP5_1_.0.jpg"] }' > product.json

PRODUCT=`cat product.json`
PRODUCT_ID=`parse_json "$PRODUCT" id`

echo "Created Product ID: $PRODUCT_ID"
echo "RESULT: $PRODUCT"
echo '  "productId":"'$PRODUCT_ID'",' >> config.json


# Find this product in this project - You should see your product here
curl -X GET "$SERVER/products/$PRODUCT_ID?project=$PROJECT_ID" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Accept: application/json" 


# Create a Thng
curl -X POST "$SERVER/thngs?project=$PROJECT_ID" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "name": "My WoT Plug", "product":"'$PRODUCT_ID'", "description": "My own Smart Plug","tags":["WoT","device","plug","energy"] }' > thng.json


THNG=`cat thng.json`
THNG_ID=`parse_json "$THNG" id`

echo "Created Thng ID: $THNG_ID"
echo "RESULT: $THNG"
echo '  "thngId":"'$THNG_ID'",' >> config.json


# Now we create an application within this project
curl -X POST "$SERVER/projects/$PROJECT_ID/applications" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "name": "My Awesome WoT App", "description": "My First WoT Client Application","tags":["WoT","device","plug","energy"], "socialNetworks": {} }' > app.json


APP=`cat app.json`
APP_ID=`parse_json "$APP" id`
APP_API_KEY=`parse_json "$APP" appApiKey`

echo "Created App ID: $APP_ID"
echo "RESULT: $APP"
echo '  "appId":"'$APP_ID'",' >> config.json
echo '  "appApiKey":"'$APP_API_KEY'",' >> config.json

# Let's now create a device API Key
curl -X POST "$SERVER/auth/evrythng/thngs" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "thngId": "'$THNG_ID'" }' > deviceApiKey.json

THNG_API=`cat deviceApiKey.json`
THNG_API_KEY=`parse_json "$THNG_API" thngApiKey`

echo '  "thngApiKey":"'$THNG_API_KEY'"' >> config.json

# Close the file
echo '}' >> config.json


# Let's update two properties of this thng.
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



# Let's update this thng a few times with random values
for i in {1..5} 
do 
	curl -X POST "$SERVER/thngs/$THNG_ID/properties" \
	     -H "Authorization: $THNG_API_KEY" \
	     -H "Content-Type: application/json" \
	     -d '[{"key": "voltage","value": '$(( $RANDOM%200 ))'},{"key": "current","value": '$(( $RANDOM%100 ))'},{"key": "power","value": '$(( $RANDOM%400 ))'}]'
	sleep 2     
done


# Creates a new instance of this action type (= sends a command to the device)
curl -X POST "$SERVER/actions/_setStatus?project=$PROJECT_ID" \
     -H "Authorization: $EVRYTHNG_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "type": "_setStatus", "thng":"'$THNG_ID'", "customFields": {"status":false} }'
