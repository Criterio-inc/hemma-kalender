import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "@/lib/auth";
import Login from "./Login";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (session) {
      navigate("/calendar");
    }
  }, [navigate]);

  return <Login />;
};

export default Index;
