import { useState } from "react";
import styled, { keyframes } from "styled-components";
import HeroSection from "../../../components/public/HeroSection";
import {
  FaGraduationCap,
  FaBook,
  FaBuilding,
  FaUniversity,
  FaFileAlt,
  FaBalanceScale,
  FaEdit,
  FaChevronDown,
} from "react-icons/fa";
import { Link } from "react-router-dom";

// 📌 Datos actualizados
const modalidadesData = [
  {
    titulo: "Tesis de Grado",
    icono: <FaBook />,
    descripcion:
      "Trabajo de investigación científica inédito, original y creativo, de naturaleza documental y/o de campo, que sigue el método científico. Profundiza el conocimiento sobre un problema específico en el perfil de Trabajo Social.",
    ruta: "/pregrado/modalidades-titulacion/tesis",
  },
  {
    titulo: "Excelencia Académica",
    icono: <FaGraduationCap />,
    descripcion:
      "Reconocimiento a estudiantes sobresalientes. Permite graduarse sin otras modalidades mediante evaluación cualitativa y cuantitativa del rendimiento académico.",
    ruta: "/pregrado/modalidades-titulacion/excelencia",
  },
  {
    titulo: "Trabajo Dirigido",
    icono: <FaBuilding />,
    descripcion:
      "Práctica profesional para intervenir en problemas concretos dentro de una organización. El estudiante aplica sus conocimientos mediante convenios interinstitucionales.",
    ruta: "/pregrado/modalidades-titulacion/trabajo-dirigido",
  },
  {
    titulo: "Adscripción",
    icono: <FaUniversity />,
    descripcion:
      "Participación de estudiantes en actividades académicas, de investigación o gestión universitaria. Se desarrolla bajo términos específicos para optar al grado académico.",
    ruta: "/pregrado/modalidades-titulacion/adscripcion",
  },
  {
    titulo: "Examen de Grado",
    icono: <FaEdit />,
    descripcion:
      "Valoración académica global o específica mediante pruebas escritas u orales, como método de titulación.",
    ruta: "/pregrado/modalidades-titulacion/examen",
  },
  {
    titulo: "Proyecto de Grado",
    icono: <FaFileAlt />,
    descripcion:
      "Trabajo investigativo con base metodológica que aborda una problemática teórica o práctica dentro del Trabajo Social.",
    ruta: "/pregrado/modalidades-titulacion/proyecto",
  },
  {
    titulo: "Doble Titulación",
    icono: <FaBalanceScale />,
    descripcion:
      "Modalidad de titulación que permite a estudiantes de Trabajo Social obtener el título de licenciatura y un postgrado al mismo tiempo, a través de un diplomado orientado a la intervención social, investigación o gestión pública. Es una opción válida en coordinación con programas de posgrado de la UMSS y está dirigida a quienes deseen fortalecer su perfil profesional con enfoque práctico y académico.",
    ruta: null, // No tiene ruta
  },
];

const ModalidadesTitulacion = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <PageContainer>
      <HeroSection title="Modalidades de Titulación" />
      <CardsContainer>
        {modalidadesData.map((modalidad, index) => (
          <Card key={index}>
            <IconContainer>{modalidad.icono}</IconContainer>
            <Title>{modalidad.titulo}</Title>
            <Divider />
            <MoreInfo onClick={() => toggleExpand(index)}>
              Detalles{" "}
              <FaChevronDown
                className={expandedIndex === index ? "rotated" : ""}
              />
            </MoreInfo>
            {expandedIndex === index && (
              <>
                <Description>{modalidad.descripcion}</Description>
                {modalidad.ruta && (
                  <ButtonContainer>
                    <VerMasBtn to={modalidad.ruta}>Ver pasos</VerMasBtn>
                  </ButtonContainer>
                )}
              </>
            )}
          </Card>
        ))}
      </CardsContainer>
    </PageContainer>
  );
};

export default ModalidadesTitulacion;

// 🔹 Estilos
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  width: 100%;
  background-color: #fff;
  overflow-x: hidden;
  padding-bottom: 40px;
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 40px 5%;
  justify-items: center;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(550px, 1fr));
  }
`;

const Card = styled.div`
  background: white;
  padding: 20px;
  width: 100%;
  max-width: 550px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;
  cursor: pointer;
  &:hover {
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }
`;

const IconContainer = styled.div`
  font-size: 2rem;
  color: #002f6c;
  margin-bottom: 10px;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
`;

const Divider = styled.div`
  height: 2px;
  background-color: #002f6c;
  margin: 10px 0;
`;

const MoreInfo = styled.div`
  font-size: 1rem;
  color: #002f6c;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  transition: color 0.3s ease;

  &:hover {
    color: #0047a3;
  }

  .rotated {
    transform: rotate(180deg);
    transition: transform 0.3s ease;
  }
`;

const Description = styled.p`
  font-size: 1rem;
  color: #444;
  margin-top: 10px;
  text-align: justify; /* 👈 Este cambio */
  padding: 0 15px;
`;

const ButtonContainer = styled.div`
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  padding: 0 15px;
`;

const VerMasBtn = styled(Link)`
  background-color: #002f6c;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: bold;
  transition: background 0.3s;

  &:hover {
    background-color: #0047a3;
  }
`;
