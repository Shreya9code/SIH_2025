// Dashboard.jsx
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState("");
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;

    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }

    const saveUserToDB = async () => {
      hasRunRef.current = true;

      try {
        const email = user.primaryEmailAddress?.emailAddress;
        const username = user.username || `${user.firstName} ${user.lastName}`;
        const clerkId = user.id;

        if (!email) {
          setDbStatus("No email found in user object");
          setLoading(false);
          return;
        }

        setDbStatus("Checking if user exists in database...");

        // Check if user already exists in DB
        const checkResponse = await axios.post(
          "https://nrityalens-backend.onrender.com/api/users/check",
          { email }
        );

        if (!checkResponse.data.exists) {
          setDbStatus("Creating new user in database...");

          // Store user in MongoDB
          await axios.post("https://nrityalens-backend.onrender.com/api/users/register", {
            clerkId,
            name: username,
            email,
            password: "clerk_placeholder",
            role: "user",
          });

          setDbStatus("User successfully saved to database!");
        } else {
          setDbStatus("User already exists in database");
        }
      } catch (err) {
        // Handle duplicate key errors gracefully
        if (err.response?.data?.error?.includes("duplicate key error")) {
          setDbStatus("User already exists in database");
        } else {
          setDbStatus(`Error: ${err.response?.data?.message || err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      saveUserToDB();
    } else {
      setLoading(false);
    }
  }, [user, isSignedIn, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold">
        Welcome, {user?.firstName || user?.username} 👋
      </h1>
      <p className="mt-4">This is your Dashboard.</p>
      <p className="mt-2 text-gray-600">
        Email: {user?.primaryEmailAddress?.emailAddress}
      </p>
      <p className="mt-2 text-gray-600">User ID: {user?.id}</p>

      {/* Database Status */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold">Database Status:</h3>
        <p
          className={
            dbStatus.includes("Error") ? "text-red-600" : "text-green-600"
          }
        >
          {dbStatus}
        </p>
      </div>

      {dbStatus.includes("successfully") && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800">✅ Success!</h3>
          <p className="text-green-700">
            Your user account has been created in the database.
          </p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;