import React, { useState } from "react";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";

const LayerContext: AnyTodo = React.createContext({});

const LayerContextProvider = ({ children }: AnyTodo) => {
  const [point, setPoint] = useState([0, 0]);

  const defaultValue = {
    point,
    setPoint,
  };

  return <LayerContext.Provider value={defaultValue}>{children}</LayerContext.Provider>;
};

export { LayerContext, LayerContextProvider };
