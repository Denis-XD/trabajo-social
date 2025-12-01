import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  FaChartBar,
  FaPercentage,
  FaRegChartBar,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import CajaMensaje from "../../../components/utils/CajaMensaje";

const DashboardEstadisticas = () => {
  const [datosEvento, setDatosEvento] = useState([]);
  const [datosModalidad, setDatosModalidad] = useState([]);
  const [datosOriginales, setDatosOriginales] = useState({
    eventos: [],
    modalidad: [],
  });
  const [loading, setLoading] = useState(true);
  const [mensajes, setMensajes] = useState([]);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const agregarMensaje = (tipo, color, texto, duracion) => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/estadisticas/dashboard");
        setDatosEvento(res.data.eventos);
        setDatosModalidad(res.data.modalidad);
        setDatosOriginales(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const convertirFecha = (fechaStr) => {
    const partes = fechaStr.split("/");
    return new Date(partes[2], partes[1] - 1, partes[0]);
  };

  const aplicarFiltro = () => {
    if (!fechaInicio || !fechaFin) {
      agregarMensaje(
        "fail",
        "#D32F2F",
        "Por favor selecciona ambas fechas.",
        8000
      );
      return;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (inicio > fin) {
      agregarMensaje(
        "fail",
        "#D32F2F",
        "La fecha de inicio no puede ser mayor que la fecha final.",
        8000
      );
      return;
    }

    const eventosFiltrados = datosOriginales.eventos.filter((evento) => {
      const fechaEvento = convertirFecha(evento.fecha_evento);
      return fechaEvento >= inicio && fechaEvento <= fin;
    });

    setDatosEvento(eventosFiltrados);

    // Recalcular modalidad basado en eventos filtrados
    const modalidadMap = {};
    eventosFiltrados.forEach((evento) => {
      const modalidad = evento.modalidad || "Virtual";
      if (!modalidadMap[modalidad]) {
        modalidadMap[modalidad] = {
          modalidad: modalidad,
          total_inscripciones: 0,
          total_certificados: 0,
          total_participantes: 0,
        };
      }
      modalidadMap[modalidad].total_inscripciones += evento.total_inscripciones;
      modalidadMap[modalidad].total_certificados += Math.round(
        (evento.total_inscripciones * evento.porcentaje_certificados) / 100
      );
    });

    const modalidadFiltrada = Object.values(modalidadMap).map((m) => ({
      modalidad: m.modalidad,
      total_inscripciones: m.total_inscripciones,
      porcentaje_participacion:
        m.total_inscripciones > 0
          ? Math.round((m.total_certificados / m.total_inscripciones) * 100)
          : 0,
    }));

    setDatosModalidad(modalidadFiltrada);
  };

  const limpiarFiltro = () => {
    setFechaInicio("");
    setFechaFin("");
    setDatosEvento(datosOriginales.eventos);
    setDatosModalidad(datosOriginales.modalidad);
  };

  if (loading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  return (
    <Container>
      {mensajes.map((mensaje) => (
        <CajaMensaje
          key={mensaje.id}
          tipo={mensaje.tipo}
          color={mensaje.color}
          mensaje={mensaje.texto}
          onClose={() => eliminarMensaje(mensaje.id)}
        />
      ))}
      <Titulo>📊 Dashboard de Eventos</Titulo>
      <FiltrosContainer>
        <FiltrosGrid>
          <InputGroup>
            <Label>Fecha Inicio</Label>
            <InputFecha
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <Label>Fecha Fin</Label>
            <InputFecha
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </InputGroup>
        </FiltrosGrid>
        <BotonesContainer>
          <BotonAplicar onClick={aplicarFiltro}>
            <FaFilter /> Aplicar Filtro
          </BotonAplicar>
          <BotonLimpiar onClick={limpiarFiltro}>
            <FaTimes /> Limpiar
          </BotonLimpiar>
        </BotonesContainer>
      </FiltrosContainer>

      <GridGraficos>
        <Seccion>
          <TituloSeccion>
            <FaChartBar /> Inscripciones por Evento
          </TituloSeccion>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosEvento}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="fecha_evento"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <TooltipCustom>
                        <div>
                          <strong>{payload[0].payload.titulo_evento}</strong>
                        </div>
                        <div>Fecha: {payload[0].payload.fecha_evento}</div>
                        <div>Inscripciones: {payload[0].value}</div>
                      </TooltipCustom>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar
                dataKey="total_inscripciones"
                fill="#4c51bf"
                name="Inscripciones"
              />
            </BarChart>
          </ResponsiveContainer>
        </Seccion>

        <Seccion>
          <TituloSeccion>
            <FaPercentage /> % Participación por Evento
          </TituloSeccion>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosEvento}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="fecha_evento"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <TooltipCustom>
                        <div>
                          <strong>{payload[0].payload.titulo_evento}</strong>
                        </div>
                        <div>Fecha: {payload[0].payload.fecha_evento}</div>
                        <div>Participación: {payload[0].value}%</div>
                      </TooltipCustom>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar
                dataKey="porcentaje_certificados"
                fill="#38a169"
                name="% Participantes"
              />
            </BarChart>
          </ResponsiveContainer>
        </Seccion>

        <Seccion>
          <TituloSeccion>
            <FaChartBar /> Inscripciones por Modalidad
          </TituloSeccion>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosModalidad}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="modalidad" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="total_inscripciones"
                fill="#3182ce"
                name="Inscripciones"
              />
            </BarChart>
          </ResponsiveContainer>
        </Seccion>

        <Seccion>
          <TituloSeccion>
            <FaRegChartBar /> % Participación por Modalidad
          </TituloSeccion>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosModalidad}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="modalidad" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="porcentaje_participacion"
                fill="#d69e2e"
                name="% Participantes"
              />
            </BarChart>
          </ResponsiveContainer>
        </Seccion>
      </GridGraficos>
    </Container>
  );
};

export default DashboardEstadisticas;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem 1rem;
  animation: ${fadeIn} 0.6s ease-out;

  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
  }
`;

const Titulo = styled.h2`
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #2d3748;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const FiltrosContainer = styled.div`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FiltrosGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
`;

const InputFecha = styled.input`
  padding: 0.75rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #2d3748;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: white;
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    padding: 0.6rem;
    font-size: 0.95rem;
  }
`;

const BotonesContainer = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const BotonBase = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.95rem;
  }
`;

const BotonAplicar = styled(BotonBase)`
  background: white;
  color: #667eea;

  &:hover {
    background: #f7fafc;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const BotonLimpiar = styled(BotonBase)`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Seccion = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const TituloSeccion = styled.h3`
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2d3748;

  svg {
    margin-right: 0.5rem;
    color: #4a5568;
  }

  @media (max-width: 768px) {
    font-size: 1.05rem;
  }
`;

const GridGraficos = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

const TooltipCustom = styled.div`
  background: white;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  div {
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
    color: #2d3748;

    &:last-child {
      margin-bottom: 0;
    }
  }

  strong {
    color: #1a202c;
  }
`;
