import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get("/users");
        setUsers(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {users.map((user: any) => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>
    </div>
  );
}