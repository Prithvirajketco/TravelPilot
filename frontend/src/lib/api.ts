const API_BASE_URL = 'http://127.0.0.1:8000';

export async function planTrip(city: string, constraints: any) {
  const response = await fetch(`${API_BASE_URL}/trips/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ city, constraints }),
  });
  if (!response.ok) {
    throw new Error('Failed to plan trip');
  }
  return response.json();
}
