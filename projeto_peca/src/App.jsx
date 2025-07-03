import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Check, Edit3, Download, FileText, Image, Video, File, BarChart3 } from 'lucide-react';

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

// Componente para visualizar um arquivo
const FileViewer = ({ file, validation, onValidationChange }) => {
  const [comment, setComment] = useState(validation.comment || '');
  const [showCommentInput, setShowCommentInput] = useState(false);

  // Salva comentário quando o usuário para de digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (comment !== validation.comment) {
        onValidationChange(file.id, { comment });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [comment, validation.comment, onValidationChange, file.id]);

  const handleStatusChange = (status) => {
    onValidationChange(file.id, { status });
  };

  const renderPreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <div className="relative group">
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-48 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 rounded-xl" />
        </div>
      );
    } else if (file.type.startsWith('video/')) {
      return (
        <video
          src={file.url}
          controls
          className="w-full h-48 object-cover rounded-xl"
        />
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="w-full h-48 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-red-400 mx-auto mb-2" />
            <span className="text-red-600 font-medium">PDF</span>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <File className="w-16 h-16 text-slate-400 mx-auto mb-2" />
          <span className="text-slate-600 font-medium">Arquivo</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Preview do arquivo */}
      {renderPreview()}
      
      {/* Nome do arquivo */}
      <div className="mt-4 flex items-center">
        <FileTypeIcon fileType={file.type} />
        <span className="ml-3 text-sm font-semibold text-slate-700 truncate">
          {file.name}
        </span>
      </div>

      {/* Botões de status */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => handleStatusChange(VALIDATION_STATUSES.APPROVED)}
          className={`py-3 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center ${
            validation.status === VALIDATION_STATUSES.APPROVED
              ? 'bg-emerald-500 text-white shadow-lg scale-105'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <Check className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => handleStatusChange(VALIDATION_STATUSES.NEEDS_ADJUSTMENT)}
          className={`py-3 px-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center ${
            validation.status === VALIDATION_STATUSES.NEEDS_ADJUSTMENT
              ? 'bg-[#ffc801] text-white shadow-lg scale-105'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Labels dos botões */}
      <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
        <div className="text-center text-emerald-600 font-medium">Aprovar</div>
        <div className="text-center text-amber-600 font-medium">Ajustes</div>
      </div>

      {/* Comentários */}
      <div className="mt-4">
        {!showCommentInput ? (
          <button
            onClick={() => setShowCommentInput(true)}
            className="text-sm text-[#ffc801] hover:text-[#ffb700] font-medium transition-colors"
          >
            {validation.comment ? 'Editar comentário' : 'Adicionar comentário'}
          </button>
        ) : (
          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Digite seu comentário..."
              className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none focus:border-[#ffc801] focus:ring-2 focus:ring-[#ffc801]/20 outline-none transition-all"
              rows="3"
              autoFocus
            />
            <button
              onClick={() => setShowCommentInput(false)}
              className="mt-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
        {validation.comment && !showCommentInput && (
          <p className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {validation.comment}
          </p>
        )}
      </div>

      {/* Status atual */}
      <div className="mt-4">
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${STATUS_COLORS[validation.status]}`}>
          {STATUS_LABELS[validation.status]}
        </span>
      </div>
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

  const handleValidationChange = useCallback((fileId, updates) => {
    setValidations(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        ...updates
      }
    }));
  }, []);

  const exportResults = () => {
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
  };

  const clearAll = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os arquivos e validações?')) {
      setFiles([]);
      setValidations({});
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
                <button
                  onClick={exportResults}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center font-semibold transform hover:scale-105"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Exportar CSV
                </button>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {files.map(file => (
                <FileViewer
                  key={file.id}
                  file={file}
                  validation={validations[file.id] || { status: VALIDATION_STATUSES.PENDING, comment: '' }}
                  onValidationChange={handleValidationChange}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;