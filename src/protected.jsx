import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import BackgroundWrapper from "./background"; // For a consistent loading screen background

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      // Check for an active session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        // No user logged in, redirect to login
        navigate("/login");
        return;
      }

      if (adminOnly) {
        // If the route is for admins only, we must check the role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile?.role === "admin") {
          setIsAuthorized(true);
        } else {
          // Not an admin, redirect to dashboard
          alert("Access Denied: Administrator access required.");
          navigate("/dashboard");
        }
      } else {
        // If it's a regular protected route, just being logged in is enough
        setIsAuthorized(true);
      }

      setLoading(false);
    };

    checkUser();
  }, [navigate, adminOnly]);

  // Show a loading screen while we verify authentication
  if (loading) {
    return (
      <BackgroundWrapper>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            color: "#fff",
            fontSize: "2rem",
            fontFamily: "'Exo 2', sans-serif",
          }}
        >
          Verifying Access...
        </div>
      </BackgroundWrapper>
    );
  }

  // If authorized, render the child component (the actual page)
  return isAuthorized ? children : null;
};

export default ProtectedRoute;
