import { useState } from "react";
import styled, { keyframes } from "styled-components";
import HeroSection from "../../../components/public/HeroSection";
import {
  FaFileAlt,
  FaGraduationCap,
  FaGlobe,
  FaUserGraduate,
  FaChevronDown,
  FaBookOpen,
} from "react-icons/fa";

const modalidadesData = [
  {
    titulo: "Exámen de Ingreso",
    icono: <FaFileAlt />,
    descripcion:
      "Se realiza una Prueba de Suficiencia Académica (PSA) obligatoria para el ingreso a la carrera de Trabajo Social. Evalúa conocimientos generales y es requisito habilitante para continuar el proceso.",
  },
  {
    titulo: "Curso Preuniversitario",
    icono: <FaBookOpen />,
    descripcion:
      "El curso preuniversitario es una modalidad de admisión que permite, a los postulantes bachilleres, iniciar estudios universitarios, a través de un proceso formativo dirigido a fortalecer sus conocimientos, mejorar sus capacidades cognoscitivas y desarrollar sus aptitudes para realizar estudios superiores.",
  },
  {
    titulo: "Admisión Especial",
    icono: <FaGraduationCap />,
    descripcion:
      "Permite el ingreso sin PSA ni Curso Preuniversitario. Dirigido a profesionales titulados del Sistema Universitario, Colegio Militar, Universidad Policial o Escuelas de Maestros; y a bachilleres con promedios de excelencia, logros en eventos nacionales, personas con discapacidad o pertenecientes a pueblos indígenas originarios y campesinos.",
  },
  {
    titulo: "Admisión Directa",
    icono: <FaGlobe />,
    descripcion:
      "Permite el ingreso libre a estudiantes destacados. Incluye el convenio COD-UMSS (un estudiante sobresaliente por sector agremiado) y a los mejores bachilleres de cada colegio del departamento (un hombre y una mujer). En Trabajo Social, además de esta modalidad, es obligatorio aprobar la Prueba de Personalidad de la Facultad de Humanidades.",
  },
  {
    titulo: "Programas de Becas Individuales (PBI)",
    icono: <FaUserGraduate />,
    descripcion:
      "En cumplimiento de la Ley No. 2563, se contribuye a la profesionalización académica de bachilleres de bajos ingresos económicos, que provienen de las 16 provincias del departamento, seleccionados con las organizaciones sociales (COD, FSUTCC, FDMCIOC “BS”, FEDECOR y 6 Federaciones del Trópico), para el ingreso libre a la Universidad Mayor de San Simón.",
  },
];

const ModalidadesIngreso = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <PageContainer>
      <HeroSection title="Modalidades de ingreso" />

      <CardsContainer>
        {modalidadesData.map((modalidad, index) => (
          <Card key={index}>
            <IconContainer>{modalidad.icono}</IconContainer>
            <Title>{modalidad.titulo}</Title>
            <Divider />
            <MoreInfo onClick={() => toggleExpand(index)}>
              Más Información{" "}
              <FaChevronDown
                className={expandedIndex === index ? "rotated" : ""}
              />
            </MoreInfo>
            {expandedIndex === index && (
              <Description>{modalidad.descripcion}</Description>
            )}
          </Card>
        ))}
      </CardsContainer>

      <ConvocatoriaButton href="https://www.umss.edu.bo/admision/">
        <FaFileAlt /> Convocatorias
      </ConvocatoriaButton>
    </PageContainer>
  );
};

export default ModalidadesIngreso;

// Animaciones
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  width: 100%;
  background-color: #ffffff;
  overflow-x: hidden;
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
  text-align: justify; /* 👈 aquí el cambio */
  padding: 0 15px;
`;

const ConvocatoriaButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #002f6c;
  color: white;
  font-weight: bold;
  text-decoration: none;
  padding: 12px 20px;
  border-radius: 5px;
  margin: 30px auto;
  width: fit-content;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0047a3;
  }
`;
