import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <div style={{ marginTop: "70px" }}>
        {children}
      </div>
    </>
  );
}
