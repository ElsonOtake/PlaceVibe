// Source: Google Maps Platform Code Assist
import { useEffect, useRef, useState, useMemo } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export type UseAutocompleteSuggestionsReturn = {
  suggestions: google.maps.places.AutocompleteSuggestion[];
  isLoading: boolean;
  resetSession: () => void;
};

/**
 * Reusable hook using Places API (New) AutocompleteSuggestion with AutocompleteSessionToken.
 * Complies with React 19 rules without synchronous setState in effect body.
 */
export function useAutocompleteSuggestions(
  inputString: string
): UseAutocompleteSuggestionsReturn {
  const placesLib = useMapsLibrary('places');

  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const [rawSuggestions, setRawSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isInputValid = Boolean(inputString && inputString.trim().length >= 2);

  const suggestions = useMemo(() => {
    return isInputValid ? rawSuggestions : [];
  }, [isInputValid, rawSuggestions]);

  useEffect(() => {
    if (!placesLib || !isInputValid) {
      return;
    }

    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    const request: google.maps.places.AutocompleteRequest = {
      input: inputString,
      sessionToken: sessionTokenRef.current,
    };

    let isCurrent = true;
    Promise.resolve().then(() => {
      if (isCurrent) setIsLoading(true);
    });

    AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
      .then((res: { suggestions?: google.maps.places.AutocompleteSuggestion[] }) => {
        if (isCurrent) {
          setRawSuggestions(res?.suggestions || []);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isCurrent) {
          console.error('Error fetching autocomplete suggestions:', err);
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [placesLib, inputString, isInputValid]);

  return {
    suggestions,
    isLoading: isInputValid ? isLoading : false,
    resetSession: () => {
      sessionTokenRef.current = null;
      setRawSuggestions([]);
    },
  };
}
