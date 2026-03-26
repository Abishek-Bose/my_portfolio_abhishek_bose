"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const CursorContext = createContext({
  cursorType: "default",
  setCursorType: () => {},
  targetElement: { current: null },
  magneticElements: { current: [] },
  registerMagnetic: () => {},
  unregisterMagnetic: () => {},
});

export function CursorProvider({ children }) {
  const [cursorType, setCursorType] = useState("default");
  const targetElement = useRef(null);
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
        targetElement,
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
  const { setCursorType, targetElement } = useCursor();
  return {
    onMouseEnter: (e) => {
      setCursorType(type);
      targetElement.current = e.currentTarget;
    },
    onMouseLeave: () => {
      setCursorType("default");
      targetElement.current = null;
    },
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
