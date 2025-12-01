import { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import {
  Search,
  Plus,
  Edit,
  Trash,
  X,
  Save,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Upload,
  XCircle,
  ExternalLink,
  File,
  FileImage,
  FileIcon as FilePdf,
  FileSpreadsheet,
  FileTextIcon,
  FileIcon as FileWord,
} from "lucide-react";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import CajaMensaje from "../../../components/utils/CajaMensaje";

export default function TramitesAdmin() {
  const [tramites, setTramites] = useState([]);
  const [filteredTramites, setFilteredTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTramite, setSelectedTramite] = useState(null);
  const [formData, setFormData] = useState({
    titulo_tramite: "",
    descripcion_tramite: "",
    planilla: null,
    quitar_planilla: false,
  });
  const [filePreview, setFilePreview] = useState(null);
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

  // Cargar datos de trámites
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/tramites");
        setTramites(response.data);
        setFilteredTramites(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        agregarMensaje("fail", "#D32F2F", "Error al cargar los trámites.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar trámites cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTramites(tramites);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = tramites.filter(
        (tramite) =>
          tramite.titulo_tramite.toLowerCase().includes(term) ||
          (tramite.descripcion_tramite &&
            tramite.descripcion_tramite.toLowerCase().includes(term))
      );
      setFilteredTramites(filtered);
    }
    setCurrentPage(1);
    setTotalPages(Math.ceil(filteredTramites.length / itemsPerPage));
  }, [searchTerm, tramites]);

  // Actualizar total de páginas cuando cambian los resultados filtrados
  useEffect(() => {
    setTotalPages(Math.ceil(filteredTramites.length / itemsPerPage));
  }, [filteredTramites]);

  // Obtener trámites para la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTramites.slice(startIndex, endIndex);
  };

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Abrir modal de eliminación
  const openDeleteModal = (tramite) => {
    setSelectedTramite(tramite);
    setIsDeleteModalOpen(true);
  };

  // Cerrar modal de eliminación
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedTramite(null);
  };

  // Abrir modal de formulario para editar
  const openEditModal = (tramite) => {
    setSelectedTramite(tramite);
    setFormData({
      titulo_tramite: tramite.titulo_tramite,
      descripcion_tramite: tramite.descripcion_tramite || "",
      planilla: null,
      quitar_planilla: false,
    });
    setFilePreview(tramite.planilla_download_url);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Abrir modal de formulario para agregar
  const openAddModal = () => {
    setSelectedTramite(null);
    setFormData({
      titulo_tramite: "",
      descripcion_tramite: "",
      planilla: null,
      quitar_planilla: false,
    });
    setFilePreview(null);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Cerrar modal de formulario
  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedTramite(null);
    setFormData({
      titulo_tramite: "",
      descripcion_tramite: "",
      planilla: null,
      quitar_planilla: false,
    });
    setFilePreview(null);
    setFormErrors({});
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "titulo_tramite") {
      const limitado = value.slice(0, 80);

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

  // Manejar cambio de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        setFormErrors({
          ...formErrors,
          planilla: "El archivo debe ser PDF, Word, Excel, TXT o imagen.",
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({
          ...formErrors,
          planilla: "El archivo no debe superar los 5MB.",
        });
        return;
      }

      setFormData({
        ...formData,
        planilla: file,
        quitar_planilla: false, // Si se sube un nuevo archivo, no se quiere quitar
      });

      // Crear URL para previsualización
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Limpiar error
      setFormErrors({
        ...formErrors,
        planilla: null,
      });
    }
  };

  // Manejar quitar archivo
  const handleRemoveFile = () => {
    setFormData({
      ...formData,
      planilla: null,
      quitar_planilla: true,
    });
    setFilePreview(null);
  };

  // Manejar cancelar quitar archivo
  const handleCancelRemoveFile = () => {
    setFormData({
      ...formData,
      quitar_planilla: false,
    });
    // Restaurar el archivo previo si estamos editando
    if (selectedTramite && selectedTramite.planilla_download_url) {
      setFilePreview(selectedTramite.planilla_download_url);
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.titulo_tramite.trim()) {
      errors.titulo_tramite = "El título es obligatorio.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Eliminar trámite
  const handleDelete = async () => {
    if (!selectedTramite) return;

    try {
      setIsSubmitting(true);
      await api.delete(`/tramitesEliminar/${selectedTramite.id_tramite}`);

      // Actualizar lista de trámites
      setTramites(
        tramites.filter((t) => t.id_tramite !== selectedTramite.id_tramite)
      );
      agregarMensaje("success", "#2E7D32", "Trámite eliminado correctamente.");
      closeDeleteModal();
    } catch (error) {
      console.error("Error al eliminar:", error);
      agregarMensaje("fail", "#D32F2F", "Error al eliminar el trámite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guardar trámite (crear o actualizar)
  const handleSave = async () => {
    if (!validateForm()) return;

    // Verificar si ya existe un trámite con el mismo título
    const tituloNormalizado = formData.titulo_tramite.trim().toLowerCase();
    const tramiteExistente = tramites.find(
      (t) =>
        t.titulo_tramite.toLowerCase() === tituloNormalizado &&
        (!selectedTramite || t.id_tramite !== selectedTramite.id_tramite)
    );

    if (tramiteExistente) {
      agregarMensaje(
        "warning",
        "#ED6C02",
        "Ya existe un trámite con este título."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Crear FormData para enviar el archivo
      const formDataToSend = new FormData();
      formDataToSend.append("titulo_tramite", formData.titulo_tramite);

      if (formData.descripcion_tramite) {
        formDataToSend.append(
          "descripcion_tramite",
          formData.descripcion_tramite
        );
      }

      // Agregar el archivo si existe
      if (formData.planilla) {
        formDataToSend.append("planilla", formData.planilla);
      }

      // Agregar flag para quitar archivo si es necesario
      if (formData.quitar_planilla) {
        formDataToSend.append("quitar_planilla", "1");
      }

      let response;

      if (selectedTramite) {
        // Actualizar trámite existente
        response = await api.post(
          `/tramitesActualizar/${selectedTramite.id_tramite}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Actualizar lista de trámites
        setTramites(
          tramites.map((t) =>
            t.id_tramite === selectedTramite.id_tramite ? response.data : t
          )
        );
        agregarMensaje(
          "success",
          "#2E7D32",
          "Trámite actualizado correctamente."
        );
      } else {
        // Crear nuevo trámite
        response = await api.post("/tramitesCrear", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Actualizar lista de trámites
        setTramites([...tramites, response.data]);
        agregarMensaje("success", "#2E7D32", "Trámite creado correctamente.");
      }

      closeFormModal();
    } catch (error) {
      console.error("Error al guardar:", error);
      agregarMensaje(
        "fail",
        "#D32F2F",
        `Error al ${selectedTramite ? "actualizar" : "crear"} el trámite.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para obtener el icono según el tipo de archivo
  const getFileIcon = (url) => {
    if (!url) return <File size={20} />;

    const extension = url.split(".").pop().toLowerCase();

    switch (extension) {
      case "pdf":
        return <FilePdf size={20} />;
      case "doc":
      case "docx":
        return <FileWord size={20} />;
      case "xls":
      case "xlsx":
        return <FileSpreadsheet size={20} />;
      case "txt":
        return <FileTextIcon size={20} />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <FileImage size={20} />;
      default:
        return <File size={20} />;
    }
  };

  // Función para abrir el archivo en una nueva pestaña
  const handleFileClick = (url) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando trámites..." />;
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
        <FileText size={24} /> Trámites de la carrera
      </Title>

      <TopControls>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon>
            <Search size={16} />
          </SearchIcon>
        </SearchContainer>

        <AddButton onClick={openAddModal}>
          <Plus size={16} /> Agregar trámite
        </AddButton>
      </TopControls>

      {/* Vista de escritorio */}
      <DesktopView>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableHeaderCell>Título</TableHeaderCell>
              <TableHeaderCell>Descripción</TableHeaderCell>
              <TableHeaderCell>Planilla</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableHeader>

            <TableBody>
              {getCurrentPageItems().length > 0 ? (
                getCurrentPageItems().map((tramite) => (
                  <TableRow key={tramite.id_tramite}>
                    <TableCell allowWrap={true}>
                      <FileText size={16} style={{ flexShrink: 0 }} />
                      <span>{tramite.titulo_tramite}</span>
                    </TableCell>
                    <DescriptionCell>
                      {tramite.descripcion_tramite || "Sin descripción"}
                    </DescriptionCell>
                    <FileCell
                      hasFile={tramite.planilla_download_url}
                      onClick={() =>
                        handleFileClick(tramite.planilla_download_url)
                      }
                    >
                      {tramite.planilla_download_url ? (
                        <>
                          {getFileIcon(tramite.planilla_download_url)}
                          <span>Ver planilla</span>
                          <ExternalLink size={14} />
                        </>
                      ) : (
                        <>
                          <File size={16} />
                          <span>Sin planilla</span>
                        </>
                      )}
                    </FileCell>
                    <TableCell>
                      <ActionButtons>
                        <EditButton
                          onClick={() => openEditModal(tramite)}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </EditButton>
                        <DeleteButton
                          onClick={() => openDeleteModal(tramite)}
                          title="Eliminar"
                        >
                          <Trash size={16} />
                        </DeleteButton>
                      </ActionButtons>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <NoResults>No se encontraron trámites</NoResults>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DesktopView>

      {/* Vista móvil */}
      <MobileView>
        {getCurrentPageItems().length > 0 ? (
          getCurrentPageItems().map((tramite) => (
            <MobileCard key={tramite.id_tramite}>
              <MobileCardHeader>
                <MobileCardTitle>
                  <FileText size={16} />
                  {tramite.titulo_tramite}
                </MobileCardTitle>
              </MobileCardHeader>
              <MobileCardContent>
                <MobileCardDescription>
                  {tramite.descripcion_tramite || "Sin descripción"}
                </MobileCardDescription>
                <MobileCardFile
                  hasFile={tramite.planilla_download_url}
                  onClick={() => handleFileClick(tramite.planilla_download_url)}
                >
                  {tramite.planilla_download_url ? (
                    <>
                      {getFileIcon(tramite.planilla_download_url)}
                      <span>Ver planilla</span>
                      <ExternalLink size={14} />
                    </>
                  ) : (
                    <>
                      <File size={16} />
                      <span>Sin planilla</span>
                    </>
                  )}
                </MobileCardFile>
              </MobileCardContent>
              <MobileCardActions>
                <EditButton
                  onClick={() => openEditModal(tramite)}
                  title="Editar"
                >
                  <Edit size={16} />
                </EditButton>
                <DeleteButton
                  onClick={() => openDeleteModal(tramite)}
                  title="Eliminar"
                >
                  <Trash size={16} />
                </DeleteButton>
              </MobileCardActions>
            </MobileCard>
          ))
        ) : (
          <NoResults>No se encontraron trámites</NoResults>
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
                  ¿Está seguro que desea eliminar el trámite{" "}
                  <strong>{selectedTramite?.titulo_tramite}</strong>?
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
                {selectedTramite ? "Editar trámite" : "Agregar trámite"}
              </ModalTitle>
              <ModalCloseButton onClick={closeFormModal}>
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label htmlFor="titulo_tramite">
                  <FileText size={16} className="inline mr-2" /> Título del
                  trámite *
                </Label>
                <Input
                  type="text"
                  id="titulo_tramite"
                  name="titulo_tramite"
                  value={formData.titulo_tramite}
                  onChange={handleFormChange}
                  placeholder="Ej. Solicitud de Titulación"
                />
                {formErrors.titulo_tramite && (
                  <ErrorMessage>{formErrors.titulo_tramite}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="descripcion_tramite">
                  <FileText size={16} className="inline mr-2" /> Descripción
                </Label>
                <TextArea
                  id="descripcion_tramite"
                  name="descripcion_tramite"
                  value={formData.descripcion_tramite}
                  onChange={handleFormChange}
                  placeholder="Descripción detallada del trámite..."
                />
                {formErrors.descripcion_tramite && (
                  <ErrorMessage>{formErrors.descripcion_tramite}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="planilla">
                  <File size={16} className="inline mr-2" /> Planilla (PDF,
                  Word, Excel, TXT o imagen)
                </Label>
                <FilePreviewContainer>
                  <FilePreview>
                    {filePreview && !formData.quitar_planilla ? (
                      <FileInfo>
                        {getFileIcon(filePreview)}
                        <span>
                          {formData.planilla
                            ? formData.planilla.name
                            : "Planilla actual"}
                        </span>
                      </FileInfo>
                    ) : (
                      <FileInfo>
                        <File size={20} />
                        <span>Sin planilla</span>
                      </FileInfo>
                    )}
                  </FilePreview>

                  <FileActions>
                    {filePreview && !formData.quitar_planilla ? (
                      <>
                        <RemoveFileButton onClick={handleRemoveFile}>
                          <XCircle size={16} /> Quitar planilla
                        </RemoveFileButton>

                        {selectedTramite &&
                          selectedTramite.planilla_download_url && (
                            <ViewFileButton
                              href={selectedTramite.planilla_download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink size={16} /> Ver planilla
                            </ViewFileButton>
                          )}
                      </>
                    ) : formData.quitar_planilla &&
                      selectedTramite?.planilla_url ? (
                      <Button onClick={handleCancelRemoveFile}>
                        <Upload size={16} /> Restaurar planilla
                      </Button>
                    ) : null}

                    <UploadButton htmlFor="planilla">
                      <Upload size={16} />{" "}
                      {filePreview ? "Cambiar planilla" : "Subir planilla"}
                      <input
                        type="file"
                        id="planilla"
                        name="planilla"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                    </UploadButton>
                  </FileActions>
                </FilePreviewContainer>
                {formErrors.planilla && (
                  <ErrorMessage>{formErrors.planilla}</ErrorMessage>
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
// Modificar el TableCell para el título en la vista de escritorio
const TableCell = styled.div`
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: ${(props) => (props.allowWrap ? "normal" : "nowrap")};
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: ${(props) => (props.allowWrap ? "break-word" : "normal")};
  overflow-wrap: ${(props) => (props.allowWrap ? "break-word" : "normal")};
  line-height: ${(props) => (props.allowWrap ? "1.3" : "inherit")};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.6s ease-out;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem;
    width: 100%;
    border-radius: 0;
    box-shadow: none;
    max-width: 100vw;
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
    margin-left: 0;
    margin-right: 0;
    width: 100%;
    overflow-x: hidden;
  }
`;

const Table = styled.div`
  width: 100%;
  min-width: 650px;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns:
    minmax(150px, 1fr) minmax(250px, 2fr) minmax(120px, 1fr)
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

// Actualizar el TableRow en la vista de escritorio para permitir que el título se ajuste
const TableRow = styled.div`
  display: grid;
  grid-template-columns:
    minmax(150px, 1fr) minmax(250px, 2fr) minmax(120px, 1fr)
    minmax(100px, 0.5fr);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
  animation: ${slideUp} 0.3s ease-in-out;
  align-items: center;

  &:hover {
    background-color: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const DescriptionCell = styled(TableCell)`
  white-space: normal;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
`;

const FileCell = styled(TableCell)`
  cursor: ${(props) => (props.hasFile ? "pointer" : "default")};
  color: ${(props) => (props.hasFile ? "#3b82f6" : "#6b7280")};

  &:hover {
    text-decoration: ${(props) => (props.hasFile ? "underline" : "none")};
  }
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
  max-width: 600px;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  animation: ${slideUp} 0.3s ease-in-out;
  display: flex;
  flex-direction: column;

  @media (max-width: 640px) {
    max-width: 100%;
    border-radius: 0.375rem;
    margin: 0 0.5rem;
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  min-height: 120px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  }
`;

const FilePreviewContainer = styled.div`
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FilePreview = styled.div`
  width: 100%;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px dashed #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  margin-bottom: 0.75rem;
  flex-direction: column;
  gap: 0.5rem;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
`;

const FileActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  width: 100%;
  justify-content: center;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }
`;

const RemoveFileButton = styled.button`
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

const ViewFileButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  text-decoration: none;

  &:hover {
    background-color: #059669;
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

// Componente para pantallas móviles
const MobileCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  animation: ${slideUp} 0.3s ease-in-out;
  width: 100%;
  box-sizing: border-box;
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

// Modificar el MobileCardTitle para la vista móvil
const MobileCardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.3;

  svg {
    flex-shrink: 0;
    margin-top: 0.2rem;
  }
`;

const MobileCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const MobileCardDescription = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  word-break: break-word;
  overflow-wrap: break-word;
`;

const MobileCardFile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${(props) => (props.hasFile ? "#3b82f6" : "#6b7280")};
  cursor: ${(props) => (props.hasFile ? "pointer" : "default")};

  &:hover {
    text-decoration: ${(props) => (props.hasFile ? "underline" : "none")};
  }
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
    width: 100%;
    overflow-x: hidden;
  }
`;

const DesktopView = styled.div`
  display: block;

  @media (max-width: 768px) {
    display: none;
  }
`;
