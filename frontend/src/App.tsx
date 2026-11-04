import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Jeffoy Auto and Motor Shop — POS</h1>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
