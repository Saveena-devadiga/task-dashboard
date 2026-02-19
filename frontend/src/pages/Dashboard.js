import { useState, useEffect } from "react";
import API from "../api"; // make sure axios is configured with baseURL
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [user, setUser] = useState({ name: "", email: "" });

  const navigate = useNavigate();

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Axios config with JWT
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch user profile
  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/profile", config);
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      // If token expired/invalid, redirect to login
      logout();
    }
  };

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks", config);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Add task
  const addTask = async () => {
    if (!title) return;

    try {
      await API.post(
        "/tasks",
        { title, description },
        config
      );
      setTitle("");
      setDescription("");
      fetchTasks();
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`, config);
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Filter tasks based on search
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!token) navigate("/login"); // if no token, redirect
    fetchUser();
    fetchTasks();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={{ margin: 0 }}>✨ Task Dashboard</h2>
            <p style={{ margin: "2px 0 0", color: "#555" }}>
              Welcome, {user.name || "User"} ({user.email || "No Email"})
            </p>
          </div>
          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>

        {/* Add Task */}
        <div style={styles.inputSection}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            style={styles.input}
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            style={styles.input}
          />
          <button style={styles.addBtn} onClick={addTask}>
            Add
          </button>
        </div>

        {/* Search */}
        <div style={styles.searchSection}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            style={styles.input}
          />
        </div>

        {/* Task List */}
        <div style={{ marginTop: "20px" }}>
          {filteredTasks.length === 0 ? (
            <p style={{ textAlign: "center", color: "gray" }}>
              No tasks found
            </p>
          ) : (
            filteredTasks.map((task) => (
              <div key={task._id} style={styles.taskItem}>
                <div>
                  <strong>{task.title}</strong>
                  {task.description && (
                    <p style={{ margin: 0, fontSize: "12px", color: "#555" }}>
                      {task.description}
                    </p>
                  )}
                </div>
                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteTask(task._id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "50px 0",
    fontFamily: "Arial, sans-serif",
    minHeight: "100vh",
  },
  card: {
    background: "#ffffff",
    padding: "30px",
    width: "500px",
    borderRadius: "15px",
    boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  logoutBtn: {
    backgroundColor: "#ff4d4d",
    border: "none",
    padding: "8px 14px",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  inputSection: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },
  searchSection: {
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  addBtn: {
    backgroundColor: "#667eea",
    border: "none",
    padding: "10px 18px",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  taskItem: {
    background: "#f9f9f9",
    padding: "12px 15px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    alignItems: "center",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  deleteBtn: {
    backgroundColor: "#ff6b6b",
    border: "none",
    padding: "6px 12px",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
