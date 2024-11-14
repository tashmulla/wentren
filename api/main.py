from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import json
from datetime import datetime

api_key = os.getenv("RDM_API_KEY")
user_agent = "curl/7.88.1"
hayes_and_harlington = "HAY"
tottenham_court_road = "TCR"
min_time_to_walk = 5

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
	url = f"https://api1.raildata.org.uk/1010-live-departure-board-dep/LDBWS/api/20220120/GetDepBoardWithDetails/{hayes_and_harlington}"

	params = {
		"filterCrs": tottenham_court_road,
		"filterType": "to",
		"timeWindow": 60,
	}
	
	headers = {
		"x-apikey": api_key,
		"User-Agent": user_agent
	}

	response = requests.get(url, headers=headers, params=params)

	if response.status_code == 200:
		data = response.json()
		
		print(data)
		
		serviceList = []
		current_time = datetime.now()
		
		for service in data['trainServices']:
			if service['etd'] == "On time":
				scheduled_time_str = service['std']
			else:
				scheduled_time_str = service['etd']
			scheduled_time = datetime.strptime(scheduled_time_str, "%H:%M")
			scheduled_time = current_time.replace(hour=scheduled_time.hour, minute=scheduled_time.minute, second=0, microsecond=0)
            
			time_diff = (scheduled_time - current_time).total_seconds() / 60
			
			if time_diff >= min_time_to_walk:
				calling_points = service['subsequentCallingPoints'][0]['callingPoint']
				stop_count = 0
				for stop in calling_points:
					stop_count += 1
					if stop['locationName'] == 'Tottenham Court Road':
						break
						
				serviceListItem = {
					'scheduledTime': service['std'],
					'estimatedTime': service['etd'],
					'numberOfStops': stop_count,
					'destination': service['destination'][0]['locationName'],
					'origin': service['origin'][0]['locationName'],
				}
				
				serviceList.append(serviceListItem)
		return serviceList
	else:
		return {"error": f"Error {response.status_code}: {response.text}"}
