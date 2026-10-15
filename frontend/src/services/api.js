const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/$/, "");

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const text = await response.text();

  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Invalid email or password"
    );
  }

  return data;
};

export const getUsageSummary = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/usage/summary`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch usage summary");
  }

  return response.json();
};

export const getHealthStatus = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/monitoring/health`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch health status");
  }

  return response.json();
};

export const getProviderUsage = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/usage/providers`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch provider usage");
  }

  return response.json();
};

export const sendChatMessage = async (message, model) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      model: model || "",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to send message");
  }

  return data;
};

export const getApiKeys = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/api-keys`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch API keys");
  }

  return response.json();
};

export const createApiKey = async (name) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/api-keys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create API key");
  }

  return data;
};

export const revokeApiKey = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/api-keys/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to revoke API key");
  }

  return true;
};


export const getUsageHistory = async (from, to) => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();

    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const query = params.toString();
    const url = `${API_BASE_URL}/api/usage/history${query ? `?${query}` : ""}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch usage history");
    }

    return response.json();
};


export const getProviderHealth = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/api/monitoring/providers`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch provider health");
  }

  return response.json();
};

export const registerUser = async (name, email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const text = await response.text();

  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Registration failed"
    );
  }

  return data;
};