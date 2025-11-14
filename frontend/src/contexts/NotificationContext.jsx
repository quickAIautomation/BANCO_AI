import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle, FaTimes } from 'react-icons/fa'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [history, setHistory] = useState([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationsEnabled')
    return saved !== null ? saved === 'true' : true
  })

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const addNotification = useCallback((notification) => {
    // Se notificações estão desabilitadas, não adicionar (exceto confirmações)
    if (!notificationsEnabled && notification.type !== 'confirm') {
      return null
    }

    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: notification.type || 'info', // success, error, warning, info
      title: notification.title || '',
      message: notification.message || '',
      duration: notification.duration || 5000,
      timestamp: new Date(),
      ...notification
    }

    setNotifications(prev => [...prev, newNotification])
    setHistory(prev => [newNotification, ...prev].slice(0, 100)) // Manter últimas 100

    // Auto remover após duração
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [notificationsEnabled, removeNotification])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled(prev => {
      const newValue = !prev
      localStorage.setItem('notificationsEnabled', newValue.toString())
      return newValue
    })
  }, [])

  // Helpers para tipos comuns
  const success = useCallback((title, message, duration) => {
    return addNotification({ type: 'success', title, message, duration })
  }, [addNotification])

  const error = useCallback((title, message, duration) => {
    return addNotification({ type: 'error', title, message, duration: duration || 7000 })
  }, [addNotification])

  const warning = useCallback((title, message, duration) => {
    return addNotification({ type: 'warning', title, message, duration })
  }, [addNotification])

  const info = useCallback((title, message, duration) => {
    return addNotification({ type: 'info', title, message, duration })
  }, [addNotification])

  // Confirm dialog
  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      const id = addNotification({
        type: 'confirm',
        title: options.title || 'Confirmar ação',
        message: options.message || 'Tem certeza que deseja continuar?',
        duration: 0, // Não remove automaticamente
        onConfirm: () => {
          removeNotification(id)
          resolve(true)
        },
        onCancel: () => {
          removeNotification(id)
          resolve(false)
        }
      })
    })
  }, [addNotification, removeNotification])

  const value = {
    notifications,
    history,
    notificationsEnabled,
    toggleNotifications,
    addNotification,
    removeNotification,
    clearAll,
    clearHistory,
    success,
    error,
    warning,
    info,
    confirm
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

// Componente de Toast individual com progress bar
const ToastNotification = ({ notification, onClose }) => {
  const [progress, setProgress] = useState(100)
  
  useEffect(() => {
    if (notification.duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (notification.duration / 100))
          return newProgress > 0 ? newProgress : 0
        })
      }, 100)
      
      return () => clearInterval(interval)
    }
  }, [notification.duration])
  
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-xl" />
      case 'error':
        return <FaTimesCircle className="text-red-500 text-xl" />
      case 'warning':
        return <FaExclamationCircle className="text-yellow-500 text-xl" />
      case 'info':
        return <FaInfoCircle className="text-blue-500 text-xl" />
      default:
        return <FaInfoCircle className="text-gray-500 text-xl" />
    }
  }
  
  return (
    <div
      className={`toast-notification ${notification.type} text-white rounded-lg shadow-2xl p-3 md:p-4 flex items-start space-x-2 md:space-x-3`}
      style={{ '--progress-duration': `${notification.duration}ms` }}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        {notification.title && (
          <h4 className="font-semibold mb-1 text-sm md:text-base">{notification.title}</h4>
        )}
        <p className="text-xs md:text-sm opacity-90 break-words">{notification.message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-white hover:text-gray-200 transition-colors p-1"
      >
        <FaTimes className="text-sm md:text-base" />
      </button>
    </div>
  )
}

// Container de notificações toast
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-20 md:top-24 right-2 md:right-4 left-2 md:left-auto z-[10000] space-y-2 max-w-md md:w-full w-[calc(100%-1rem)]">
      {notifications.map((notification) => {
        if (notification.type === 'confirm') {
          return <ConfirmDialog key={notification.id} notification={notification} />
        }

        return (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        )
      })}
    </div>
  )
}

// Dialog de confirmação
const ConfirmDialog = ({ notification }) => {
  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-[10000]">
      <div className="modal-content bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-800">
        <div className="flex items-start space-x-3 mb-4">
          <FaExclamationCircle className="text-yellow-500 text-2xl flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{notification.title}</h3>
            <p className="text-gray-300 whitespace-pre-line">{notification.message}</p>
          </div>
        </div>
        <div className="flex space-x-3 justify-end">
          <button
            onClick={notification.onCancel}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={notification.onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

