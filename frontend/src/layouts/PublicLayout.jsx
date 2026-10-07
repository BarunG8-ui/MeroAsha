import { Outlet } from "react-router-dom";

function PublicLayout() {
  return (
    <div>
      <header>
        <h1>MeroAsha</h1>
        <p>Hospital Management System</p>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        <p>© MeroAsha Hospital</p>
      </footer>
    </div>
  );
}

export default PublicLayout;