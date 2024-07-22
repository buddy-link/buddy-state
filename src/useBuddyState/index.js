import { useEffect, useState, useMemo } from "react";
import { nanoid } from "../vendor";
import { getStateInstance } from "../initBuddyState";

/**
 * Custom hook to subscribe and interact with a global state using a unique key and an optional selector function.
 * @param {string} key The key to identify the particular state to subscribe to.
 * @param {Function} [selector] An optional function to transform or select a part of the state.
 * @returns An array containing the selected state value and a function to update the source state.
 */

export const useBuddyState = (key, selector) => {
  const uniqueId = nanoid(); // Generates a unique ID for the subscription.
  const stateInstance = getStateInstance(); // Retrieves the global state instance.
  const source = stateInstance.getSource(key); // Retrieves the source observable based on the key.

  // State to hold the value from the observable source.
  const [value, setValue] = useState(source?.getValue());

  // Observer object to interact with the observable source.
  const observer = useMemo(() => ({
    id: uniqueId,
    /**
       * @param {any} nextValue
     */
    next(nextValue) {
      setValue(nextValue); // Updates state value when observable pushes new values.
    },
    complete() {
      setValue(undefined); // Resets state value when observable is completed.
    },
  }), [uniqueId]);

  // useEffect hook to subscribe to the source on mount and unsubscribe on unmount.
  useEffect(() => {
    source?.subscribe(observer);
    return () => source?.unsubscribe(observer.id);
  }, [source, observer]);

  // Function to update the observable source's value.
  const updateSource = (/** @type {(arg0: any) => any} */ nextValue) => {
    if (typeof nextValue === 'function') {
      source?.next(nextValue(source.getValue()))
    } else {
      source?.next(nextValue)
    }
  };

  // useMemo hook to apply the selector function to the state value if provided.
  const selectedValue = useMemo(
    () => selector ? selector(value) : value,
    [value, selector]
  );

  return [selectedValue, updateSource];
};
