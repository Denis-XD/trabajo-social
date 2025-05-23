import { Routes, Route, Navigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PrivateLayout from "../layouts/PrivateLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Informacion from "../pages/admin/Carrera/Informacion";
import RedesSociales from "../pages/admin/Carrera/RedesSociales";
import TramitesAdmin from "../pages/admin/Carrera/TramitesAdmin";
import AutoridadesAdmin from "../pages/admin/Personal/AutoridadesAdmin";
import AdministrativosAdmin from "../pages/admin/Personal/AdministrativosAdmin";
import DocentesAdmin from "../pages/admin/Personal/DocentesAdmin";
import AsignaturasAdmin from "../pages/admin/Personal/AsignaturasAdmin";

const AdminRoutes = () => {
  const { user, loading } = useContext(AuthContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);
  }, [user]); // ✅ Detecta cambios en `user`

  if (loading) {
    return <LoadingSpinner message="Verificando credenciales..." />;
  }

  return isAuthenticated ? (
    <PrivateLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/usuarios" element={<h1>Usuarios</h1>} />
        <Route
          path="/cambiar-contrasena"
          element={<h1>Cambiar Contraseña</h1>}
        />
        <Route path="/informacion-carrera" element={<Informacion />} />
        <Route path="/malla-curricular" element={<h1>Malla Curricular</h1>} />
        <Route path="/redes-sociales" element={<RedesSociales />} />
        <Route path="/tramites" element={<TramitesAdmin />} />
        <Route path="/docentes" element={<DocentesAdmin />} />
        <Route path="/docentes/asignaturas" element={<AsignaturasAdmin />} />
        <Route path="/administrativos" element={<AdministrativosAdmin />} />
        <Route path="/autoridades" element={<AutoridadesAdmin />} />
        <Route path="/publicaciones" element={<h1>Publicaciones</h1>} />
        <Route path="/comunicados" element={<h1>Comunicados</h1>} />
        <Route path="/eventos" element={<h1>Eventos</h1>} />
        <Route path="/eventos-sin-costo" element={<h1>Eventos Sin Costo</h1>} />
        <Route path="/eventos-con-costo" element={<h1>Eventos Con Costo</h1>} />
        <Route
          path="/eventos-dashboard"
          element={<h1>Dashboard de Eventos</h1>}
        />
      </Routes>
    </PrivateLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default AdminRoutes;
