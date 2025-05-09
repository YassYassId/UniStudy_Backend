import React, { useState, useEffect } from "react";
import axios from "axios";
import registerImg from "../assets/registrationFormImg.jpg";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Auth = () => {
  const initialFormData = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    fieldOfStudy: "",
    university: "",
    subjects: []
  };
  const [registerFormData, setRegisterFormData] = useState(initialFormData);

  const [signInFormData, setSignInFormData] = useState({
    email: "",
    password: "",
  });
  const initialFormData1 = {
    email: "",
    password: "",
  };

  const [selectedItem, setSelectedItem] = useState("Register");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterFormData({ ...registerFormData, [name]: value });
  };

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    console.log(name, " :: ", value);
    setSignInFormData({ ...signInFormData, [name]: value });
  };

  // Handle changes of the selected button
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setSelectedItem(value);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/register",
        registerFormData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Form data submitted successfully:", response.data);
      Cookies.remove("accessToken");
      Cookies.remove("isAuthenticated");
      Cookies.remove("userRole");
      Cookies.set("token", response.data.token);
      Cookies.set("username", registerFormData.email);
      Cookies.set("userId", response.data.userId || "");
      setRegisterFormData(initialFormData);
      navigate("/inbox");
    } catch (error) {
      console.error("Error submitting form data:", error);
    }
    console.log(registerFormData);
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/signin",
        signInFormData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Form data submitted successfully:", response.data);
      Cookies.remove("accessToken");
      Cookies.remove("isAuthenticated");
      Cookies.remove("userRole");
      Cookies.set("token", response.data.token);
      Cookies.set("username", signInFormData.email);
      Cookies.set("userId", response.data.userId || "");
      setSignInFormData(initialFormData1);
      navigate("/inbox");
    } catch (error) {
      console.error("Error submitting form data:", error);
    }
  };

  useEffect(() => {}, [selectedItem]);
  return (
    <div className="relative flex justify-center items-center">
      <div className="grid grid-cols-1 rounded-xl md:grid-cols-2 m-auto h-[600px] shadow-2xl bg-[#333961] sm:max-w-[900px]">
        <div className="p-4 flex flex-col mx-4">
          <div className="flex justify-center space-x-8 text-lg">
            <button
              onClick={handleItemChange}
              name="register"
              value="Register"
              className={
                selectedItem == "Register"
                  ? "bg-[#f9b172] text-white py-2 px-3 rounded-t-md"
                  : "text-[#676f9d] bg-transparent"
              }
            >
              Register
            </button>
            <button
              onClick={handleItemChange}
              name="signIn"
              value="SignIn"
              className={
                selectedItem == "SignIn"
                  ? "bg-[#f9b172] text-white py-2 px-3 rounded-t-md"
                  : "text-[#676f9d] bg-transparent"
              }
            >
              Sign In
            </button>
          </div>
          <hr className="border-0 h-[2px] w-[80%] mx-auto rounded bg-[#f9b172] mb-3" />
          {selectedItem == "SignIn" ? (
            <form onSubmit={handleSignInSubmit}>
              <h1 className="text-4xl text-[#f9b172] font-bold mb-2">
                Sign In to Your Account
              </h1>
              <span className=" font-semibold text-[#676f9d]">
                Welcome back! Please enter your credentials to access your
                account.
              </span>
              <div className=" flex flex-col justify-start">
                {/* Email Input */}
                <br />
                <label
                  htmlFor="email"
                  className="flex justify-start text-[#ebe1d8] font-semibold"
                >
                  Email
                </label>
                <input
                  value={signInFormData.email}
                  onChange={handleSignInChange}
                  id="email"
                  name="email"
                  className="border-2 focus:outline-none focus:border-[#f9b172] focus:ring-[#f9b172] p-2 mr-2 -mb-2 rounded-md border-[#676f9d] bg-[#676f9d] "
                  type="email"
                />

                {/* Password Input */}
                <br />
                <label
                  htmlFor="password"
                  className="flex justify-start text-[#ebe1d8] font-semibold"
                >
                  Password
                </label>
                <input
                  value={signInFormData.password}
                  onChange={handleSignInChange}
                  id="password"
                  name="password"
                  className="border-2 p-2 mr-2 mb-3 rounded-md border-[#676f9d] focus:outline-none focus:border-[#f9b172] focus:ring-[#f9b172] bg-[#676f9d] "
                  type="password"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 my-4 rounded-md bg-[#f9b172] text-white font-medium"
              >
                Sign In
              </button>
              <a className="text-center text-[#ebe1d8] hover:cursor-pointer">
                Forgot Username or Password?
              </a>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <h1 className="text-4xl text-[#f9b172] font-bold mb-2">
                Create an account
              </h1>
              <span className=" font-semibold text-[#676f9d]">
                Welcome to our community! We're excited to have you on board.
              </span>
              <div className=" flex flex-col justify-start">
                <div className="grid grid-cols-2 gap-6 -mb-4">
                  {/* Firstname Input */}
                  <div className=" ">
                    <label
                      htmlFor="firstName"
                      className="flex mt-2 text-[#ebe1d8] font-semibold"
                    >
                      Firstname
                    </label>
                    <input
                      onChange={handleChange}
                      id="firstName"
                      name="firstName"
                      value={registerFormData.firstName}
                      className="flex border-2 py-2 w-[95%] justify-start rounded-md border-[#676f9d] focus:outline-none focus:border-[#f9b172] focus:ring-[#f9b172] bg-[#676f9d]"
                      type="text"
                    />
                  </div>

                  {/* Lastname Input */}
                  <div className=" ">
                    <label
                      htmlFor="lastName"
                      className="flex mt-2 text-[#ebe1d8] font-semibold"
                    >
                      Lastname
                    </label>
                    <input
                      value={registerFormData.lastName}
                      onChange={handleChange}
                      id="lastName"
                      name="lastName"
                      className="border-2 focus:outline-none focus:border-[#f9b172] focus:ring-[#f9b172] py-2 rounded-md w-[95%] flex justify-start border-[#676f9d]  bg-[#676f9d]"
                      type="text"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <br />
                <label
                  htmlFor="email"
                  className="flex justify-start text-[#ebe1d8] font-semibold"
                >
                  Email
                </label>
                <input
                  onChange={handleChange}
                  value={registerFormData.email}
                  id="email"
                  name="email"
                  className="border-2 focus:outline-none focus:border-[#f9b172] focus:ring-[#f9b172] p-2 mr-2 -mb-2 rounded-md border-[#676f9d] bg-[#676f9d]"
                  type="email"
                />

                {/* University Input */}
                <br />
                <label
                  htmlFor="university"
                  className="flex justify-start text-[#ebe1d8] font-semibold"
                >
                  University
                </label>
                <input
                  value={registerFormData.university}
                  onChange={handleChange}
                  id="university"
                  name="university"
                  className="border-2 focus:outline-none focus:border-[#f9b172] focus:ring-[#f9b172] p-2 mr-2 -mb-2 rounded-md border-[#676f9d] bg-[#676f9d] "
                  type="text"
                />

                {/* Field of Study Input */}
                <br />
                <label
                  htmlFor="fieldOfStudy"
                  className="flex justify-start text-[#ebe1d8] font-semibold"
                >
                  Field of Study
                </label>
                <input
                  value={registerFormData.fieldOfStudy}
                  onChange={handleChange}
                  id="fieldOfStudy"
                  name="fieldOfStudy"
                  className="border-2 focus:outline-none focus:border-[#f9b172] focus:ring-[#f9b172] p-2 mr-2 -mb-2 rounded-md border-[#676f9d] bg-[#676f9d] "
                  type="text"
                />

                {/* Password Input */}
                <br />
                <label
                  htmlFor="password"
                  className="flex justify-start text-[#ebe1d8] font-semibold"
                >
                  Password
                </label>
                <input
                  value={registerFormData.password}
                  onChange={handleChange}
                  id="password"
                  name="password"
                  className="border-2 p-2 mr-2 mb-3 rounded-md border-[#676f9d] focus:outline-none focus:border-[#f9b172] focus:ring-[#f9b172] bg-[#676f9d] "
                  type="password"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 my-4 rounded-md bg-[#f9b172] text-white font-medium"
              >
                Sign Up
              </button>
            </form>
          )}
        </div>
        <div className="w-full h-[600px] hidden md:block">
          <img
            className="w-full h-full rounded-r-xl opacity-70"
            src={registerImg}
            alt="/"
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;