"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var src_exports = {};
__export(src_exports, {
  initBuddyState: () => initBuddyState,
  useBuddyState: () => useBuddyState
});
module.exports = __toCommonJS(src_exports);

// src/useBuddyState/index.js
var import_nanoid = require("nanoid");
var import_react = require("react");
var useBuddyState = (key, selector) => {
  const uniqueId = (0, import_nanoid.nanoid)();
  const stateInstance = getStateInstance();
  const source = stateInstance.getSource(key);
  const [value, setValue] = (0, import_react.useState)(source == null ? void 0 : source.getValue());
  const observer = (0, import_react.useMemo)(() => ({
    complete() {
      setValue(void 0);
    },
    id: uniqueId,
    next(nextValue) {
      setValue(nextValue);
    }
  }), [uniqueId]);
  (0, import_react.useEffect)(() => {
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
  const selectedValue = (0, import_react.useMemo)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  initBuddyState,
  useBuddyState
});
