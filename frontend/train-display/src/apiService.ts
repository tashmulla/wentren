export const fetchTrainDetails = async () => {
	try {
		const response = await fetch('http://localhost:8000/journeys');
		if (!response.ok) {
			throw new Error(`Error: ${response.statusText}`);
		}
		return response.json();
	} catch (error) {
		console.error('Failed to fetch train details: ', error);
	}
};
