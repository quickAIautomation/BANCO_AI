import { Link } from 'react-router-dom'
import { FaChevronRight, FaHome } from 'react-icons/fa'

export const Breadcrumb = ({ items = [] }) => {
  if (items.length === 0) return null

  return (
    <nav className="breadcrumb mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link 
            to="/dashboard" 
            className="breadcrumb-item text-gray-400 hover:text-red-600 transition-colors"
          >
            <FaHome className="text-sm" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <FaChevronRight className="breadcrumb-separator text-gray-500 text-xs" />
            {index === items.length - 1 ? (
              <span className="text-white font-semibold">{item.label}</span>
            ) : (
              <Link 
                to={item.path} 
                className="breadcrumb-item text-gray-400 hover:text-red-600 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

