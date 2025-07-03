import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Check, Edit3, Download, FileText, Image, Video, File, BarChart3, X, Save, Eye, ChevronDown } from 'lucide-react';

// Tipos de status de validação
const VALIDATION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  NEEDS_ADJUSTMENT: 'needs_adjustment',
  REJECTED: 'rejected'
};

// Cores para cada status com nova paleta
const STATUS_COLORS = {
  [VALIDATION_STATUSES.PENDING]: 'bg-slate-100 text-slate-700 border-slate-300',
  [VALIDATION_STATUSES.APPROVED]: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  [VALIDATION_STATUSES.NEEDS_ADJUSTMENT]: 'bg-amber-100 text-amber-700 border-amber-300',
  [VALIDATION_STATUSES.REJECTED]: 'bg-rose-100 text-rose-700 border-rose-300'
};

// Labels para os status
const STATUS_LABELS = {
  [VALIDATION_STATUSES.PENDING]: 'Pendente',
  [VALIDATION_STATUSES.APPROVED]: 'Aprovado',
  [VALIDATION_STATUSES.NEEDS_ADJUSTMENT]: 'Precisa Ajustes',
  [VALIDATION_STATUSES.REJECTED]: 'Reprovado'
};

// Componente para upload de arquivos
const FileUpload = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    onFilesAdded(files);
  }, [onFilesAdded]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    onFilesAdded(files);
  }, [onFilesAdded]);

  return (
    <div className="mb-8">
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-[#ffc801] bg-[#ffc801]/5 scale-105' 
            : 'border-slate-300 hover:border-[#ffc801]/60 hover:bg-slate-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#ffc801] to-[#ffb700] rounded-full flex items-center justify-center mb-6 shadow-lg">
          <Upload className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Arraste e solte seus arquivos aqui
        </h3>
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          Suporte para imagens, vídeos e PDFs. Arraste múltiplos arquivos ou clique para selecionar.
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-input"
          accept="image/*,video/*,.pdf"
        />
        <label
          htmlFor="file-input"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#ffc801] to-[#ffb700] text-white font-semibold rounded-xl cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <Upload className="w-5 h-5 mr-2" />
          Selecionar Arquivos
        </label>
      </div>
    </div>
  );
};

// Componente para mostrar ícone do tipo de arquivo
const FileTypeIcon = ({ fileType }) => {
  if (fileType.startsWith('image/')) {
    return <Image className="w-5 h-5 text-blue-500" />;
  } else if (fileType.startsWith('video/')) {
    return <Video className="w-5 h-5 text-purple-500" />;
  } else if (fileType === 'application/pdf') {
    return <FileText className="w-5 h-5 text-red-500" />;
  }
  return <File className="w-5 h-5 text-slate-500" />;
};

// Componente pop-up para validação
const FilePopup = ({ file, validation, onValidationChange, onClose, onSave }) => {
  const [localValidation, setLocalValidation] = useState({
    status: validation?.status || VALIDATION_STATUSES.PENDING,
    comment: validation?.comment || ''
  });

  const handleStatusChange = (status) => {
    setLocalValidation(prev => ({ ...prev, status }));
  };

  const handleCommentChange = (comment) => {
    setLocalValidation(prev => ({ ...prev, comment }));
  };

  const handleSave = () => {
    onSave(file.id, localValidation);
    onClose();
  };

  const renderContent = () => {
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg"
        />
      );
    } else if (file.type.startsWith('video/')) {
      return (
        <video
          src={file.url}
          controls
          className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-lg"
        />
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="w-96 h-96 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center shadow-lg">
          <div className="text-center">
            <FileText className="w-24 h-24 text-red-400 mx-auto mb-4" />
            <span className="text-red-600 font-medium text-lg">Arquivo PDF</span>
            <p className="text-red-500 text-sm mt-2">Clique para baixar e visualizar</p>
          </div>
        </div>
      );
    }
    return (
      <div className="w-96 h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center shadow-lg">
        <div className="text-center">
          <File className="w-24 h-24 text-slate-400 mx-auto mb-4" />
          <span className="text-slate-600 font-medium text-lg">Arquivo</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <FileTypeIcon fileType={file.type} />
            <div>
              <h3 className="text-xl font-bold text-slate-800">{file.name}</h3>
              <p className="text-sm text-slate-600">Validação de peça criativa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* File Preview */}
          <div className="flex justify-center mb-8">
            {renderContent()}
          </div>

          {/* Validation Controls */}
          <div className="space-y-6">
            {/* Status Buttons */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Status da Validação
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleStatusChange(VALIDATION_STATUSES.APPROVED)}
                  className={`p-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    localValidation.status === VALIDATION_STATUSES.APPROVED
                      ? 'bg-emerald-500 text-white shadow-lg scale-105'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Check className="w-5 h-5" />
                  <span>Aprovar</span>
                </button>
                
                <button
                  onClick={() => handleStatusChange(VALIDATION_STATUSES.NEEDS_ADJUSTMENT)}
                  className={`p-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    localValidation.status === VALIDATION_STATUSES.NEEDS_ADJUSTMENT
                      ? 'bg-[#ffc801] text-white shadow-lg scale-105'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <Edit3 className="w-5 h-5" />
                  <span>Precisa Ajustes</span>
                </button>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Comentário (opcional)
              </label>
              <textarea
                value={localValidation.comment}
                onChange={(e) => handleCommentChange(e.target.value)}
                placeholder="Digite suas observações sobre a peça..."
                className="w-full p-4 border border-slate-200 rounded-xl text-sm resize-none focus:border-[#ffc801] focus:ring-2 focus:ring-[#ffc801]/20 outline-none transition-all"
                rows="4"
              />
            </div>

            {/* Current Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Status Atual
              </label>
              <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-full border ${STATUS_COLORS[localValidation.status]}`}>
                {STATUS_LABELS[localValidation.status]}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-slate-200 bg-slate-50 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-3 text-slate-600 font-semibold hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-[#ffc801] to-[#ffb700] text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Salvar Validação</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para visualizar um arquivo (apenas preview)
const FileViewer = ({ file, validation, onOpenPopup }) => {
  const [isHovered, setIsHovered] = useState(false);

  const renderPreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="relative group">
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-48 object-cover rounded-xl"
          />
          {isHovered && (
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center transition-all duration-200">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2">
                <Eye className="w-4 h-4 text-slate-700" />
                <span className="text-sm font-semibold text-slate-700">Visualizar</span>
              </div>
            </div>
          )}
        </div>
      );
    } else if (file.type.startsWith('video/')) {
      return (
        <div className="relative group">
          <video
            src={file.url}
            className="w-full h-48 object-cover rounded-xl"
          />
          {isHovered && (
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center transition-all duration-200">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2">
                <Eye className="w-4 h-4 text-slate-700" />
                <span className="text-sm font-semibold text-slate-700">Visualizar</span>
              </div>
            </div>
          )}
        </div>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="relative group">
          <div className="w-full h-48 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-red-400 mx-auto mb-2" />
              <span className="text-red-600 font-medium">PDF</span>
            </div>
          </div>
          {isHovered && (
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center transition-all duration-200">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2">
                <Eye className="w-4 h-4 text-slate-700" />
                <span className="text-sm font-semibold text-slate-700">Visualizar</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="relative group">
        <div className="w-full h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <File className="w-16 h-16 text-slate-400 mx-auto mb-2" />
            <span className="text-slate-600 font-medium">Arquivo</span>
          </div>
        </div>
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center transition-all duration-200">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2">
              <Eye className="w-4 h-4 text-slate-700" />
              <span className="text-sm font-semibold text-slate-700">Visualizar</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onClick={() => onOpenPopup(file)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Preview do arquivo */}
      {renderPreview()}
      
      {/* Nome do arquivo */}
      <div className="mt-4 flex items-center">
        <FileTypeIcon fileType={file.type} />
        <span className="ml-3 text-sm font-semibold text-slate-700 truncate">
          {file.name}
        </span>
      </div>

      {/* Status atual */}
      <div className="mt-4">
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${STATUS_COLORS[validation.status]}`}>
          {STATUS_LABELS[validation.status]}
        </span>
      </div>

      {/* Comentário se existir */}
      {validation.comment && (
        <div className="mt-3">
          <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 line-clamp-2">
            {validation.comment}
          </p>
        </div>
      )}
    </div>
  );
};

// Componente de resumo das validações
const ValidationSummary = ({ validations }) => {
  const stats = Object.values(validations).reduce((acc, validation) => {
    acc[validation.status] = (acc[validation.status] || 0) + 1;
    return acc;
  }, {});

  const total = Object.values(validations).length;

  if (total === 0) return null;

  const cards = [
    {
      title: 'Pendentes',
      value: stats[VALIDATION_STATUSES.PENDING] || 0,
      color: 'slate',
      icon: '⏳'
    },
    {
      title: 'Aprovados',
      value: stats[VALIDATION_STATUSES.APPROVED] || 0,
      color: 'emerald',
      icon: '✅'
    },
    {
      title: 'Precisam Ajustes',
      value: stats[VALIDATION_STATUSES.NEEDS_ADJUSTMENT] || 0,
      color: 'amber',
      icon: '✏️'
    }
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{card.icon}</span>
              <div className={`w-12 h-12 rounded-full bg-${card.color}-100 flex items-center justify-center`}>
                <BarChart3 className={`w-6 h-6 text-${card.color}-600`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">
              {card.value}
            </div>
            <div className="text-sm text-slate-600 font-medium">
              {card.title}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-[#ffc801] to-[#ffb700] rounded-2xl p-6 text-center shadow-xl">
        <div className="text-white">
          <div className="text-3xl font-bold mb-2">{total}</div>
          <div className="text-lg font-semibold opacity-90">Total de peças enviadas</div>
        </div>
      </div>
    </div>
  );
};

// Componente da Logo Aprobi
const AprobiLogo = ({ size = "large" }) => {
  const dimensions = size === "large" ? { width: 140, height: 48 } : { width: 100, height: 34 };
  
  return (
    <svg width={dimensions.width} height={dimensions.height} viewBox="0 0 140 48" className="flex-shrink-0">
      {/* Letra A com gradiente */}
      <defs>
        <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffc801" />
          <stop offset="100%" stopColor="#ffb700" />
        </linearGradient>
      </defs>
      
      {/* Letra A estilizada */}
      <path 
        d="M8 38 L18 10 L28 38 M13 28 L23 28" 
        stroke="url(#yellowGradient)" 
        strokeWidth="5" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Triângulo superior do A preenchido */}
      <path 
        d="M15 10 L21 10 L24 18 L12 18 Z" 
        fill="url(#yellowGradient)"
      />
      
      {/* Linhas horizontais azuis */}
      <line x1="32" y1="16" x2="44" y2="16" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="21" x2="40" y2="21" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="26" x2="46" y2="26" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Check mark verde/teal */}
      <path 
        d="M36 31 L40 35 L48 24" 
        stroke="#10b981" 
        strokeWidth="3.5" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Texto "probi" */}
      <text x="56" y="33" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="bold" fill="#1e3a8a">
        probi
      </text>
    </svg>
  );
};

// Componente principal da aplicação
const App = () => {
  const [files, setFiles] = useState([]);
  const [validations, setValidations] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Carrega dados salvos do localStorage ao iniciar
  useEffect(() => {
    const savedFiles = localStorage.getItem('sunoCreatorsFiles');
    const savedValidations = localStorage.getItem('sunoCreatorsValidations');
    
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    }
    if (savedValidations) {
      setValidations(JSON.parse(savedValidations));
    }
  }, []);

  // Fecha o menu de exportação quando clica fora ou pressiona Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && showExportMenu) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showExportMenu]);

  // Salva no localStorage sempre que files ou validations mudarem
  useEffect(() => {
    localStorage.setItem('sunoCreatorsFiles', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('sunoCreatorsValidations', JSON.stringify(validations));
  }, [validations]);

  const handleFilesAdded = useCallback((newFiles) => {
    const processedFiles = newFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      file: file
    }));

    setFiles(prev => [...prev, ...processedFiles]);

    const newValidations = {};
    processedFiles.forEach(file => {
      newValidations[file.id] = {
        status: VALIDATION_STATUSES.PENDING,
        comment: ''
      };
    });

    setValidations(prev => ({ ...prev, ...newValidations }));
  }, []);

  const handleOpenPopup = useCallback((file) => {
    setSelectedFile(file);
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const handleSaveValidation = useCallback((fileId, validation) => {
    setValidations(prev => ({
      ...prev,
      [fileId]: validation
    }));
  }, []);

  const exportCSV = () => {
    setIsExporting(true);
    
    const results = files.map(file => ({
      arquivo: file.name,
      status: STATUS_LABELS[validations[file.id]?.status] || 'Pendente',
      comentario: validations[file.id]?.comment || ''
    }));

    const csv = [
      'Arquivo,Status,Comentário',
      ...results.map(r => `"${r.arquivo}","${r.status}","${r.comentario}"`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `validacao_sunocreators_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setTimeout(() => setIsExporting(false), 1000);
  };

  const exportPDF = async () => {
    setIsExporting(true);
    // Criar um elemento temporário para o PDF
    const element = document.createElement('div');
    element.style.width = '210mm';
    element.style.minHeight = '297mm';
    element.style.padding = '20mm';
    element.style.backgroundColor = 'white';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.color = '#1e293b';
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    
    const today = new Date().toLocaleDateString('pt-BR');
    const stats = Object.values(validations).reduce((acc, validation) => {
      acc[validation.status] = (acc[validation.status] || 0) + 1;
      return acc;
    }, {});

    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #ffc801; padding-bottom: 20px;">
        <h1 style="color: #1e3a8a; margin: 0; font-size: 28px; font-weight: bold;">Sistema Aprobi</h1>
        <h2 style="color: #64748b; margin: 10px 0 0 0; font-size: 18px;">Relatório de Validação de Peças Criativas</h2>
        <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Data: ${today}</p>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="color: #1e293b; margin-bottom: 15px; font-size: 18px;">Resumo Geral</h3>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #1e293b;">${files.length}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Total de Peças</div>
          </div>
          <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #059669;">${stats[VALIDATION_STATUSES.APPROVED] || 0}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Aprovadas</div>
          </div>
          <div style="background: #fffbeb; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #d97706;">${stats[VALIDATION_STATUSES.NEEDS_ADJUSTMENT] || 0}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Precisam Ajustes</div>
          </div>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #64748b;">${stats[VALIDATION_STATUSES.PENDING] || 0}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Pendentes</div>
          </div>
        </div>
      </div>

      <div>
        <h3 style="color: #1e293b; margin-bottom: 20px; font-size: 18px;">Detalhamento das Peças</h3>
        ${files.map((file, index) => {
          const validation = validations[file.id] || { status: VALIDATION_STATUSES.PENDING, comment: '' };
          const statusColor = validation.status === VALIDATION_STATUSES.APPROVED ? '#059669' :
                             validation.status === VALIDATION_STATUSES.NEEDS_ADJUSTMENT ? '#d97706' : '#64748b';
          const statusBg = validation.status === VALIDATION_STATUSES.APPROVED ? '#ecfdf5' :
                          validation.status === VALIDATION_STATUSES.NEEDS_ADJUSTMENT ? '#fffbeb' : '#f8fafc';
          
          return `
            <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; background: #fafafa;">
              <div style="display: flex; align-items: start; gap: 20px;">
                <div style="flex-shrink: 0;">
                  <div style="width: 100px; height: 80px; background: ${statusBg}; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid ${statusColor}20;">
                    <div style="text-align: center; color: ${statusColor};">
                      <div style="font-size: 24px; margin-bottom: 5px;">
                        ${file.type.startsWith('image/') ? '🖼️' : 
                          file.type.startsWith('video/') ? '🎥' : 
                          file.type === 'application/pdf' ? '📄' : '📁'}
                      </div>
                      <div style="font-size: 10px; font-weight: bold;">${file.type.startsWith('image/') ? 'IMG' : 
                        file.type.startsWith('video/') ? 'VIDEO' : 
                        file.type === 'application/pdf' ? 'PDF' : 'ARQUIVO'}</div>
                    </div>
                  </div>
                </div>
                
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <h4 style="margin: 0; font-size: 16px; color: #1e293b; font-weight: bold; max-width: 300px; word-break: break-word;">${file.name}</h4>
                    <span style="background: ${statusBg}; color: ${statusColor}; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; border: 1px solid ${statusColor};">
                      ${STATUS_LABELS[validation.status]}
                    </span>
                  </div>
                  
                  <div style="color: #64748b; font-size: 12px; margin-bottom: 8px;">
                    <strong>Tipo:</strong> ${file.type} | <strong>Tamanho:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  
                  ${validation.comment ? `
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-top: 10px;">
                      <div style="font-size: 12px; color: #64748b; margin-bottom: 5px; font-weight: bold;">COMENTÁRIO:</div>
                      <div style="font-size: 13px; color: #374151; line-height: 1.4;">${validation.comment}</div>
                    </div>
                  ` : `
                    <div style="font-size: 12px; color: #9ca3af; font-style: italic; margin-top: 10px;">Nenhum comentário</div>
                  `}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          Relatório gerado automaticamente pelo Sistema Aprobi em ${new Date().toLocaleString('pt-BR')}
        </p>
      </div>
    `;

    document.body.appendChild(element);

    try {
      // Usar a API de impressão do navegador para gerar PDF
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório de Validação - Aprobi</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @media print {
              .page-break {
                page-break-before: always;
              }
            }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      // Fallback: download como HTML
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório de Validação - Aprobi</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: white; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio_validacao_aprobi_${new Date().toISOString().split('T')[0]}.html`;
      link.click();
    }

    document.body.removeChild(element);
    setTimeout(() => setIsExporting(false), 1000);
  };

  const clearAll = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os arquivos e validações?')) {
      setFiles([]);
      setValidations({});
      setSelectedFile(null);
      setShowExportMenu(false);
      localStorage.removeItem('sunoCreatorsFiles');
      localStorage.removeItem('sunoCreatorsValidations');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <AprobiLogo size="large" />
              <div className="border-l border-slate-300 pl-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Sistema de Aprovação
                </h1>
                <p className="text-lg text-slate-600 font-medium">
                  Validação de Peças Criativas
                </p>
              </div>
            </div>
            
            {files.length > 0 && (
              <div className="flex gap-4">
                <div className="relative export-menu-container">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={isExporting}
                    className={`bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center font-semibold transform hover:scale-105 ${isExporting ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {isExporting ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Exportando...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Exportar
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                  
                  {showExportMenu && !isExporting && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            exportCSV();
                            setShowExportMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 flex items-center transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-3 text-emerald-600" />
                          <div>
                            <div className="font-semibold">Exportar CSV</div>
                            <div className="text-xs text-slate-500">Planilha para análise</div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            exportPDF();
                            setShowExportMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 flex items-center transition-colors"
                        >
                          <File className="w-4 h-4 mr-3 text-red-600" />
                          <div>
                            <div className="font-semibold">Exportar PDF</div>
                            <div className="text-xs text-slate-500">Relatório visual completo</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={clearAll}
                  className="bg-gradient-to-r from-rose-500 to-rose-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 font-semibold transform hover:scale-105"
                >
                  Limpar Tudo
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <FileUpload onFilesAdded={handleFilesAdded} />
        
        {files.length > 0 && (
          <>
            <ValidationSummary validations={validations} />
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Peças para Validação
              </h2>
              <p className="text-slate-600 mb-6">
                Clique em qualquer peça para abrir a visualização completa e realizar a validação.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {files.map(file => (
                <FileViewer
                  key={file.id}
                  file={file}
                  validation={validations[file.id] || { status: VALIDATION_STATUSES.PENDING, comment: '' }}
                  onOpenPopup={handleOpenPopup}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Pop-up Modal */}
      {selectedFile && (
        <FilePopup
          file={selectedFile}
          validation={validations[selectedFile.id] || { status: VALIDATION_STATUSES.PENDING, comment: '' }}
          onValidationChange={handleSaveValidation}
          onClose={handleClosePopup}
          onSave={handleSaveValidation}
        />
      )}
    </div>
  );
};

export default App;