"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const CursorContext = createContext({
  cursorType: "default",
  setCursorType: () => {},
  magneticElements: { current: [] },
  registerMagnetic: () => {},
  unregisterMagnetic: () => {},
});

export function CursorProvider({ children }) {
  const [cursorType, setCursorType] = useState("default");
  const magneticElements = useRef([]);

  const registerMagnetic = useCallback((element, strength = 0.3) => {
    if (!magneticElements.current.find((item) => item.element === element)) {
      magneticElements.current.push({ element, strength });
    }
  }, []);

  const unregisterMagnetic = useCallback((element) => {
    magneticElements.current = magneticElements.current.filter(
      (item) => item.element !== element
    );
  }, []);

  return (
    <CursorContext.Provider
      value={{
        cursorType,
        setCursorType,
        magneticElements,
        registerMagnetic,
        unregisterMagnetic,
      }}
    >
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  return useContext(CursorContext);
}

export function useCursorHover(type = "link") {
  const { setCursorType } = useCursor();
  return {
    onMouseEnter: () => setCursorType(type),
    onMouseLeave: () => setCursorType("default"),
  };
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
