import React, { useState, useEffect } from 'react';
import { fetchTrainDetails } from './apiService';
import './App.css'; // Ensure you import the CSS file

interface Train {
	startTime: string;
	destination: string;
	numberOfStops: number;
	duration: number;
	timeUntil?: number;
}

const TrainList: React.FC = () => {
	const [trains, setTrains] = useState<Train[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [currentTime, setCurrentTime] = useState<Date>(new Date());

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const loadTrainData = () => {
		fetchTrainDetails()
		  .then((data) => {
			if (data) {
			  const updatedTrains = data.map((train: Train) => {
				const trainTime = new Date(train.startTime);
				const timeDiff = Math.floor((trainTime.getTime() - currentTime.getTime()) / 60000);
				return { ...train, timeUntil: timeDiff };
			  });
			  setTrains(updatedTrains);
			}
		  })
		  .catch((error) => setError(error.message));
	};

	useEffect(() => {
	loadTrainData();

	const dataInterval = setInterval(() => {
		loadTrainData();
	}, 60000);

	return () => clearInterval(dataInterval);
	}, [currentTime]);

	const formatTime = (dateTime: string) => {
	const date = new Date(dateTime);
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	return (
	<>
	  <div className="current-time">
		{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
	  </div>
	  {error && <div>Error: {error}</div>}
	  {!error && !trains.length && <div>Loading...</div>}
	  {trains.length > 0 && (
		<ul>
		  {trains.map((train, index) => (
			<li key={index}>
			  <div className="train-time">{formatTime(train.startTime)}</div>
			  <div className="train-info">
				{train.timeUntil} mins away - {train.numberOfStops} stops - {train.duration} mins journey - <span className="train-destination">{train.destination}</span>
			  </div>
			</li>
		  ))}
		</ul>
	  )}
	</>
	);
};

export default TrainList;
