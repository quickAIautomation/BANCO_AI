import { useState, useEffect } from "react";
import api from "../services/api";
import { getUserRole, getSelectedEmpresaId } from "../utils/auth";
import { getApiBaseUrl } from "../services/api";
import {
  FaTimes,
  FaUpload,
  FaTachometerAlt,
  FaTag,
  FaDollarSign,
  FaFileAlt,
  FaImage,
  FaTrash,
  FaGripVertical,
} from "react-icons/fa";
import Logo from "./Logo";
import { useTranslation } from "../hooks/useTranslation";

function CarroForm({ carro, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    placa: "",
    quilometragem: "",
    modelo: "",
    marca: "",
    ano: "",
    valor: "",
    observacoes: "",
  });
  const [fotos, setFotos] = useState([]);
  const [fotosPreview, setFotosPreview] = useState([]);
  const [fotosExistentes, setFotosExistentes] = useState([]); // URLs das fotos existentes do backend
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [fotosOrdemAlterada, setFotosOrdemAlterada] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Detectar se é mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (carro) {
      setFormData({
        placa: carro.placa || "",
        quilometragem: carro.quilometragem || "",
        modelo: carro.modelo || "",
        marca: carro.marca || "",
        ano: carro.ano || "",
        valor: carro.valor || "",
        observacoes: carro.observacoes || "",
      });
      // Só recarregar fotos se não houve alteração manual (evita recarregar após remoção)
      if (!fotosOrdemAlterada) {
        // Carregar fotos existentes (vêm como URLs do backend)
        if (carro.fotos && carro.fotos.length > 0) {
          const fotosComUrlsCompletas = carro.fotos.map((foto) =>
            foto.startsWith("http") ? foto : `${getApiBaseUrl()}${foto}`
          );
          setFotosExistentes(fotosComUrlsCompletas);
          setFotosPreview(fotosComUrlsCompletas);
        } else {
          setFotosExistentes([]);
          setFotosPreview([]);
        }
      }
      setFotos([]); // Limpar novas fotos ao editar
    } else {
      // Limpar previews ao criar novo carro
      setFotosPreview([]);
      setFotos([]);
      setFotosExistentes([]);
    }
  }, [carro, fotosOrdemAlterada]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    console.log("Arquivos selecionados:", files.length);
    console.log("Fotos atuais:", fotosPreview.length);

    // Validar se há arquivos selecionados
    if (files.length === 0) {
      console.log("Nenhum arquivo selecionado");
      return;
    }

    // Validar limite de 20 fotos
    const totalFotos = fotosPreview.length + files.length;
    if (totalFotos > 20) {
      setErro(
        `Máximo de 20 fotos permitidas. Atualmente: ${fotosPreview.length}, tentando adicionar: ${files.length}`
      );
      return;
    }

    // Validar tipos de arquivo
    const arquivosValidos = files.filter((file) => {
      const isValid = file.type.startsWith("image/");
      if (!isValid) {
        console.log("Arquivo inválido:", file.name, file.type);
      }
      return isValid;
    });

    if (arquivosValidos.length !== files.length) {
      setErro(
        `Alguns arquivos não são imagens válidas. Apenas ${arquivosValidos.length} de ${files.length} foram aceitos.`
      );
    }

    if (arquivosValidos.length === 0) {
      setErro("Nenhuma imagem válida foi selecionada.");
      return;
    }

    console.log("Arquivos válidos:", arquivosValidos.length);

    // Adicionar arquivos válidos
    setFotos((prev) => {
      const novosArquivos = [...prev, ...arquivosValidos];
      console.log("Total de fotos após adição:", novosArquivos.length);
      return novosArquivos;
    });

    // Criar previews das novas fotos e adicionar às existentes
    const novosPreviews = arquivosValidos.map((file) => {
      const url = URL.createObjectURL(file);
      console.log("Preview criado para:", file.name);
      return url;
    });

    setFotosPreview((prev) => {
      const novasPreviews = [...prev, ...novosPreviews];
      console.log("Total de previews:", novasPreviews.length);
      return novasPreviews;
    });

    setErro(""); // Limpar erro se conseguiu adicionar

    // Limpar o input para permitir selecionar os mesmos arquivos novamente
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Adicionar dados do carro como JSON
      const carroData = {
        placa: formData.placa,
        quilometragem: parseInt(formData.quilometragem),
        modelo: formData.modelo,
        marca: formData.marca,
        ano: parseInt(formData.ano),
        valor: formData.valor ? parseFloat(formData.valor) : null,
        observacoes: formData.observacoes,
      };

      formDataToSend.append(
        "carro",
        new Blob([JSON.stringify(carroData)], {
          type: "application/json",
        })
      );

      // Adicionar fotos
      fotos.forEach((foto) => {
        formDataToSend.append("fotos", foto);
      });

      // Se for admin, adicionar empresaId como parâmetro
      const params = {};
      const userRole = getUserRole();
      if (userRole === "ADMIN") {
        const empresaId = getSelectedEmpresaId();
        if (empresaId) {
          params.empresaId = empresaId;
        }
      }

      let response;
      if (carro) {
        // Atualizar
        response = await api.put(`/carros/${carro.id}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params,
        });
      } else {
        // Criar
        response = await api.post("/carros", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params,
        });
      }

      // Só chamar onSuccess e onClose se a resposta foi bem-sucedida
      if (response && (response.status === 200 || response.status === 201)) {
        onSuccess();
        // Passar true apenas se foi criado (não editado) para mostrar notificação
        onClose(!carro); // true se criou, false se editou
      }
    } catch (error) {
      setErro(
        error.response?.data?.message ||
          "Erro ao salvar carro. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async (index) => {
    // Se está editando e a foto é uma existente
    if (carro && index < fotosExistentes.length) {
      const fotoUrl = fotosExistentes[index];

      try {
        // Remover foto do backend
        const params = {};
        const userRole = getUserRole();
        if (userRole === "ADMIN") {
          const empresaId = getSelectedEmpresaId();
          if (empresaId) {
            params.empresaId = empresaId;
          }
        }

        await api.delete(`/carros/${carro.id}/fotos`, {
          params: { ...params, fotoUrl: fotoUrl.replace(getApiBaseUrl(), "") },
        });

        // Remover da lista de existentes permanentemente
        const novasExistentes = fotosExistentes.filter((_, i) => i !== index);
        setFotosExistentes(novasExistentes);

        // Atualizar preview removendo a existente
        const novasPreviews = fotosPreview.filter((_, i) => i !== index);
        setFotosPreview(novasPreviews);

        // Marcar que houve alteração na ordem/quantidade das fotos
        setFotosOrdemAlterada(true);

        // Atualizar o objeto carro localmente para evitar recarregamento
        if (carro.fotos) {
          carro.fotos = carro.fotos.filter(
            (foto) => foto !== fotoUrl.replace(getApiBaseUrl(), "")
          );
        }

        console.log("Foto removida com sucesso:", fotoUrl);

        // Notificar o componente pai sobre a mudança
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Erro ao remover foto:", error);
        setErro("Erro ao remover foto. Tente novamente.");
      }
    } else {
      // É uma foto nova, remover normalmente
      const fotoIndex = carro ? index - fotosExistentes.length : index;
      const newFotos = fotos.filter((_, i) => i !== fotoIndex);
      const newPreviews = fotosPreview.filter((_, i) => i !== index);
      setFotos(newFotos);
      setFotosPreview(newPreviews);
    }
  };

  // Sistema simples de drag-and-drop
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    // Reordenar as fotos
    const newPreviews = [...fotosPreview];
    const draggedItem = newPreviews[draggedIndex];
    newPreviews.splice(draggedIndex, 1);
    newPreviews.splice(dropIndex, 0, draggedItem);

    setFotosPreview(newPreviews);

    // Se está editando um carro existente, salvar a nova ordem no backend
    if (carro) {
      const fotosOrdenadas = newPreviews.map((foto) =>
        foto.startsWith(getApiBaseUrl())
          ? foto.replace(getApiBaseUrl(), "")
          : foto
      );

      api
        .put(
          `/carros/${carro.id}/reordenar-fotos`,
          { fotosOrdenadas },
          {
            params:
              getUserRole() === "ADMIN" && getSelectedEmpresaId()
                ? { empresaId: getSelectedEmpresaId() }
                : {},
          }
        )
        .then(() => {
          setFotosExistentes(newPreviews.slice(0, fotosExistentes.length));
          setFotosOrdemAlterada(true);
        })
        .catch(() => {
          setErro("Erro ao reordenar fotos. Tente novamente.");
          setFotosPreview(fotosPreview);
        });
    } else {
      // Para carros novos, reordenar as fotos localmente
      const newFotos = [...fotos];
      if (draggedIndex < fotos.length && dropIndex < fotos.length) {
        const draggedFile = newFotos[draggedIndex];
        newFotos.splice(draggedIndex, 1);
        newFotos.splice(dropIndex, 0, draggedFile);
        setFotos(newFotos);
      }
    }

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Touch events simplificados para mobile
  const handleTouchStart = (e, index) => {
    if (!isMobile || e.target.closest(".delete-button")) return;

    const touch = e.touches[0];
    setTouchStartPos({
      x: touch.clientX,
      y: touch.clientY,
      index: index,
    });
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !touchStartPos) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);

    if (deltaX > 15 || deltaY > 15) {
      setDraggedIndex(touchStartPos.index);
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e, dropIndex) => {
    if (!isMobile || !touchStartPos) {
      setTouchStartPos(null);
      setDraggedIndex(null);
      return;
    }

    if (draggedIndex !== null && dropIndex !== touchStartPos.index) {
      handleDrop({ preventDefault: () => {} }, dropIndex);
    }

    setTouchStartPos(null);
    setDraggedIndex(null);
  };

  // Esconder header quando modal está aberto
  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      header.style.display = "none";
    }
    return () => {
      if (header) {
        header.style.display = "";
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 modal-overlay flex items-center justify-center z-[10000] p-6"
      onClick={() => onClose(false)}
    >
      <div
        className="modal-content rounded-lg max-w-3xl w-full h-[90vh] max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <Logo className="text-red-600" size="default" />
            <h2 className="text-2xl font-bold text-white">
              {carro ? t("carForm.editCar") : t("carForm.newCar")}
            </h2>
          </div>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            aria-label="Fechar"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto bg-gray-900 min-h-0"
        >
          <div className="p-6 space-y-6">
            {erro && (
              <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg flex items-center space-x-2">
                <FaTimes />
                <span>{erro}</span>
              </div>
            )}

            {fotosOrdemAlterada && (
              <div className="bg-green-900/50 border border-green-600 text-green-200 px-4 py-3 rounded-lg flex items-center space-x-2">
                <FaImage />
                <span>Ordem das fotos atualizada com sucesso!</span>
                <button
                  onClick={() => setFotosOrdemAlterada(false)}
                  className="ml-auto text-green-400 hover:text-green-200"
                >
                  <FaTimes />
                </button>
              </div>
            )}

            {/* Informações Básicas */}
            <div className="glass-container p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Logo className="text-red-600" size="small" />
                <span>{t("carForm.basicInfo")}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="placa"
                    className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2"
                  >
                    <FaTag className="text-red-600 text-xs" />
                    <span>{t("carForm.plate")} *</span>
                  </label>
                  <input
                    type="text"
                    id="placa"
                    name="placa"
                    value={formData.placa}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    className="input-enhanced w-full text-white"
                    placeholder={t("carForm.platePlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="quilometragem"
                    className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2"
                  >
                    <FaTachometerAlt className="text-red-600 text-xs" />
                    <span>{t("carForm.mileage")} *</span>
                  </label>
                  <input
                    type="number"
                    id="quilometragem"
                    name="quilometragem"
                    value={formData.quilometragem}
                    onChange={handleChange}
                    required
                    min="0"
                    className="input-enhanced w-full text-white"
                    placeholder={t("carForm.mileagePlaceholder")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label
                    htmlFor="marca"
                    className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2"
                  >
                    <Logo className="text-red-600 opacity-70" size="small" />
                    <span>{t("carForm.brand")} *</span>
                  </label>
                  <input
                    type="text"
                    id="marca"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    required
                    className="input-enhanced w-full text-white"
                    placeholder={t("carForm.brandPlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="modelo"
                    className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2"
                  >
                    <FaTag className="text-red-600 text-xs" />
                    <span>{t("carForm.model")} *</span>
                  </label>
                  <input
                    type="text"
                    id="modelo"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    required
                    className="input-enhanced w-full text-white"
                    placeholder={t("carForm.modelPlaceholder")}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="ano"
                  className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2"
                >
                  <FaTag className="text-red-600 text-xs" />
                  <span>{t("carForm.year")} *</span>
                </label>
                <input
                  type="number"
                  id="ano"
                  name="ano"
                  value={formData.ano}
                  onChange={handleChange}
                  required
                  min="1900"
                  max="2030"
                  className="input-enhanced w-full text-white"
                  placeholder={t("carForm.yearPlaceholder")}
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="valor"
                  className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2"
                >
                  <FaDollarSign className="text-red-600 text-xs" />
                  <span>{t("carForm.value")} (R$)</span>
                </label>
                <input
                  type="number"
                  id="valor"
                  name="valor"
                  value={formData.valor}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input-enhanced w-full text-white"
                  placeholder={t("carForm.valuePlaceholder")}
                />
              </div>
            </div>

            {/* Observações */}
            <div className="glass-container p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FaFileAlt className="text-red-600" />
                <span>{t("carForm.notes")}</span>
              </h3>
              <textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows="4"
                className="input-enhanced w-full text-white resize-none"
                placeholder={t("carForm.notesPlaceholder")}
              />
            </div>

            {/* Fotos */}
            <div className="glass-container p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FaImage className="text-red-600" />
                <span>{t("carForm.vehiclePhotos")}</span>
              </h3>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="btn-primary flex items-center justify-center space-x-2 cursor-pointer pulse-on-hover w-full sm:w-auto">
                    <FaUpload />
                    <span className={isMobile ? "text-sm" : ""}>
                      {t("carForm.selectPhotos")}
                    </span>
                    <input
                      type="file"
                      id="fotos"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {fotos.length > 0 && (
                    <span className="text-gray-400 text-sm text-center sm:text-left">
                      {fotos.length} foto{fotos.length > 1 ? "s" : ""} nova
                      {fotos.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="text-gray-400 text-sm text-center sm:text-right">
                  <span
                    className={`${
                      fotosPreview.length >= 15 ? "text-yellow-400" : ""
                    } ${fotosPreview.length >= 18 ? "text-red-400" : ""}`}
                  >
                    {fotosPreview.length}/20 fotos
                  </span>
                </div>
              </div>

              {fotosPreview.length > 1 && (
                <div className="mb-4 p-3 bg-blue-900/30 border border-blue-600/50 rounded-lg">
                  <p className="text-blue-200 text-sm flex items-center space-x-2">
                    <FaGripVertical className="text-blue-400" />
                    <span>
                      {isMobile
                        ? "Toque e arraste as fotos para reordená-las"
                        : "Arraste as fotos para reordená-las"}
                    </span>
                  </p>
                </div>
              )}

              {fotosPreview.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {fotosPreview.map((preview, index) => (
                    <div
                      key={index}
                      data-photo-index={index}
                      className={`relative group transition-all duration-200 cursor-grab ${
                        draggedIndex === index
                          ? "opacity-50 scale-95 rotate-2"
                          : "opacity-100 scale-100"
                      }`}
                      draggable={!isMobile}
                      onDragStart={
                        !isMobile ? (e) => handleDragStart(e, index) : undefined
                      }
                      onDragOver={!isMobile ? handleDragOver : undefined}
                      onDrop={
                        !isMobile ? (e) => handleDrop(e, index) : undefined
                      }
                      onDragEnd={!isMobile ? handleDragEnd : undefined}
                      onTouchStart={
                        isMobile ? (e) => handleTouchStart(e, index) : undefined
                      }
                      onTouchMove={isMobile ? handleTouchMove : undefined}
                      onTouchEnd={
                        isMobile ? (e) => handleTouchEnd(e, index) : undefined
                      }
                    >
                      <div className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className={`w-full object-cover rounded-lg border-2 transition-colors ${
                            isMobile ? "h-28 sm:h-32" : "h-32"
                          } ${
                            draggedIndex === index
                              ? "border-blue-500"
                              : "border-gray-700 group-hover:border-red-600"
                          }`}
                          draggable={false}
                        />

                        {/* Indicador de posição */}
                        <div
                          className={`absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full font-medium ${
                            isMobile ? "text-xs" : "text-xs"
                          }`}
                        >
                          {index + 1}
                        </div>

                        {/* Ícone de drag - apenas visual */}
                        <div
                          className={`absolute bg-black/80 text-white p-1 rounded transition-opacity ${
                            isMobile
                              ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-90"
                              : "top-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <FaGripVertical
                            className={isMobile ? "text-sm" : "text-xs"}
                          />
                        </div>

                        {/* Botão de remover - pequeno e funcional */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemovePhoto(index);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="delete-button absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-50 flex items-center justify-center shadow-md"
                          style={{ transform: "translate(30%, -30%)" }}
                          aria-label={t("carForm.removePhoto")}
                        >
                          <FaTrash className="text-[8px]" />
                        </button>
                      </div>

                      {/* Overlay de drag - mais sutil no mobile */}
                      <div
                        className={`absolute inset-0 rounded-lg transition-opacity ${
                          draggedIndex !== null && draggedIndex !== index
                            ? `opacity-100 ${
                                isMobile
                                  ? "bg-blue-600/10 border-2 border-blue-400/50 border-dashed"
                                  : "bg-blue-600/20 border-2 border-blue-400 border-dashed"
                              }`
                            : "opacity-0"
                        }`}
                      ></div>

                      {/* Indicador de toque ativo no mobile */}
                      {isMobile && isDragging && draggedIndex === index && (
                        <div className="absolute inset-0 bg-blue-500/30 rounded-lg border-2 border-blue-400 animate-pulse"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer com Botões */}
          <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 px-6 py-4 flex space-x-4 flex-shrink-0">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t("carForm.saving")}</span>
                </>
              ) : (
                <span>
                  {carro ? t("carForm.update") : t("carForm.register")}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CarroForm;
