import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidenav from "examples/Sidenav"; // update path accordingly
import FlyoutMenu from "../examples/flyout";

// Dummy components for route targets
const Dashboard = () => <div>Dashboard Page</div>;
const Map = () => <div>Map Page</div>;
const Destination = () => <div>Top Destination Page</div>;
const Amsterdam = () => <div>Amsterdam Page</div>;
const Profile = () => <div>Profile Page</div>;
const SignIn = () => <div>Sign In Page</div>;

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <span>📊</span>,
    route: "/dashboard",
    component: Dashboard,
  },
  {
    type: "collapse",
    name: "Destinations",
    key: "destination",
    icon: <span>📍</span>,
    route: "",
    children: [
      {
        type: "collapse",
        name: "Map",
        key: "map",
        icon: <span>🗺️</span>,
        route: "/dashboard/map",
        component: Map,
      },
      {
        type: "collapse",
        name: "Top Destinations",
        key: "topdestinations",
        icon: <span>✈️</span>,
        flyout: true,
        route: "/top-destination",
        component: Destination,
        children: [
          {
            type: "collapse",
            name: "Amsterdam",
            key: "amsterdam",
            icon: <span>🏙️</span>,
            route: "/top-destination/amsterdam",
          },
        ],
      },
    ],
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <span>👤</span>,
    route: "/profile",
    component: Profile,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <span>🔑</span>,
    route: "/authentication/sign-in",
    component: SignIn,
  },
];

function TestPage() {
  const [hoveredMenuKey, setHoveredMenuKey] = useState(null);

  const handleMouseEnter = (key) => {
    setHoveredMenuKey(key);
  };

  const handleMouseLeave = () => {
    setHoveredMenuKey(null);
  };

  // Find the hovered route
  const hoveredRoute = routes
    .flatMap((r) => r.children || [])
    .find((r) => r.key === hoveredMenuKey);

  return (
    <div style={{ display: "flex", height: "100vh", position: "relative" }}>
      <div
        onMouseLeave={handleMouseLeave}
        style={{ position: "relative", zIndex: 1000 }}
      >
        <Sidenav
          brandName="Test Brand"
          routes={routes}
          color="info"
          onItemHover={handleMouseEnter}
        />
    

      {/* Renders FlyoutMenu if hovered */}
      {hoveredRoute && hoveredRoute.children?.length > 0 && (
        <FlyoutMenu
          parentKey={hoveredRoute.key}
          childrenRoutes={hoveredRoute.children}
          hoveredMenuKey={hoveredMenuKey}
        />
      )}
      </div>

      <main style={{ flex: 1, padding: "1rem" }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/map" element={<Map />} />
          <Route path="/top-destination" element={<Destination />} />
          <Route path="/top-destination/amsterdam" element={<Amsterdam />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/authentication/sign-in" element={<SignIn />} />
          <Route path="*" element={<div>Home or 404</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default TestPage;
