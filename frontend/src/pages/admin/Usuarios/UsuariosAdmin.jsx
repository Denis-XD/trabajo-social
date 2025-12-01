import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  Search,
  Plus,
  Edit,
  Trash,
  X,
  Save,
  User,
  Mail,
  Phone,
  Users,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Shield,
  UserCheck,
  Filter,
} from "lucide-react";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import CajaMensaje from "../../../components/utils/CajaMensaje";

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    celular_user: "",
    is_admin: false,
    notificar: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const itemsPerPage = 10;

  // Función para agregar mensajes
  const agregarMensaje = (
    tipo,
    color,
    mensaje,
    duracion = 5000,
    backgroundColor = ""
  ) => {
    const id = Date.now();
    setMensajes((prev) => [
      ...prev,
      { id, tipo, color, mensaje, duracion, backgroundColor },
    ]);
  };

  // Función para eliminar mensajes
  const eliminarMensaje = (id) => {
    setMensajes((prev) => prev.filter((m) => m.id !== id));
  };

  // Cargar datos de usuarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/usuarios");
        setUsuarios(response.data);
        setFilteredUsuarios(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        agregarMensaje("fail", "#D32F2F", "Error al cargar los usuarios.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar usuarios cuando cambia el término de búsqueda o filtro de rol
  useEffect(() => {
    let filtered = usuarios;

    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (usuario) =>
          usuario.name.toLowerCase().includes(term) ||
          usuario.email.toLowerCase().includes(term) ||
          (usuario.celular_user && usuario.celular_user.includes(term))
      );
    }

    // Filtrar por rol
    if (roleFilter !== "todos") {
      if (roleFilter === "admin") {
        filtered = filtered.filter((usuario) => usuario.is_admin === true);
      } else if (roleFilter === "colaborador") {
        filtered = filtered.filter((usuario) => usuario.is_admin === false);
      }
    }

    setFilteredUsuarios(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [searchTerm, roleFilter, usuarios]);

  // Actualizar total de páginas cuando cambian los resultados filtrados
  useEffect(() => {
    setTotalPages(Math.ceil(filteredUsuarios.length / itemsPerPage));
  }, [filteredUsuarios]);

  // Obtener usuarios para la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsuarios.slice(startIndex, endIndex);
  };

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Abrir modal de eliminación
  const openDeleteModal = (usuario) => {
    setSelectedUsuario(usuario);
    setIsDeleteModalOpen(true);
  };

  // Cerrar modal de eliminación
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUsuario(null);
  };

  // Abrir modal de formulario para editar
  const openEditModal = (usuario) => {
    setSelectedUsuario(usuario);
    setFormData({
      name: usuario.name,
      email: usuario.email,
      password: "",
      celular_user: usuario.celular_user || "",
      is_admin: usuario.is_admin,
      notificar: true,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Abrir modal de formulario para agregar
  const openAddModal = () => {
    setSelectedUsuario(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      celular_user: "",
      is_admin: false,
      notificar: true,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Cerrar modal de formulario
  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedUsuario(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      celular_user: "",
      is_admin: false,
      notificar: true,
    });
    setFormErrors({});
    setShowPassword(false);
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const soloLetras = value
        .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
        .replace(/\s{2,}/g, " ");

      const limitado = soloLetras.slice(0, 40);

      setFormData({
        ...formData,
        [name]: limitado,
      });

      if (formErrors[name]) {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      }

      return;
    }

    // Para el campo celular, solo permitir números y máximo 8 dígitos
    if (name === "celular_user") {
      const onlyNumbers = value.replace(/\D/g, "");
      if (onlyNumbers.length <= 8) {
        setFormData({
          ...formData,
          [name]: onlyNumbers,
        });
      }
    } else if (name === "is_admin") {
      setFormData({
        ...formData,
        [name]: value === "true",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Limpiar error cuando el usuario comienza a escribir
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  // Manejar cambio en checkbox
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Generar contraseña aleatoria
  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    const length = Math.floor(Math.random() * 6) + 10; // Entre 10 y 15 caracteres
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({
      ...formData,
      password,
    });
    // Limpiar error de contraseña si existe
    if (formErrors.password) {
      setFormErrors({
        ...formErrors,
        password: null,
      });
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      errors.name = "El nombre es obligatorio.";
    }

    // Validar correo
    if (!formData.email.trim()) {
      errors.email = "El correo es obligatorio.";
    } else {
      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "El formato del correo no es válido.";
      } else {
        // Verificar que el correo no exista (excepto si es el mismo usuario)
        const correoNormalizado = formData.email.toLowerCase().trim();
        const correoExistente = usuarios.find(
          (u) =>
            u.email.toLowerCase() === correoNormalizado &&
            u.id !== selectedUsuario?.id
        );
        if (correoExistente) {
          errors.email = "Ya existe un usuario con este correo.";
        }
      }
    }

    // Validar celular (opcional pero si se ingresa debe ser válido)
    if (formData.celular_user.trim()) {
      const celularRegex = /^\d{8}$/;
      if (!celularRegex.test(formData.celular_user)) {
        errors.celular_user = "El celular debe contener exactamente 8 números.";
      }
    }

    // Validar contraseña (solo al crear)
    if (!selectedUsuario) {
      if (!formData.password.trim()) {
        errors.password = "La contraseña es obligatoria.";
      } else {
        if (formData.password.length < 10 || formData.password.length > 15) {
          errors.password =
            "La contraseña debe tener entre 10 y 15 caracteres.";
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Eliminar usuario
  const handleDelete = async () => {
    if (!selectedUsuario) return;

    try {
      setIsSubmitting(true);
      await api.delete(`/usuariosEliminar/${selectedUsuario.id}`);

      // Actualizar lista de usuarios
      setUsuarios(usuarios.filter((u) => u.id !== selectedUsuario.id));
      agregarMensaje("success", "#2E7D32", "Usuario eliminado correctamente.");
      closeDeleteModal();
    } catch (error) {
      console.error("Error al eliminar:", error);
      agregarMensaje("fail", "#D32F2F", "Error al eliminar el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guardar usuario (crear o actualizar)
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      if (selectedUsuario) {
        // Actualizar usuario existente
        const updateData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          celular_user: formData.celular_user.trim(),
          is_admin: formData.is_admin,
        };

        await api.put(`/usuariosActualizar/${selectedUsuario.id}`, updateData);

        // Actualizar lista de usuarios
        setUsuarios(
          usuarios.map((u) =>
            u.id === selectedUsuario.id
              ? {
                  ...u,
                  name: formData.name.trim(),
                  email: formData.email.trim(),
                  celular_user: formData.celular_user.trim(),
                  is_admin: formData.is_admin,
                }
              : u
          )
        );
        agregarMensaje(
          "success",
          "#2E7D32",
          "Usuario actualizado correctamente."
        );
      } else {
        // Crear nuevo usuario
        const createData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          celular_user: formData.celular_user.trim(),
          is_admin: formData.is_admin,
          notificar: formData.notificar,
        };

        const response = await api.post("/usuariosCrear", createData);

        // Actualizar lista de usuarios
        setUsuarios([...usuarios, response.data]);
        agregarMensaje("success", "#2E7D32", "Usuario creado correctamente.");
      }

      closeFormModal();
    } catch (error) {
      console.error("Error al guardar:", error);
      agregarMensaje(
        "fail",
        "#D32F2F",
        `Error al ${selectedUsuario ? "actualizar" : "crear"} el usuario.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando usuarios..." />;
  }

  return (
    <Container>
      {/* Mensajes */}
      {mensajes.map((mensaje) => (
        <CajaMensaje
          key={mensaje.id}
          tipo={mensaje.tipo}
          color={mensaje.color}
          mensaje={mensaje.mensaje}
          duracion={mensaje.duracion}
          backgroundColor={mensaje.backgroundColor}
          onClose={() => eliminarMensaje(mensaje.id)}
        />
      ))}

      <Title>
        <Users size={24} /> Gestión de Usuarios
      </Title>

      <TopControls>
        <SearchAndFilterContainer>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Buscar por nombre, correo o celular..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon>
              <Search size={16} />
            </SearchIcon>
          </SearchContainer>

          <FilterContainer>
            <FilterSelect
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="todos">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="colaborador">Colaboradores</option>
            </FilterSelect>
            <FilterIcon>
              <Filter size={16} />
            </FilterIcon>
          </FilterContainer>
        </SearchAndFilterContainer>

        <AddButton onClick={openAddModal}>
          <Plus size={16} /> Agregar Usuario
        </AddButton>
      </TopControls>

      {/* Vista de escritorio */}
      <DesktopView>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableHeaderCell>Nombre</TableHeaderCell>
              <TableHeaderCell>Correo</TableHeaderCell>
              <TableHeaderCell>Rol</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableHeader>

            <TableBody>
              {getCurrentPageItems().length > 0 ? (
                getCurrentPageItems().map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <UserAvatar>
                        <User size={16} />
                      </UserAvatar>
                      {usuario.name}
                    </TableCell>
                    <TableCell>
                      <Mail size={16} />
                      {usuario.email}
                    </TableCell>
                    <TableCell>
                      <RoleBadge isAdmin={usuario.is_admin}>
                        {usuario.is_admin ? (
                          <Shield size={14} />
                        ) : (
                          <UserCheck size={14} />
                        )}
                        {usuario.is_admin ? "Administrador" : "Colaborador"}
                      </RoleBadge>
                    </TableCell>
                    <TableCell>
                      <ActionButtons>
                        <EditButton
                          onClick={() => openEditModal(usuario)}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </EditButton>
                        <DeleteButton
                          onClick={() => openDeleteModal(usuario)}
                          title="Eliminar"
                        >
                          <Trash size={16} />
                        </DeleteButton>
                      </ActionButtons>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <NoResults>No se encontraron usuarios</NoResults>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DesktopView>

      {/* Vista móvil */}
      <MobileView>
        {getCurrentPageItems().length > 0 ? (
          getCurrentPageItems().map((usuario) => (
            <MobileCard key={usuario.id}>
              <MobileCardHeader>
                <MobileCardTitle>{usuario.name}</MobileCardTitle>
                <UserAvatar>
                  <User size={16} />
                </UserAvatar>
              </MobileCardHeader>
              <MobileCardContent>
                <MobileCardItem>
                  <Mail size={16} />
                  {usuario.email}
                </MobileCardItem>
                <MobileCardItem>
                  <RoleBadge isAdmin={usuario.is_admin}>
                    {usuario.is_admin ? (
                      <Shield size={14} />
                    ) : (
                      <UserCheck size={14} />
                    )}
                    {usuario.is_admin ? "Administrador" : "Colaborador"}
                  </RoleBadge>
                </MobileCardItem>
                <MobileCardItem>
                  <Phone size={16} />
                  {usuario.celular_user || "No especificado"}
                </MobileCardItem>
              </MobileCardContent>
              <MobileCardActions>
                <EditButton
                  onClick={() => openEditModal(usuario)}
                  title="Editar"
                >
                  <Edit size={16} />
                </EditButton>
                <DeleteButton
                  onClick={() => openDeleteModal(usuario)}
                  title="Eliminar"
                >
                  <Trash size={16} />
                </DeleteButton>
              </MobileCardActions>
            </MobileCard>
          ))
        ) : (
          <NoResults>No se encontraron usuarios</NoResults>
        )}
      </MobileView>

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination>
          <PageButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </PageButton>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PageButton
              key={page}
              active={page === currentPage}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </PageButton>
          ))}

          <PageButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </PageButton>
        </Pagination>
      )}

      {/* Modal de confirmación para eliminar */}
      {isDeleteModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Confirmar eliminación</ModalTitle>
              <ModalCloseButton onClick={closeDeleteModal}>
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={24} className="text-red-500" />
                <p>
                  ¿Está seguro que desea eliminar al usuario{" "}
                  <strong>{selectedUsuario?.name}</strong>?
                </p>
              </div>
              <p className="text-gray-500 text-sm">
                Esta acción no se puede deshacer.
              </p>
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={closeDeleteModal}>
                <X size={16} /> Cancelar
              </CancelButton>
              <ConfirmButton
                danger
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <SpinIcon>⟳</SpinIcon> Eliminando...
                  </>
                ) : (
                  <>
                    <Trash size={16} /> Eliminar
                  </>
                )}
              </ConfirmButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Modal de formulario para agregar/editar */}
      {isFormModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {selectedUsuario ? "Editar Usuario" : "Agregar Usuario"}
              </ModalTitle>
              <ModalCloseButton onClick={closeFormModal}>
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label htmlFor="name">
                  <User size={16} className="inline mr-2" /> Nombre *
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Nombre completo"
                  error={formErrors.name}
                />
                {formErrors.name && (
                  <ErrorMessage>{formErrors.name}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">
                  <Mail size={16} className="inline mr-2" /> Correo Electrónico
                  *
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="correo@ejemplo.com"
                  error={formErrors.email}
                />
                {formErrors.email && (
                  <ErrorMessage>{formErrors.email}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="celular_user">
                  <Phone size={16} className="inline mr-2" /> Celular (opcional)
                </Label>
                <Input
                  type="text"
                  id="celular_user"
                  name="celular_user"
                  value={formData.celular_user}
                  onChange={handleFormChange}
                  placeholder="8 dígitos"
                  error={formErrors.celular_user}
                />
                {formErrors.celular_user && (
                  <ErrorMessage>{formErrors.celular_user}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="is_admin">
                  <Shield size={16} className="inline mr-2" /> Rol *
                </Label>
                <Select
                  id="is_admin"
                  name="is_admin"
                  value={formData.is_admin.toString()}
                  onChange={handleFormChange}
                  error={formErrors.is_admin}
                >
                  <option value="false">Colaborador</option>
                  <option value="true">Administrador</option>
                </Select>
                {formErrors.is_admin && (
                  <ErrorMessage>{formErrors.is_admin}</ErrorMessage>
                )}
              </FormGroup>

              {/* Contraseña (solo al crear) */}
              {!selectedUsuario && (
                <FormGroup>
                  <Label htmlFor="password">
                    <User size={16} className="inline mr-2" /> Contraseña *
                    (10-15 caracteres)
                  </Label>
                  <PasswordContainer>
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      placeholder="10-15 caracteres (cualquier tipo)"
                      error={formErrors.password}
                    />
                    <PasswordActions>
                      <PasswordButton
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        title={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </PasswordButton>
                      <GenerateButton
                        type="button"
                        onClick={generatePassword}
                        title="Generar contraseña"
                      >
                        <RefreshCw size={16} />
                      </GenerateButton>
                    </PasswordActions>
                  </PasswordContainer>
                  {formErrors.password && (
                    <ErrorMessage>{formErrors.password}</ErrorMessage>
                  )}
                </FormGroup>
              )}

              {/* Notificar (solo al crear) */}
              {!selectedUsuario && (
                <FormGroup>
                  <CheckboxContainer>
                    <Checkbox
                      type="checkbox"
                      id="notificar"
                      name="notificar"
                      checked={formData.notificar}
                      onChange={handleCheckboxChange}
                    />
                    <CheckboxLabel htmlFor="notificar">
                      Notificar por correo electrónico
                    </CheckboxLabel>
                  </CheckboxContainer>
                </FormGroup>
              )}
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={closeFormModal}>
                <X size={16} /> Cancelar
              </CancelButton>
              <SaveButton onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <SpinIcon>⟳</SpinIcon> Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />{" "}
                    {selectedUsuario ? "Actualizar" : "Crear"}
                  </>
                )}
              </SaveButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

// Animaciones
const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.6s ease-out;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 1rem;
    width: 100%;
    border-radius: 0;
    box-shadow: none;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const TopControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchAndFilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex: 1;
  min-width: 200px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
`;

const FilterContainer = styled.div`
  position: relative;
  min-width: 150px;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  }
`;

const FilterIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: #2563eb;
  }

  svg {
    margin-right: 0.5rem;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    border-radius: 0.375rem;
    margin-left: -0.5rem;
    margin-right: -0.5rem;
    width: calc(100% + 1rem);
  }
`;

const Table = styled.div`
  width: 100%;
  min-width: 650px;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns:
    minmax(150px, 1.5fr) minmax(180px, 1.5fr) minmax(120px, 1fr)
    minmax(100px, 0.5fr);
  background-color: #f9fafb;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
`;

const TableHeaderCell = styled.div`
  padding: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TableBody = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns:
    minmax(150px, 1.5fr) minmax(180px, 1.5fr) minmax(120px, 1fr)
    minmax(100px, 0.5fr);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
  animation: ${slideUp} 0.3s ease-in-out;

  &:hover {
    background-color: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div`
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RoleBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${(props) => (props.isAdmin ? "#dbeafe" : "#f0fdf4")};
  color: ${(props) => (props.isAdmin ? "#1e40af" : "#166534")};
  border: 1px solid ${(props) => (props.isAdmin ? "#93c5fd" : "#bbf7d0")};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  &:focus {
    outline: none;
  }
`;

const EditButton = styled(IconButton)`
  background-color: #3b82f6;
  color: white;

  &:hover {
    background-color: #2563eb;
  }
`;

const DeleteButton = styled(IconButton)`
  background-color: #ef4444;
  color: white;

  &:hover {
    background-color: #dc2626;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  background-color: ${(props) => (props.active ? "#3b82f6" : "white")};
  color: ${(props) => (props.active ? "white" : "#374151")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.active ? "#2563eb" : "#f9fafb")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  animation: ${fadeIn} 0.2s ease-in-out;
  padding: 1rem;
  overflow-y: auto;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  animation: ${slideUp} 0.3s ease-in-out;
  display: flex;
  flex-direction: column;

  @media (max-width: 640px) {
    max-width: 100%;
    border-radius: 0.375rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #111827;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;

  @media (max-width: 640px) {
    flex-direction: column-reverse;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${(props) => (props.error ? "#ef4444" : "#d1d5db")};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${(props) => (props.error ? "#ef4444" : "#d1d5db")};
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  }
`;

const PasswordContainer = styled.div`
  position: relative;
`;

const PasswordActions = styled.div`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 0.5rem;
`;

const PasswordButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #111827;
  }
`;

const GenerateButton = styled(PasswordButton)`
  color: #3b82f6;

  &:hover {
    color: #2563eb;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
  cursor: pointer;

  &:checked {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  }
`;

const CheckboxLabel = styled.span`
  font-size: 0.875rem;
  color: #374151;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  svg {
    margin-right: 0.5rem;
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const CancelButton = styled(Button)`
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;

  &:hover:not(:disabled) {
    background-color: #e5e7eb;
  }
`;

const ConfirmButton = styled(Button)`
  background-color: ${(props) => (props.danger ? "#ef4444" : "#3b82f6")};
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background-color: ${(props) => (props.danger ? "#dc2626" : "#2563eb")};
  }
`;

const SaveButton = styled(Button)`
  background-color: #22c55e;
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background-color: #16a34a;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
`;

const SpinIcon = styled.span`
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const UserAvatar = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  flex-shrink: 0;
`;

// Componente para pantallas móviles
const MobileCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  animation: ${slideUp} 0.3s ease-in-out;
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const MobileCardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
`;

const MobileCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MobileCardItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
`;

const MobileCardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const MobileView = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const DesktopView = styled.div`
  display: block;

  @media (max-width: 768px) {
    display: none;
  }
`;
