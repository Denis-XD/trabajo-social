import { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
  Box,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ExpandMore,
  ChevronRight,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import styled from "styled-components";
import logo from "../../assets/img/logo.jpeg";
import banner from "../../assets/img/banner.png";

const navigation = [
  { title: "Inicio", path: "/" },
  {
    title: "Generalidades",
    items: [
      { title: "Nuestra Carrera", path: "/nuestra-carrera" },
      { title: "Autoridades", path: "/autoridades" },
      { title: "Personal Administrativo", path: "/personal-administrativo" },
      { title: "Personal Docente", path: "/personal-docente" },
    ],
  },
  {
    title: "Pregrado",
    items: [
      {
        title: "Modalidades de Ingreso",
        path: "/pregrado/modalidades-ingreso",
      },
      {
        title: "Modalidades de Titulación",
        path: "/pregrado/modalidades-titulacion",
      },
      { title: "Malla Curricular", path: "/pregrado/malla-curricular" },
      { title: "Trámites", path: "/pregrado/tramites" },
    ],
  },
  {
    title: "Postgrado",
    path: "https://posgrado.hum.umss.edu.bo/",
    isExternal: true,
  },
  {
    title: "Investigación",
    path: "https://iifhce.hum.umss.edu.bo/",
    isExternal: true,
  },
  {
    title: "Servicios Informáticos",
    items: [
      {
        title: "Facultativos",
        items: [
          {
            title: "Servicios a Estudiantes",
            path: "https://www.hum.umss.edu.bo/estudiantes/",
            isExternal: true,
          },
          {
            title: "Servicios a Docentes",
            path: "https://www.hum.umss.edu.bo/docentes/",
            isExternal: true,
          },
          {
            title: "Plataforma Moodle",
            path: "https://moodle.hum.umss.edu.bo/login/index.php",
            isExternal: true,
          },
        ],
      },
      {
        title: "Universitarios",
        items: [
          {
            title: "Plataformas para Estudiantes",
            path: "https://www.umss.edu.bo/plataformas-educativas-estudiantes/",
            isExternal: true,
          },
          {
            title: "Plataformas para Docentes",
            path: "https://www.umss.edu.bo/plataformas-educativas-y-correos-para-funcionarios/",
            isExternal: true,
          },
          {
            title: "WebSis",
            path: "https://websis.umss.edu.bo/",
            isExternal: true,
          },
        ],
      },
    ],
  },
  {
    title: "Noticias",
    items: [
      { title: "Anuncios", path: "/noticias/anuncios" },
      { title: "Eventos", path: "/noticias/eventos" },
    ],
  },
  { title: "Contacto", path: "/contacto" },
];

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function DesktopNavItem({ item }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!item.items) {
    return (
      <Button
        component={Link}
        to={item.path}
        color="inherit"
        sx={{ fontSize: "0.885rem", textTransform: "capitalize" }}
      >
        {capitalize(item.title)}
      </Button>
    );
  }

  return (
    <Box onMouseEnter={handleOpen} onMouseLeave={handleClose}>
      <Button
        color="inherit"
        sx={{ fontSize: "0.885rem", textTransform: "capitalize" }}
        endIcon={<ExpandMore />}
      >
        {capitalize(item.title)}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            onMouseLeave: handleClose,
          },
        }}
      >
        {item.items.map((subItem) => (
          <SubMenuItem key={subItem.title} item={subItem} />
        ))}
      </Menu>
    </Box>
  );
}

function SubMenuItem({ item }) {
  const [subMenuEl, setSubMenuEl] = useState(null);
  const openSubMenu = Boolean(subMenuEl);

  const handleOpenSubMenu = (event) => {
    setSubMenuEl(event.currentTarget);
  };

  const handleCloseSubMenu = () => {
    setSubMenuEl(null);
  };

  if (!item.items) {
    return (
      <MenuItem
        sx={{ fontSize: "0.775rem", textTransform: "capitalize" }}
        component={Link}
        to={item.path}
      >
        {capitalize(item.title)}
      </MenuItem>
    );
  }

  return (
    <Box onMouseEnter={handleOpenSubMenu} onMouseLeave={handleCloseSubMenu}>
      <MenuItem sx={{ fontSize: "0.775rem", textTransform: "capitalize" }}>
        {capitalize(item.title)} <ExpandMore />
      </MenuItem>
      <Menu
        anchorEl={subMenuEl}
        open={openSubMenu}
        onClose={handleCloseSubMenu}
        slotProps={{
          list: {
            onMouseLeave: handleCloseSubMenu,
          },
        }}
      >
        {item.items.map((nestedItem) => (
          <MenuItem
            key={nestedItem.title}
            sx={{ fontSize: "0.775rem", textTransform: "capitalize" }}
            component="a"
            href={nestedItem.path}
            target="_blank"
          >
            {capitalize(nestedItem.title)}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

function MobileNavItem({ item, onClose }) {
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(!open);

  return (
    <>
      <ListItem disablePadding>
        <ListItemButton
          onClick={item.items ? handleClick : () => onClose()}
          component={item.path ? Link : "div"}
          to={item.path}
        >
          <ListItemText
            primary={capitalize(item.title)}
            slotProps={{
              primary: {
                sx: { textTransform: "capitalize" },
              },
            }}
          />
          {item.items && (open ? <ExpandMore /> : <ChevronRight />)}
        </ListItemButton>
      </ListItem>
      {item.items && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.items.map((subItem) => (
              <Box key={subItem.title} sx={{ pl: 2 }}>
                <MobileNavItem item={subItem} onClose={onClose} />
              </Box>
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <>
      <StyledAppBar position="sticky">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleDrawerToggle}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <Logo src={logo} alt="Trabajo Social" />
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            {navigation.map((item) => (
              <DesktopNavItem key={item.title} item={item} />
            ))}
          </Box>
        </Toolbar>
      </StyledAppBar>

      <Drawer anchor="left" open={mobileOpen} onClose={handleDrawerToggle}>
        <List sx={{ width: 250 }}>
          {navigation.map((item) => (
            <MobileNavItem
              key={item.title}
              item={item}
              onClose={() => setMobileOpen(false)}
            />
          ))}
        </List>
      </Drawer>
    </>
  );
}

const StyledAppBar = styled(AppBar)`
  background-blend-mode: multiply;
  background-image: url(${banner}) !important;
  background-color: hsl(208, 96.6%, 45.5%) !important;
  transition: background-color 0.3s ease-in-out;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.img`
  max-width: 220px;
  height: auto;
  object-fit: contain;
  border-radius: 10px;

  @media (max-width: 180px) {
    max-width: 200px;
  }

  @media (max-width: 480px) {
    max-width: 180px;
  }
`;
