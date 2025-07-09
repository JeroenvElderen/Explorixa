import PropTypes from "prop-types";

// @mui material components
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "../../components/MDBox";

// Custom styles for the SidenavCollapse
import {
  collapseItem,
  collapseIconBox,
  collapseIcon,
  collapseText,
} from "../../examples/Sidenav/styles/sidenavCollapse";

// Material Dashboard 2 React context
import { useMaterialUIController } from "../../context";

function SidenavCollapse({ icon, name, active = false, noCollapse, sx = {}, ...rest }) {
  const [controller] = useMaterialUIController();
  const {
    miniSidenav,
    transparentSidenav,
    whiteSidenav,
    darkMode,
    sidenavColor,
  } = controller;

  return (
    <ListItem component="li">
      <MDBox
        {...rest}
        sx={(theme) => ({
          ...collapseItem(theme, {
            active,
            transparentSidenav,
            whiteSidenav,
            darkMode,
            sidenavColor,
          }),
          ...(typeof sx === "function" ? sx(theme) : sx),
        })}
      >
        <ListItemIcon
          sx={(theme) =>
            collapseIconBox(theme, {
              transparentSidenav,
              whiteSidenav,
              darkMode,
              active,
            })
          }
        >
          {typeof icon === "string" ? (
            <Icon sx={(theme) => collapseIcon(theme, { active })}>{icon}</Icon>
          ) : (
            icon
          )}
        </ListItemIcon>

        <ListItemText
          primary={name}
          
          sx={(theme) =>
            collapseText(theme, {
              miniSidenav,
              transparentSidenav,
              whiteSidenav,
              active,
            })
          }
        />
      </MDBox>
    </ListItem>
  );
}

SidenavCollapse.propTypes = {
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
};

export default SidenavCollapse;
