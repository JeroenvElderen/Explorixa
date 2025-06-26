import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "../../../components/MDBox";

// Routes
import routes from "routes";

// Material Dashboard 2 React context
import { useMaterialUIController, setLayout } from "../../../context";
import Sidenav from "../../../examples/Sidenav";

// Supabase
import { supabase } from "../../../SupabaseClient"; // adjust if needed

function DashboardLayout({ children }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, sidenavColor } = controller;
  const { pathname } = useLocation();

  const [user, setUser] = useState(null);
  const [filteredRoutes, setFilteredRoutes] = useState([]);

  // Fetch user on mount
  useEffect(() => {
    setLayout(dispatch, "dashboard");

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Listen to login/logout events
   // Listen to login/logout events
const { subscription } = supabase.auth.onAuthStateChange((_, session) => {
  setUser(session?.user || null);
});

return () => {
  if (subscription?.unsubscribe) {
    subscription.unsubscribe();
  }
};



  }, [dispatch]); // Pathname

  // Filter routes based on user
  /* useEffect(() => {
    const visibleRoutes = routes.filter((route) => {
      // Hide "sign-in" and "sign-up" if user is logged in
      if (user && ["sign-in", "sign-up"].includes(route.key)) return false;

      // Hide "billing" and "rtl" if not logged in
      if (!user && ["billing", "rtl", "notifications", "tables", "profile"].includes(route.key)) return false;

      return true;
    });

    setFilteredRoutes(visibleRoutes);
  }, [user]);
*/
  return (
    <>
      <Sidenav
        color={sidenavColor}
        brandName="Explorixa"
        routes={routes} //filteredRoutes
      />
      <MDBox
        sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
          p: 3,
          position: "relative",

          [breakpoints.up("xl")]: {
            marginLeft: miniSidenav ? pxToRem(120) : pxToRem(274),
            transition: transitions.create(["margin-left", "margin-right"], {
              easing: transitions.easing.easeInOut,
              duration: transitions.duration.standard,
            }),
          },
        })}
      >
        {children}
      </MDBox>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
