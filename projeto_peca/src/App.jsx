import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Check, X, Edit3, Download, FileText, Image, Video, File } from 'lucide-react';

// Tipos de status de validação
const VALIDATION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  NEEDS_ADJUSTMENT: 'needs_adjustment',
  REJECTED: 'rejected'
};

// Cores para cada status
const STATUS_COLORS = {
  [VALIDATION_STATUSES.PENDING]: 'bg-gray-100 text-gray-700 border-gray-300',
  [VALIDATION_STATUSES.APPROVED]: 'bg-green-100 text-green-700 border-green-300',
  [VALIDATION_STATUSES.NEEDS_ADJUSTMENT]: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  [VALIDATION_STATUSES.REJECTED]: 'bg-red-100 text-red-700 border-red-300'
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
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Arraste e solte seus arquivos aqui
        </p>
        <p className="text-gray-500 mb-4">
          ou clique para selecionar
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Selecionar Arquivos
        </label>
      </div>
    </div>
  );
};

// Componente para mostrar ícone do tipo de arquivo
const FileTypeIcon = ({ fileType }) => {
  if (fileType.startsWith('image/')) {
    return <Image className="w-4 h-4" />;
  } else if (fileType.startsWith('video/')) {
    return <Video className="w-4 h-4" />;
  } else if (fileType === 'application/pdf') {
    return <FileText className="w-4 h-4" />;
  }
  return <File className="w-4 h-4" />;
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
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-48 object-cover rounded-lg"
        />
      );
    } else if (file.type.startsWith('video/')) {
      return (
        <video
          src={file.url}
          controls
          className="w-full h-48 object-cover rounded-lg"
        />
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <FileText className="w-16 h-16 text-gray-400" />
          <span className="ml-2 text-gray-600">PDF</span>
        </div>
      );
    }
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <File className="w-16 h-16 text-gray-400" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Preview do arquivo */}
      {renderPreview()}
      
      {/* Nome do arquivo */}
      <div className="mt-3 flex items-center">
        <FileTypeIcon fileType={file.type} />
        <span className="ml-2 text-sm font-medium text-gray-700 truncate">
          {file.name}
        </span>
      </div>

      {/* Botões de status */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => handleStatusChange(VALIDATION_STATUSES.APPROVED)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            validation.status === VALIDATION_STATUSES.APPROVED
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-green-100'
          }`}
        >
          <Check className="w-4 h-4 inline mr-1" />
          Aprovar
        </button>
        
        <button
          onClick={() => handleStatusChange(VALIDATION_STATUSES.NEEDS_ADJUSTMENT)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            validation.status === VALIDATION_STATUSES.NEEDS_ADJUSTMENT
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
          }`}
        >
          <Edit3 className="w-4 h-4 inline mr-1" />
          Ajustes
        </button>
        
        <button
          onClick={() => handleStatusChange(VALIDATION_STATUSES.REJECTED)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            validation.status === VALIDATION_STATUSES.REJECTED
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-red-100'
          }`}
        >
          <X className="w-4 h-4 inline mr-1" />
          Reprovar
        </button>
      </div>

      {/* Comentários */}
      <div className="mt-3">
        {!showCommentInput ? (
          <button
            onClick={() => setShowCommentInput(true)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {validation.comment ? 'Editar comentário' : 'Adicionar comentário'}
          </button>
        ) : (
          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Digite seu comentário..."
              className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
              rows="2"
              autoFocus
            />
            <button
              onClick={() => setShowCommentInput(false)}
              className="mt-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Fechar
            </button>
          </div>
        )}
        {validation.comment && !showCommentInput && (
          <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {validation.comment}
          </p>
        )}
      </div>

      {/* Status atual */}
      <div className="mt-3">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[validation.status]}`}>
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Resumo das Validações
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {stats[VALIDATION_STATUSES.PENDING] || 0}
          </div>
          <div className="text-sm text-gray-500">Pendentes</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats[VALIDATION_STATUSES.APPROVED] || 0}
          </div>
          <div className="text-sm text-gray-500">Aprovados</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {stats[VALIDATION_STATUSES.NEEDS_ADJUSTMENT] || 0}
          </div>
          <div className="text-sm text-gray-500">Precisam Ajustes</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {stats[VALIDATION_STATUSES.REJECTED] || 0}
          </div>
          <div className="text-sm text-gray-500">Reprovados</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="text-center">
          <span className="text-lg font-semibold text-gray-700">
            Total: {total} peças
          </span>
        </div>
      </div>
    </div>
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
      id: Date.now() + Math.random(), // ID único simples
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file), // Cria URL temporária para preview
      file: file // Mantém referência ao arquivo original
    }));

    setFiles(prev => [...prev, ...processedFiles]);

    // Cria validações iniciais para os novos arquivos
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sunocreators Approval
              </h1>
              <p className="text-gray-600 mt-1">
                Validação rápida de peças criativas
              </p>
            </div>
            
            {files.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={exportResults}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </button>
                <button
                  onClick={clearAll}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Limpar Tudo
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <FileUpload onFilesAdded={handleFilesAdded} />
        
        {files.length > 0 && (
          <>
            <ValidationSummary validations={validations} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

        {files.length === 0 && (
          <div className="text-center py-12">
            <Upload className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Nenhum arquivo carregado
            </h3>
            <p className="text-gray-500">
              Faça upload de suas peças criativas para começar a validação
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;