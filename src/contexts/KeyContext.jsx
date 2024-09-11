import { createContext, useState } from "react";
import PropTypes from "prop-types";

const KeyContext = createContext();

export const KeyProvider = ({ children }) => {
  const [toggleKeyOne, setToggleKeyOne] = useState("q"); // Default toggle key
  const [toggleKeyTwo, setToggleKeyTwo] = useState("w"); // Default toggle key
  const [restartKey, setRestartKey] = useState("R"); // Default restart key
  const [switchKey, setSwitchKey] = useState("a"); // Default switch key

  return (
    <KeyContext.Provider
      value={{
        toggleKeyOne,
        setToggleKeyOne,
        toggleKeyTwo,
        setToggleKeyTwo,
        restartKey,
        setRestartKey,
        switchKey,
        setSwitchKey,
      }}
    >
      {children}
    </KeyContext.Provider>
  );
};

KeyProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
