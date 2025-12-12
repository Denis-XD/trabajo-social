import { useState, useEffect } from "react";
import { Mail, Phone, Save, X, Plus, Trash, Edit } from "lucide-react";
import styled, { keyframes } from "styled-components";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import CajaMensaje from "../../../components/utils/CajaMensaje";

export default function Informacion() {
  const [carrera, setCarrera] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [editingEmail, setEditingEmail] = useState(null);
  const [editingPhone, setEditingPhone] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // Funciones de validación de caracteres
  const validarCaracteres = (valor, tipo) => {
    let regex;

    switch (tipo) {
      case "nombre_carrera":
      case "facultad":
      case "ensenanza":
      case "idiomas":
      case "grado":
        // Solo letras (mayúsculas, minúsculas), espacios, punto y ñ
        regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]*$/;
        break;

      case "duracion":
        // Números, letras (mayúsculas, minúsculas), espacios, punto y ñ
        regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.]*$/;
        break;

      case "direccion":
        // Letras (mayúsculas, minúsculas), espacios, ñ y los caracteres "().,"
        regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s().,"]*$/;
        break;

      default:
        return true;
    }

    return regex.test(valor);
  };

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

  // Cargar datos de la carrera
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/carrera");
        setCarrera(response.data);
        setOriginalData(JSON.parse(JSON.stringify(response.data)));
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        agregarMensaje(
          "fail",
          "#D32F2F",
          "Error al cargar los datos de la carrera."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Manejar cambios en los campos principales con validación
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validar longitud máxima
    if (value.length > 60) {
      return; // No actualizar si excede 60 caracteres
    }

    // Validar caracteres permitidos
    if (!validarCaracteres(value, name)) {
      return; // No actualizar el estado si contiene caracteres no permitidos
    }

    setCarrera({
      ...carrera,
      [name]: value,
    });
  };

  // Manejar cambios en correos
  const handleEmailChange = (index, value) => {
    // Validar longitud máxima
    if (value.length > 50) {
      return;
    }

    const updatedEmails = [...carrera.correos];
    updatedEmails[index] = {
      ...updatedEmails[index],
      correo_carrera: value,
    };
    setCarrera({
      ...carrera,
      correos: updatedEmails,
    });
  };

  // Manejar cambios en teléfonos
  const handlePhoneChange = (index, value) => {
    // Validar longitud máxima
    if (value.length > 20) {
      return;
    }

    const updatedPhones = [...carrera.telefonos];
    updatedPhones[index] = {
      ...updatedPhones[index],
      telefono: value,
    };
    setCarrera({
      ...carrera,
      telefonos: updatedPhones,
    });
  };

  // Modificar la función addEmail para verificar si el correo ya existe
  const addEmail = () => {
    if (!newEmail.trim()) {
      agregarMensaje("warning", "#ED6C02", "El correo no puede estar vacío.");
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      agregarMensaje("warning", "#ED6C02", "Formato de correo inválido.");
      return;
    }

    // Verificar si el correo ya existe
    const correoExistente = carrera.correos.find(
      (correo) => correo.correo_carrera.toLowerCase() === newEmail.toLowerCase()
    );

    if (correoExistente) {
      agregarMensaje(
        "warning",
        "#ED6C02",
        "Este correo ya ha sido registrado."
      );
      return;
    }

    const newEmailObj = {
      id_carrera_correo: Date.now(),
      id_carrera: carrera.id_carrera,
      correo_carrera: newEmail,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCarrera({
      ...carrera,
      correos: [...carrera.correos, newEmailObj],
    });
    setNewEmail("");
  };

  // Modificar la función addPhone para verificar si el teléfono ya existe
  const addPhone = () => {
    if (!newPhone.trim()) {
      agregarMensaje("warning", "#ED6C02", "El teléfono no puede estar vacío.");
      return;
    }

    // Verificar si el teléfono ya existe
    const telefonoExistente = carrera.telefonos.find(
      (telefono) => telefono.telefono === newPhone.trim()
    );

    if (telefonoExistente) {
      agregarMensaje(
        "warning",
        "#ED6C02",
        "Este teléfono ya ha sido registrado."
      );
      return;
    }

    const newPhoneObj = {
      id_carrera_telefono: Date.now(),
      id_carrera: carrera.id_carrera,
      telefono: newPhone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCarrera({
      ...carrera,
      telefonos: [...carrera.telefonos, newPhoneObj],
    });
    setNewPhone("");
  };

  // Eliminar correo
  const deleteEmail = (index) => {
    const updatedEmails = [...carrera.correos];
    updatedEmails.splice(index, 1);
    setCarrera({
      ...carrera,
      correos: updatedEmails,
    });
  };

  // Eliminar teléfono
  const deletePhone = (index) => {
    const updatedPhones = [...carrera.telefonos];
    updatedPhones.splice(index, 1);
    setCarrera({
      ...carrera,
      telefonos: updatedPhones,
    });
  };

  // Cancelar cambios
  const handleCancel = () => {
    setCarrera(JSON.parse(JSON.stringify(originalData)));
    setEditingEmail(null);
    setEditingPhone(null);
    setNewEmail("");
    setNewPhone("");
    agregarMensaje("warning", "#ED6C02", "Cambios cancelados.");
  };

  // Guardar cambios
  const handleSave = async () => {
    // Validar que no haya campos vacíos
    if (
      !carrera.nombre_carrera.trim() ||
      !carrera.facultad.trim() ||
      !carrera.duracion.trim() ||
      !carrera.ensenanza.trim() ||
      !carrera.idiomas.trim() ||
      !carrera.grado.trim() ||
      !carrera.direccion.trim()
    ) {
      agregarMensaje("fail", "#D32F2F", "Todos los campos son obligatorios.");
      return;
    }

    // Validar que haya al menos un correo y un teléfono
    if (carrera.correos.length === 0) {
      agregarMensaje(
        "fail",
        "#D32F2F",
        "Debe agregar al menos un correo electrónico."
      );
      return;
    }

    if (carrera.telefonos.length === 0) {
      agregarMensaje("fail", "#D32F2F", "Debe agregar al menos un teléfono.");
      return;
    }

    // Validar formato de todos los correos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of carrera.correos) {
      if (!emailRegex.test(email.correo_carrera)) {
        agregarMensaje(
          "fail",
          "#D32F2F",
          `El correo "${email.correo_carrera}" tiene un formato inválido.`
        );
        return;
      }
    }

    try {
      setSaving(true);
      await api.put("/carreraUpdate", {
        ...carrera,
        correos: carrera.correos.map((c) => ({
          correo_carrera: c.correo_carrera,
        })),
        telefonos: carrera.telefonos.map((t) => ({ telefono: t.telefono })),
      });
      setOriginalData(JSON.parse(JSON.stringify(carrera)));
      agregarMensaje("success", "#2E7D32", "Datos guardados correctamente.");
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      agregarMensaje("fail", "#D32F2F", "Error al guardar los datos.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando información de la carrera..." />;
  }

  if (!carrera) {
    return (
      <ErrorMessage>
        No se pudo cargar la información de la carrera.
      </ErrorMessage>
    );
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

      <Title>Información de la carrera</Title>

      {/* Información principal */}
      <Grid>
        <div>
          <FormGroup>
            <Label htmlFor="nombre_carrera">Nombre de la carrera</Label>
            <Input
              type="text"
              id="nombre_carrera"
              name="nombre_carrera"
              value={carrera.nombre_carrera}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="facultad">Facultad</Label>
            <Input
              type="text"
              id="facultad"
              name="facultad"
              value={carrera.facultad}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="duracion">Duración</Label>
            <Input
              type="text"
              id="duracion"
              name="duracion"
              value={carrera.duracion}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="ensenanza">Enseñanza</Label>
            <Input
              type="text"
              id="ensenanza"
              name="ensenanza"
              value={carrera.ensenanza}
              onChange={handleChange}
            />
          </FormGroup>
        </div>

        <div>
          <FormGroup>
            <Label htmlFor="idiomas">Idiomas</Label>
            <Input
              type="text"
              id="idiomas"
              name="idiomas"
              value={carrera.idiomas}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="grado">Grado</Label>
            <Input
              type="text"
              id="grado"
              name="grado"
              value={carrera.grado}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              type="text"
              id="direccion"
              name="direccion"
              value={carrera.direccion}
              onChange={handleChange}
            />
          </FormGroup>
        </div>
      </Grid>

      {/* Sección de correos */}
      <Section>
        <SectionTitle>
          <Mail size={20} /> Correos electrónicos
        </SectionTitle>

        <ItemList>
          {carrera.correos.map((correo, index) => (
            <ItemRow key={correo.id_carrera_correo}>
              {editingEmail === index ? (
                <ItemInput
                  type="email"
                  value={correo.correo_carrera}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                />
              ) : (
                <ItemContent>
                  <Mail
                    size={16}
                    style={{
                      display: "inline-block",
                      marginRight: "0.5rem",
                      verticalAlign: "middle",
                    }}
                  />
                  {correo.correo_carrera}
                </ItemContent>
              )}

              <ButtonGroup>
                {editingEmail === index ? (
                  <IconButton
                    onClick={() => setEditingEmail(null)}
                    color="#22c55e"
                    hoverColor="#16a34a"
                    title="Guardar"
                  >
                    <Save size={18} />
                  </IconButton>
                ) : (
                  <IconButton
                    onClick={() => setEditingEmail(index)}
                    color="#3b82f6"
                    hoverColor="#2563eb"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </IconButton>
                )}
                <IconButton
                  onClick={() => deleteEmail(index)}
                  color="#ef4444"
                  hoverColor="#dc2626"
                  title="Eliminar"
                >
                  <Trash size={18} />
                </IconButton>
              </ButtonGroup>
            </ItemRow>
          ))}
        </ItemList>

        <AddItemContainer>
          <AddItemInput
            type="email"
            value={newEmail}
            onChange={(e) => {
              if (e.target.value.length <= 50) {
                setNewEmail(e.target.value);
              }
            }}
            placeholder="Agregar nuevo correo"
          />
          <AddButton onClick={addEmail}>
            <Plus size={18} /> Agregar
          </AddButton>
        </AddItemContainer>
      </Section>

      {/* Sección de teléfonos */}
      <Section>
        <SectionTitle>
          <Phone size={20} /> Teléfonos
        </SectionTitle>

        <ItemList>
          {carrera.telefonos.map((telefono, index) => (
            <ItemRow key={telefono.id_carrera_telefono}>
              {editingPhone === index ? (
                <ItemInput
                  type="text"
                  value={telefono.telefono}
                  onChange={(e) => handlePhoneChange(index, e.target.value)}
                />
              ) : (
                <ItemContent>
                  <Phone
                    size={16}
                    style={{
                      display: "inline-block",
                      marginRight: "0.5rem",
                      verticalAlign: "middle",
                    }}
                  />
                  {telefono.telefono}
                </ItemContent>
              )}

              <ButtonGroup>
                {editingPhone === index ? (
                  <IconButton
                    onClick={() => setEditingPhone(null)}
                    color="#22c55e"
                    hoverColor="#16a34a"
                    title="Guardar"
                  >
                    <Save size={18} />
                  </IconButton>
                ) : (
                  <IconButton
                    onClick={() => setEditingPhone(index)}
                    color="#3b82f6"
                    hoverColor="#2563eb"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </IconButton>
                )}
                <IconButton
                  onClick={() => deletePhone(index)}
                  color="#ef4444"
                  hoverColor="#dc2626"
                  title="Eliminar"
                >
                  <Trash size={18} />
                </IconButton>
              </ButtonGroup>
            </ItemRow>
          ))}
        </ItemList>

        <AddItemContainer>
          <AddItemInput
            type="text"
            value={newPhone}
            onChange={(e) => {
              if (e.target.value.length <= 20) {
                setNewPhone(e.target.value);
              }
            }}
            placeholder="Agregar nuevo teléfono"
          />
          <AddButton onClick={addPhone}>
            <Plus size={18} /> Agregar
          </AddButton>
        </AddItemContainer>
      </Section>

      {/* Botones de acción */}
      <ActionButtons>
        <CancelButton onClick={handleCancel} disabled={saving}>
          <X size={18} /> Cancelar
        </CancelButton>
        <SaveButton onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <SpinIcon>⟳</SpinIcon> Guardando...
            </>
          ) : (
            <>
              <Save size={18} /> Guardar cambios
            </>
          )}
        </SaveButton>
      </ActionButtons>
    </Container>
  );
}
// Styled Components

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow-x: hidden; /* Prevenir scroll horizontal */
  animation: ${fadeIn} 0.6s ease-out;

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

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  color: #333;

  svg {
    margin-right: 0.5rem;
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #4b5563;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
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

const Section = styled.div`
  margin-bottom: 2rem;
  width: 100%;
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  width: 100%;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const ItemContent = styled.div`
  flex-grow: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
  word-break: break-word;
  overflow-wrap: break-word;

  @media (max-width: 480px) {
    width: 100%;
    border-bottom: 1px dashed #e5e7eb;
    padding-bottom: 0.5rem;
  }
`;

const ItemInput = styled.input`
  flex-grow: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  margin-left: 0.5rem;

  @media (max-width: 480px) {
    margin-left: 0;
    justify-content: flex-end;
    width: 100%;
    padding-top: 0.25rem;
  }
`;

const IconButton = styled.button`
  padding: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.color || "#3b82f6"};
  transition: color 0.2s;

  &:hover {
    color: ${(props) => props.hoverColor || "#1d4ed8"};
  }

  &:focus {
    outline: none;
  }
`;

const AddItemContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const AddItemInput = styled.input`
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

const AddButton = styled.button`
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

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.25rem;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 2px solid #e2e8f0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 2rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    margin-right: 0.5rem;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
  }
`;

const CancelButton = styled(Button)`
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const SaveButton = styled(Button)`
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
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

const ErrorMessage = styled.div`
  text-align: center;
  color: #ef4444;
  font-weight: 500;
  margin: 2rem 0;
`;
