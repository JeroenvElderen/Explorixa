import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useTheme } from "@mui/material/styles";
import MDTypography from "components/MDTypography";
import TimelineItem from "examples/Timeline/TimelineItem";

function OrdersOverview({ cities = [], countryName }) {
  const [visibleCities, setVisibleCities] = useState([]);
  const CITIES_TO_SHOW = 5;
  const [controller] = useMaterialUIController();
  const { sidenavColor } = controller;
  const theme = useTheme();
  const filteredCities = useMemo(() => (cities || []).filter(city => city !== "All"), [cities]);


  
  

  useEffect(() => {
    if (!filteredCities.length) return;

    let index = 0;

    const updateVisibleCities = () => {
      const nextCities = [];

      for (let i = 0; i < CITIES_TO_SHOW; i++) {
        const current = (index + i) % filteredCities.length;
        nextCities.push(filteredCities[current]);
      }

      setVisibleCities(nextCities);
      index = (index + CITIES_TO_SHOW) % filteredCities.length;
    };

    updateVisibleCities(); // Initial call

    const interval = setInterval(updateVisibleCities, 300000); // every 5 minutes

    return () => clearInterval(interval);
  }, [filteredCities]);

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Cities in {countryName || "The country"} 
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        {visibleCities.map((city, idx) => (
          <TimelineItem
            key={idx}
            color={sidenavColor}
            icon="location_on"
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <Link to={`/city/${city}`} style={{ textDecoration: "none", color: "white" }}>
                  {city}
                </Link>
              </div>
            }
            dateTime=""
            lastItem={idx === visibleCities.length - 1}
          />
        ))}
      </MDBox>
    </Card>
  );
}


export default OrdersOverview;
