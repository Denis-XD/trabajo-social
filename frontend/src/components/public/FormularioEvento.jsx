import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  Calendar,
  MapPin,
  Monitor,
  DollarSign,
  User,
  CreditCard,
  Mail,
  Phone,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Save,
  X,
  Eye,
} from "lucide-react";
import api from "../../utils/api";
import Tesseract from "tesseract.js";

const FormularioEvento = () => {
  const { slug } = useParams();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState("");
  const [extractedMonto, setExtractedMonto] = useState(null);

  const [formData, setFormData] = useState({
    nombre_asistente: "",
    ci: "",
    email_inscripcion: "",
    celular_inscripcion: "",
    comprobante_pago: null,
  });

  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    cargarEvento();
  }, [slug]);

  const cargarEvento = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/eventos/publicos/${slug}`);
      setEvento(response.data.evento);
    } catch (error) {
      console.error("Error al cargar evento:", error);
      setError(error.response?.data?.error || "Error al cargar el evento");
    } finally {
      setLoading(false);
    }
  };

  const extractMontoFromText = (text) => {
    const montoPatterns = [
      /(?:Pagó|Pago|Monto|La suma de|Importe pagado|Monto a transferir).*?(?:Bs\.?\s*|bolivianos?\s*)(\d+(?:\.\d{2})?)/i,
      /Bs\.?\s*(\d+(?:\.\d{2})?)/i,
      /(\d+(?:\.\d{2})?).*?(?:Bs|bolivianos)/i,
    ];

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    for (const pattern of montoPatterns) {
      for (const line of lines) {
        const match = line.match(pattern);
        if (match && match[1]) {
          return Number.parseFloat(match[1]);
        }
      }
    }
    return null;
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "nombre_asistente":
        if (!value.trim()) {
          newErrors[name] = "El nombre es obligatorio";
        } else if (value.length < 2) {
          newErrors[name] = "El nombre debe tener al menos 2 caracteres";
        } else {
          delete newErrors[name];
        }
        break;

      case "ci":
        if (!value.trim()) {
          newErrors[name] = "El CI es obligatorio";
        } else if (!/^\d+$/.test(value)) {
          newErrors[name] = "El CI solo debe contener números";
        } else if (value.length > 10) {
          newErrors[name] = "El CI no puede tener más de 10 dígitos";
        } else {
          delete newErrors[name];
        }
        break;

      case "email_inscripcion":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors[name] = "El correo electrónico es obligatorio";
        } else if (!emailRegex.test(value)) {
          newErrors[name] = "Ingrese un correo electrónico válido";
        } else {
          delete newErrors[name];
        }
        break;

      case "celular_inscripcion":
        if (value && (!/^\d+$/.test(value) || value.length !== 8)) {
          newErrors[name] = "El celular debe tener exactamente 8 dígitos";
        } else {
          delete newErrors[name];
        }
        break;

      case "comprobante_pago":
        if (evento?.es_pago && !value) {
          newErrors[name] = "El comprobante de pago es obligatorio";
        } else if (value && value.size > 5 * 1024 * 1024) {
          newErrors[name] = "El archivo no puede ser mayor a 5MB";
        } else {
          delete newErrors[name];
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "nombre_asistente") {
      const soloLetras = value
        .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
        .replace(/\s{2,}/g, " ");

      const limitado = soloLetras.slice(0, 40);

      setFormData((prev) => ({
        ...prev,
        [name]: limitado,
      }));

      validateField(name, limitado);

      return;
    }

    if (name === "ci" && (!/^\d*$/.test(value) || value.length > 10)) {
      return;
    }

    if (
      name === "celular_inscripcion" &&
      (!/^\d*$/.test(value) || value.length > 8)
    ) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    validateField(name, value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = async (file) => {
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        comprobante_pago: "Solo se permiten archivos de imagen",
      }));
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        comprobante_pago: "El archivo no puede ser mayor a 5MB",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      comprobante_pago: file,
    }));

    validateField("comprobante_pago", file);

    // Procesar OCR si es evento de pago
    if (evento?.es_pago) {
      await processOCR(file);
    }
  };

  const processOCR = async (file) => {
    try {
      setOcrProcessing(true);
      setOcrResult("");
      setExtractedMonto(null);

      const result = await Tesseract.recognize(file, "spa", {
        logger: (m) => console.log(m),
      });

      const extractedText = result.data.text;
      setOcrResult(extractedText);

      // Extraer solo el monto
      const monto = extractMontoFromText(extractedText);
      setExtractedMonto(monto);
    } catch (error) {
      console.error("Error en OCR:", error);
      setOcrResult("Error al procesar la imagen con OCR");
      setExtractedMonto(null);
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const downloadQR = async () => {
    try {
      if (!evento?.id_evento) {
        console.error("No hay ID de evento disponible");
        return;
      }

      // Hacer llamada a la API para obtener el QR
      const response = await api.get(
        `/eventos/${evento.id_evento}/qr/download`,
        {
          responseType: "blob",
        }
      );

      if (!response.data) {
        throw new Error("No se recibió la imagen del QR");
      }

      // Crear URL del blob
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);

      // Crear elemento de descarga
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `qr_pago_${evento.titulo_evento.replace(/\s+/g, "_")}.png`;

      document.body.appendChild(a);
      a.click();

      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error al descargar QR:", error);
      alert("Error al descargar el código QR. Intenta nuevamente.");
    }
  };

  const isFormValid = () => {
    // Verificar campos obligatorios
    const requiredFields = ["nombre_asistente", "ci", "email_inscripcion"];

    // Si es evento de pago, también requerir comprobante
    if (evento?.es_pago) {
      requiredFields.push("comprobante_pago");
    }

    // Verificar que todos los campos obligatorios estén llenos
    for (const field of requiredFields) {
      if (
        !formData[field] ||
        (typeof formData[field] === "string" && !formData[field].trim())
      ) {
        return false;
      }
    }

    // Verificar que no haya errores de validación
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar todos los campos
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key]);
    });

    // Verificar si el formulario es válido
    if (!isFormValid()) {
      setMensaje({
        tipo: "error",
        texto:
          "Por favor, complete todos los campos obligatorios correctamente",
      });
      return;
    }

    try {
      setSubmitting(true);

      const submitData = new FormData();
      submitData.append("nombre_asistente", formData.nombre_asistente);
      submitData.append("ci", formData.ci);
      submitData.append("email_inscripcion", formData.email_inscripcion);

      if (formData.celular_inscripcion) {
        submitData.append("celular_inscripcion", formData.celular_inscripcion);
      }

      if (formData.comprobante_pago) {
        submitData.append("comprobante_pago", formData.comprobante_pago);
      }

      // Agregar texto OCR si existe
      if (ocrResult && evento?.es_pago) {
        submitData.append("texto_ocr", ocrResult);
      }

      // Agregar monto extraído si existe
      if (extractedMonto !== null && evento?.es_pago) {
        submitData.append("monto", extractedMonto.toString());
      }

      const response = await api.post(
        `/eventos/publicos/${evento.id_evento}/inscribir`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(true);

      // Determinar tipo de mensaje basado en el código de respuesta
      let tipoMensaje = "success";
      if (response.status === 200) {
        tipoMensaje = "warning"; // Para advertencias como "ya inscrito"
      }

      setMensaje({
        tipo: tipoMensaje,
        texto: response.data.message || "¡Inscripción realizada exitosamente!",
      });

      // Limpiar formulario solo si fue exitoso (201)
      if (response.status === 201) {
        setFormData({
          nombre_asistente: "",
          ci: "",
          email_inscripcion: "",
          celular_inscripcion: "",
          comprobante_pago: null,
        });
        setOcrResult("");
        setExtractedMonto(null);
      }
    } catch (error) {
      console.error("Error al inscribirse:", error);
      setMensaje({
        tipo: "error",
        texto:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error al procesar la inscripción",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingContent>
          <Spinner />
          <LoadingText>Cargando evento...</LoadingText>
        </LoadingContent>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <Container>
        <Content>
          <ErrorContainer>
            <AlertCircle size={48} />
            <h2>Evento no encontrado</h2>
            <p>{error}</p>
          </ErrorContainer>
        </Content>
      </Container>
    );
  }

  const qrCodeURL = evento?.qr_pago_url;

  return (
    <Container>
      <Content>
        <EventHeader>
          <EventTitle>{evento.titulo_evento}</EventTitle>

          <EventDetails>
            <DetailItem isPago={evento.es_pago}>
              <Clock size={20} />
              <span>{formatDate(evento.fecha_evento)}</span>
            </DetailItem>

            {evento.modalidad === "Presencial" ? (
              <DetailItem isPago={evento.es_pago}>
                <MapPin size={20} />
                <span>{evento.ubicacion}</span>
              </DetailItem>
            ) : (
              <DetailItem isPago={evento.es_pago}>
                <Monitor size={20} />
                <span>Evento Virtual</span>
              </DetailItem>
            )}

            {evento.modalidad === "Virtual" && evento.enlace_evento && (
              <DetailItem isPago={evento.es_pago}>
                <Monitor size={20} />
                <a
                  href={evento.enlace_evento}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#475569",
                    fontWeight: "500",
                    textDecoration: "none",
                  }}
                >
                  Enlace del evento
                </a>
              </DetailItem>
            )}

            <DetailItem isPago={evento.es_pago}>
              <DollarSign size={20} />
              <span>{evento.es_pago ? `Bs. ${evento.costo}` : "Gratuito"}</span>
            </DetailItem>
          </EventDetails>

          {Boolean(evento.es_pago) && (
            <PaymentButton onClick={() => setShowPaymentModal(true)}>
              <Eye size={20} />
              Ver Información de Pago
            </PaymentButton>
          )}
        </EventHeader>

        <MainGrid>
          <EventCard>
            <EventImageContainer>
              {evento.imagen_evento_url ? (
                <EventImage
                  src={evento.imagen_evento_url}
                  alt={evento.titulo_evento}
                />
              ) : (
                <EventImagePlaceholder>
                  <Calendar size={48} />
                </EventImagePlaceholder>
              )}
            </EventImageContainer>
          </EventCard>

          <FormContainer>
            <FormTitle isPago={evento.es_pago}>
              Formulario de Inscripción
            </FormTitle>

            {mensaje.texto && (
              <MessageBox className={mensaje.tipo}>
                {mensaje.tipo === "success" && <CheckCircle size={20} />}
                {mensaje.tipo === "error" && <AlertCircle size={20} />}
                {mensaje.tipo === "warning" && <AlertCircle size={20} />}
                {mensaje.texto}
              </MessageBox>
            )}

            <form onSubmit={handleSubmit}>
              <FormGrid>
                <FormGroup>
                  <Label isPago={evento.es_pago}>
                    <User size={18} />
                    Nombre Completo <span className="required">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="nombre_asistente"
                    value={formData.nombre_asistente}
                    onChange={handleInputChange}
                    className={
                      errors.nombre_asistente
                        ? "error"
                        : formData.nombre_asistente
                        ? "success"
                        : ""
                    }
                    placeholder="Ingrese su nombre completo"
                    isPago={evento.es_pago}
                  />
                  {errors.nombre_asistente && (
                    <ErrorMessage>
                      <AlertCircle />
                      {errors.nombre_asistente}
                    </ErrorMessage>
                  )}
                  {!errors.nombre_asistente && formData.nombre_asistente && (
                    <SuccessMessage isPago={evento.es_pago}>
                      <CheckCircle />
                      Nombre válido
                    </SuccessMessage>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label isPago={evento.es_pago}>
                    <CreditCard size={18} />
                    Cédula de Identidad <span className="required">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="ci"
                    value={formData.ci}
                    onChange={handleInputChange}
                    className={
                      errors.ci ? "error" : formData.ci ? "success" : ""
                    }
                    placeholder="Ingrese su CI (solo números)"
                    maxLength="10"
                    isPago={evento.es_pago}
                  />
                  {errors.ci && (
                    <ErrorMessage>
                      <AlertCircle />
                      {errors.ci}
                    </ErrorMessage>
                  )}
                  {!errors.ci && formData.ci && (
                    <SuccessMessage isPago={evento.es_pago}>
                      <CheckCircle />
                      CI válido
                    </SuccessMessage>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label isPago={evento.es_pago}>
                    <Mail size={18} />
                    Correo Electrónico <span className="required">*</span>
                  </Label>
                  <Input
                    type="email"
                    name="email_inscripcion"
                    value={formData.email_inscripcion}
                    onChange={handleInputChange}
                    className={
                      errors.email_inscripcion
                        ? "error"
                        : formData.email_inscripcion
                        ? "success"
                        : ""
                    }
                    placeholder="ejemplo@correo.com"
                    autoComplete="email"
                    isPago={evento.es_pago}
                  />
                  {errors.email_inscripcion && (
                    <ErrorMessage>
                      <AlertCircle />
                      {errors.email_inscripcion}
                    </ErrorMessage>
                  )}
                  {!errors.email_inscripcion && formData.email_inscripcion && (
                    <SuccessMessage isPago={evento.es_pago}>
                      <CheckCircle />
                      Correo válido
                    </SuccessMessage>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label isPago={evento.es_pago}>
                    <Phone size={18} />
                    Celular (Opcional)
                  </Label>
                  <Input
                    type="text"
                    name="celular_inscripcion"
                    value={formData.celular_inscripcion}
                    onChange={handleInputChange}
                    className={
                      errors.celular_inscripcion
                        ? "error"
                        : formData.celular_inscripcion &&
                          formData.celular_inscripcion.length === 8
                        ? "success"
                        : ""
                    }
                    placeholder="8 dígitos"
                    maxLength="8"
                    isPago={evento.es_pago}
                  />
                  {errors.celular_inscripcion && (
                    <ErrorMessage>
                      <AlertCircle />
                      {errors.celular_inscripcion}
                    </ErrorMessage>
                  )}
                  {!errors.celular_inscripcion &&
                    formData.celular_inscripcion &&
                    formData.celular_inscripcion.length === 8 && (
                      <SuccessMessage isPago={evento.es_pago}>
                        <CheckCircle />
                        Celular válido
                      </SuccessMessage>
                    )}
                </FormGroup>
              </FormGrid>

              {/* Campo de comprobante solo para eventos de pago */}
              {Boolean(evento.es_pago) && (
                <FormGroup style={{ marginTop: "1.5rem" }}>
                  <Label isPago={evento.es_pago}>
                    <Upload size={18} />
                    Comprobante de Pago <span className="required">*</span>
                  </Label>
                  <FileUploadContainer
                    className={`${dragOver ? "dragover" : ""} ${
                      errors.comprobante_pago ? "error" : ""
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    isPago={evento.es_pago}
                  >
                    <FileUploadInput
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <FileUploadContent isPago={evento.es_pago}>
                      <Upload size={32} />
                      <div>
                        <strong>Haz clic para subir</strong> o arrastra tu
                        comprobante aquí
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        Solo imágenes, máximo 5MB
                      </div>
                    </FileUploadContent>
                  </FileUploadContainer>

                  {formData.comprobante_pago && (
                    <FilePreview isPago={evento.es_pago}>
                      <CheckCircle size={20} />
                      <span>{formData.comprobante_pago.name}</span>
                      {ocrProcessing && <SpinIcon>⟳</SpinIcon>}
                      {extractedMonto && (
                        <span
                          style={{
                            marginLeft: "auto",
                            fontWeight: "bold",
                            color: "#16a34a",
                          }}
                        >
                          Monto: Bs. {extractedMonto}
                        </span>
                      )}
                    </FilePreview>
                  )}

                  {errors.comprobante_pago && (
                    <ErrorMessage>
                      <AlertCircle />
                      {errors.comprobante_pago}
                    </ErrorMessage>
                  )}
                </FormGroup>
              )}

              <SubmitButton
                type="submit"
                disabled={submitting || !isFormValid()}
                className={success ? "success" : ""}
                isPago={evento.es_pago}
              >
                {submitting ? (
                  <>
                    <SpinIcon>⟳</SpinIcon> Inscribiendo...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle size={16} />
                    ¡Inscripción exitosa!
                  </>
                ) : (
                  <>
                    <Save size={16} /> Inscribirse al evento
                  </>
                )}
              </SubmitButton>
            </form>
          </FormContainer>
        </MainGrid>

        {/* Modal de Información de Pago */}
        {showPaymentModal && (
          <Modal onClick={() => setShowPaymentModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h3>
                  <CreditCard size={24} />
                  Información de Pago
                </h3>
                <CloseButton onClick={() => setShowPaymentModal(false)}>
                  <X size={20} />
                </CloseButton>
              </ModalHeader>

              <p
                style={{
                  marginBottom: "1rem",
                  color: "#9a3412",
                  textAlign: "center",
                }}
              >
                Costo del evento: <strong>Bs. {evento.costo}</strong>
              </p>

              {qrCodeURL && (
                <QRContainer>
                  <QRImage src={qrCodeURL} alt="QR de pago" />
                  <DownloadButton onClick={downloadQR}>
                    <Download size={16} />
                    Descargar QR
                  </DownloadButton>
                </QRContainer>
              )}

              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#9a3412",
                  textAlign: "center",
                }}
              >
                Realiza el pago y sube tu comprobante en el formulario
              </p>
            </ModalContent>
          </Modal>
        )}
      </Content>
    </Container>
  );
};

export default FormularioEvento;

// Animaciones
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 1rem;

  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
  }
`;

const Content = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
`;

const EventHeader = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  padding: 2rem;
  margin-bottom: 2rem;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const EventCard = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const EventImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  background: #f1f5f9; /* color de fondo para rellenar */
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 300px;
  }
`;

const EventImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain; /* 🔥 muestra toda la imagen sin recortarla */
  background: #f1f5f9; /* fondo visible alrededor de imágenes pequeñas */
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02); /* sutil zoom */
  }
`;

const EventImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 1.2rem;
  animation: ${pulse} 2s infinite;
`;

const EventTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #003366;
  margin-bottom: 1rem;
  line-height: 1.2;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const EventDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: #f1f5f9;
    transform: translateX(5px);
  }

  svg {
    color: ${(props) => (props.isPago ? "#ff6b35" : "#10b981")};
    flex-shrink: 0;
  }

  span {
    color: #475569;
    font-weight: 500;
  }
`;

const PaymentButton = styled.button`
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem auto 0 auto;
  max-width: 300px;
  justify-content: center;

  &:hover {
    background: linear-gradient(135deg, #d97706, #b45309);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: ${fadeInUp} 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: ${slideIn} 0.3s ease-out;

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 1rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h3 {
    color: #ea580c;
    font-size: 1.2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: #f1f5f9;
    color: #ef4444;
  }
`;

const QRContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
`;

const QRImage = styled.img`
  max-width: 300px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    max-width: 200px;
  }
`;

const DownloadButton = styled.button`
  background: #f97316;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: #ea580c;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const FormTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
  text-align: center;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(
      90deg,
      ${(props) => (props.isPago ? "#ff6b35, #f59e0b" : "#10b981, #059669")}
    );
    border-radius: 2px;
    animation: ${shimmer} 2s infinite;
    background-size: 200px 100%;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: ${(props) => (props.isPago ? "#ff6b35" : "#10b981")};
  }

  .required {
    color: #ef4444;
  }
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.isPago ? "#ff6b35" : "#10b981")};
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.isPago ? "rgba(255, 107, 53, 0.1)" : "rgba(16, 185, 129, 0.1)"};
    transform: translateY(-1px);
  }

  &.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  &.success {
    border-color: ${(props) => (props.isPago ? "#ff6b35" : "#10b981")};
    box-shadow: 0 0 0 3px
      ${(props) =>
        props.isPago ? "rgba(255, 107, 53, 0.1)" : "rgba(16, 185, 129, 0.1)"};
  }
`;

const FileUploadContainer = styled.div`
  position: relative;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #fafafa;

  &:hover {
    border-color: ${(props) => (props.isPago ? "#ff6b35" : "#10b981")};
    background: ${(props) => (props.isPago ? "#fff7ed" : "#f0fdf4")};
  }

  &.dragover {
    border-color: ${(props) => (props.isPago ? "#ff6b35" : "#10b981")};
    background: ${(props) => (props.isPago ? "#fff7ed" : "#f0fdf4")};
    transform: scale(1.02);
  }

  &.error {
    border-color: #ef4444;
    background: #fef2f2;
  }
`;

const FileUploadInput = styled.input`
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
`;

const FileUploadContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #9ca3af;
    transition: color 0.3s ease;
  }

  ${FileUploadContainer}:hover & svg {
    color: ${(props) => (props.isPago ? "#ff6b35" : "#10b981")};
  }
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${(props) => (props.isPago ? "#fff7ed" : "#f0fdf4")};
  border: 1px solid ${(props) => (props.isPago ? "#fed7aa" : "#bbf7d0")};
  border-radius: 8px;
  margin-top: 0.5rem;

  svg {
    color: ${(props) => (props.isPago ? "#ea580c" : "#16a34a")};
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SuccessMessage = styled.span`
  color: ${(props) => (props.isPago ? "#ea580c" : "#16a34a")};
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SpinIcon = styled.span`
  display: inline-block;
  animation: ${spin} 1s linear infinite;
  margin-right: 0.5rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  background: linear-gradient(
    135deg,
    ${(props) =>
      props.isPago ? "#ff6b35 0%, #f59e0b 100%" : "#10b981 0%, #059669 100%"}
  );
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 2rem;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover:not(:disabled) {
    box-shadow: 0 8px 25px
      ${(props) =>
        props.isPago ? "rgba(255, 107, 53, 0.3)" : "rgba(16, 185, 129, 0.3)"};

    &::before {
      left: 100%;
    }
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    box-shadow: none;
  }

  &.success {
    background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
    animation: ${bounce} 0.6s ease-out;
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingContent = styled.div`
  text-align: center;
`;

const Spinner = styled.div`
  width: 4rem;
  height: 4rem;
  border: 2px solid transparent;
  border-bottom: 2px solid #2563eb;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: #6b7280;
  font-size: 1.125rem;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

  svg {
    color: #ef4444;
    margin-bottom: 1rem;
  }

  h2 {
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  p {
    color: #64748b;
  }
`;

const MessageBox = styled.div`
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &.success {
    background-color: #ecfdf5;
    border: 1px solid #bbf7d0;
    color: #065f46;
  }

  &.error {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
  }

  &.warning {
    background-color: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1e40af;
  }
`;
