import { useState, useEffect, useRef } from "react";
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
  Briefcase,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Upload,
  XCircle,
} from "lucide-react";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import CajaMensaje from "../../../components/utils/CajaMensaje";

export default function AutoridadesAdmin() {
  const [autoridades, setAutoridades] = useState([]);
  const [filteredAutoridades, setFilteredAutoridades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedAutoridad, setSelectedAutoridad] = useState(null);
  const [formData, setFormData] = useState({
    nombre_persona: "",
    cargo: "",
    emails: [],
    imagen_persona: null,
    quitar_imagen: false,
  });
  const [newEmail, setNewEmail] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const fileInputRef = useRef(null);
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

  // Cargar datos de autoridades
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/autoridades");
        setAutoridades(response.data);
        setFilteredAutoridades(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        agregarMensaje("fail", "#D32F2F", "Error al cargar las autoridades.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar autoridades cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAutoridades(autoridades);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = autoridades.filter(
        (autoridad) =>
          autoridad.nombre_persona.toLowerCase().includes(term) ||
          autoridad.cargo.toLowerCase().includes(term) ||
          autoridad.correos.some((correo) =>
            correo.email_persona.toLowerCase().includes(term)
          )
      );
      setFilteredAutoridades(filtered);
    }
    setCurrentPage(1);
    setTotalPages(Math.ceil(filteredAutoridades.length / itemsPerPage));
  }, [searchTerm, autoridades]);

  // Actualizar total de páginas cuando cambian los resultados filtrados
  useEffect(() => {
    setTotalPages(Math.ceil(filteredAutoridades.length / itemsPerPage));
  }, [filteredAutoridades]);

  // Obtener autoridades para la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAutoridades.slice(startIndex, endIndex);
  };

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Abrir modal de eliminación
  const openDeleteModal = (autoridad) => {
    setSelectedAutoridad(autoridad);
    setIsDeleteModalOpen(true);
  };

  // Cerrar modal de eliminación
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedAutoridad(null);
  };

  // Abrir modal de formulario para editar
  const openEditModal = (autoridad) => {
    setSelectedAutoridad(autoridad);

    // Extraer los emails de los correos
    const emails = autoridad.correos.map((correo) => correo.email_persona);

    setFormData({
      nombre_persona: autoridad.nombre_persona,
      cargo: autoridad.cargo,
      emails: emails,
      imagen_persona: null,
      quitar_imagen: false,
    });

    // Mostrar la imagen actual si existe
    setImagePreview(autoridad.imagen_persona_url);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Abrir modal de formulario para agregar
  const openAddModal = () => {
    setSelectedAutoridad(null);
    setFormData({
      nombre_persona: "",
      cargo: "",
      emails: [],
      imagen_persona: null,
      quitar_imagen: false,
    });
    setImagePreview(null);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Cerrar modal de formulario
  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedAutoridad(null);
    setFormData({
      nombre_persona: "",
      cargo: "",
      emails: [],
      imagen_persona: null,
      quitar_imagen: false,
    });
    setNewEmail("");
    setImagePreview(null);
    setFormErrors({});
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "nombre_persona") {
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

    if (name === "cargo") {
      const soloLetras = value
        .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
        .replace(/\s{2,}/g, " ");

      const limitado = soloLetras.slice(0, 30);

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

    setFormData({
      ...formData,
      [name]: value,
    });
    // Limpiar error cuando el usuario comienza a escribir
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  // Manejar cambio de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        setFormErrors({
          ...formErrors,
          imagen_persona: "El archivo debe ser una imagen.",
        });
        return;
      }

      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setFormErrors({
          ...formErrors,
          imagen_persona: "La imagen no debe superar los 2MB.",
        });
        return;
      }

      setFormData({
        ...formData,
        imagen_persona: file,
        quitar_imagen: false, // Si se sube una nueva imagen, no se quiere quitar
      });

      // Crear URL para previsualización
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Limpiar error
      setFormErrors({
        ...formErrors,
        imagen_persona: null,
      });
    }
  };

  // Manejar quitar imagen
  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      imagen_persona: null,
      quitar_imagen: true,
    });
    setImagePreview(null);
  };

  // Manejar cancelar quitar imagen
  const handleCancelRemoveImage = () => {
    setFormData({
      ...formData,
      quitar_imagen: false,
    });
    // Restaurar la imagen previa si estamos editando
    if (selectedAutoridad && selectedAutoridad.imagen_persona_url) {
      setImagePreview(selectedAutoridad.imagen_persona_url);
    }
  };

  // Agregar email al formulario
  const addEmail = () => {
    if (!newEmail.trim()) {
      setFormErrors({
        ...formErrors,
        newEmail: "El correo no puede estar vacío.",
      });
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setFormErrors({
        ...formErrors,
        newEmail: "Formato de correo inválido.",
      });
      return;
    }

    // Verificar si el correo ya existe
    if (formData.emails.includes(newEmail)) {
      setFormErrors({
        ...formErrors,
        newEmail: "Este correo ya ha sido agregado.",
      });
      return;
    }

    setFormData({
      ...formData,
      emails: [...formData.emails, newEmail],
    });
    setNewEmail("");

    // Limpiar error
    setFormErrors({
      ...formErrors,
      newEmail: null,
    });
  };

  // Eliminar email del formulario
  const removeEmail = (index) => {
    const updatedEmails = [...formData.emails];
    updatedEmails.splice(index, 1);
    setFormData({
      ...formData,
      emails: updatedEmails,
    });
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.nombre_persona.trim()) {
      errors.nombre_persona = "El nombre es obligatorio.";
    }

    if (!formData.cargo.trim()) {
      errors.cargo = "El cargo es obligatorio.";
    }

    // Validar formato de todos los correos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of formData.emails) {
      if (!emailRegex.test(email)) {
        errors.emails = `El correo "${email}" tiene un formato inválido.`;
        break;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Eliminar autoridad
  const handleDelete = async () => {
    if (!selectedAutoridad) return;

    try {
      setIsSubmitting(true);
      await api.delete(`/autoridadesEliminar/${selectedAutoridad.id_persona}`);

      // Actualizar lista de autoridades
      setAutoridades(
        autoridades.filter((a) => a.id_persona !== selectedAutoridad.id_persona)
      );
      agregarMensaje(
        "success",
        "#2E7D32",
        "Autoridad eliminada correctamente."
      );
      closeDeleteModal();
    } catch (error) {
      console.error("Error al eliminar:", error);
      agregarMensaje("fail", "#D32F2F", "Error al eliminar la autoridad.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guardar autoridad (crear o actualizar)
  const handleSave = async () => {
    if (!validateForm()) return;

    // Verificar si ya existe una autoridad con el mismo nombre
    const nombreNormalizado = formData.nombre_persona.trim().toLowerCase();
    const autoridadExistente = autoridades.find(
      (a) =>
        a.nombre_persona.toLowerCase() === nombreNormalizado &&
        (!selectedAutoridad || a.id_persona !== selectedAutoridad.id_persona)
    );

    if (autoridadExistente) {
      agregarMensaje(
        "warning",
        "#ED6C02",
        "Ya existe una autoridad con este nombre."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Crear FormData para enviar la imagen y los correos
      const formDataToSend = new FormData();
      formDataToSend.append("nombre_persona", formData.nombre_persona);
      formDataToSend.append("cargo", formData.cargo);

      // Agregar los correos con la notación correcta
      formData.emails.forEach((email, index) => {
        formDataToSend.append(`correos[${index}]`, email);
      });

      // Agregar la imagen si existe
      if (formData.imagen_persona) {
        formDataToSend.append("imagen", formData.imagen_persona);
      }

      // Agregar flag para quitar imagen si es necesario
      if (formData.quitar_imagen) {
        formDataToSend.append("quitar_imagen", "1");
      }

      let response;

      if (selectedAutoridad) {
        // Actualizar autoridad existente
        response = await api.post(
          `/autoridadesActualizar/${selectedAutoridad.id_persona}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Actualizar lista de autoridades
        setAutoridades(
          autoridades.map((a) =>
            a.id_persona === selectedAutoridad.id_persona ? response.data : a
          )
        );
        agregarMensaje(
          "success",
          "#2E7D32",
          "Autoridad actualizada correctamente."
        );
      } else {
        // Crear nueva autoridad
        response = await api.post("/autoridadesCrear", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Actualizar lista de autoridades
        setAutoridades([...autoridades, response.data]);
        agregarMensaje("success", "#2E7D32", "Autoridad creada correctamente.");
      }

      closeFormModal();
    } catch (error) {
      console.error("Error al guardar:", error);
      agregarMensaje(
        "fail",
        "#D32F2F",
        `Error al ${selectedAutoridad ? "actualizar" : "crear"} la autoridad.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando autoridades..." />;
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
        <User size={24} /> Autoridades de la carrera
      </Title>

      <TopControls>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Buscar por nombre, cargo o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon>
            <Search size={16} />
          </SearchIcon>
        </SearchContainer>

        <AddButton onClick={openAddModal}>
          <Plus size={16} /> Agregar autoridad
        </AddButton>
      </TopControls>

      {/* Vista de escritorio */}
      <DesktopView>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableHeaderCell>Nombre</TableHeaderCell>
              <TableHeaderCell>Cargo</TableHeaderCell>
              <TableHeaderCell>Correo</TableHeaderCell>
              <TableHeaderCell>Imagen</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableHeader>

            <TableBody>
              {getCurrentPageItems().length > 0 ? (
                getCurrentPageItems().map((autoridad) => (
                  <TableRow key={autoridad.id_persona}>
                    <TableCell>{autoridad.nombre_persona}</TableCell>
                    <TableCell>{autoridad.cargo}</TableCell>
                    <TableCell>
                      <Mail size={16} />
                      {autoridad.correos.length > 0
                        ? autoridad.correos[0].email_persona
                        : "Sin correo"}
                      {autoridad.correos.length > 1 && (
                        <span
                          title={autoridad.correos
                            .map((c) => c.email_persona)
                            .join(", ")}
                        >
                          {` (+${autoridad.correos.length - 1} más)`}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ProfileImage>
                        {autoridad.imagen_persona_url ? (
                          <img
                            src={
                              autoridad.imagen_persona_url || "/placeholder.svg"
                            }
                            alt={autoridad.nombre_persona}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder.svg";
                            }}
                          />
                        ) : (
                          <User size={16} />
                        )}
                      </ProfileImage>
                    </TableCell>
                    <TableCell>
                      <ActionButtons>
                        <EditButton
                          onClick={() => openEditModal(autoridad)}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </EditButton>
                        <DeleteButton
                          onClick={() => openDeleteModal(autoridad)}
                          title="Eliminar"
                        >
                          <Trash size={16} />
                        </DeleteButton>
                      </ActionButtons>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <NoResults>No se encontraron autoridades</NoResults>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DesktopView>

      {/* Vista móvil */}
      <MobileView>
        {getCurrentPageItems().length > 0 ? (
          getCurrentPageItems().map((autoridad) => (
            <MobileCard key={autoridad.id_persona}>
              <MobileCardHeader>
                <MobileCardTitle>{autoridad.nombre_persona}</MobileCardTitle>
                <ProfileImage>
                  {autoridad.imagen_persona_url ? (
                    <img
                      src={autoridad.imagen_persona_url || "/placeholder.svg"}
                      alt={autoridad.nombre_persona}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <User size={16} />
                  )}
                </ProfileImage>
              </MobileCardHeader>
              <MobileCardContent>
                <MobileCardItem>
                  <Briefcase size={16} />
                  {autoridad.cargo}
                </MobileCardItem>
                <MobileCardItem>
                  <Mail size={16} />
                  {autoridad.correos.length > 0
                    ? autoridad.correos[0].email_persona
                    : "Sin correo"}
                  {autoridad.correos.length > 1 && (
                    <span
                      style={{ fontStyle: "italic", marginLeft: "0.25rem" }}
                    >
                      {`(+${autoridad.correos.length - 1} más)`}
                    </span>
                  )}
                </MobileCardItem>
              </MobileCardContent>
              <MobileCardActions>
                <EditButton
                  onClick={() => openEditModal(autoridad)}
                  title="Editar"
                >
                  <Edit size={16} />
                </EditButton>
                <DeleteButton
                  onClick={() => openDeleteModal(autoridad)}
                  title="Eliminar"
                >
                  <Trash size={16} />
                </DeleteButton>
              </MobileCardActions>
            </MobileCard>
          ))
        ) : (
          <NoResults>No se encontraron autoridades</NoResults>
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
                  ¿Está seguro que desea eliminar a{" "}
                  <strong>{selectedAutoridad?.nombre_persona}</strong>?
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
                {selectedAutoridad ? "Editar autoridad" : "Agregar autoridad"}
              </ModalTitle>
              <ModalCloseButton onClick={closeFormModal}>
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label htmlFor="nombre_persona">
                  <User size={16} className="inline mr-2" /> Nombre completo *
                </Label>
                <Input
                  type="text"
                  id="nombre_persona"
                  name="nombre_persona"
                  value={formData.nombre_persona}
                  onChange={handleFormChange}
                  placeholder="Ej. Dr. Juan Pérez"
                />
                {formErrors.nombre_persona && (
                  <ErrorMessage>{formErrors.nombre_persona}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="cargo">
                  <Briefcase size={16} className="inline mr-2" /> Cargo *
                </Label>
                <Input
                  type="text"
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleFormChange}
                  placeholder="Ej. Director de Carrera"
                />
                {formErrors.cargo && (
                  <ErrorMessage>{formErrors.cargo}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>
                  <Mail size={16} className="inline mr-2" /> Correos
                  electrónicos
                </Label>

                {/* Lista de correos */}
                <EmailList>
                  {formData.emails.length > 0 ? (
                    formData.emails.map((email, index) => (
                      <EmailItem key={index}>
                        <EmailContent>
                          <Mail size={16} />
                          {email}
                        </EmailContent>
                        <EmailActions>
                          <IconButton
                            onClick={() => removeEmail(index)}
                            color="#ef4444"
                            hoverColor="#dc2626"
                            title="Eliminar"
                          >
                            <Trash size={18} />
                          </IconButton>
                        </EmailActions>
                      </EmailItem>
                    ))
                  ) : (
                    <div
                      style={{
                        color: "#6b7280",
                        fontStyle: "italic",
                        fontSize: "0.875rem",
                        padding: "0.5rem 0",
                      }}
                    >
                      No hay correos agregados
                    </div>
                  )}
                </EmailList>

                {/* Agregar nuevo correo */}
                <AddEmailContainer>
                  <AddEmailInput
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Agregar nuevo correo"
                  />
                  <AddEmailButton onClick={addEmail}>
                    <Plus size={16} /> Agregar
                  </AddEmailButton>
                </AddEmailContainer>
                {formErrors.newEmail && (
                  <ErrorMessage>{formErrors.newEmail}</ErrorMessage>
                )}
                {formErrors.emails && (
                  <ErrorMessage>{formErrors.emails}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="imagen_persona">
                  <ImageIcon size={16} className="inline mr-2" /> Imagen de
                  perfil
                </Label>
                <ImagePreviewContainer>
                  <ImagePreview>
                    {imagePreview && !formData.quitar_imagen ? (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Vista previa"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <User size={40} />
                    )}
                  </ImagePreview>

                  <ImageActions>
                    {imagePreview && !formData.quitar_imagen ? (
                      <RemoveImageButton onClick={handleRemoveImage}>
                        <XCircle size={16} /> Quitar imagen
                      </RemoveImageButton>
                    ) : formData.quitar_imagen &&
                      selectedAutoridad?.imagen_persona ? (
                      <Button onClick={handleCancelRemoveImage}>
                        <Upload size={16} /> Restaurar imagen
                      </Button>
                    ) : null}

                    <UploadButton htmlFor="imagen_persona">
                      <Upload size={16} />{" "}
                      {imagePreview ? "Cambiar imagen" : "Subir imagen"}
                      <input
                        type="file"
                        id="imagen_persona"
                        name="imagen_persona"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                      />
                    </UploadButton>
                  </ImageActions>
                </ImagePreviewContainer>
                {formErrors.imagen_persona && (
                  <ErrorMessage>{formErrors.imagen_persona}</ErrorMessage>
                )}
              </FormGroup>
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
                    <Save size={16} /> Guardar
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
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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
  overflow-x: hidden; /* Prevenir scroll horizontal */

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

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
  width: 100%;
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
  min-width: 650px; /* Ancho mínimo para evitar que se comprima demasiado */
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns:
    minmax(150px, 1.5fr) minmax(120px, 1fr) minmax(180px, 1.5fr)
    minmax(80px, 0.5fr) minmax(100px, 0.5fr);
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
    minmax(150px, 1.5fr) minmax(120px, 1fr) minmax(180px, 1.5fr)
    minmax(80px, 0.5fr) minmax(100px, 0.5fr);
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

const ImagePreviewContainer = styled.div`
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ImagePreview = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px dashed #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  margin-bottom: 0.75rem;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ImageActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const RemoveImageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #dc2626;
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const UploadButton = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e5e7eb;
  }

  svg {
    margin-right: 0.5rem;
  }

  input {
    display: none;
  }
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

const ProfileImage = styled.div`
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

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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

// Componentes para múltiples correos
const EmailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
`;

const EmailItem = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background-color: #f9fafb;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const EmailContent = styled.div`
  flex-grow: 1;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  word-break: break-word;
  overflow-wrap: break-word;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const EmailActions = styled.div`
  display: flex;
  margin-left: 0.5rem;

  @media (max-width: 480px) {
    margin-left: 0;
    justify-content: flex-end;
    width: 100%;
  }
`;

const AddEmailContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 0.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const AddEmailInput = styled.input`
  flex-grow: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  }

  @media (max-width: 480px) {
    border-radius: 0.375rem;
    width: 100%;
  }
`;

const AddEmailButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }

  svg {
    margin-right: 0.25rem;
  }

  @media (max-width: 480px) {
    border-radius: 0.375rem;
    width: 100%;
  }
`;
