import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  FileText,
  Download,
  Bell,
  User,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  DollarSign,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import CajaMensaje from "../../../components/utils/CajaMensaje";

const AsistentesAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados principales
  const [evento, setEvento] = useState(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [inscripcionesFiltradas, setInscripcionesFiltradas] = useState([]);
  const [asistentesExistentes, setAsistentesExistentes] = useState([]);

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    busqueda: "",
    fecha: "",
    habilitado: "",
  });

  // Estados de modales
  const [modalDetalle, setModalDetalle] = useState({
    visible: false,
    inscripcion: null,
  });
  const [modalEditar, setModalEditar] = useState({
    visible: false,
    inscripcion: null,
  });
  const [modalAgregar, setModalAgregar] = useState({ visible: false });
  const [modalEliminar, setModalEliminar] = useState({
    visible: false,
    inscripcion: null,
  });

  // Estados de formulario
  const [formData, setFormData] = useState({
    nombre_asistente: "",
    ci: "",
    email_inscripcion: "",
    celular_inscripcion: "",
    habilitado: "1",
    certificado_entregado: "0",
    entrada: "0",
    salida: "0",
  });

  // Estados de sugerencias
  const [sugerencias, setSugerencias] = useState({
    visible: false,
    items: [],
    campo: "",
  });
  const [comprobantePago, setComprobantePago] = useState(null);
  const [mostrarComprobante, setMostrarComprobante] = useState(false);

  // Agregar/eliminar mensajes
  const agregarMensaje = (tipo, color, texto, duracion = 5000) => {
    const nuevoMensaje = {
      id: Date.now(),
      tipo,
      color,
      texto,
      duracion,
    };
    setMensajes((prev) => [...prev, nuevoMensaje]);
    setTimeout(() => {
      eliminarMensaje(nuevoMensaje.id);
    }, duracion);
  };

  const eliminarMensaje = (id) => {
    setMensajes((prev) => prev.filter((msg) => msg.id !== id));
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
    cargarAsistentesExistentes();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/eventos/${id}/detalles`);

      if (response.data.evento) {
        setEvento(response.data.evento);
        setInscripciones(response.data.evento.inscripciones || []);
        setInscripcionesFiltradas(response.data.evento.inscripciones || []);
      } else {
        agregarMensaje("fail", "#D32F2F", "Evento no encontrado", 8000);
        navigate("/admin/eventos");
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      agregarMensaje(
        "fail",
        "#D32F2F",
        "Error al cargar los datos del evento",
        8000
      );
      navigate("/admin/eventos");
    } finally {
      setLoading(false);
    }
  };

  const cargarAsistentesExistentes = async () => {
    try {
      const response = await api.get("/asistentes");
      setAsistentesExistentes(response.data);
    } catch (error) {
      console.error("Error al cargar asistentes:", error);
    }
  };

  // Filtros
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, inscripciones]);

  const aplicarFiltros = () => {
    let filtradas = [...inscripciones];

    // Filtro de búsqueda
    if (filtros.busqueda.trim()) {
      const busqueda = filtros.busqueda.toLowerCase();
      filtradas = filtradas.filter(
        (inscripcion) =>
          inscripcion.asistente.nombre_asistente
            .toLowerCase()
            .includes(busqueda) ||
          inscripcion.asistente.ci.includes(busqueda) ||
          inscripcion.email_inscripcion.toLowerCase().includes(busqueda)
      );
    }

    // Filtro de fecha
    if (filtros.fecha) {
      filtradas = filtradas.filter((inscripcion) =>
        inscripcion.fecha_registro.startsWith(filtros.fecha)
      );
    }

    // Filtro de habilitado
    if (filtros.habilitado !== "") {
      filtradas = filtradas.filter(
        (inscripcion) =>
          inscripcion.habilitado.toString() === filtros.habilitado
      );
    }

    setInscripcionesFiltradas(filtradas);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  // Manejo de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    // ----- Validación para nombre_asistente -----
    if (name === "nombre_asistente") {
      // Solo letras y espacios
      newValue = value
        .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
        .replace(/\s{2,}/g, " ");

      // Limitar a 40 caracteres
      if (newValue.length > 40) {
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }

    // ----- Validación para celular_inscripcion -----
    else if (name === "celular_inscripcion") {
      const soloNumeros = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: soloNumeros }));
    }

    // ----- Validación para CI -----
    else if (name === "ci") {
      const soloNumeros = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: soloNumeros }));
    }

    // ----- Otros campos sin validación especial -----
    else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }

    // ----- Sugerencias al escribir -----
    if ((name === "nombre_asistente" || name === "ci") && newValue.trim()) {
      const sugerenciasFiltradas = asistentesExistentes.filter((asistente) => {
        if (name === "nombre_asistente") {
          return asistente.nombre_asistente
            .toLowerCase()
            .includes(newValue.toLowerCase());
        } else {
          return asistente.ci.includes(newValue);
        }
      });

      setSugerencias({
        visible: sugerenciasFiltradas.length > 0,
        items: sugerenciasFiltradas,
        campo: name,
      });
    } else {
      setSugerencias({ visible: false, items: [], campo: "" });
    }
  };

  const seleccionarSugerencia = (asistente) => {
    setFormData((prev) => ({
      ...prev,
      nombre_asistente: asistente.nombre_asistente,
      ci: asistente.ci,
    }));
    setSugerencias({ visible: false, items: [], campo: "" });
  };

  // Modales
  const abrirModalDetalle = async (inscripcion) => {
    setModalDetalle({ visible: true, inscripcion });
    setMostrarComprobante(false);

    // Cargar comprobante de pago si existe
    if (inscripcion.comprobante_pago) {
      try {
        const response = await api.get(
          `/inscripcion/comprobante/${inscripcion.id_inscripcion}`,
          {
            responseType: "blob",
          }
        );
        const imageUrl = URL.createObjectURL(response.data);
        setComprobantePago(imageUrl);
      } catch (error) {
        console.error("Error al cargar comprobante:", error);
        setComprobantePago(null);
      }
    } else {
      setComprobantePago(null);
    }
  };

  const abrirModalEditar = (inscripcion) => {
    setFormData({
      nombre_asistente: inscripcion.asistente.nombre_asistente,
      ci: inscripcion.asistente.ci,
      email_inscripcion: inscripcion.email_inscripcion,
      celular_inscripcion: inscripcion.celular_inscripcion,
      habilitado: inscripcion.habilitado.toString(),
      certificado_entregado: inscripcion.certificado_entregado.toString(),
      entrada: inscripcion.entrada.toString(),
      salida: inscripcion.salida.toString(),
    });
    setModalEditar({ visible: true, inscripcion });
  };

  const abrirModalAgregar = () => {
    setFormData({
      nombre_asistente: "",
      ci: "",
      email_inscripcion: "",
      celular_inscripcion: "",
      habilitado: "1",
      certificado_entregado: "0",
      entrada: "0",
      salida: "0",
    });
    setModalAgregar({ visible: true });
  };

  const cerrarModales = () => {
    setModalDetalle({ visible: false, inscripcion: null });
    setModalEditar({ visible: false, inscripcion: null });
    setModalAgregar({ visible: false });
    setModalEliminar({ visible: false, inscripcion: null });
    setSugerencias({ visible: false, items: [], campo: "" });
    setComprobantePago(null);
  };

  const abrirModalEliminar = (inscripcion) => {
    setModalEliminar({ visible: true, inscripcion });
  };

  const confirmarEliminar = async () => {
    try {
      setIsSubmitting(true);
      await api.delete(
        `/inscripcionesEliminar/${modalEliminar.inscripcion.id_inscripcion}`
      );
      agregarMensaje(
        "success",
        "#2E7D32",
        "Inscripción eliminada exitosamente"
      );
      cerrarModales();
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar inscripción:", error);
      agregarMensaje(
        "fail",
        "#D32F2F",
        error.response?.data?.message || "Error al eliminar inscripción"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // CRUD
  const agregarInscripcion = async () => {
    if (!validarFormulario()) return;

    try {
      setSaving(true);
      const formDataToSend = new FormData();

      formDataToSend.append("nombre_asistente", formData.nombre_asistente);
      formDataToSend.append("ci", formData.ci);
      formDataToSend.append("email_inscripcion", formData.email_inscripcion);
      formDataToSend.append(
        "celular_inscripcion",
        formData.celular_inscripcion
      );

      await api.post(`/eventos/${id}/inscribir`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      agregarMensaje("success", "#2E7D32", "Inscripción agregada exitosamente");
      cerrarModales();
      cargarDatos();
    } catch (error) {
      if (error.response?.status === 409) {
        agregarMensaje("fail", "#D32F2F", error.response.data.error);
      } else {
        const mensajeError =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error al agregar inscripción";
        agregarMensaje("fail", "#D32F2F", mensajeError);
      }
    } finally {
      setSaving(false);
    }
  };

  const editarInscripcion = async () => {
    if (!validarFormulario()) return;

    try {
      setSaving(true);
      await api.post(
        `/inscripcionActualizar/${modalEditar.inscripcion.id_inscripcion}`,
        formData
      );

      agregarMensaje(
        "success",
        "#2E7D32",
        "Inscripción actualizada exitosamente"
      );
      cerrarModales();
      cargarDatos();
    } catch (error) {
      if (error.response?.status === 409) {
        agregarMensaje("fail", "#D32F2F", error.response.data.error);
      } else {
        const mensajeError =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Error al actualizar inscripción";
        agregarMensaje("fail", "#D32F2F", mensajeError);
      }
    } finally {
      setSaving(false);
    }
  };

  // Validaciones
  const validarFormulario = () => {
    if (!formData.nombre_asistente.trim()) {
      agregarMensaje(
        "fail",
        "#D32F2F",
        "El nombre del asistente es obligatorio"
      );
      return false;
    }

    if (!formData.ci.trim()) {
      agregarMensaje("fail", "#D32F2F", "El CI es obligatorio");
      return false;
    }

    if (!/^\d{1,10}$/.test(formData.ci)) {
      agregarMensaje(
        "fail",
        "#D32F2F",
        "El CI debe contener solo números y máximo 10 dígitos"
      );
      return false;
    }

    if (!formData.email_inscripcion) {
      agregarMensaje(
        "fail",
        "#D32F2F",
        "El email del asistente es obligatorio"
      );
      return false;
    }

    if (
      formData.email_inscripcion &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_inscripcion)
    ) {
      agregarMensaje(
        "fail",
        "#D32F2F",
        "El email debe tener un formato válido"
      );
      return false;
    }

    if (
      formData.celular_inscripcion &&
      !/^\d{8}$/.test(formData.celular_inscripcion)
    ) {
      agregarMensaje(
        "fail",
        "#D32F2F",
        "El celular debe tener exactamente 8 dígitos"
      );
      return false;
    }

    return true;
  };

  // Acciones adicionales
  const descargarPDF = async () => {
    try {
      const response = await api.get(`/eventos/descargar-pdf/${id}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `asistentes-${evento?.titulo_evento || "evento"}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      agregarMensaje("success", "#2E7D32", "PDF descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      agregarMensaje("fail", "#D32F2F", "Error al descargar el PDF");
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const descargarComprobante = async () => {
    try {
      const response = await api.get(
        `/inscripcion/comprobante/${modalDetalle.inscripcion.id_inscripcion}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `comprobante-${modalDetalle.inscripcion.asistente.nombre_asistente}.jpg`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      agregarMensaje(
        "success",
        "#2E7D32",
        "Comprobante descargado exitosamente"
      );
    } catch (error) {
      console.error("Error al descargar comprobante:", error);
      agregarMensaje("fail", "#D32F2F", "Error al descargar el comprobante");
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando asistentes del evento..." />;
  }

  return (
    <Container>
      <MaxWidthContainer>
        {/* Mensajes */}
        {mensajes.map((mensaje) => (
          <CajaMensaje
            key={mensaje.id}
            tipo={mensaje.tipo}
            color={mensaje.color}
            mensaje={mensaje.texto}
            onClose={() => eliminarMensaje(mensaje.id)}
          />
        ))}

        {/* Header */}
        <HeaderCard>
          <HeaderContent>
            <HeaderInfo>
              <Title>
                <Users />
                Asistentes del Evento
              </Title>
              {evento && (
                <EventInfo>
                  <InfoItem>
                    <FileText size={16} />
                    {evento.titulo_evento}
                  </InfoItem>
                  <InfoItem>
                    <Calendar size={16} />
                    {formatearFecha(evento.fecha_evento)}
                  </InfoItem>
                  <InfoItem>
                    <MapPin size={16} />
                    {evento.ubicacion}
                  </InfoItem>
                  {evento.es_pago === 1 && (
                    <InfoItem>
                      <DollarSign size={16} />
                      Bs. {evento.costo}
                    </InfoItem>
                  )}
                </EventInfo>
              )}
            </HeaderInfo>
            <BackButton onClick={() => navigate("/admin/eventos")}>
              <ArrowLeft size={20} />
              Volver
            </BackButton>
          </HeaderContent>
        </HeaderCard>

        {/* Controles */}
        <ControlsCard>
          <ControlsTop>
            <h3>Total de Inscripciones: {inscripcionesFiltradas.length}</h3>
            <ActionButtons>
              <AddButton onClick={abrirModalAgregar}>
                <Plus size={20} />
                Agregar Asistente
              </AddButton>
              <NotifyButton
                onClick={() => navigate(`/admin/eventos/notificar/${id}`)}
              >
                <Bell size={20} />
                Notificar
              </NotifyButton>
              <DownloadButton onClick={descargarPDF}>
                <Download size={20} />
                Descargar PDF
              </DownloadButton>
            </ActionButtons>
          </ControlsTop>

          <FiltersContainer>
            <SearchContainer>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Buscar por nombre, CI o email..."
                value={filtros.busqueda}
                onChange={(e) => handleFiltroChange("busqueda", e.target.value)}
              />
            </SearchContainer>
            <DateInput
              type="date"
              value={filtros.fecha}
              onChange={(e) => handleFiltroChange("fecha", e.target.value)}
            />
            <Select
              value={filtros.habilitado}
              onChange={(e) => handleFiltroChange("habilitado", e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="1">✅ Habilitado</option>
              <option value="0">❌ Deshabilitado</option>
            </Select>
          </FiltersContainer>
        </ControlsCard>

        {/* Contenido principal */}
        <TableCard>
          {inscripcionesFiltradas.length > 0 ? (
            <>
              {/* Vista móvil: Cards */}
              <MobileCardContainer>
                {inscripcionesFiltradas.map((inscripcion) => (
                  <MobileCard key={inscripcion.id_inscripcion}>
                    <MobileCardHeader>
                      <MobileCardName>
                        {inscripcion.asistente.nombre_asistente}
                      </MobileCardName>
                      <MobileCardActions>
                        <ViewButton
                          onClick={() => abrirModalDetalle(inscripcion)}
                        >
                          <Eye size={16} />
                        </ViewButton>
                        <EditButton
                          onClick={() => abrirModalEditar(inscripcion)}
                        >
                          <Edit size={16} />
                        </EditButton>
                        <DeleteButton
                          onClick={() => abrirModalEliminar(inscripcion)}
                        >
                          <Trash2 size={16} />
                        </DeleteButton>
                      </MobileCardActions>
                    </MobileCardHeader>

                    <MobileCardInfo>
                      <MobileCardItem>
                        <CreditCard size={14} />
                        CI: {inscripcion.asistente.ci}
                      </MobileCardItem>
                      <MobileCardItem>
                        <Mail size={14} />
                        {inscripcion.email_inscripcion || "No especificado"}
                      </MobileCardItem>
                      <MobileCardItem>
                        <CheckCircle size={14} />
                        <StatusBadge
                          status={
                            inscripcion.habilitado ? "presente" : "ausente"
                          }
                        >
                          {inscripcion.habilitado
                            ? "Habilitado"
                            : "Deshabilitado"}
                        </StatusBadge>
                      </MobileCardItem>
                    </MobileCardInfo>
                  </MobileCard>
                ))}
              </MobileCardContainer>

              {/* Vista desktop: Tabla */}
              <DesktopTableContainer>
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHeaderCell>Nombre</TableHeaderCell>
                      <TableHeaderCell>CI</TableHeaderCell>
                      <TableHeaderCell>Email</TableHeaderCell>
                      <TableHeaderCell>Habilitado</TableHeaderCell>
                      <TableHeaderCell>Acciones</TableHeaderCell>
                    </tr>
                  </TableHeader>
                  <tbody>
                    {inscripcionesFiltradas.map((inscripcion) => (
                      <TableRow key={inscripcion.id_inscripcion}>
                        <TableCell>
                          {inscripcion.asistente.nombre_asistente}
                        </TableCell>
                        <TableCell>{inscripcion.asistente.ci}</TableCell>
                        <TableCell>
                          {inscripcion.email_inscripcion || "No especificado"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={
                              inscripcion.habilitado ? "presente" : "ausente"
                            }
                          >
                            {inscripcion.habilitado ? (
                              <CheckCircle size={16} />
                            ) : (
                              <XCircle size={16} />
                            )}
                            {inscripcion.habilitado
                              ? "Habilitado"
                              : "Deshabilitado"}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          <TableActions>
                            <ViewButton
                              onClick={() => abrirModalDetalle(inscripcion)}
                            >
                              <Eye size={16} />
                            </ViewButton>
                            <EditButton
                              onClick={() => abrirModalEditar(inscripcion)}
                            >
                              <Edit size={16} />
                            </EditButton>
                            <DeleteButton
                              onClick={() => abrirModalEliminar(inscripcion)}
                            >
                              <Trash2 size={16} />
                            </DeleteButton>
                          </TableActions>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </DesktopTableContainer>
            </>
          ) : (
            <EmptyState>
              <EmptyIcon>👥</EmptyIcon>
              <h3>No hay inscripciones</h3>
              <p>
                No se encontraron inscripciones para este evento con los filtros
                aplicados.
              </p>
            </EmptyState>
          )}
        </TableCard>

        {/* Modal Ver Detalles */}
        {modalDetalle.visible && (
          <ModalOverlay onClick={cerrarModales}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <Eye />
                  Detalles de la Inscripción
                </ModalTitle>
                <CloseButton onClick={cerrarModales}>
                  <X size={20} />
                </CloseButton>
              </ModalHeader>
              <ModalBody>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>
                      <User size={16} />
                      Nombre Completo
                    </DetailLabel>
                    <DetailValue>
                      {modalDetalle.inscripcion?.asistente.nombre_asistente}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>
                      <CreditCard size={16} />
                      Cédula de Identidad
                    </DetailLabel>
                    <DetailValue>
                      {modalDetalle.inscripcion?.asistente.ci}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>
                      <Mail size={16} />
                      Email
                    </DetailLabel>
                    <DetailValue>
                      {modalDetalle.inscripcion?.email_inscripcion ||
                        "No especificado"}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>
                      <Phone size={16} />
                      Celular
                    </DetailLabel>
                    <DetailValue>
                      {modalDetalle.inscripcion?.celular_inscripcion ||
                        "No especificado"}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>
                      <CheckCircle size={16} />
                      Estado
                    </DetailLabel>
                    <DetailValue>
                      <StatusBadge
                        status={
                          modalDetalle.inscripcion?.habilitado
                            ? "presente"
                            : "ausente"
                        }
                      >
                        {modalDetalle.inscripcion?.habilitado ? (
                          <CheckCircle size={16} />
                        ) : (
                          <XCircle size={16} />
                        )}
                        {modalDetalle.inscripcion?.habilitado
                          ? "Habilitado"
                          : "Deshabilitado"}
                      </StatusBadge>
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>
                      <Calendar size={16} />
                      Fecha de Registro
                    </DetailLabel>
                    <DetailValue>
                      {formatearFecha(modalDetalle.inscripcion?.fecha_registro)}
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>
                      <FileText size={16} />
                      Certificado
                    </DetailLabel>
                    <DetailValue>
                      <StatusBadge
                        status={
                          modalDetalle.inscripcion?.certificado_entregado
                            ? "entregado"
                            : "no-entregado"
                        }
                      >
                        {modalDetalle.inscripcion?.certificado_entregado ? (
                          <CheckCircle size={16} />
                        ) : (
                          <XCircle size={16} />
                        )}
                        {modalDetalle.inscripcion?.certificado_entregado
                          ? "Entregado"
                          : "No Entregado"}
                      </StatusBadge>
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>
                      <Clock size={16} />
                      Entrada
                    </DetailLabel>
                    <DetailValue>
                      <StatusBadge
                        status={
                          modalDetalle.inscripcion?.entrada
                            ? "presente"
                            : "ausente"
                        }
                      >
                        {modalDetalle.inscripcion?.entrada ? (
                          <CheckCircle size={16} />
                        ) : (
                          <XCircle size={16} />
                        )}
                        {modalDetalle.inscripcion?.entrada
                          ? "Presente"
                          : "Ausente"}
                      </StatusBadge>
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>
                      <Clock size={16} />
                      Salida
                    </DetailLabel>
                    <DetailValue>
                      <StatusBadge
                        status={
                          modalDetalle.inscripcion?.salida
                            ? "presente"
                            : "ausente"
                        }
                      >
                        {modalDetalle.inscripcion?.salida ? (
                          <CheckCircle size={16} />
                        ) : (
                          <XCircle size={16} />
                        )}
                        {modalDetalle.inscripcion?.salida
                          ? "Presente"
                          : "Ausente"}
                      </StatusBadge>
                    </DetailValue>
                  </DetailItem>
                </DetailGrid>

                {modalDetalle.inscripcion?.comprobante_pago && (
                  <ComprobanteContainer>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <DetailLabel
                        style={{ margin: 0, cursor: "pointer" }}
                        onClick={() =>
                          setMostrarComprobante(!mostrarComprobante)
                        }
                      >
                        <CreditCard size={16} />
                        Comprobante de Pago
                        {mostrarComprobante ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </DetailLabel>
                      <button
                        onClick={descargarComprobante}
                        style={{
                          background:
                            "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          width: "36px",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow =
                            "0 4px 15px rgba(59, 130, 246, 0.4)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow =
                            "0 2px 8px rgba(59, 130, 246, 0.3)";
                        }}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                    {mostrarComprobante && (
                      <div style={{ animation: "slideDown 0.3s ease-out" }}>
                        {comprobantePago ? (
                          <ComprobanteImage
                            src={comprobantePago}
                            alt="Comprobante de pago"
                          />
                        ) : (
                          <p>Cargando comprobante...</p>
                        )}
                      </div>
                    )}
                  </ComprobanteContainer>
                )}
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* Modal Editar */}
        {modalEditar.visible && (
          <ModalOverlay onClick={cerrarModales}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <Edit />
                  Editar Inscripción
                </ModalTitle>
                <CloseButton onClick={cerrarModales}>
                  <X size={20} />
                </CloseButton>
              </ModalHeader>
              <ModalBody>
                <FormGrid>
                  <FormGroup style={{ position: "relative" }}>
                    <Label>
                      <User size={16} />
                      Nombre Completo *
                    </Label>
                    <Input
                      type="text"
                      name="nombre_asistente"
                      value={formData.nombre_asistente}
                      onChange={handleInputChange}
                      placeholder="Ingrese el nombre completo"
                      required
                    />
                    {sugerencias.visible &&
                      sugerencias.campo === "nombre_asistente" && (
                        <SuggestionsList>
                          {sugerencias.items.map((asistente) => (
                            <SuggestionItem
                              key={asistente.id_asistente}
                              onClick={() => seleccionarSugerencia(asistente)}
                            >
                              {asistente.nombre_asistente} - CI: {asistente.ci}
                            </SuggestionItem>
                          ))}
                        </SuggestionsList>
                      )}
                  </FormGroup>
                  <FormGroup style={{ position: "relative" }}>
                    <Label>
                      <CreditCard size={16} />
                      Cédula de Identidad *
                    </Label>
                    <Input
                      type="text"
                      name="ci"
                      value={formData.ci}
                      onChange={handleInputChange}
                      placeholder="Ingrese el CI"
                      maxLength="10"
                      required
                    />
                    {sugerencias.visible && sugerencias.campo === "ci" && (
                      <SuggestionsList>
                        {sugerencias.items.map((asistente) => (
                          <SuggestionItem
                            key={asistente.id_asistente}
                            onClick={() => seleccionarSugerencia(asistente)}
                          >
                            {asistente.nombre_asistente} - CI: {asistente.ci}
                          </SuggestionItem>
                        ))}
                      </SuggestionsList>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label>
                      <Mail size={16} />
                      Email
                    </Label>
                    <Input
                      type="email"
                      name="email_inscripcion"
                      value={formData.email_inscripcion}
                      onChange={handleInputChange}
                      placeholder="Ingrese el email"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>
                      <Phone size={16} />
                      Celular
                    </Label>
                    <Input
                      type="text"
                      name="celular_inscripcion"
                      value={formData.celular_inscripcion}
                      onChange={handleInputChange}
                      placeholder="Ingrese el celular"
                      maxLength="8"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>
                      <CheckCircle size={16} />
                      Estado
                    </Label>
                    <Select
                      name="habilitado"
                      value={formData.habilitado}
                      onChange={handleInputChange}
                    >
                      <option value="1">Habilitado</option>
                      <option value="0">Deshabilitado</option>
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>
                      <FileText size={16} />
                      Certificado Entregado
                    </Label>
                    <Select
                      name="certificado_entregado"
                      value={formData.certificado_entregado}
                      onChange={handleInputChange}
                    >
                      <option value="0">No Entregado</option>
                      <option value="1">Entregado</option>
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>
                      <Clock size={16} />
                      Entrada
                    </Label>
                    <Select
                      name="entrada"
                      value={formData.entrada}
                      onChange={handleInputChange}
                    >
                      <option value="0">Ausente</option>
                      <option value="1">Presente</option>
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>
                      <Clock size={16} />
                      Salida
                    </Label>
                    <Select
                      name="salida"
                      value={formData.salida}
                      onChange={handleInputChange}
                    >
                      <option value="0">Ausente</option>
                      <option value="1">Presente</option>
                    </Select>
                  </FormGroup>
                </FormGrid>
              </ModalBody>
              <ModalActions>
                <CancelButton onClick={cerrarModales}>
                  <X size={16} />
                  Cancelar
                </CancelButton>
                <SaveButton onClick={editarInscripcion} disabled={saving}>
                  {saving ? (
                    <>
                      <SpinIcon>⟳</SpinIcon>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Guardar Cambios
                    </>
                  )}
                </SaveButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* Modal Agregar */}
        {modalAgregar.visible && (
          <ModalOverlay onClick={cerrarModales}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  <Plus />
                  Agregar Asistente
                </ModalTitle>
                <CloseButton onClick={cerrarModales}>
                  <X size={20} />
                </CloseButton>
              </ModalHeader>
              <ModalBody>
                <FormGrid>
                  <FormGroup style={{ position: "relative" }}>
                    <Label>
                      <User size={16} />
                      Nombre Completo *
                    </Label>
                    <Input
                      type="text"
                      name="nombre_asistente"
                      value={formData.nombre_asistente}
                      onChange={handleInputChange}
                      placeholder="Ingrese el nombre completo"
                      required
                    />
                    {sugerencias.visible &&
                      sugerencias.campo === "nombre_asistente" && (
                        <SuggestionsList>
                          {sugerencias.items.map((asistente) => (
                            <SuggestionItem
                              key={asistente.id_asistente}
                              onClick={() => seleccionarSugerencia(asistente)}
                            >
                              {asistente.nombre_asistente} - CI: {asistente.ci}
                            </SuggestionItem>
                          ))}
                        </SuggestionsList>
                      )}
                  </FormGroup>
                  <FormGroup style={{ position: "relative" }}>
                    <Label>
                      <CreditCard size={16} />
                      Cédula de Identidad *
                    </Label>
                    <Input
                      type="text"
                      name="ci"
                      value={formData.ci}
                      onChange={handleInputChange}
                      placeholder="Ingrese el CI"
                      maxLength="10"
                      required
                    />
                    {sugerencias.visible && sugerencias.campo === "ci" && (
                      <SuggestionsList>
                        {sugerencias.items.map((asistente) => (
                          <SuggestionItem
                            key={asistente.id_asistente}
                            onClick={() => seleccionarSugerencia(asistente)}
                          >
                            {asistente.nombre_asistente} - CI: {asistente.ci}
                          </SuggestionItem>
                        ))}
                      </SuggestionsList>
                    )}
                  </FormGroup>
                  <FormGroup>
                    <Label>
                      <Mail size={16} />
                      Email
                    </Label>
                    <Input
                      type="email"
                      name="email_inscripcion"
                      value={formData.email_inscripcion}
                      onChange={handleInputChange}
                      placeholder="Ingrese el email"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>
                      <Phone size={16} />
                      Celular
                    </Label>
                    <Input
                      type="text"
                      name="celular_inscripcion"
                      value={formData.celular_inscripcion}
                      onChange={handleInputChange}
                      placeholder="Ingrese el celular"
                      maxLength="8"
                    />
                  </FormGroup>
                </FormGrid>
              </ModalBody>
              <ModalActions>
                <CancelButton onClick={cerrarModales}>
                  <X size={16} />
                  Cancelar
                </CancelButton>
                <SaveButton onClick={agregarInscripcion} disabled={saving}>
                  {saving ? (
                    <>
                      <SpinIcon>⟳</SpinIcon>
                      Agregando...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Agregar Asistente
                    </>
                  )}
                </SaveButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* Modal Eliminar */}
        {modalEliminar.visible && (
          <ModalOverlay onClick={cerrarModales}>
            <ModalContent
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "450px" }}
            >
              <ModalAlert>
                <AlertTriangle size={48} color="#f87171" />
                <div>
                  <ModalText>
                    ¿Estás seguro de que quieres eliminar esta inscripción?
                  </ModalText>
                  <ModalSubtext>
                    Esta acción eliminará permanentemente la inscripción de{" "}
                    <strong>
                      {modalEliminar.inscripcion?.asistente.nombre_asistente}
                    </strong>{" "}
                    y no se podrá deshacer.
                  </ModalSubtext>
                </div>
              </ModalAlert>
              <ModalFooter>
                <CancelModalButton onClick={cerrarModales}>
                  Cancelar
                </CancelModalButton>
                <ConfirmModalButton
                  onClick={confirmarEliminar}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <>Eliminando...</> : <>Eliminar</>}
                </ConfirmModalButton>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </MaxWidthContainer>
    </Container>
  );
};

export default AsistentesAdmin;

// Animaciones
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

// Contenedores principales - MÓVIL FIRST
const Container = styled.div`
  min-height: 100vh;
  padding: 0.5rem;
  animation: ${fadeIn} 0.6s ease-out;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 1rem;
  }

  @media (min-width: 1024px) {
    padding: 2rem 1rem;
  }
`;

const MaxWidthContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

// Header - DISEÑO MÓVIL SIMPLIFICADO
const HeaderCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: ${slideUp} 0.8s ease-out;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  @media (min-width: 1024px) {
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 2rem;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
`;

const HeaderInfo = styled.div`
  flex: 1;
  width: 100%;
  min-width: 0;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #000000;
  margin: 0 0 0.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 2rem;
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    gap: 1rem;
  }

  @media (min-width: 1024px) {
    font-size: 2.5rem;
  }
`;

const EventInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #6b7280;
  width: 100%;

  @media (min-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.875rem;
  }

  @media (min-width: 1024px) {
    font-size: 0.95rem;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #f8fafc;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    width: auto;
    padding: 0.5rem 1rem;
    border-radius: 8px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
  width: 100%;
  font-size: 0.9rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
  }

  @media (min-width: 768px) {
    width: auto;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-size: 1rem;
  }
`;

// Controles - LAYOUT MÓVIL STACK
const ControlsCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: ${slideUp} 0.8s ease-out 0.1s both;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  @media (min-width: 1024px) {
    border-radius: 20px;
    padding: 2rem;
    margin-bottom: 2rem;
  }
`;

const ControlsTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;

  h3 {
    margin: 0;
    color: #1f2937;
    font-size: 1rem;
    text-align: center;
  }

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;

    h3 {
      font-size: 1.1rem;
      text-align: left;
    }
  }

  @media (min-width: 1024px) {
    h3 {
      font-size: 1.25rem;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;

  @media (min-width: 768px) {
    flex-direction: row;
    width: auto;
    gap: 1rem;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  width: 100%;
  min-height: 48px;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (min-width: 768px) {
    width: auto;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-size: 0.95rem;
    min-height: 44px;
  }
`;

const AddButton = styled(ActionButton)`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);

  &:hover {
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  }
`;

const NotifyButton = styled(ActionButton)`
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);

  &:hover {
    box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
  }
`;

const DownloadButton = styled(ActionButton)`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);

  &:hover {
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  }
`;

// Filtros - STACK MÓVIL
const FiltersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    align-items: start;
    gap: 1rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }

  &::placeholder {
    color: #9ca3af;
  }

  @media (min-width: 768px) {
    padding: 0.875rem 1rem 0.875rem 3rem;
    border-radius: 12px;
    font-size: 1rem;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  width: 1rem;
  height: 1rem;
  pointer-events: none;

  @media (min-width: 768px) {
    left: 1rem;
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const DateInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }

  @media (min-width: 768px) {
    padding: 0.875rem 1rem;
    border-radius: 12px;
    font-size: 1rem;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;
  box-sizing: border-box;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  appearance: none;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }

  &:hover {
    border-color: #9ca3af;
  }

  @media (min-width: 768px) {
    padding: 0.875rem 2.5rem 0.875rem 1rem;
    border-radius: 12px;
    font-size: 1rem;
  }
`;

// Tabla - DISEÑO MÓVIL CARDS
const TableCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  animation: ${scaleIn} 0.8s ease-out 0.2s both;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    border-radius: 16px;
    padding: 1.5rem;
  }

  @media (min-width: 1024px) {
    border-radius: 20px;
    padding: 2rem;
  }
`;

// DISEÑO MÓVIL: Cards en lugar de tabla
const MobileCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
`;

const MobileCardName = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
  word-break: break-word;
`;

const MobileCardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MobileCardItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const MobileCardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

// DISEÑO DESKTOP: Tabla tradicional
const DesktopTableContainer = styled.div`
  display: none;
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  -webkit-overflow-scrolling: touch;

  @media (min-width: 768px) {
    display: block;
  }

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  min-width: 600px;
`;

const TableHeader = styled.thead`
  background: rgb(55, 111, 231);
  color: white;
`;

const TableRow = styled.tr`
  transition: all 0.3s ease;

  &:nth-child(even) {
    background: #f8fafc;
  }

  &:hover {
    background: #e0e7ff;
    transform: scale(1.01);
  }
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  white-space: nowrap;
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.95rem;
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TableActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

const TableActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const ViewButton = styled(TableActionButton)`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);

  &:hover {
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  }
`;

const EditButton = styled(TableActionButton)`
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);

  &:hover {
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
  }
`;

const DeleteButton = styled(TableActionButton)`
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);

  &:hover {
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
  }
`;

// Modal - FULL SCREEN EN MÓVIL
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: ${fadeIn} 0.3s ease-out;

  @media (min-width: 768px) {
    padding: 1rem;
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: ${scaleIn} 0.3s ease-out;
  box-sizing: border-box;
  margin: 1rem;

  @media (min-width: 768px) {
    border-radius: 16px;
    padding: 1.5rem;
    max-width: 600px;
    max-height: 90vh;
  }

  @media (min-width: 1024px) {
    border-radius: 20px;
    padding: 2rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 768px) {
    font-size: 1.5rem;
    gap: 0.75rem;
  }
`;

const CloseButton = styled.button`
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6b7280;

  &:hover {
    background: #e5e7eb;
    transform: scale(1.1);
  }
`;

const ModalBody = styled.div`
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    margin-bottom: 2rem;
  }
`;

// GRID MÓVIL SIMPLIFICADO
const DetailGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const DetailItem = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;

  @media (min-width: 768px) {
    border-radius: 12px;
  }
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DetailValue = styled.div`
  color: #1f2937;
  font-size: 1rem;
  word-break: break-word;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;

  ${(props) =>
    props.status === "entregado" &&
    `
    background: #dcfce7;
    color: #166534;
  `}

  ${(props) =>
    props.status === "no-entregado" &&
    `
    background: #fee2e2;
    color: #991b1b;
  `}
  
  ${(props) =>
    props.status === "presente" &&
    `
    background: #dbeafe;
    color: #1e40af;
  `}
  
  ${(props) =>
    props.status === "ausente" &&
    `
    background: #fef3c7;
    color: #92400e;
  `}
`;

const ComprobanteContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;

  @media (min-width: 768px) {
    grid-column: 1 / -1;
    border-radius: 12px;
  }
`;

const ComprobanteImage = styled.img`
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
`;

// Formulario - STACK MÓVIL
const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }

  &:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    padding: 0.875rem 1rem;
    border-radius: 12px;
    font-size: 1rem;
  }
`;

const SuggestionsList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
`;

const SuggestionItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f3f4f6;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

// Acciones del modal - STACK MÓVIL
const ModalActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: flex-end;
    gap: 1rem;
  }
`;

const ModalButton = styled.button`
  padding: 0.875rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px;
  width: 100%;
  font-size: 0.9rem;
  box-sizing: border-box;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (min-width: 768px) {
    width: auto;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-size: 1rem;
    min-height: 44px;
  }
`;

const SaveButton = styled(ModalButton)`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);

  &:hover:not(:disabled) {
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  }
`;

const CancelButton = styled(ModalButton)`
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);

  &:hover {
    box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
  }
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

// Estado vacío - MÓVIL CENTRADO
const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: #6b7280;

  h3 {
    margin: 1rem 0 0.5rem 0;
    font-size: 1.1rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  @media (min-width: 768px) {
    padding: 3rem 2rem;

    h3 {
      font-size: 1.25rem;
    }

    p {
      font-size: 1rem;
    }
  }
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  opacity: 0.5;

  @media (min-width: 768px) {
    font-size: 4rem;
  }
`;

// Modal de eliminar - FULL SCREEN MÓVIL
const ModalAlert = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    border-radius: 12px;
  }
`;

const ModalText = styled.p`
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-weight: 500;
  font-size: 0.95rem;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const ModalSubtext = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 0.85rem;
  line-height: 1.4;

  @media (min-width: 768px) {
    font-size: 0.875rem;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: flex-end;
    gap: 1rem;
  }
`;

const CancelModalButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;
  width: 100%;
  font-size: 0.9rem;
  box-sizing: border-box;

  &:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
  }

  @media (min-width: 768px) {
    width: auto;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    min-height: 44px;
  }
`;

const ConfirmModalButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;
  width: 100%;
  font-size: 0.9rem;
  box-sizing: border-box;

  &:hover:not(:disabled) {
    background: #dc2626;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    width: auto;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    min-height: 44px;
  }
`;
