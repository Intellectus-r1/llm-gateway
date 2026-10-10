import { useState } from "react";
import { AuthContext } from "./AuthContext.js";
import { loginUser } from "../services/api";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email, password) => {
    const data = await loginUser(email, password);

    localStorage.setItem("token", data.token);

    const userData = {
      userId: data.userId,
      name: data.name,
      email: data.email,
    };

    localStorage.setItem("user", JSON.stringify(userData));

    setToken(data.token);
    setUser(userData);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}