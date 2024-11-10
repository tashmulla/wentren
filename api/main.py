from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import json
from datetime import datetime

app_key = os.getenv("TFL_APP_KEY")

hayes_and_harlington = "910GHAYESAH"
tottenham_court_road = "940GZZLUTCR"
min_time_to_walk = 6

app = FastAPI()

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:5173"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
	)

@app.get("/journeys")
def get_journey_list():
	url = f"https://api.tfl.gov.uk/Journey/JourneyResults/{hayes_and_harlington}/to/{tottenham_court_road}"

	params = {
		"app_key": app_key,
		"useRealTimeLiveArrivals": "true"
	}

	response = requests.get(url, params=params)

	if response.status_code == 200:
		data = response.json()
		
		print(json.dumps(data, indent=2))
		
		journeyInfoList = []
		current_time = datetime.now()
		
		for journey in data['journeys']:
			start_time = datetime.fromisoformat(journey['startDateTime'].replace('Z', '+00:00'))
			time_diff = (start_time - current_time).total_seconds() / 60
			
			if time_diff >= min_time_to_walk:
				journeyInfoItem = {
					'startTime': journey['startDateTime'],
					'numberOfStops': len(journey['legs'][0]['path']['stopPoints']),
					'destination': journey['legs'][0]['routeOptions'][0]['directions'][0],
					'duration': journey['duration'],
				}
			
				journeyInfoList.append(journeyInfoItem)
			
		return journeyInfoList
	else:
		return {"error": f"Error {response.status_code}: {response.text}"}
