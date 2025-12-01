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
  CreditCard,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import CajaMensaje from "../../../components/utils/CajaMensaje";

export default function Asistentes() {
  const [asistentes, setAsistentes] = useState([]);
  const [filteredAsistentes, setFilteredAsistentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedAsistente, setSelectedAsistente] = useState(null);
  const [formData, setFormData] = useState({
    nombre_asistente: "",
    ci: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Cargar datos de asistentes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/asistentes");
        setAsistentes(response.data);
        setFilteredAsistentes(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        agregarMensaje("fail", "#D32F2F", "Error al cargar los asistentes.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar asistentes cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAsistentes(asistentes);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = asistentes.filter(
        (asistente) =>
          asistente.nombre_asistente.toLowerCase().includes(term) ||
          asistente.ci.toLowerCase().includes(term)
      );
      setFilteredAsistentes(filtered);
    }
    setCurrentPage(1);
    setTotalPages(Math.ceil(filteredAsistentes.length / itemsPerPage));
  }, [searchTerm, asistentes]);

  // Actualizar total de páginas cuando cambian los resultados filtrados
  useEffect(() => {
    setTotalPages(Math.ceil(filteredAsistentes.length / itemsPerPage));
  }, [filteredAsistentes]);

  // Obtener asistentes para la página actual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAsistentes.slice(startIndex, endIndex);
  };

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Abrir modal de eliminación
  const openDeleteModal = (asistente) => {
    setSelectedAsistente(asistente);
    setIsDeleteModalOpen(true);
  };

  // Cerrar modal de eliminación
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedAsistente(null);
  };

  // Abrir modal de formulario para editar
  const openEditModal = (asistente) => {
    setSelectedAsistente(asistente);
    setFormData({
      nombre_asistente: asistente.nombre_asistente,
      ci: asistente.ci,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Abrir modal de formulario para agregar
  const openAddModal = () => {
    setSelectedAsistente(null);
    setFormData({
      nombre_asistente: "",
      ci: "",
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Cerrar modal de formulario
  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedAsistente(null);
    setFormData({
      nombre_asistente: "",
      ci: "",
    });
    setFormErrors({});
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "ci") {
      const numericValue = value.replace(/\D/g, "").slice(0, 20);
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else if (name === "nombre_asistente") {
      let cleaned = value
        .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
        .replace(/\s{2,}/g, " ");

      cleaned = cleaned.slice(0, 40);

      setFormData({
        ...formData,
        [name]: cleaned,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.nombre_asistente.trim()) {
      errors.nombre_asistente = "El nombre es obligatorio.";
    }

    if (!formData.ci.trim()) {
      errors.ci = "El CI es obligatorio.";
    } else if (formData.ci.length < 7) {
      errors.ci = "El CI debe tener al menos 7 dígitos.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Eliminar asistente
  const handleDelete = async () => {
    if (!selectedAsistente) return;

    try {
      setIsSubmitting(true);
      await api.delete(`/asistentesEliminar/${selectedAsistente.id_asistente}`);

      // Actualizar lista de asistentes - IGUAL QUE EN AutoridadesAdmin
      setAsistentes(
        asistentes.filter(
          (a) => a.id_asistente !== selectedAsistente.id_asistente
        )
      );
      agregarMensaje(
        "success",
        "#2E7D32",
        "Asistente eliminado correctamente."
      );
      closeDeleteModal();
    } catch (error) {
      console.error("Error al eliminar:", error);
      agregarMensaje("fail", "#D32F2F", "Error al eliminar el asistente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guardar asistente (crear o actualizar)
  const handleSave = async () => {
    if (!validateForm()) return;

    // Verificar si ya existe un asistente con el mismo CI
    const ciExistente = asistentes.find(
      (a) =>
        a.ci === formData.ci &&
        (!selectedAsistente ||
          a.id_asistente !== selectedAsistente.id_asistente)
    );

    if (ciExistente) {
      agregarMensaje(
        "warning",
        "#ED6C02",
        "Ya existe un asistente con este CI."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const dataToSend = {
        nombre_asistente: formData.nombre_asistente,
        ci: formData.ci,
      };

      let response;

      if (selectedAsistente) {
        // Actualizar asistente existente
        response = await api.put(
          `/asistentesActualizar/${selectedAsistente.id_asistente}`,
          dataToSend
        );

        // Actualizar lista de asistentes - IGUAL QUE EN AutoridadesAdmin
        setAsistentes(
          asistentes.map((a) =>
            a.id_asistente === selectedAsistente.id_asistente
              ? response.data.data
              : a
          )
        );
        agregarMensaje(
          "success",
          "#2E7D32",
          "Asistente actualizado correctamente."
        );
      } else {
        // Crear nuevo asistente
        response = await api.post("/asistentesCrear", dataToSend);

        // Actualizar lista de asistentes - IGUAL QUE EN AutoridadesAdmin
        setAsistentes([...asistentes, response.data.data]);
        agregarMensaje("success", "#2E7D32", "Asistente creado correctamente.");
      }

      closeFormModal();
    } catch (error) {
      console.error("Error al guardar:", error);
      agregarMensaje(
        "fail",
        "#D32F2F",
        `Error al ${selectedAsistente ? "actualizar" : "crear"} el asistente.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando asistentes..." />;
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
        <User size={24} /> Gestión de Asistentes
      </Title>

      <TopControls>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Buscar por nombre o CI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon>
            <Search size={16} />
          </SearchIcon>
        </SearchContainer>

        <AddButton onClick={openAddModal}>
          <Plus size={16} /> Agregar asistente
        </AddButton>
      </TopControls>

      {/* Vista de escritorio */}
      <DesktopView>
        <TableContainer>
          <Table>
            <TableHeader>
              <TableHeaderCell>Nombre</TableHeaderCell>
              <TableHeaderCell>CI</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableHeader>

            <TableBody>
              {getCurrentPageItems().length > 0 ? (
                getCurrentPageItems().map((asistente) => (
                  <TableRow key={asistente.id_asistente}>
                    <TableCell>
                      <User size={16} />
                      {asistente.nombre_asistente}
                    </TableCell>
                    <TableCell>
                      <CreditCard size={16} />
                      {asistente.ci}
                    </TableCell>
                    <TableCell>
                      <ActionButtons>
                        <EditButton
                          onClick={() => openEditModal(asistente)}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </EditButton>
                        <DeleteButton
                          onClick={() => openDeleteModal(asistente)}
                          title="Eliminar"
                        >
                          <Trash size={16} />
                        </DeleteButton>
                      </ActionButtons>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <NoResults>No se encontraron asistentes</NoResults>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DesktopView>

      {/* Vista móvil */}
      <MobileView>
        {getCurrentPageItems().length > 0 ? (
          getCurrentPageItems().map((asistente) => (
            <MobileCard key={asistente.id_asistente}>
              <MobileCardHeader>
                <MobileCardTitle>{asistente.nombre_asistente}</MobileCardTitle>
              </MobileCardHeader>
              <MobileCardContent>
                <MobileCardItem>
                  <CreditCard size={16} />
                  CI: {asistente.ci}
                </MobileCardItem>
              </MobileCardContent>
              <MobileCardActions>
                <EditButton
                  onClick={() => openEditModal(asistente)}
                  title="Editar"
                >
                  <Edit size={16} />
                </EditButton>
                <DeleteButton
                  onClick={() => openDeleteModal(asistente)}
                  title="Eliminar"
                >
                  <Trash size={16} />
                </DeleteButton>
              </MobileCardActions>
            </MobileCard>
          ))
        ) : (
          <NoResults>No se encontraron asistentes</NoResults>
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
                  <strong>{selectedAsistente?.nombre_asistente}</strong>?
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
                {selectedAsistente ? "Editar asistente" : "Agregar asistente"}
              </ModalTitle>
              <ModalCloseButton onClick={closeFormModal}>
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label htmlFor="nombre_asistente">
                  <User size={16} className="inline mr-2" /> Nombre completo *
                </Label>
                <Input
                  type="text"
                  id="nombre_asistente"
                  name="nombre_asistente"
                  value={formData.nombre_asistente}
                  onChange={handleFormChange}
                  placeholder="Ej. Juan Pérez"
                />
                {formErrors.nombre_asistente && (
                  <ErrorMessage>{formErrors.nombre_asistente}</ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="ci">
                  <CreditCard size={16} className="inline mr-2" /> Carnet de
                  Identidad *
                </Label>
                <Input
                  type="text"
                  id="ci"
                  name="ci"
                  value={formData.ci}
                  onChange={handleFormChange}
                  placeholder="Ej. 12345678"
                  maxLength="20"
                />
                {formErrors.ci && <ErrorMessage>{formErrors.ci}</ErrorMessage>}
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
  min-width: 500px;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 2fr) minmax(150px, 1fr) minmax(
      120px,
      0.8fr
    );
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
  grid-template-columns: minmax(200px, 2fr) minmax(150px, 1fr) minmax(
      120px,
      0.8fr
    );
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
