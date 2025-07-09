/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";

// Material Dashboard 2 React components
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";

function PlatformSettings() {
  const [followsMe, setFollowsMe] = useState(false);
  const [answersPost, setAnswersPost] = useState(false);
  const [mentionsMe, setMentionsMe] = useState(false);
  const [newLaunches, setNewLaunches] = useState(false);
  const [productUpdate, setProductUpdate] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  return (
    <Card sx={{
      position: "relative",
      // Glass-metal styling:
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      background: "linear-gradient(145deg, rgba(241,143,1,0.3) 0%, rgba(241,143,1,0) 100%)",
      border: "1px solid rgba(255, 255, 255, 0.6)",
      boxShadow:
        "inset 4px 4px 10px rgba(241,143,1,0.4), inset -4px -4px 10px rgba(241,143,1,0.1), 0 6px 15px rgba(241,143,1,0.3)",
      borderRadius: "12px",
      overflow: "hidden",
    }}>
      <MDBox p={2}>
        <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
          platform settings
        </MDTypography>
      </MDBox>
      <MDBox pt={1} pb={2} px={2} lineHeight={1.25}>
        <MDTypography variant="caption" fontWeight="bold" color="text" textTransform="uppercase">
          account
        </MDTypography>
        <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <MDBox mt={0.5}>
            <Switch checked={followsMe} onChange={() => setFollowsMe(!followsMe)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  // thumb color
                  color: "#F18F01",
                  // track when checked
                  "& + .MuiSwitch-track": {
                    backgroundColor: "#F18F01 !important",
                  },
                },
                // track when unchecked
                "& .MuiSwitch-track": {
                  backgroundColor: "rgba(255,255,255,0.4)",
                },
              }}
            />
          </MDBox>
          <MDBox width="80%" ml={0.5}>
            <MDTypography variant="button" fontWeight="regular" color="text">
              Email me when someone follows me
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <MDBox mt={0.5}>
            <Switch checked={answersPost} onChange={() => setAnswersPost(!answersPost)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  // thumb color
                  color: "#F18F01",
                  // track when checked
                  "& + .MuiSwitch-track": {
                    backgroundColor: "#F18F01 !important",
                  },
                },
                // track when unchecked
                "& .MuiSwitch-track": {
                  backgroundColor: "rgba(255,255,255,0.4)",
                },
              }} />
          </MDBox>
          <MDBox width="80%" ml={0.5}>
            <MDTypography variant="button" fontWeight="regular" color="text">
              Email me when someone answers on my post
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <MDBox mt={0.5}>
            <Switch checked={mentionsMe} onChange={() => setMentionsMe(!mentionsMe)} 
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                // thumb color
                color: "#F18F01",
                // track when checked
                "& + .MuiSwitch-track": {
                  backgroundColor: "#F18F01 !important",
                },
              },
              // track when unchecked
              "& .MuiSwitch-track": {
                backgroundColor: "rgba(255,255,255,0.4)",
              },
            }} />
          </MDBox>
          <MDBox width="80%" ml={0.5}>
            <MDTypography variant="button" fontWeight="regular" color="text">
              Email me when someone mentions me
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox mt={3}>
          <MDTypography variant="caption" fontWeight="bold" color="text" textTransform="uppercase">
            application
          </MDTypography>
        </MDBox>
        <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <MDBox mt={0.5}>
            <Switch checked={newLaunches} onChange={() => setNewLaunches(!newLaunches)} 
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                // thumb color
                color: "#F18F01",
                // track when checked
                "& + .MuiSwitch-track": {
                  backgroundColor: "#F18F01 !important",
                },
              },
              // track when unchecked
              "& .MuiSwitch-track": {
                backgroundColor: "rgba(255,255,255,0.4)",
              },
            }} />
          </MDBox>
          <MDBox width="80%" ml={0.5}>
            <MDTypography variant="button" fontWeight="regular" color="text">
              New launches and projects
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <MDBox mt={0.5}>
            <Switch checked={productUpdate} onChange={() => setProductUpdate(!productUpdate)} 
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                // thumb color
                color: "#F18F01",
                // track when checked
                "& + .MuiSwitch-track": {
                  backgroundColor: "#F18F01 !important",
                },
              },
              // track when unchecked
              "& .MuiSwitch-track": {
                backgroundColor: "rgba(255,255,255,0.4)",
              },
            }} />
          </MDBox>
          <MDBox width="80%" ml={0.5}>
            <MDTypography variant="button" fontWeight="regular" color="text">
              Monthly product updates
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
          <MDBox mt={0.5}>
            <Switch checked={newsletter} onChange={() => setNewsletter(!newsletter)} 
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                // thumb color
                color: "#F18F01",
                // track when checked
                "& + .MuiSwitch-track": {
                  backgroundColor: "#F18F01 !important",
                },
              },
              // track when unchecked
              "& .MuiSwitch-track": {
                backgroundColor: "rgba(255,255,255,0.4)",
              },
            }} />
          </MDBox>
          <MDBox width="80%" ml={0.5}>
            <MDTypography variant="button" fontWeight="regular" color="text">
              Subscribe to newsletter
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default PlatformSettings;
