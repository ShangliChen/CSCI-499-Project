import { useParams } from "react-router-dom";
import StudentSignup from "./StudentSignup";
import CounselorSignup from "./CounselorSignup";

function Signup() {
  const { userType } = useParams();
  if (userType === "student") return <StudentSignup />;
  if (userType === "counselor") return <CounselorSignup />;
  return <p>Invalid user type</p>;
}

export default Signup;
