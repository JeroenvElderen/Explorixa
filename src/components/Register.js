import React, { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient";
import "../Register.css";

export default function Register({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!formData.agree) {
      alert("Please accept the terms.");
      return;
    }

    // Email/password signup with Supabase
    const { data, error } = await supabase.auth.signUp(
      {
        email: formData.email,
        password: formData.password,
      },
      {
        data: {
          display_name: formData.name,  // This will be stored in user_metadata.display_name
        },
        // Optional: redirectTo: window.location.origin, // set redirect url if needed
      }
    );

    if (error) {
      alert("Error signing up: " + error.message);
      console.error(error);
    } else {
      alert(
        "Account created! Please check your email to confirm your account."
      );
      onClose?.();
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Create an account</h2>

        <button
          className="social-button"
          onClick={() => handleOAuthSignIn("google")}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
          />
          Sign up with Google
        </button>

        <button
          className="social-button"
          onClick={() => handleOAuthSignIn("facebook")}
        >
          <img
            src="https://www.svgrepo.com/show/475647/facebook-color.svg"
            alt="Facebook"
          />
          Sign up with Facebook
        </button>

        <button
          className="social-button"
          onClick={() => handleOAuthSignIn("apple")}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
            alt="Apple"
          />
          Sign up with Apple
        </button>

        <div className="divider">or</div>

        <form onSubmit={handleSubmit} className="register-form">
          <label>
            Full name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

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

          <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              required
            />
            I agree to the terms and conditions
          </label>

          <button type="submit" className="submit-button">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
