"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";

const CursorContext = createContext({
  cursorType: "default",
  setCursorType: () => {},
  targetElementRef: { current: null },
  setCursorTarget: () => {},
  magneticElementsRef: { current: [] },
  registerMagnetic: () => {},
  unregisterMagnetic: () => {},
});

export function CursorProvider({ children }) {
  const [cursorType, setCursorType] = useState("default");
  const targetElementRef = useRef(null);
  const magneticElementsRef = useRef([]);

  // Consumers read the ref inside the rAF loop but must not write to it —
  // the write lives here, next to the useRef that owns it.
  const setCursorTarget = useCallback((element) => {
    targetElementRef.current = element;
  }, []);

  const registerMagnetic = useCallback((element, strength = 0.3) => {
    if (!magneticElementsRef.current.find((item) => item.element === element)) {
      magneticElementsRef.current.push({ element, strength });
    }
  }, []);

  const unregisterMagnetic = useCallback((element) => {
    magneticElementsRef.current = magneticElementsRef.current.filter(
      (item) => item.element !== element
    );
  }, []);

  const value = useMemo(
    () => ({
      cursorType,
      setCursorType,
      targetElementRef,
      setCursorTarget,
      magneticElementsRef,
      registerMagnetic,
      unregisterMagnetic,
    }),
    [cursorType, setCursorTarget, registerMagnetic, unregisterMagnetic]
  );

  return (
    <CursorContext.Provider value={value}>{children}</CursorContext.Provider>
  );
}

export function useCursor() {
  return useContext(CursorContext);
}

export function useCursorHover(type = "link") {
  const { setCursorType, setCursorTarget } = useCursor();

  return useMemo(
    () => ({
      onMouseEnter: (e) => {
        setCursorType(type);
        setCursorTarget(e.currentTarget);
      },
      onMouseLeave: () => {
        setCursorType("default");
        setCursorTarget(null);
      },
    }),
    [type, setCursorType, setCursorTarget]
  );
}

export function useMagnetic(strength = 0.3) {
  const ref = useRef(null);
  const { registerMagnetic, unregisterMagnetic } = useCursor();

  useEffect(() => {
    const el = ref.current;
    if (el) {
      registerMagnetic(el, strength);
    }
    return () => {
      if (el) unregisterMagnetic(el);
    };
  }, [strength, registerMagnetic, unregisterMagnetic]);

  return ref;
}
