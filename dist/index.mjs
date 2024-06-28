// src/useBuddyState/index.js
import { nanoid } from "nanoid";
import { useEffect, useMemo, useState } from "react";
var useBuddyState = (key, selector) => {
  const uniqueId = nanoid();
  const stateInstance = getStateInstance();
  const source = stateInstance.getSource(key);
  const [value, setValue] = useState(source == null ? void 0 : source.getValue());
  const observer = useMemo(() => ({
    complete() {
      setValue(void 0);
    },
    id: uniqueId,
    next(nextValue) {
      setValue(nextValue);
    }
  }), [uniqueId]);
  useEffect(() => {
    source == null ? void 0 : source.subscribe(observer);
    return () => source == null ? void 0 : source.unsubscribe(observer.id);
  }, [source, observer]);
  const updateSource = (nextValue) => {
    if (typeof nextValue === "function") {
      source == null ? void 0 : source.next(nextValue(source.getValue()));
    } else {
      source == null ? void 0 : source.next(nextValue);
    }
  };
  const selectedValue = useMemo(
    () => selector ? selector(value) : value,
    [value, selector]
  );
  return [selectedValue, updateSource];
};

// src/initBuddyState/index.js
var globalStateInstance = null;
var Observable = (initialValue) => {
  let value = initialValue;
  let subscriptions = /* @__PURE__ */ new Map();
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
var createEventBus = (initialState) => {
  const observables = /* @__PURE__ */ new Map();
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
var initBuddyState = (initialState) => {
  if (!globalStateInstance) {
    console.log("Initializing Buddy State");
    globalStateInstance = createEventBus({
      init(observables) {
        Object.keys(initialState).forEach((key) => {
          observables.set(key, Observable(initialState[key]));
        });
      }
    });
  } else {
    console.warn("State has already been initialized.");
  }
};
var getStateInstance = () => {
  if (!globalStateInstance) {
    throw new Error("State has not been initialized. Please initialize state at the root of your application.");
  }
  return globalStateInstance;
};
export {
  initBuddyState,
  useBuddyState
};
