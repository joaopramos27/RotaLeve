import { NavLink } from 'react-router-dom';

type NavItem = {
  to: string;
  label: string;
  icon: JSX.Element;
};

const items: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M4 13.5V20h6v-6.5H4Zm10 0V20h6v-6.5h-6ZM4 4v6.5h6V4H4Zm10 0v6.5h6V4h-6Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/products',
    label: 'Produtos',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M7 8.5V7a5 5 0 0 1 10 0v1.5M6 8.5h12l1 11H5l1-11Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/clients',
    label: 'Clientes',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M16.5 20a4.5 4.5 0 0 0-9 0M12 13.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/routes',
    label: 'Rotas',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M5 17h4l3-10 4 7h3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Perfil',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function MainNav() {
  return (
    <nav
      aria-label="Menu principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-5 gap-1 px-2 py-2 sm:px-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium transition',
                isActive
                  ? 'bg-brand-500 text-white shadow-soft'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
              ].join(' ')
            }
          >
            {item.icon}
            <span className="leading-none">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
