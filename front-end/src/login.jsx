import { useParams } from "react-router-dom";
import StudentLogin from "./StudentLogin";
import CounselorLogin from "./CounselorLogin";

function Login() {
  const { userType } = useParams(); // "student" or "counselor"

  if (userType === "student") return <StudentLogin />;
  if (userType === "counselor") return <CounselorLogin />;

  return <div>Invalid user type</div>;
}

export default Login;
