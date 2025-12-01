import { useState, useContext } from "react";
import styled from "styled-components";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import logo from "../../assets/img/logo-ts.png";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });

    // Validate fields
    if (name === "email") {
      if (!value) {
        setErrors({ ...errors, email: "El correo es requerido" });
      } else if (!validateEmail(value)) {
        setErrors({ ...errors, email: "Ingrese un correo válido" });
      } else {
        setErrors({ ...errors, email: "" });
      }
    }

    if (name === "password") {
      if (!value) {
        setErrors({ ...errors, password: "La contraseña es requerida" });
      } else {
        setErrors({ ...errors, password: "" });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedCredentials = {
      email: credentials.email.trim(),
      password: credentials.password.trim(),
    };

    const newErrors = {
      email: !trimmedCredentials.email
        ? "El correo es requerido"
        : !validateEmail(trimmedCredentials.email)
        ? "Ingrese un correo válido"
        : "",
      password: !trimmedCredentials.password
        ? "La contraseña es requerida"
        : "",
    };

    setErrors(newErrors);

    if (newErrors.email || newErrors.password) {
      return;
    }

    setError("");

    try {
      await login(trimmedCredentials);
    } catch {
      setError("Credenciales incorrectas");
    }
  };

  const isFormValid = () => {
    return (
      validateEmail(credentials.email) &&
      credentials.password.length > 0 &&
      !errors.email &&
      !errors.password
    );
  };

  return (
    <PageContainer>
      <LoginContainer>
        <Logo src={logo} alt="Logo" />
        <Title>Trabajo Social - UMSS</Title>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <InputGroup>
            <IconWrapper>
              <Mail size={18} />
            </IconWrapper>
            <Input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={credentials.email}
              onChange={handleChange}
              autoComplete="email"
              error={errors.email}
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <IconWrapper>
              <Lock size={18} />
            </IconWrapper>
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              value={credentials.password}
              onChange={handleChange}
              error={errors.password}
            />
            <TogglePassword type="button" onClick={togglePasswordVisibility}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </TogglePassword>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </InputGroup>

          <Button type="submit" disabled={!isFormValid()}>
            Ingresar
          </Button>
        </Form>
      </LoginContainer>
    </PageContainer>
  );
};

export default Login;

// Styled components
const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  background-color: #f5f5f5;
`;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  max-width: 400px;
  width: 100%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 1.5rem;
    width: 90%;
    max-width: 350px;
  }
`;

const Logo = styled.img`
  width: 180px;
  height: auto;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  padding-left: 2.5rem;
  border: 1px solid ${(props) => (props.error ? "#e74c3c" : "#ddd")};
  border-radius: 4px;
  font-size: 1rem;
  outline: none;
  transition: border 0.3s ease;

  &:focus {
    border-color: #3498db;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const TogglePassword = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;
