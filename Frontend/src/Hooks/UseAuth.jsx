import { useContext } from "react";
import { AuthContext } from "../Provider/ContextProvider";

const UseAuth = () => {
  const auth = useContext(AuthContext);
  return auth;
};

export default UseAuth;
