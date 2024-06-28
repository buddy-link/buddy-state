import { nanoid } from 'nanoid';
import { useState, useMemo, useEffect } from 'react';

/**
 * Custom hook to subscribe and interact with a global state using a unique key and an optional selector function.
 * @param {string} key The key to identify the particular state to subscribe to.
 * @param {Function} [selector] An optional function to transform or select a part of the state.
 * @returns An array containing the selected state value and a function to update the source state.
 */

const useBuddyState = (key, selector) => {
  const uniqueId = nanoid(); // Generates a unique ID for the subscription.
  const stateInstance = getStateInstance(); // Retrieves the global state instance.
  const source = stateInstance.getSource(key); // Retrieves the source observable based on the key.

  // State to hold the value from the observable source.
  const [value, setValue] = useState(source?.getValue());

  // Observer object to interact with the observable source.
  const observer = useMemo(() => ({
    complete() {
      setValue(undefined); // Resets state value when observable is completed.
    },
    id: uniqueId,
    next(nextValue) {
      setValue(nextValue); // Updates state value when observable pushes new values.
    },
  }), [uniqueId]);

  // useEffect hook to subscribe to the source on mount and unsubscribe on unmount.
  useEffect(() => {
    source?.subscribe(observer);
    return () => source?.unsubscribe(observer.id);
  }, [source, observer]);

  // Function to update the observable source's value.
  const updateSource = (nextValue) => {
    if (typeof nextValue === 'function') {
      source?.next(nextValue(source.getValue()));
    } else {
      source?.next(nextValue);
    }
  };

  // useMemo hook to apply the selector function to the state value if provided.
  const selectedValue = useMemo(
    () => selector ? selector(value) : value,
    [value, selector]
  );

  return [selectedValue, updateSource];
};

let globalStateInstance = null;

/**
 * Factory function to create an Observable.
 * @param {*} initialValue The initial value of the Observable.
 * @returns An object representing the observable with methods to subscribe, unsubscribe, push next values, complete the observable, and get the current value.
 */
const Observable = (initialValue) => {
  let value = initialValue;
  let subscriptions = new Map();

  return {
    complete() {
      subscriptions.forEach((observer) => observer.complete());
      subscriptions.clear();
    },
    getValue() {
      return value;
    },
    next(nextValue) {
      value = nextValue;
      subscriptions.forEach((observer) => observer.next(nextValue));
    },
    subscribe(observer) {
      const { id } = observer;
      subscriptions.set(id, observer);
      observer.next(value);
    },
    unsubscribe(id) {
      subscriptions.delete(id);
    }
  };
};

/**
 * Creates an event bus with a given initial state.
 * @param {Object} initialState The initial state for the event bus.
 * @returns An object representing the event bus with methods to get source, update values, and access the observables.
 */
const createEventBus = (initialState) => {
  const observables = new Map();
  initialState.init(observables);

  return {
    getSource(id) {
      const next_source = observables.get(id);
      if (!next_source) console.log(`Could not find buddyState for ${id}, please add to initialState`);
      return next_source;
    },
    observables,
    update(id, value) {
      const observable = observables.get(id);
      if (observable) {
        observable.next(value);
      } else {
        const newObservable = Observable(value);
        observables.set(id, newObservable);
        newObservable.next(value);
      }
    }
  };
};

/**
 * Initializes the global state with the provided initial state.
 * @param {Object} initialState The initial state object.
 */
const initBuddyState = (initialState) => {
  if (!globalStateInstance) {
    console.log('Initializing Buddy State');
    globalStateInstance = createEventBus({
      init(observables) {
        Object.keys(initialState).forEach((key) => {
          observables.set(key, Observable(initialState[key]));
        });
      },
    });
  } else {
    console.warn("State has already been initialized.");
  }
};

/**
 * Returns the global state instance.
 * @returns The global state instance.
 * @throws If the state has not been initialized.
 */
const getStateInstance = () => {
  if (!globalStateInstance) {
    throw new Error("State has not been initialized. Please initialize state at the root of your application.");
  }
  return globalStateInstance;
};

export { initBuddyState, useBuddyState };
