import { AddressFormData } from '../types';
import { getEnvironmentVariable } from './api';

interface GeocodeResult {
  longitude: string;
  latitude: string;
}

let cachedKey: string | null = null;

async function getAzureMapsKey() {
  if (!cachedKey) {
    cachedKey = await getEnvironmentVariable('AZURE_MAPS_KEY');
  }
  return cachedKey;
}

export async function searchAddress(query: string): Promise<AddressFormData[]> {
  try {
    const apiKey = await getAzureMapsKey();
    if (!apiKey) {
      console.warn('Azure Maps API key not configured, returning empty results');
      return [];
    }

    const response = await fetch(
      `https://atlas.microsoft.com/search/address/json?` +
      `subscription-key=${apiKey}&` +
      `api-version=1.0&` +
      `language=en-US&` +
      `query=${encodeURIComponent(query)}&` +
      `limit=5`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address suggestions');
    }

    const data = await response.json();
    
    return data.results.map((result: AzureMapsResult) => ({
      street: `${result.address.streetNumber} ${result.address.streetName}`.trim(),
      city: result.address.municipality,
      state: result.address.countrySubdivision,
      zip_code: result.address.postalCode,
      country: result.address.country
    }));
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return [];
  }
}

export async function validateAddress(address: AddressFormData): Promise<boolean> {
  try {
    const apiKey = await getAzureMapsKey();
    if (!apiKey) {
      console.warn('Azure Maps API key not configured, skipping validation');
      return true;
    }

    const query = `${address.street}, ${address.city}, ${address.state} ${address.zip_code}`;
    const response = await fetch(
      `https://atlas.microsoft.com/search/address/json?` +
      `subscription-key=${apiKey}&` +
      `api-version=1.0&` +
      `language=en-US&` +
      `query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.results.length > 0;
  } catch (error) {
    console.error('Error validating address:', error);
    return true;
  }
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  try {
    const apiKey = await getAzureMapsKey();
    if (!apiKey) {
      console.warn('Azure Maps API key not configured');
      return null;
    }

    const response = await fetch(
      `https://atlas.microsoft.com/search/address/json?` +
      `subscription-key=${apiKey}&` +
      `api-version=1.0&` +
      `language=en-US&` +
      `query=${encodeURIComponent(address)}&` +
      `limit=1`
    );

    if (!response.ok) {
      throw new Error('Failed to geocode address');
    }

    const data = await response.json();
    if (!data.results?.[0]?.position) {
      return null;
    }

    // Get the most accurate result (first one)
    const result = data.results[0];
    const { lon, lat } = result.position;

    // Validate coordinates
    if (typeof lon !== 'number' || typeof lat !== 'number' ||
        isNaN(lon) || isNaN(lat) ||
        lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      console.error('Invalid coordinates returned from geocoding:', { lon, lat });
      return null;
    }

    return {
      longitude: lon.toString(),
      latitude: lat.toString()
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

interface AzureMapsResult {
  address: {
    streetNumber: string;
    streetName: string;
    municipality: string;
    countrySubdivision: string;
    postalCode: string;
    country: string;
    freeformAddress: string;
  };
}