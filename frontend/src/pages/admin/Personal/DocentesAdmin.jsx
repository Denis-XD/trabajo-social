import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Book,
  Eye,
  FileSpreadsheet,
  Settings,
} from "lucide-react";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import CajaMensaje from "../../../components/utils/CajaMensaje";

export default function DocentesAdmin() {
  const navigate = useNavigate();
  const [docentes, setDocentes] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [filteredDocentes, setFilteredDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAsignatura, setNewAsignatura] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [formData, setFormData] = useState({
    nombre_persona: "",
    cargo: "Docente",
    emails: [],
    asignaturas: [],
    nuevasAsignaturas: [],
    imagen_persona: null,
    quitar_imagen: false,
  });
  const [newEmail, setNewEmail] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
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

  // Cargar datos de docentes y asignaturas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/docentes");
        setDocentes(response.data.docentes);
        setAsignaturas(response.data.asignaturas);
        setFilteredDocentes(response.data.docentes);
        setTotalPages(Math.ceil(response.data.docentes.length / itemsPerPage));
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        agregarMensaje("fail", "#D32F2F", "Error al cargar los docentes.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar docentes cuando cambia el término de búsqueda o el filtro de asignatura
  useEffect(() => {
    let filtered = [...docentes];

    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (docente) =>
          docente.nombre_persona.toLowerCase().includes(term) ||
          docente.cargo.toLowerCase().includes(term) ||
          docente.correos.some((correo) =>
            correo.email_persona.toLowerCase().includes(term)
          ) ||
          docente.asignaturas.some((asignatura) =>
            asignatura.nombre_asignatura.toLowerCase().includes(term)
          )
      );
    }

    setFilteredDocentes(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [searchTerm, docentes]);

  // Obtener docentes para la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDocentes.slice(startIndex, endIndex);
  };

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Modificar la función handleExcelUpload para enviar el archivo a la API
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificar que sea un archivo Excel
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.oasis.opendocument.spreadsheet",
      ];

      if (!validTypes.includes(file.type)) {
        agregarMensaje(
          "warning",
          "#ED6C02",
          "El archivo debe ser de tipo Excel (.xls, .xlsx, .ods)."
        );
        e.target.value = null;
        return;
      }

      try {
        setIsSubmitting(true);

        // Crear FormData para enviar el archivo
        const formData = new FormData();
        formData.append("excel", file);

        // Enviar el archivo a la API
        await api.post("/docentes-importar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Recargar los datos después de importar
        const response = await api.get("/docentes");
        setDocentes(response.data.docentes);
        setAsignaturas(response.data.asignaturas);
        setFilteredDocentes(response.data.docentes);

        agregarMensaje(
          "success",
          "#2E7D32",
          "Archivo Excel importado correctamente."
        );
      } catch (error) {
        console.error("Error al importar el archivo:", error);
        agregarMensaje(
          "fail",
          "#D32F2F",
          "Error al importar el archivo Excel."
        );
      } finally {
        setIsSubmitting(false);
        e.target.value = null;
      }
    }
  };

  // Abrir modal de eliminación
  const openDeleteModal = (docente) => {
    setSelectedDocente(docente);
    setIsDeleteModalOpen(true);
  };

  // Cerrar modal de eliminación
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedDocente(null);
  };

  // Abrir modal de detalles
  const openDetailModal = (docente) => {
    setSelectedDocente(docente);
    setIsDetailModalOpen(true);
  };

  // Cerrar modal de detalles
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDocente(null);
  };

  // Abrir modal de formulario para editar
  const openEditModal = (docente) => {
    setSelectedDocente(docente);

    // Extraer los emails de los correos
    const emails = docente.correos.map((correo) => correo.email_persona);

    // Extraer las asignaturas
    const docenteAsignaturas = docente.asignaturas.map((asignatura) => ({
      id: asignatura.id_asignatura,
      nombre: asignatura.nombre_asignatura,
    }));

    setFormData({
      nombre_persona: docente.nombre_persona,
      cargo: docente.cargo || "Docente",
      emails: emails,
      asignaturas: docenteAsignaturas,
      nuevasAsignaturas: [],
      imagen_persona: null,
      quitar_imagen: false,
    });

    // Mostrar la imagen actual si existe
    setImagePreview(docente.imagen_persona_url);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Abrir modal de formulario para agregar
  const openAddModal = () => {
    setSelectedDocente(null);
    setFormData({
      nombre_persona: "",
      cargo: "Docente",
      emails: [],
      asignaturas: [],
      nuevasAsignaturas: [],
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
    setSelectedDocente(null);
    setFormData({
      nombre_persona: "",
      cargo: "Docente",
      emails: [],
      asignaturas: [],
      nuevasAsignaturas: [],
      imagen_persona: null,
      quitar_imagen: false,
    });
    setNewEmail("");
    setNewAsignatura("");
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
    if (selectedDocente && selectedDocente.imagen_persona_url) {
      setImagePreview(selectedDocente.imagen_persona_url);
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

  // Agregar nueva asignatura
  const addNewAsignatura = () => {
    if (!newAsignatura.trim()) {
      setFormErrors({
        ...formErrors,
        newAsignatura: "El nombre de la asignatura no puede estar vacío.",
      });
      return;
    }

    // Verificar si la asignatura ya existe en las existentes
    const asignaturaExistente = asignaturas.find(
      (a) =>
        a.nombre_asignatura.toLowerCase() === newAsignatura.trim().toLowerCase()
    );

    if (asignaturaExistente) {
      // Verificar si ya está agregada
      const yaAgregada = formData.asignaturas.some(
        (a) => a.id === asignaturaExistente.id_asignatura
      );

      if (yaAgregada) {
        setFormErrors({
          ...formErrors,
          newAsignatura: "Esta asignatura ya ha sido agregada.",
        });
        return;
      }

      // Agregar la asignatura existente
      setFormData({
        ...formData,
        asignaturas: [
          ...formData.asignaturas,
          {
            id: asignaturaExistente.id_asignatura,
            nombre: asignaturaExistente.nombre_asignatura,
          },
        ],
      });
    } else {
      // Verificar si la asignatura ya está agregada en las nuevas
      const yaExisteEnNuevas = formData.nuevasAsignaturas.some(
        (a) => a.toLowerCase() === newAsignatura.trim().toLowerCase()
      );

      if (yaExisteEnNuevas) {
        setFormErrors({
          ...formErrors,
          newAsignatura: "Esta asignatura ya ha sido agregada.",
        });
        return;
      }

      // Agregar como nueva asignatura
      setFormData({
        ...formData,
        nuevasAsignaturas: [
          ...formData.nuevasAsignaturas,
          newAsignatura.trim(),
        ],
      });
    }

    setNewAsignatura("");
  };

  // Eliminar asignatura existente
  const removeAsignatura = (index) => {
    const updatedAsignaturas = [...formData.asignaturas];
    updatedAsignaturas.splice(index, 1);
    setFormData({
      ...formData,
      asignaturas: updatedAsignaturas,
    });
  };

  // Eliminar nueva asignatura
  const removeNewAsignatura = (index) => {
    const updatedNuevasAsignaturas = [...formData.nuevasAsignaturas];
    updatedNuevasAsignaturas.splice(index, 1);
    setFormData({
      ...formData,
      nuevasAsignaturas: updatedNuevasAsignaturas,
    });
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.nombre_persona.trim()) {
      errors.nombre_persona = "El nombre es obligatorio.";
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

  // Eliminar docente
  const handleDelete = async () => {
    if (!selectedDocente) return;

    try {
      setIsSubmitting(true);
      await api.delete(`/docentesEliminar/${selectedDocente.id_persona}`);

      // Actualizar lista de docentes
      setDocentes(
        docentes.filter((d) => d.id_persona !== selectedDocente.id_persona)
      );
      agregarMensaje("success", "#2E7D32", "Docente eliminado correctamente.");
      closeDeleteModal();
    } catch (error) {
      console.error("Error al eliminar:", error);
      agregarMensaje("fail", "#D32F2F", "Error al eliminar el docente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guardar docente (crear o actualizar)
  const handleSave = async () => {
    if (!validateForm()) return;

    // Verificar si ya existe un docente con el mismo nombre
    const nombreNormalizado = formData.nombre_persona.trim().toLowerCase();
    const docenteExistente = docentes.find(
      (d) =>
        d.nombre_persona.toLowerCase() === nombreNormalizado &&
        (!selectedDocente || d.id_persona !== selectedDocente.id_persona)
    );

    if (docenteExistente) {
      agregarMensaje(
        "warning",
        "#ED6C02",
        "Ya existe un docente con este nombre."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Crear FormData para enviar la imagen, correos y asignaturas
      const formDataToSend = new FormData();
      formDataToSend.append("nombre_persona", formData.nombre_persona);
      formDataToSend.append("cargo", formData.cargo || "Docente");

      // Agregar los correos con la notación correcta
      formData.emails.forEach((email, index) => {
        formDataToSend.append(`correos[${index}]`, email);
      });

      // Preparar las asignaturas (IDs de existentes y nombres de nuevas)
      const asignaturasToSend = [
        ...formData.asignaturas.map((a) => a.id),
        ...formData.nuevasAsignaturas,
      ];

      // Agregar las asignaturas
      asignaturasToSend.forEach((asignatura, index) => {
        formDataToSend.append(`asignaturas[${index}]`, asignatura);
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

      if (selectedDocente) {
        // Actualizar docente existente
        response = await api.post(
          `/docentesActualizar/${selectedDocente.id_persona}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Actualizar lista de docentes
        setDocentes(
          docentes.map((d) =>
            d.id_persona === selectedDocente.id_persona ? response.data : d
          )
        );
        agregarMensaje(
          "success",
          "#2E7D32",
          "Docente actualizado correctamente."
        );
      } else {
        // Crear nuevo docente
        response = await api.post("/docentesCrear", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Actualizar lista de docentes
        setDocentes([...docentes, response.data]);
        agregarMensaje("success", "#2E7D32", "Docente creado correctamente.");
      }

      // Actualizar lista de asignaturas si se agregaron nuevas
      if (formData.nuevasAsignaturas.length > 0) {
        // Recargar las asignaturas para obtener las nuevas
        const asignaturasResponse = await api.get("/docentes");
        setAsignaturas(asignaturasResponse.data.asignaturas);
      }

      closeFormModal();
    } catch (error) {
      console.error("Error al guardar:", error);
      agregarMensaje(
        "fail",
        "#D32F2F",
        `Error al ${selectedDocente ? "actualizar" : "crear"} el docente.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando docentes..." />;
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
        <User size={24} /> Docentes de la carrera
      </Title>

      {/* Modificar la sección de TopControls para actualizar los botones */}
      <TopControls>
        <SearchFilterContainer>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Buscar por nombre, cargo, correo o asignatura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon>
              <Search size={16} />
            </SearchIcon>
          </SearchContainer>
        </SearchFilterContainer>

        <ButtonsContainer>
          <AddButton onClick={openAddModal}>
            <Plus size={16} /> Agregar
          </AddButton>

          <AsignaturasButton
            onClick={() => navigate("/admin/docentes/asignaturas")}
          >
            <Settings size={16} /> Asignaturas
          </AsignaturasButton>

          <UploadButton htmlFor="excel-upload">
            <FileSpreadsheet size={16} /> Importar
            <input
              type="file"
              id="excel-upload"
              accept=".xls,.xlsx,.ods"
              onChange={handleExcelUpload}
              ref={excelInputRef}
            />
          </UploadButton>
        </ButtonsContainer>
      </TopControls>

      {/* Vista de escritorio */}
      <DesktopView>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableHeaderCell>Nombre</TableHeaderCell>
              <TableHeaderCell>Correo</TableHeaderCell>
              <TableHeaderCell>Asignaturas</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableHeader>

            <TableBody>
              {getCurrentPageItems().length > 0 ? (
                getCurrentPageItems().map((docente) => (
                  <TableRow key={docente.id_persona}>
                    <TableCell>
                      <ProfileImage>
                        {docente.imagen_persona_url ? (
                          <img
                            src={
                              docente.imagen_persona_url || "/placeholder.svg"
                            }
                            alt={docente.nombre_persona}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder.svg";
                            }}
                          />
                        ) : (
                          <User size={16} />
                        )}
                      </ProfileImage>
                      {docente.nombre_persona}
                    </TableCell>
                    <TableCell>
                      {docente.correos.length > 0
                        ? docente.correos[0].email_persona
                        : "Sin correo"}
                      {docente.correos.length > 1 && (
                        <span
                          title={docente.correos
                            .map((c) => c.email_persona)
                            .join(", ")}
                        >
                          {` (+${docente.correos.length - 1} más)`}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {docente.asignaturas.length > 0
                        ? docente.asignaturas[0].nombre_asignatura
                        : "Sin asignaturas"}
                      {docente.asignaturas.length > 1 && (
                        <span
                          title={docente.asignaturas
                            .map((a) => a.nombre_asignatura)
                            .join(", ")}
                        >
                          {` (+${docente.asignaturas.length - 1} más)`}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ActionButtons>
                        <ViewButton
                          onClick={() => openDetailModal(docente)}
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </ViewButton>
                        <EditButton
                          onClick={() => openEditModal(docente)}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </EditButton>
                        <DeleteButton
                          onClick={() => openDeleteModal(docente)}
                          title="Eliminar"
                        >
                          <Trash size={16} />
                        </DeleteButton>
                      </ActionButtons>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <NoResults>No se encontraron docentes</NoResults>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DesktopView>

      {/* Vista móvil */}
      <MobileView>
        {getCurrentPageItems().length > 0 ? (
          getCurrentPageItems().map((docente) => (
            <MobileCard key={docente.id_persona}>
              <MobileCardHeader>
                <MobileCardTitle>{docente.nombre_persona}</MobileCardTitle>
                <ProfileImage>
                  {docente.imagen_persona_url ? (
                    <img
                      src={docente.imagen_persona_url || "/placeholder.svg"}
                      alt={docente.nombre_persona}
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
                  {docente.correos.length > 0
                    ? docente.correos[0].email_persona
                    : "Sin correo"}
                  {docente.correos.length > 1 && (
                    <span
                      style={{ fontStyle: "italic", marginLeft: "0.25rem" }}
                    >
                      {`(+${docente.correos.length - 1} más)`}
                    </span>
                  )}
                </MobileCardItem>
                <MobileCardItem>
                  {docente.asignaturas.length > 0
                    ? docente.asignaturas[0].nombre_asignatura
                    : "Sin asignaturas"}
                  {docente.asignaturas.length > 1 && (
                    <span
                      style={{ fontStyle: "italic", marginLeft: "0.25rem" }}
                    >
                      {`(+${docente.asignaturas.length - 1} más)`}
                    </span>
                  )}
                </MobileCardItem>
              </MobileCardContent>
              <MobileCardActions>
                <ViewButton
                  onClick={() => openDetailModal(docente)}
                  title="Ver detalles"
                >
                  <Eye size={16} />
                </ViewButton>
                <EditButton
                  onClick={() => openEditModal(docente)}
                  title="Editar"
                >
                  <Edit size={16} />
                </EditButton>
                <DeleteButton
                  onClick={() => openDeleteModal(docente)}
                  title="Eliminar"
                >
                  <Trash size={16} />
                </DeleteButton>
              </MobileCardActions>
            </MobileCard>
          ))
        ) : (
          <NoResults>No se encontraron docentes</NoResults>
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
                  <strong>{selectedDocente?.nombre_persona}</strong>?
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

      {/* Modal de detalles */}
      {isDetailModalOpen && selectedDocente && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Detalles del docente</ModalTitle>
              <ModalCloseButton onClick={closeDetailModal}>
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <DetailImageContainer>
                <DetailImage>
                  {selectedDocente.imagen_persona_url ? (
                    <img
                      src={
                        selectedDocente.imagen_persona_url || "/placeholder.svg"
                      }
                      alt={selectedDocente.nombre_persona}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <User size={40} />
                  )}
                </DetailImage>
              </DetailImageContainer>

              <DetailSection>
                <DetailTitle>
                  <User size={18} /> Información personal
                </DetailTitle>
                <DetailContent>
                  <DetailItem>
                    <DetailLabel>Nombre:</DetailLabel>
                    <DetailValue>{selectedDocente.nombre_persona}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Cargo:</DetailLabel>
                    <DetailValue>{selectedDocente.cargo}</DetailValue>
                  </DetailItem>
                </DetailContent>
              </DetailSection>

              <DetailSection>
                <DetailTitle>
                  <Mail size={18} /> Correos electrónicos
                </DetailTitle>
                <DetailContent>
                  {selectedDocente.correos.length > 0 ? (
                    <DetailList>
                      {selectedDocente.correos.map((correo) => (
                        <li key={correo.id_persona_correo}>
                          {correo.email_persona}
                        </li>
                      ))}
                    </DetailList>
                  ) : (
                    <p>No hay correos registrados.</p>
                  )}
                </DetailContent>
              </DetailSection>

              <DetailSection>
                <DetailTitle>
                  <Book size={18} /> Asignaturas
                </DetailTitle>
                <DetailContent>
                  {selectedDocente.asignaturas.length > 0 ? (
                    <DetailList>
                      {selectedDocente.asignaturas.map((asignatura) => (
                        <li key={asignatura.id_asignatura}>
                          {asignatura.nombre_asignatura}
                        </li>
                      ))}
                    </DetailList>
                  ) : (
                    <p>No hay asignaturas asignadas.</p>
                  )}
                </DetailContent>
              </DetailSection>
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={closeDetailModal}>
                <X size={16} /> Cerrar
              </CancelButton>
              <ConfirmButton
                onClick={() => {
                  closeDetailModal();
                  openEditModal(selectedDocente);
                }}
              >
                <Edit size={16} /> Editar
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
                {selectedDocente ? "Editar docente" : "Agregar docente"}
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
                  <Briefcase size={16} className="inline mr-2" /> Cargo
                </Label>
                <Input
                  type="text"
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleFormChange}
                  placeholder="Ej. Docente Titular"
                />
                {formErrors.cargo && (
                  <ErrorMessage>{formErrors.cargo}</ErrorMessage>
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
                      selectedDocente?.imagen_persona ? (
                      <Button onClick={handleCancelRemoveImage}>
                        <Upload size={16} /> Restaurar imagen
                      </Button>
                    ) : null}

                    <UploadImageButton htmlFor="imagen_persona">
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
                    </UploadImageButton>
                  </ImageActions>
                </ImagePreviewContainer>
                {formErrors.imagen_persona && (
                  <ErrorMessage>{formErrors.imagen_persona}</ErrorMessage>
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

              <AsignaturasSection>
                {/* Título de Asignaturas en su propia línea */}
                <AsignaturasTitle style={{ marginBottom: "1rem" }}>
                  <Book size={16} /> Asignaturas
                </AsignaturasTitle>

                {/* Buscador de asignaturas */}
                <div style={{ width: "100%", marginBottom: "1rem" }}>
                  <AddEmailContainer>
                    <AddEmailInput
                      type="text"
                      value={newAsignatura}
                      onChange={(e) => {
                        setNewAsignatura(e.target.value);
                        // Limpiar error cuando el usuario comienza a escribir
                        if (formErrors.newAsignatura) {
                          setFormErrors({
                            ...formErrors,
                            newAsignatura: null,
                          });
                        }
                      }}
                      placeholder="Escriba para buscar o agregar asignatura"
                    />
                    <AddEmailButton onClick={addNewAsignatura}>
                      <Plus size={16} /> Agregar
                    </AddEmailButton>
                  </AddEmailContainer>
                  {formErrors.newAsignatura && (
                    <ErrorMessage>{formErrors.newAsignatura}</ErrorMessage>
                  )}

                  {/* Sugerencias de asignaturas */}
                  {newAsignatura.trim() !== "" && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.375rem",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      {asignaturas
                        .filter((a) =>
                          a.nombre_asignatura
                            .toLowerCase()
                            .includes(newAsignatura.toLowerCase())
                        )
                        .slice(0, 5)
                        .map((asignatura) => (
                          <div
                            key={asignatura.id_asignatura}
                            style={{
                              padding: "0.5rem",
                              cursor: "pointer",
                              borderBottom: "1px solid #e5e7eb",
                              backgroundColor: "#f9fafb",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                            onClick={() => {
                              // Verificar si la asignatura ya está agregada
                              const yaExiste = formData.asignaturas.some(
                                (a) => a.id === asignatura.id_asignatura
                              );

                              if (yaExiste) {
                                setFormErrors({
                                  ...formErrors,
                                  newAsignatura:
                                    "Esta asignatura ya ha sido agregada.",
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  asignaturas: [
                                    ...formData.asignaturas,
                                    {
                                      id: asignatura.id_asignatura,
                                      nombre: asignatura.nombre_asignatura,
                                    },
                                  ],
                                });
                                setNewAsignatura("");
                              }
                            }}
                          >
                            <Book size={16} />
                            {asignatura.nombre_asignatura}
                          </div>
                        ))}
                      {asignaturas.filter((a) =>
                        a.nombre_asignatura
                          .toLowerCase()
                          .includes(newAsignatura.toLowerCase())
                      ).length === 0 && (
                        <div
                          style={{
                            padding: "0.5rem",
                            fontStyle: "italic",
                            color: "#6b7280",
                          }}
                        >
                          No hay coincidencias.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Lista de asignaturas existentes */}
                <AsignaturasList>
                  {formData.asignaturas.length > 0 ? (
                    formData.asignaturas.map((asignatura, index) => (
                      <AsignaturaItem key={index}>
                        <AsignaturaContent>
                          <Book size={16} />
                          {asignatura.nombre}
                        </AsignaturaContent>
                        <AsignaturaActions>
                          <IconButton
                            onClick={() => removeAsignatura(index)}
                            color="#ef4444"
                            hoverColor="#dc2626"
                            title="Eliminar"
                          >
                            <Trash size={18} />
                          </IconButton>
                        </AsignaturaActions>
                      </AsignaturaItem>
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
                      No hay asignaturas agregadas
                    </div>
                  )}
                </AsignaturasList>

                {/* Lista de nuevas asignaturas */}
                {formData.nuevasAsignaturas.length > 0 && (
                  <>
                    <Label>Nuevas asignaturas</Label>
                    <AsignaturasList>
                      {formData.nuevasAsignaturas.map((asignatura, index) => (
                        <AsignaturaItem key={index}>
                          <AsignaturaContent>
                            <Book size={16} />
                            {asignatura}{" "}
                            <span
                              style={{
                                color: "#6b7280",
                                fontStyle: "italic",
                              }}
                            >
                              (Nueva)
                            </span>
                          </AsignaturaContent>
                          <AsignaturaActions>
                            <IconButton
                              onClick={() => removeNewAsignatura(index)}
                              color="#ef4444"
                              hoverColor="#dc2626"
                              title="Eliminar"
                            >
                              <Trash size={18} />
                            </IconButton>
                          </AsignaturaActions>
                        </AsignaturaItem>
                      ))}
                    </AsignaturasList>
                  </>
                )}

                {/* Eliminar la sección "Agregar nueva asignatura" */}
              </AsignaturasSection>
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
  position: relative;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 1rem;
    width: 100%;
    border-radius: 0;
    box-shadow: none;
    max-width: 100vw;
    overflow-x: hidden;
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
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 0;
    margin: 0 0 1.5rem 0;
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

// Modificar el componente ButtonsContainer para asegurar que los botones se ajusten correctamente
const ButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;

// Modificar el AddButton para simplificar su texto
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
    flex: 1;
    padding: 0.5rem;
    font-size: 0.75rem;
  }
`;

// Modificar el UploadButton para cambiar su texto
const UploadButton = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
  box-sizing: border-box;

  &:hover {
    background-color: #059669;
  }

  svg {
    margin-right: 0.5rem;
  }

  input {
    display: none;
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 0.5rem;
    font-size: 0.75rem;
  }
`;

// Añadir un nuevo botón para Asignaturas
const AsignaturasButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: #8b5cf6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: #7c3aed;
  }

  svg {
    margin-right: 0.5rem;
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 0.5rem;
    font-size: 0.75rem;
  }
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  box-sizing: border-box;

  @media (max-width: 768px) {
    border-radius: 0.375rem;
    margin-left: 0;
    margin-right: 0;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }
`;

const Table = styled.div`
  width: 100%;
  min-width: 650px; /* Ancho mínimo para evitar que se comprima demasiado */
`;

// Modificar el TableHeader para quitar la columna Cargo
const TableHeader = styled.div`
  display: grid;
  grid-template-columns:
    minmax(150px, 1.5fr) minmax(180px, 1.5fr) minmax(120px, 1fr)
    minmax(120px, 0.8fr);
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

// Modificar el TableRow para quitar la columna Cargo
const TableRow = styled.div`
  display: grid;
  grid-template-columns:
    minmax(150px, 1.5fr) minmax(180px, 1.5fr) minmax(120px, 1fr)
    minmax(120px, 0.8fr);
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

const ViewButton = styled(IconButton)`
  background-color: #8b5cf6;
  color: white;

  &:hover {
    background-color: #7c3aed;
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

const UploadImageButton = styled.label`
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
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
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
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
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

// Componentes para asignaturas
const AsignaturasList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
`;

const AsignaturaItem = styled.div`
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

const AsignaturaContent = styled.div`
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

const AsignaturaActions = styled.div`
  display: flex;
  margin-left: 0.5rem;

  @media (max-width: 480px) {
    margin-left: 0;
    justify-content: flex-end;
    width: 100%;
  }
`;

const AsignaturasSection = styled.div`
  margin-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
`;

const AsignaturasTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Componente para detalles
const DetailSection = styled.div`
  margin-bottom: 1.5rem;
`;

const DetailTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DetailContent = styled.div`
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
`;

const DetailItem = styled.div`
  display: flex;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  font-weight: 500;
  color: #4b5563;
  width: 120px;
  flex-shrink: 0;
`;

const DetailValue = styled.div`
  color: #111827;
  flex-grow: 1;
`;

const DetailImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const DetailImage = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e5e7eb;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DetailList = styled.ul`
  margin: 0;
  padding-left: 1.5rem;

  li {
    margin-bottom: 0.25rem;
  }
`;

const SearchFilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 1;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
