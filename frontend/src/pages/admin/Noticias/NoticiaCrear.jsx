import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  ArrowLeft,
  Save,
  FileText,
  User,
  Globe,
  GlobeLock,
  ImageIcon,
  Video,
  File,
  Trash,
  Eye,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Tag,
} from "lucide-react";
import api from "../../../utils/api";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import CajaMensaje from "../../../components/utils/CajaMensaje";

export default function NoticiaCrear() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [existingTitles, setExistingTitles] = useState([]);

  // Refs para inputs de archivos
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo_noticia: "",
    contenido: "",
    autor: "Trabajo Social",
    categoria: "",
    es_publico: true,
  });

  // Estados de archivos
  const [imagenes, setImagenes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [archivos, setArchivos] = useState([]);

  // Estados de errores
  const [errors, setErrors] = useState({});

  // Estados del editor
  const [editorState, setEditorState] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  const [editorColor, setEditorColor] = useState("#000000");
  const [editorFontSize, setEditorFontSize] = useState("14");

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

  // Cargar títulos existentes
  useEffect(() => {
    const fetchExistingTitles = async () => {
      try {
        const response = await api.get("/noticiasAdmin");
        setExistingTitles(
          response.data.map((noticia) => noticia.titulo_noticia.toLowerCase())
        );
      } catch (error) {
        console.error("Error al cargar títulos existentes:", error);
      }
    };

    fetchExistingTitles();
  }, []);

  // Función para limpiar y normalizar el título
  const cleanTitle = (text) => {
    // Normalizar caracteres Unicode (convertir caracteres especiales a su forma básica)
    let cleanedText = text.normalize("NFD");

    // Remover diacríticos (tildes, acentos)
    cleanedText = cleanedText.replace(/[\u0300-\u036f]/g, "");

    // Convertir caracteres matemáticos en negrita a caracteres normales
    const boldMathMap = {
      𝐀: "A",
      𝐁: "B",
      𝐂: "C",
      𝐃: "D",
      𝐄: "E",
      𝐅: "F",
      𝐆: "G",
      𝐇: "H",
      𝐈: "I",
      𝐉: "J",
      𝐊: "K",
      𝐋: "L",
      𝐌: "M",
      𝐍: "N",
      𝐎: "O",
      𝐏: "P",
      𝐐: "Q",
      𝐑: "R",
      𝐒: "S",
      𝐓: "T",
      𝐔: "U",
      𝐕: "V",
      𝐖: "W",
      𝐗: "X",
      𝐘: "Y",
      𝐙: "Z",
      𝐚: "a",
      𝐛: "b",
      𝐜: "c",
      𝐝: "d",
      𝐞: "e",
      𝐟: "f",
      𝐠: "g",
      𝐡: "h",
      𝐢: "i",
      𝐣: "j",
      𝐤: "k",
      𝐥: "l",
      𝐦: "m",
      𝐧: "n",
      𝐨: "o",
      𝐩: "p",
      𝐪: "q",
      𝐫: "r",
      𝐬: "s",
      𝐭: "t",
      𝐮: "u",
      𝐯: "v",
      𝐰: "w",
      𝐱: "x",
      𝐲: "y",
      𝐳: "z",
      "𝟎": "0",
      "𝟏": "1",
      "𝟐": "2",
      "𝟑": "3",
      "𝟒": "4",
      "𝟓": "5",
      "𝟔": "6",
      "𝟕": "7",
      "𝟖": "8",
      "𝟗": "9",
    };

    // Reemplazar caracteres matemáticos en negrita
    cleanedText = cleanedText.replace(
      /[𝐀-𝐳𝟎-𝟗]/gu,
      (char) => boldMathMap[char] || char
    );

    // Remover emojis y otros símbolos especiales
    cleanedText = cleanedText.replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
      ""
    );

    // Remover caracteres de control y otros caracteres especiales, manteniendo letras, números, espacios y algunos símbolos básicos
    cleanedText = cleanedText.replace(/[^\w\s\-_.,()[\]]/g, "");

    // Limpiar espacios múltiples pero mantener espacios simples
    cleanedText = cleanedText.replace(/\s{2,}/g, " ");

    // Convertir a mayúsculas
    return cleanedText.toUpperCase();
  };

  // Validar archivo
  const validateFile = (file, type) => {
    const maxSizes = {
      image: 5 * 1024 * 1024, // 5MB
      video: 30 * 1024 * 1024, // 30MB
      file: 5 * 1024 * 1024, // 5MB
    };

    if (file.size > maxSizes[type]) {
      const maxSizeText = type === "video" ? "30MB" : "5MB";
      return `El archivo ${file.name} supera el tamaño máximo de ${maxSizeText}`;
    }

    if (type === "image" && !file.type.startsWith("image/")) {
      return `${file.name} no es una imagen válida`;
    }

    if (type === "video" && !file.type.startsWith("video/")) {
      return `${file.name} no es un video válido`;
    }

    return null;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let newValue = value;

    if (name === "titulo_noticia" && value.length > 100) {
      return;
    }

    if (name === "autor" && value.length > 40) {
      return;
    }

    if (name === "titulo_noticia") {
      newValue = cleanTitle(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : newValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Manejar cambios en el editor
  const handleEditorChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setFormData((prev) => ({
        ...prev,
        contenido: content,
      }));

      // Limpiar error
      if (errors.contenido) {
        setErrors((prev) => ({
          ...prev,
          contenido: null,
        }));
      }
    }
  };

  // Comandos del editor
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();

    // Actualizar estado del editor
    setEditorState({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });

    handleEditorChange();
  };

  // Función para cambiar el tamaño de fuente
  const changeFontSize = (size) => {
    setEditorFontSize(size);
    execCommand("fontSize", "3"); // Usar fontSize 3 como base

    // Aplicar el tamaño personalizado
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
          const span = document.createElement("span");
          span.style.fontSize = size + "px";
          try {
            range.surroundContents(span);
          } catch (e) {
            // Si no se puede envolver, insertar el span
            span.appendChild(range.extractContents());
            range.insertNode(span);
          }
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
    handleEditorChange();
  };

  // Función para cambiar el color del texto
  const changeTextColor = (color) => {
    setEditorColor(color);
    execCommand("foreColor", color);
  };

  // Función mejorada para listas
  const toggleList = () => {
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    if (range) {
      // Guardar la selección
      const selectedText = range.toString();

      // Ejecutar el comando de lista
      execCommand("insertUnorderedList");

      // Si había texto seleccionado, restaurar la selección
      if (selectedText) {
        setTimeout(() => {
          const newRange = document.createRange();
          const walker = document.createTreeWalker(
            editorRef.current,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );

          let node;
          while ((node = walker.nextNode())) {
            if (node.textContent.includes(selectedText)) {
              const index = node.textContent.indexOf(selectedText);
              newRange.setStart(node, index);
              newRange.setEnd(node, index + selectedText.length);
              selection.removeAllRanges();
              selection.addRange(newRange);
              break;
            }
          }
        }, 10);
      }
    } else {
      execCommand("insertUnorderedList");
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar título
    if (!formData.titulo_noticia.trim()) {
      newErrors.titulo_noticia = "El título es obligatorio";
    } else if (existingTitles.includes(formData.titulo_noticia.toLowerCase())) {
      newErrors.titulo_noticia = "Ya existe una noticia con este título";
    }

    // Validar categoría
    if (!formData.categoria) {
      newErrors.categoria = "La categoría es obligatoria";
    }

    // Validar contenido
    if (!formData.contenido.trim() || formData.contenido === "<br>") {
      newErrors.contenido = "El contenido es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      agregarMensaje(
        "fail",
        "#D32F2F",
        "Por favor corrige los errores en el formulario"
      );
      return;
    }

    try {
      setSaving(true);

      const formDataToSend = new FormData();

      // Agregar datos del formulario
      formDataToSend.append("titulo_noticia", formData.titulo_noticia);
      formDataToSend.append("contenido", formData.contenido);
      formDataToSend.append("autor", formData.autor);
      formDataToSend.append("categoria", formData.categoria);
      formDataToSend.append("es_publico", formData.es_publico ? "1" : "0");

      // Agregar archivos
      imagenes.forEach((img, index) => {
        formDataToSend.append(`imagenes[${index}]`, img.file);
      });

      videos.forEach((vid, index) => {
        formDataToSend.append(`videos[${index}]`, vid.file);
      });

      archivos.forEach((file, index) => {
        formDataToSend.append(`archivos[${index}]`, file.file);
      });

      await api.post("/noticiasCrear", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      agregarMensaje("success", "#2E7D32", "Noticia creada correctamente");

      // Esperar un momento para mostrar el mensaje y luego navegar
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Error al crear noticia:", error);
      agregarMensaje("fail", "#D32F2F", "Error al crear la noticia");
    } finally {
      setSaving(false);
    }
  };

  // Manejar volver atrás
  const handleGoBack = () => {
    navigate(-1);
  };

  // Limpiar URLs de preview al desmontar
  useEffect(() => {
    return () => {
      imagenes.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
      videos.forEach((vid) => {
        if (vid.preview) URL.revokeObjectURL(vid.preview);
      });
      archivos.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  // Funciones para manejar archivos
  const handleFileUpload = (files, type) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    fileArray.forEach((file) => {
      const error = validateFile(file, type);
      if (error) {
        errors.push(error);
      } else {
        const fileWithPreview = {
          file,
          id: Date.now() + Math.random() + Math.floor(Math.random() * 10000), // ID más único
          name: file.name,
          size: file.size,
          type: file.type,
          preview:
            type === "image" || type === "video"
              ? URL.createObjectURL(file)
              : null,
        };
        validFiles.push(fileWithPreview);
      }
    });

    if (errors.length > 0) {
      errors.forEach((error) => agregarMensaje("warning", "#ED6C02", error));
    }

    if (validFiles.length > 0) {
      if (type === "image") {
        setImagenes((prev) => [...prev, ...validFiles]);
      } else if (type === "video") {
        setVideos((prev) => [...prev, ...validFiles]);
      } else {
        setArchivos((prev) => [...prev, ...validFiles]);
      }
    }
  };

  const formatFileSize = (size) => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(2)} ${units[i]}`;
  };

  const viewFile = (file, e) => {
    e.stopPropagation();
    window.open(file.preview, "_blank");
  };

  const removeFile = (id, type, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (type === "image") {
      setImagenes((prev) => {
        const updated = prev.filter((img) => img.id !== id);
        // Limpiar URL de preview del archivo eliminado
        const removed = prev.find((img) => img.id === id);
        if (removed?.preview) {
          URL.revokeObjectURL(removed.preview);
        }
        return updated;
      });
    } else if (type === "video") {
      setVideos((prev) => {
        const updated = prev.filter((vid) => vid.id !== id);
        // Limpiar URL de preview del archivo eliminado
        const removed = prev.find((vid) => vid.id === id);
        if (removed?.preview) {
          URL.revokeObjectURL(removed.preview);
        }
        return updated;
      });
    } else {
      setArchivos((prev) => {
        const updated = prev.filter((file) => file.id !== id);
        // Limpiar URL de preview del archivo eliminado
        const removed = prev.find((file) => file.id === id);
        if (removed?.preview) {
          URL.revokeObjectURL(removed.preview);
        }
        return updated;
      });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando..." />;
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

      <HeaderCard>
        <HeaderContent>
          <Title>
            <FileText size={28} />
            Crear Noticia
          </Title>
          <BackButton onClick={handleGoBack}>
            <ArrowLeft size={20} />
            Volver
          </BackButton>
        </HeaderContent>
      </HeaderCard>

      <Form onSubmit={handleSubmit}>
        {/* Información básica */}
        <Section>
          <SectionTitle>
            <FileText size={22} />
            Información de la Noticia
          </SectionTitle>

          <FormGroup>
            <Label htmlFor="titulo_noticia">
              <FileText size={16} />
              Título de la noticia *
            </Label>
            <Input
              type="text"
              id="titulo_noticia"
              name="titulo_noticia"
              value={formData.titulo_noticia}
              onChange={handleInputChange}
              placeholder="TÍTULO EN MAYÚSCULAS"
              className={errors.titulo_noticia ? "error" : ""}
            />
            {errors.titulo_noticia && (
              <ErrorMessage>{errors.titulo_noticia}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="autor">
              <User size={16} />
              Autor
            </Label>
            <Input
              type="text"
              id="autor"
              name="autor"
              value={formData.autor}
              onChange={handleInputChange}
              placeholder="Nombre del autor"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="categoria">
              <Tag size={16} />
              Categoría *
            </Label>
            <Select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              className={errors.categoria ? "error" : ""}
            >
              <option value="">Seleccionar categoría</option>
              <StyledOption value="Articulo">Artículo</StyledOption>
              <StyledOption value="Comunicado">Comunicado</StyledOption>
            </Select>
            {errors.categoria && (
              <ErrorMessage>{errors.categoria}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>
              <Globe size={16} />
              Visibilidad
            </Label>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                id="es_publico"
                name="es_publico"
                checked={formData.es_publico}
                onChange={handleInputChange}
              />
              <CheckboxLabel htmlFor="es_publico">
                {formData.es_publico ? (
                  <Globe size={16} />
                ) : (
                  <GlobeLock size={16} />
                )}
                {formData.es_publico ? "Público" : "Privado"}
              </CheckboxLabel>
            </CheckboxContainer>
          </FormGroup>
        </Section>

        {/* Contenido */}
        <Section>
          <SectionTitle>
            <FileText size={22} />
            Contenido de la Noticia
          </SectionTitle>

          <FormGroup>
            <Label>
              <FileText size={16} />
              Contenido *
            </Label>
            <EditorContainer className={errors.contenido ? "error" : ""}>
              <EditorToolbar>
                {/* Formato básico */}
                <ToolbarButton
                  type="button"
                  active={editorState.bold}
                  onClick={() => execCommand("bold")}
                  title="Negrita"
                >
                  <Bold size={14} />
                </ToolbarButton>
                <ToolbarButton
                  type="button"
                  active={editorState.italic}
                  onClick={() => execCommand("italic")}
                  title="Cursiva"
                >
                  <Italic size={14} />
                </ToolbarButton>
                <ToolbarButton
                  type="button"
                  active={editorState.underline}
                  onClick={() => execCommand("underline")}
                  title="Subrayado"
                >
                  <Underline size={14} />
                </ToolbarButton>

                <ToolbarSeparator />

                {/* Tamaño de fuente */}
                <ToolbarSelect
                  value={editorFontSize}
                  onChange={(e) => changeFontSize(e.target.value)}
                  title="Tamaño de fuente"
                >
                  <option value="10">10px</option>
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                  <option value="24">24px</option>
                  <option value="28">28px</option>
                  <option value="32">32px</option>
                </ToolbarSelect>

                {/* Color de texto */}
                <ColorInput
                  type="color"
                  value={editorColor}
                  onChange={(e) => changeTextColor(e.target.value)}
                  title="Color del texto"
                />

                <ToolbarSeparator />

                {/* Lista */}
                <ToolbarButton
                  type="button"
                  onClick={toggleList}
                  title="Lista con viñetas"
                >
                  <List size={14} />
                </ToolbarButton>

                <ToolbarSeparator />

                {/* Alineación */}
                <ToolbarButton
                  type="button"
                  onClick={() => execCommand("justifyLeft")}
                  title="Alinear izquierda"
                >
                  <AlignLeft size={14} />
                </ToolbarButton>
                <ToolbarButton
                  type="button"
                  onClick={() => execCommand("justifyCenter")}
                  title="Centrar"
                >
                  <AlignCenter size={14} />
                </ToolbarButton>
                <ToolbarButton
                  type="button"
                  onClick={() => execCommand("justifyRight")}
                  title="Alinear derecha"
                >
                  <AlignRight size={14} />
                </ToolbarButton>
                <ToolbarButton
                  type="button"
                  onClick={() => execCommand("justifyFull")}
                  title="Justificar"
                >
                  <AlignJustify size={14} />
                </ToolbarButton>
              </EditorToolbar>
              <EditorContent
                ref={editorRef}
                contentEditable
                onInput={handleEditorChange}
                onKeyUp={() => {
                  setEditorState({
                    bold: document.queryCommandState("bold"),
                    italic: document.queryCommandState("italic"),
                    underline: document.queryCommandState("underline"),
                  });
                }}
                suppressContentEditableWarning={true}
                style={{ minHeight: "220px" }}
              />
            </EditorContainer>
            {errors.contenido && (
              <ErrorMessage>{errors.contenido}</ErrorMessage>
            )}
          </FormGroup>
        </Section>

        {/* Imágenes */}
        <Section>
          <SectionTitle>
            <ImageIcon size={22} />
            Imágenes (Máximo 5MB cada una)
          </SectionTitle>

          <FileUploadSection
            onClick={() => imageInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("dragover");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("dragover");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("dragover");
              handleFileUpload(e.dataTransfer.files, "image");
            }}
          >
            <FileUploadIcon>
              <ImageIcon size={56} />
            </FileUploadIcon>
            <FileUploadText>
              Haz clic aquí o arrastra imágenes para subir
            </FileUploadText>
            <FileUploadSubtext>
              Formatos soportados: JPG, PNG, GIF, WebP
            </FileUploadSubtext>
          </FileUploadSection>

          <HiddenInput
            ref={imageInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files, "image")}
          />

          {imagenes.length > 0 && (
            <FileList>
              {imagenes.map((imagen) => (
                <FileItem key={imagen.id}>
                  <FilePreview>
                    <img
                      src={imagen.preview || "/placeholder.svg"}
                      alt={imagen.name}
                    />
                  </FilePreview>
                  <FileInfo>
                    <FileName>{imagen.name}</FileName>
                    <FileSize>{formatFileSize(imagen.size)}</FileSize>
                  </FileInfo>
                  <FileActions>
                    <ViewFileButton
                      type="button"
                      onClick={(e) => viewFile(imagen, e)}
                      title="Ver"
                    >
                      <Eye size={12} />
                    </ViewFileButton>
                    <RemoveFileButton
                      type="button"
                      onClick={(e) => removeFile(imagen.id, "image", e)}
                      title="Eliminar"
                    >
                      <Trash size={12} />
                    </RemoveFileButton>
                  </FileActions>
                </FileItem>
              ))}
            </FileList>
          )}
        </Section>

        {/* Videos */}
        <Section>
          <SectionTitle>
            <Video size={22} />
            Videos (Máximo 30MB cada uno)
          </SectionTitle>

          <FileUploadSection
            onClick={() => videoInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("dragover");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("dragover");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("dragover");
              handleFileUpload(e.dataTransfer.files, "video");
            }}
          >
            <FileUploadIcon>
              <Video size={56} />
            </FileUploadIcon>
            <FileUploadText>
              Haz clic aquí o arrastra videos para subir
            </FileUploadText>
            <FileUploadSubtext>
              Formatos soportados: MP4, AVI, MOV, WebM
            </FileUploadSubtext>
          </FileUploadSection>

          <HiddenInput
            ref={videoInputRef}
            type="file"
            multiple
            accept="video/*"
            onChange={(e) => handleFileUpload(e.target.files, "video")}
          />

          {videos.length > 0 && (
            <FileList>
              {videos.map((video) => (
                <FileItem key={video.id}>
                  <FilePreview>
                    <video src={video.preview} controls />
                  </FilePreview>
                  <FileInfo>
                    <FileName>{video.name}</FileName>
                    <FileSize>{formatFileSize(video.size)}</FileSize>
                  </FileInfo>
                  <FileActions>
                    <ViewFileButton
                      type="button"
                      onClick={(e) => viewFile(video, e)}
                      title="Ver"
                    >
                      <Eye size={12} />
                    </ViewFileButton>
                    <RemoveFileButton
                      type="button"
                      onClick={(e) => removeFile(video.id, "video", e)}
                      title="Eliminar"
                    >
                      <Trash size={12} />
                    </RemoveFileButton>
                  </FileActions>
                </FileItem>
              ))}
            </FileList>
          )}
        </Section>

        {/* Archivos */}
        <Section>
          <SectionTitle>
            <File size={22} />
            Archivos (Máximo 5MB cada uno)
          </SectionTitle>

          <FileUploadSection
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("dragover");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("dragover");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("dragover");
              handleFileUpload(e.dataTransfer.files, "file");
            }}
          >
            <FileUploadIcon>
              <File size={56} />
            </FileUploadIcon>
            <FileUploadText>
              Haz clic aquí o arrastra archivos para subir
            </FileUploadText>
            <FileUploadSubtext>
              Documentos, PDFs, hojas de cálculo, etc.
            </FileUploadSubtext>
          </FileUploadSection>

          <HiddenInput
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e.target.files, "file")}
          />

          {archivos.length > 0 && (
            <FileList>
              {archivos.map((archivo) => (
                <FileItem key={archivo.id}>
                  <FilePreview>
                    <File size={48} />
                  </FilePreview>
                  <FileInfo>
                    <FileName>{archivo.name}</FileName>
                    <FileSize>{formatFileSize(archivo.size)}</FileSize>
                  </FileInfo>
                  <FileActions>
                    <RemoveFileButton
                      type="button"
                      onClick={(e) => removeFile(archivo.id, "file", e)}
                      title="Eliminar"
                    >
                      <Trash size={12} />
                    </RemoveFileButton>
                  </FileActions>
                </FileItem>
              ))}
            </FileList>
          )}
        </Section>

        {/* Botones de acción */}
        <ActionButtons>
          <SaveButton type="submit" disabled={saving}>
            {saving ? (
              <>
                <SpinIcon>⟳</SpinIcon>
                Guardando...
              </>
            ) : (
              <>
                <Save size={16} />
                Guardar Noticia
              </>
            )}
          </SaveButton>
        </ActionButtons>
      </Form>
    </Container>
  );
}

// Animaciones
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.4s ease-in-out;
  overflow-x: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    padding: 1rem;
    width: 100%;
    border-radius: 0;
    box-shadow: none;
    background: white;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const Section = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 2rem;
  animation: ${slideUp} 0.4s ease-in-out;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
    background-size: 200% 100%;
    animation: ${shimmer} 3s ease-in-out infinite;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.375rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.75rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background-color: #fefefe;
  }

  &.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  &:hover:not(:focus) {
    border-color: #cbd5e1;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background-color: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background-color: #fefefe;
  }

  &.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  &:hover:not(:focus) {
    border-color: #cbd5e1;
  }
`;

const StyledOption = styled.option`
  padding: 0.5rem;
  font-weight: 500;

  &[value="Articulo"] {
    color: #16a34a;
    background-color: #f0fdf4;
  }

  &[value="Comunicado"] {
    color: #ea580c;
    background-color: #fff7ed;
  }
`;

const EditorContainer = styled.div`
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: white;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  &:hover:not(:focus-within) {
    border-color: #cbd5e1;
  }
`;

const EditorToolbar = styled.div`
  display: flex;
  gap: 0.375rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-bottom: 1px solid #cbd5e1;
  flex-wrap: wrap;
  align-items: center;
`;

const ToolbarButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 0.375rem;
  background-color: ${(props) => (props.active ? "#3b82f6" : "transparent")};
  color: ${(props) => (props.active ? "white" : "#4b5563")};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  padding: 0 0.375rem;
  font-weight: 500;

  &:hover {
    background-color: ${(props) => (props.active ? "#2563eb" : "#e2e8f0")};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ToolbarSelect = styled.select`
  height: 2.25rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  background-color: white;
  color: #4b5563;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0 0.5rem;
  min-width: 70px;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ColorInput = styled.input`
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  cursor: pointer;
  background: none;
  padding: 2px;

  &::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
  }
`;

const ToolbarSeparator = styled.div`
  width: 1px;
  height: 1.75rem;
  background-color: #cbd5e1;
  margin: 0 0.375rem;
`;

const EditorContent = styled.div`
  min-height: 220px;
  padding: 1rem;
  outline: none;
  line-height: 1.7;
  font-size: 0.9rem;

  &:focus {
    background-color: #fefefe;
  }

  @media (max-width: 768px) {
    min-height: 180px;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
`;

const Checkbox = styled.input`
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
  accent-color: #3b82f6;
`;

const CheckboxLabel = styled.label`
  font-size: 0.9rem;
  color: #4b5563;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
`;

const FileUploadSection = styled.div`
  border: 2px dashed #cbd5e1;
  border-radius: 0.75rem;
  padding: 2.5rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);

  &:hover {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%);
    transform: translateY(-2px);
  }

  &.dragover {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    animation: ${pulse} 1s infinite;
  }

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const FileUploadIcon = styled.div`
  font-size: 3.5rem;
  color: #9ca3af;
  margin-bottom: 1.25rem;
  transition: all 0.3s ease;

  ${FileUploadSection}:hover & {
    color: #3b82f6;
    transform: scale(1.1);
  }
`;

const FileUploadText = styled.p`
  color: #6b7280;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
`;

const FileUploadSubtext = styled.p`
  color: #9ca3af;
  font-size: 0.8rem;
`;

const FileList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FileItem = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
    border-color: #cbd5e1;
  }
`;

const FilePreview = styled.div`
  width: 100%;
  height: 140px;
  border-radius: 0.5rem;
  overflow: hidden;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const FileInfo = styled.div`
  text-align: center;
  width: 100%;
`;

const FileName = styled.p`
  font-size: 0.8rem;
  color: #374151;
  margin: 0;
  word-break: break-word;
  line-height: 1.4;
  font-weight: 500;
`;

const FileSize = styled.p`
  font-size: 0.7rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
`;

const FileActions = styled.div`
  display: flex;
  gap: 0.375rem;
  margin-top: 0.75rem;
`;

const FileActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const ViewFileButton = styled(FileActionButton)`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  type: "button";

  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }
`;

const RemoveFileButton = styled(FileActionButton)`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  type: "button";

  &:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 500;
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

const HiddenInput = styled.input`
  display: none;
`;

const HeaderCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${slideUp} 0.8s ease-out;

  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: #000000;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;
