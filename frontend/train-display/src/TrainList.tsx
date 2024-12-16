import React, { useState, useEffect } from 'react';
import { fetchTrainDetails } from './apiService';
import './App.css';

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
                if (data && data.length) {
                    const updatedTrains = data.map((train: Train) => {
                        const timeToUse = train.estimatedTime !== 'On time' ? train.estimatedTime : train.scheduledTime;
                        const trainTime = new Date();
                        const [hours, minutes] = timeToUse.split(':').map(Number);
                        trainTime.setHours(hours, minutes, 0, 0);

                        const timeDiff = Math.floor((trainTime.getTime() - currentTime.getTime()) / 60000);
                        return { ...train, timeUntil: isNaN(timeDiff) ? null : timeDiff };
                    })
                    .filter((train) => train.timeUntil !== null && train.timeUntil >= -0.5);
                    
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

    const renderTrainDetails = (train: Train) => {
        const isDelayed = train.estimatedTime !== 'On time';
        return (
            <div className="train-details">
                <span className={`train-status ${isDelayed ? 'delayed' : 'on-time'}`}>
                    {isDelayed ? 'Delayed' : 'On Time'}
                </span>
                {' / '}
                <span className="train-scheduled-time">{train.scheduledTime}</span>
                {isDelayed && (
                    <>
                        {' / '}
                        <span className="train-estimated-time">{train.estimatedTime}</span>
                    </>
                )}
                {' / '}
                <span className="train-time-until">{train.timeUntil} mins away</span>
                {' / '}
                <span className="train-duration">{train.duration} mins</span>
            </div>
        );
    };

    return (
        <div className="train-list-container">
            <div className="current-time">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            {error && <div>Error: {error}</div>}
            {!error && !trains.length && <div>Loading...</div>}
            {trains && trains.length > 0 && (
                <ul>
                    {trains.map((train, index) => (
                        <li
                            key={index}
                            className={`train-item ${train.timeUntil !== null && train.timeUntil < 5 ? 'soon-arrival' : ''}`}
                        >
                            <div className="train-info">
                                <div className="train-header">
                                    <span className="train-destination">
                                        {train.destination} ({train.origin})
                                    </span>
                                    <span className="train-stops"> - {train.numberOfStops} stops</span>
                                </div>
                                {renderTrainDetails(train)}
                            </div>
                            <hr className="train-divider" />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TrainList;
