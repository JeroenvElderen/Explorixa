import React from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import PinCard from "examples/Charts/PinCard";
import PinDetailCard from "components/PinDetailCard";
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";
import PinInteractionPanel from "components/PinInteractionPanel";
import { Box } from "@mui/material";
import { timeAgo } from "./helpers";

export default function RecentPins({
  recentPins,
  expandedPinId,
  handlePinClick,
  countryName,
  countryCities,
  setExpandedPinId,
}) {
  return (
    <>
      <MDBox mt={4.5} mb={4.5}>
        <Grid container spacing={3}>
          {recentPins.map((pin, idx) => (
            <Grid item xs={12} md={6} lg={4} key={pin.id}>
              <MDBox mb={3}>
                {/* Only wrap the card in the click, not the whole container */}
                {expandedPinId === pin.id ? (
                  <>
                    <div style={{ cursor: "pointer" }} onClick={() => handlePinClick(pin)}>
                      <PinDetailCard pin={pin} />
                    </div>
                    <Box mt={0.5}>
                      <PinInteractionPanel pin={pin} />
                    </Box>
                  </>
                ) : (
                  <>
                    <div style={{ cursor: "pointer" }} onClick={() => handlePinClick(pin)}>
                      <PinCard
                        pin={pin}
                        title={pin.Name || "Untitled"}
                        description={pin.Information}
                        date={timeAgo(pin.created_at)}
                        imageurl={pin["Main Image"]}
                        imagealt={pin.Name}
                      />
                    </div>
                    
                  </>
                )}
              </MDBox>
            </Grid>
          ))}
        </Grid>
      </MDBox>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Projects country={countryName} />
        </Grid>
        <Grid item xs={12} md={4}>
          <OrdersOverview cities={countryCities} countryName={countryName} />
        </Grid>
      </Grid>
    </>
  );
}
