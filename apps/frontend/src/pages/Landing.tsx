import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  // Automatically redirect to overview page
  useEffect(() => {
    navigate("/overview", { replace: true });
  }, [navigate]);

  return null;
};

export default Landing;
