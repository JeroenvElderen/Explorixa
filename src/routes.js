// src/routes/index.js
import React from "react";
import Tables from "./layouts/tables";
import Billing from "./layouts/billing";
import RTL from "./layouts/rtl";
import Notifications from "./layouts/notifications";
import Profile from "./layouts/profile";
import SignIn from "./layouts/authentication/sign-in";
import SignUp from "./layouts/authentication/sign-up";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import CityPage from "components/cities/CityPage";
import Home from "layouts/home";
import HomeIcon from "@mui/icons-material/Home";
import CountryPage from "components/countries/CountryPage";
import ContinentPage from "components/continent/ContinentPage";
import PinPage from "pages/PinPage";
import ProfilePage from "components/ProfilePage";
import Icon from "@mui/material/Icon";
import destinationConfigs from "./routesDestination";

const Map = React.lazy(() => import("./layouts/map"));

const routes = [
  {
    type: "collapse",
    name: "Home",
    key: "home",
    icon: <HomeIcon fontSize="small" />,
    route: "/home",
    component: Home,
  },
  {
    type: "collapse",
    name: "Map",
    key: "map",
    icon: <PublicIcon fontSize="small" />,
    route: "/map",
    component: Map,
  },

  // ← your single “Destinations” entry now just spreads in that array
  {
    type: "collapse",
    name: "Destinations",
    key: "destinations",
    icon: <LocationOnIcon fontSize="small" />,
    flyout: false,
    children: destinationConfigs,
  },

  // dynamic “:continent” / “:countrySlug” / “:pinSlug” routes
  {
    type: "route",
    key: "continent-dynamic",
    route: "/Destinations/:continent",
    component: ContinentPage,
  },
  {
    type: "route",
    key: "country-dynamic",
    route: "/Destinations/:continent/:countrySlug",
    component: CountryPage,
  },
  {
    type: "route",
    key: "pin-dynamic",
    route: "/Destinations/:continent/:countrySlug/:pinSlug",
    component: PinPage,
  },

  // profile, auth, city, etc…
  {
    type: "route",
    key: "user-profile",
    route: "/profile/:userId",
    component: ProfilePage,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: ProfilePage,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: SignIn,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: SignUp,
  },
  {
    type: "route",
    name: "City Page",
    key: "city",
    route: "/city/:cityId",
    component: CityPage,
  },
];

export default routes;
