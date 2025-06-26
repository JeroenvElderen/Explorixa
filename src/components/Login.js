import React, { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient";
import "../Register.css"; // You can reuse the same styles or create a separate Login.css

export default function Login({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleOAuthSignIn = async (provider) => {
    console.log("OAuth sign in with:", provider);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      alert("OAuth error: " + error.message);
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      alert("Error logging in: " + error.message);
      console.error(error);
    } else {
      alert("Successfully logged in!");
      onClose?.();
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Login to your account</h2>

        <button
          className="social-button"
          onClick={() => handleOAuthSignIn("google")}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
          />
          Sign in with Google
        </button>

        <button
          className="social-button"
          onClick={() => handleOAuthSignIn("facebook")}
        >
          <img
            src="https://www.svgrepo.com/show/475647/facebook-color.svg"
            alt="Facebook"
          />
          Sign in with Facebook
        </button>

        <button
          className="social-button"
          onClick={() => handleOAuthSignIn("apple")}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
            alt="Apple"
          />
          Sign in with Apple
        </button>

        <div className="divider">or</div>

        <form onSubmit={handleSubmit} className="register-form">
          <label>
            Email Address
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="submit-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
