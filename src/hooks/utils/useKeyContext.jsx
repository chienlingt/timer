import { useContext } from "react";
import { KeyContext } from "./KeyContext";

export const useKeyContext = () => {
  return useContext(KeyContext);
};
