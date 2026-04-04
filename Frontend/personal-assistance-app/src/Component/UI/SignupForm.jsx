import { useState, useEffect } from "react";
import api from "../../Lib/api";
import { useNavigate } from "react-router-dom";

function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const navigate = useNavigate();

  // Validation states
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
  // Terms and privacy policy
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState("");

  // Form validation
  useEffect(() => {
    // Reset validation errors first
    let tempFirstNameError = "";
    let tempLastNameError = "";
    let tempMobileError = "";
    let tempEmailError = "";
    let tempPasswordError = "";
    let tempConfirmPasswordError = "";
    let tempTermsError = "";
    
    // Validate first name (no numbers or special characters)
    if (firstName) {
      const nameRegex = /^[A-Za-z\s'-]+$/;
      if (!nameRegex.test(firstName)) {
        tempFirstNameError = "First name should only contain letters, spaces, hyphens, or apostrophes";
      } else if (firstName.length < 2) {
        tempFirstNameError = "First name must be at least 2 characters";
      }
    }
    setFirstNameError(tempFirstNameError);
    
    // Validate last name (no numbers or special characters)
    if (lastName) {
      const nameRegex = /^[A-Za-z\s'-]+$/;
      if (!nameRegex.test(lastName)) {
        tempLastNameError = "Last name should only contain letters, spaces, hyphens, or apostrophes";
      } else if (lastName.length < 2) {
        tempLastNameError = "Last name must be at least 2 characters";
      }
    }
    setLastNameError(tempLastNameError);
    
    // Validate mobile number (numbers only, proper length)
    if (mobile) {
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(mobile.replace(/\D/g, ''))) {
        tempMobileError = "Please enter a valid mobile number (10 digits)";
      }
    }
    setMobileError(tempMobileError);
    
    // Validate email
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        tempEmailError = "Please enter a valid email address";
      }
    }
    setEmailError(tempEmailError);
    
    // Validate password strength
    if (password) {
      const passwordChecks = {
        length: password.length >= 6,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
      };
          
      if (!passwordChecks.length) {
        tempPasswordError = "Password must be at least 6 characters long";
      } else if (!passwordChecks.hasUpper) {
        tempPasswordError = "Password must include at least one uppercase letter";
      } else if (!passwordChecks.hasLower) {
        tempPasswordError = "Password must include at least one lowercase letter";
      } else if (!passwordChecks.hasNumber) {
        tempPasswordError = "Password must include at least one number";
      } else if (!passwordChecks.hasSpecial) {
        tempPasswordError = "Password must include at least one special character";
      }
    }
    setPasswordError(tempPasswordError);
        
    // Validate password confirmation
    if (confirmPassword) {
      if (password !== confirmPassword) {
        tempConfirmPasswordError = "Passwords do not match";
      }
    }
    setConfirmPasswordError(tempConfirmPasswordError);
    
    // Validate terms acceptance
    if (!acceptTerms) {
      tempTermsError = "You must accept the Terms and Privacy Policy";
    }
    setTermsError(tempTermsError);
    
    // Check if form is valid
    const isValid = 
      firstName && lastName && mobile && email && password && confirmPassword && acceptTerms &&
      !tempFirstNameError && !tempLastNameError && !tempMobileError && !tempEmailError && 
      !tempPasswordError && !tempConfirmPasswordError && !tempTermsError;
    
    setFormValid(isValid);
  }, [firstName, lastName, mobile, email, password, confirmPassword, acceptTerms]);

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formValid) {
      setErrorMsg("Please fix all validation errors before submitting.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/api/auth/register", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobile: mobile.replace(/\D/g, ''), // Remove any non-digit characters
        email: email.trim(),
        password,
      });

      if (res.data && res.data.message === "success") {
        // Auto-login after successful registration
        try {
          const loginRes = await api.post("/api/auth/token", {
            email: email.trim(),
            password,
          });
          
          if (loginRes.data && loginRes.data.token) {
            localStorage.setItem("authToken", loginRes.data.token);
            localStorage.setItem("userRole", "user");
            // Set session timestamp
            localStorage.setItem("sessionStart", Date.now().toString());
            navigate("/dashboard");
          } else {
            // Registration successful but auto-login failed
            setErrorMsg("Account created! Please login with your new credentials.");
            setTimeout(() => navigate("/signin"), 2000);
          }
        } catch (loginErr) {
          // Handle login failure after successful registration
          console.error("Auto-login failed:", loginErr);
          setErrorMsg("Account created! Please login with your new credentials.");
          setTimeout(() => navigate("/signin"), 2000);
        }
      } else {
        setErrorMsg((res.data && res.data.message) || "Signup failed");
      }
    } catch (err) {
      if (err.response) {
        const responseMessage = err.response.data && err.response.data.message ? err.response.data.message : "";

        if (err.response.status === 409 || /already registered/i.test(responseMessage)) {
          setEmailError("This email is already registered");
          setErrorMsg("This email address is already registered. Please use a different email or login.");
        } else if (responseMessage) {
          setErrorMsg(responseMessage);
        } else {
          setErrorMsg("Registration failed. Please check your information and try again.");
        }
      } else if (err.request) {
        console.error(err);
        setErrorMsg("Network error. Please check your connection and try again.");
      } else {
        console.error(err);
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    // Keep only numbers
    const cleaned = value.replace(/\D/g, '');
    setMobile(cleaned);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Create Your Account</h2>
          <p className="text-gray-500 mt-2">Join our community today</p>
        </div>
        
        <form onSubmit={handleSignup} className="space-y-4">
          {/* First Name Field */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              id="firstName"
              type="text"
              className={`w-full px-4 py-3 border ${
                firstNameError ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
              } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all`}
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              aria-invalid={firstNameError ? "true" : "false"}
              aria-describedby={firstNameError ? "firstName-error" : undefined}
              required
            />
            {firstNameError && (
              <p id="firstName-error" className="mt-1 text-sm text-red-600">
                {firstNameError}
              </p>
            )}
          </div>
          
          {/* Last Name Field */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              id="lastName"
              type="text"
              className={`w-full px-4 py-3 border ${
                lastNameError ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
              } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all`}
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              aria-invalid={lastNameError ? "true" : "false"}
              aria-describedby={lastNameError ? "lastName-error" : undefined}
              required
            />
            {lastNameError && (
              <p id="lastName-error" className="mt-1 text-sm text-red-600">
                {lastNameError}
              </p>
            )}
          </div>
          
          {/* Mobile Field */}
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input
              id="mobile"
              type="tel"
              className={`w-full px-4 py-3 border ${
                mobileError ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
              } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all`}
              placeholder="0771234567"
              value={mobile}
              onChange={(e) => formatPhoneNumber(e.target.value)}
              aria-invalid={mobileError ? "true" : "false"}
              aria-describedby={mobileError ? "mobile-error" : undefined}
              required
            />
            {mobileError && (
              <p id="mobile-error" className="mt-1 text-sm text-red-600">
                {mobileError}
              </p>
            )}
          </div>
          
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              className={`w-full px-4 py-3 border ${
                emailError ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
              } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all`}
              placeholder="yourname@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={emailError ? "true" : "false"}
              aria-describedby={emailError ? "email-error" : undefined}
              required
            />
            {emailError && (
              <p id="email-error" className="mt-1 text-sm text-red-600">
                {emailError}
              </p>
            )}
          </div>
          
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              className={`w-full px-4 py-3 border ${
                passwordError ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
              } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={passwordError ? "true" : "false"}
              aria-describedby={passwordError ? "password-error" : undefined}
              required
            />
            {passwordError && (
              <p id="password-error" className="mt-1 text-sm text-red-600">
                {passwordError}
              </p>
            )}

            <div className="mt-1 text-xs text-gray-500">
              Password must be at least 6 characters with uppercase, lowercase, number, and special character.
            </div>
          </div>
          
          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`w-full px-4 py-3 border ${
                confirmPasswordError ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
              } rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all`}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={confirmPasswordError ? "true" : "false"}
              aria-describedby={confirmPasswordError ? "confirm-password-error" : undefined}
              required
            />
            {confirmPasswordError && (
              <p id="confirm-password-error" className="mt-1 text-sm text-red-600">
                {confirmPasswordError}
              </p>
            )}
          </div>
          
          {/* Terms and Conditions Checkbox */}
          <div className="flex items-start mt-4">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-700">
                I agree to the Terms of Service and Privacy Policy
              </label>
              {termsError && (
                <p className="mt-1 text-sm text-red-600">
                  {termsError}
                </p>
              )}
            </div>
          </div>
          
          {/* Error Message */}
          {errorMsg && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 p-3 rounded-lg">
              {errorMsg}
            </div>
          )}
          
          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !formValid}
              className={`w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ${
                isLoading || !formValid ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a href="/signin" className="text-blue-600 font-medium hover:text-blue-800">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;