import { create } from 'zustand';

interface TripState {
  city: string;
  budget: number;
  days: number;
  itinerary: any[];
  setTripConstraints: (city: string, budget: number, days: number) => void;
  setItinerary: (itinerary: any[]) => void;
}

export const useTripStore = create<TripState>((set) => ({
  city: 'Rome',
  budget: 500,
  days: 5,
  itinerary: [],
  setTripConstraints: (city, budget, days) => set({ city, budget, days }),
  setItinerary: (itinerary) => set({ itinerary }),
}));
