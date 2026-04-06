import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const id = nanoid(10);
    navigate(`/${id}`);
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-xl font-medium animate-pulse">Initializing your workspace...</div>
    </div>
  );
}
