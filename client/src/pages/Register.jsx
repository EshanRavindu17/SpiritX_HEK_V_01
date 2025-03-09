import { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { firebaseAuth } from '../config/firebaseConfig'; // Adjust path as needed
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

const firestoreDB = getFirestore();

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [emailBoxColour, setEmailBoxColour] = useState('red');
  const [usernameValid, setUsernameValid] = useState(false);
  const [usernameBoxColour, setUsernameBoxColour] = useState('red');
  const [value, setValue] = useState('');
  const [isNameValid, setIsNameValid] = useState(true);
  const [icon, setIcon] = useState(null);
  const [placeholder, setPlaceholder] = useState('Username');
  const [suggestedUsernames, setSuggestedUsernames] = useState([]);
  const [nextButtonEnabled, setNextButtonEnabled] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('None');
  const [authError, setAuthError] = useState('');

  const checkPasswordStrength = (password) => {
    if (password.length === 0) return 'None';
    const lengthCriteria = password.length >= 8;
    const numberCriteria = /[0-9]/.test(password);
    const lowercaseCriteria = /[a-z]/.test(password);
    const uppercaseCriteria = /[A-Z]/.test(password);
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const criteriaMet = [lengthCriteria, numberCriteria, lowercaseCriteria, uppercaseCriteria, specialCharCriteria].filter(Boolean).length;
    
    if (criteriaMet === 1) return 'Weak';
    else if (criteriaMet === 2 || criteriaMet === 3) return 'Medium';
    else if (criteriaMet >= 4) return 'Strong';
    return 'None';
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleUsername = async (text) => {
    setValue(text);
    setAuthError(''); // Clear any previous error

    // Rule 1: No spaces
    if (/\s/.test(text)) {
      setUsernameValid(false);
      setUsernameBoxColour('red');
      setIsNameValid(false);
      setNextButtonEnabled(false);
      setAuthError('Username cannot contain spaces');
      return;
    }

    // Rule 2: More than 8 characters
    if (text.length <= 8) {
      setUsernameValid(false);
      setUsernameBoxColour('red');
      setIsNameValid(false);
      setNextButtonEnabled(false);
      setAuthError('Username must be more than 8 characters');
      return;
    }

    // Check if username is unique in Firestore
    const usersCollection = collection(firestoreDB, 'users');
    const q = query(usersCollection, where('username', '==', text));
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setUsernameValid(false);
        setUsernameBoxColour('red');
        setIsNameValid(false);
        setNextButtonEnabled(false);
        setAuthError('Username is already taken');
        const suggestions = await generateUsernameSuggestions(text);
        setSuggestedUsernames(suggestions);
      } else {
        setUsernameValid(true);
        setUsernameBoxColour('green');
        setIsNameValid(true);
        setNextButtonEnabled(true);
        setSuggestedUsernames([]);
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setSuggestedUsernames([]);
      setAuthError('Error checking username availability');
    }
  };

  const generateRandomSuffix = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'; // All allowed characters
    const length = 3; // Fixed length for consistency
    let suffix = '';
    for (let i = 0; i < length; i++) {
      suffix += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return suffix;
  };

  const generateUsernameSuggestions = async (username) => {
    const suggestions = [];
    const maxSuggestions = 3;
    while (suggestions.length < maxSuggestions) {
      const randomSuffix = generateRandomSuffix();
      const newUsername = `${username}${randomSuffix}`;
      // Ensure suggestions meet the length requirement (> 8)
      if (newUsername.length > 8) {
        const q = query(collection(firestoreDB, 'users'), where('username', '==', newUsername));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          suggestions.push(newUsername);
        }
      }
    }
    return suggestions;
  };

  const selectValidity = (text) => {
    if (placeholder === 'Email') {
      validateEmail(text);
    } else {
      handleUsername(text);
    }
  };

  useLayoutEffect(() => {
    switch (placeholder) {
      case 'Username':
        setIcon('person');
        break;
      default:
        setIcon(null);
        break;
    }
  }, [placeholder]);

  useEffect(() => {
    validateEmail();
  }, [email]);

  const validateEmail = (value = email) => {
    const re = /\S+@\S+\.\S+/;
    const isValid = re.test(value);
    setEmailValid(isValid);
    setEmailBoxColour(isValid ? 'green' : 'red');
    return isValid;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!fullName.trim() || !value) {
        setAuthError('Full name and username are required');
        return;
      }
      if (!usernameValid) {
        setAuthError('Please select a valid username');
        return;
      }
      setUsername(value); // Store the validated username
      setAuthError('');
      setStep(2);
    } else if (step === 2) {
      if (!email || !password) {
        setAuthError('Email and password are required');
        return;
      }
      if (!validateEmail()) {
        setAuthError('Please enter a valid email');
        return;
      }
      setAuthError('');
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(prevStep => Math.max(prevStep - 1, 1));
    setAuthError('');
  };

  const handleSignUp = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await sendEmailVerification(userCred.user);
      
      const data = {
        _id: userCred.user.uid,
        fullName: fullName,
        username: username,
        providerData: userCred.user.providerData[0],
      };
      
      await setDoc(doc(firestoreDB, 'users', userCred.user.uid), data);
      
      setAuthError('Signup successful! Redirecting to login in 2 seconds...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('This email is already in use');
      } else {
        setAuthError('Error during signup. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      <motion.div
        className="w-1/3 bg-gray-50 p-8 flex flex-col justify-between"
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div>
          <div className="flex items-center mb-8">
            
          </div>
          <div className="space-y-4">
            <Step title="Your details" description="Provide full name and username" icon="user" isActive={step === 1} />
            <Step title="Verify your email" description="Enter your email and password" icon="mail" isActive={step === 2} />
            <Step title="Welcome!" description="Get up and running" icon="check" isActive={step === 3} />
          </div>
        </div>
        <div className="flex justify-between text-gray-600">
          <Link to="/login" className="hover:underline">Sign in</Link>
        </div>
      </motion.div>

      <motion.div
        className="w-2/3 p-16 flex flex-col items-center justify-center bg-white"
        initial={{ x: 200 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        {authError && (
          <div className="text-red-600 mb-4 text-center">{authError}</div>
        )}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-semibold text-gray-800 mb-6">Your Details</h2>
              <p className="text-gray-600 mb-10">Provide your full name and username</p>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full mb-5 p-4 border-2 border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Username (>8 chars)"
                value={value}
                onChange={(e) => selectValidity(e.target.value)}
                className={`w-full mb-5 p-4 border-2 rounded-lg ${usernameValid ? 'border-green-500' : 'border-red-500'}`}
              />
              {value && !usernameValid && suggestedUsernames.length > 0 && (
                <div className="mt-4 p-5 bg-white border-2 border-gray-300 rounded-lg">
                  <p className="text-red-600 font-semibold mb-3">Username taken. Suggestions:</p>
                  <ul className="space-y-2">
                    {suggestedUsernames.map((username, index) => (
                      <li key={index}>
                        <button
                          onClick={() => selectValidity(username)}
                          className="w-full p-3 text-left text-gray-700 bg-gray-50 border rounded-md hover:bg-gray-100"
                        >
                          {username}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex justify-between w-full mt-10">
                <button
                  className="py-3 px-8 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button
                  className="py-3 px-8 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                  onClick={handleNext}
                  disabled={!usernameValid || !fullName.trim()}
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Verify your email</h2>
              <p className="text-gray-600 mb-8">Enter your email and password</p>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full mb-4 p-2 border rounded ${emailValid ? 'border-green-500' : 'border-red-500'}`}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full mb-4 p-2 border rounded"
              />
              {password.length > 0 && (
                <p className={`text-sm mt-2 ${
                  passwordStrength === 'Weak' ? 'text-red-600' :
                  passwordStrength === 'Medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  Password Strength: {passwordStrength}
                </p>
              )}
              <div className="flex justify-between w-full mt-10">
                <button
                  className="py-3 px-8 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button
                  className="py-3 px-8 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                  onClick={handleNext}
                  disabled={!emailValid || !password}
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome !</h2>
              <p className="text-gray-600 mb-8">Get started now</p>
              <button
                className="w-full py-3 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                onClick={handleSignUp}
              >
                Sign Up
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const Step = ({ title, description, icon, isActive }) => (
  <motion.div
    className={`flex items-start p-4 border-l-4 ${isActive ? 'border-orange-600 bg-white' : 'border-gray-200'} rounded-md`}
    initial={{ opacity: 0, x: -100 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex-shrink-0">
      <i className={`material-icons text-lg ${isActive ? 'text-orange-600' : 'text-gray-400'}`}>{icon}</i>
    </div>
    <div className="ml-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </motion.div>
);

export default Register;