import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";


export default function MainLayout({ children }) {
  return (
    <>
      <Navbar></Navbar>
      {children}
      <Footer></Footer>
    </>
  );
}