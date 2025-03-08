import { useState, useEffect, useLayoutEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { firebaseAuth } from '../config/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification,onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs,setDoc,doc,getDoc  } from 'firebase/firestore';

const firestoreDB = getFirestore();

const Register = () => {
  const router = useRouter();
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
const [passwordStrength, setPasswordStrength] = useState('None'); // Default strength




const [name, setName] = useState('');
const [getEmailValidationStatus, setGetEmailValidationStatus] = useState(true); // You can implement your validation here

const handleSignUp = async () => {
    if (getEmailValidationStatus && email !== "") {
      try {
        // Check if the user is already authenticated (i.e. already signed up and logged in)
        onAuthStateChanged(firebaseAuth, async (user) => {
          if (user) {
            // If the user is authenticated, we don't want to recreate them.
            console.log("User already authenticated:", user.uid);
            
            // Now, check if the user data is already in Firestore (check if it's already set)
            const docRef = doc(firestoreDB, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              console.log("User data already exists in Firestore");
              // Proceed to redirect to the dashboard (no need to setDoc again)
              router.push('/grouppages');
            } else {
              // If the user data doesn't exist in Firestore, we set it.
              const data = {
                _id: user.uid,
                fullName: fullName,
                username: value,
                providerData: user.providerData[0],
              };
  
              await setDoc(doc(firestoreDB, 'users', user.uid), data);
              router.push('/grouppages'); // Redirect to the dashboard after successful sign-up
            }
          } else {
            // If the user is not authenticated, proceed to create the user
            const userCred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  
            const data = {
              _id: userCred.user.uid,
              fullName: name,
              username: username,
              providerData: userCred.user.providerData[0],
            };
  
            // Save user data to Firestore
            await setDoc(doc(firestoreDB, 'users', userCred.user.uid), data);
  
            // Redirect to the dashboard after successful sign-up
            router.push('/grouppages');
          }
        });
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.error("The email is already in use.");
          alert("This email is already in use. Please use a different email.");
        } else {
          console.error("Error signing up: ", error.message);
          alert("An error occurred during sign-up. Please try again.");
        }
      }
    } else {
      console.error("Invalid email or email validation failed.");
      alert("Please enter a valid email.");
    }
  };
  

const checkPasswordStrength = (password) => {
    if (password.length === 0) return 'None';
  
    const lengthCriteria = password.length >= 8;
    const numberCriteria = /[0-9]/.test(password);
    const lowercaseCriteria = /[a-z]/.test(password);
    const uppercaseCriteria = /[A-Z]/.test(password);
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
    const criteriaMet = [lengthCriteria, numberCriteria, lowercaseCriteria, uppercaseCriteria, specialCharCriteria].filter(Boolean).length;
  
    if (criteriaMet === 1) {
      return 'Weak';
    } else if (criteriaMet === 2 || criteriaMet === 3) {
      return 'Medium';
    } else if (criteriaMet === 4 || criteriaMet === 5) {
      return 'Strong';
    }
  
    return 'None';
  };
  
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword)); // Update password strength
  };

const handleUsername = async (text) => {
    setValue(text);
    console.log("Checking username availability...");

    // Check for spaces in the username
    if (/\s/.test(text)) {
      setUsernameValid(false);
      setUsernameBoxColour('red');
      setIsNameValid(false);
      setNextButtonEnabled(false);
      console.log("Username contains spaces.");
      return;
    }

    const usersCollection = collection(firestoreDB, 'users');
    const q = query(usersCollection, where('fullName', '==', text)); // Check for exact match of fullName

    try {
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map((doc) => doc.data());
      console.log("Users found:", users);

      // If username exists, mark it as invalid and suggest alternatives
      if (users.length > 0) {
        setUsernameValid(false);
        setUsernameBoxColour('red');
        setIsNameValid(false);
        setNextButtonEnabled(false);
        console.log("Username already exists.");

        // Generate suggested usernames
        const suggestions = await generateUsernameSuggestions(text);
        console.log("Generated suggestions:", suggestions);
        setSuggestedUsernames(suggestions);
      } else {
        setUsernameValid(true);
        setUsernameBoxColour('green');
        setIsNameValid(true);
        setNextButtonEnabled(true);
        setSuggestedUsernames([]);
      }
    } catch (error) {
      console.error("Error checking username availability:", error);
      setSuggestedUsernames([]); // Ensure it's always an array even if there's an error
    }
  };

  const generateRandomSuffix = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.random() < 0.5 ? 2 : 3; // Randomly choose 2 or 3 characters
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

      const usersCollection = collection(firestoreDB, 'users');
      const q = query(usersCollection, where('fullName', '==', newUsername));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        suggestions.push(newUsername);
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

  // Set the icon based on placeholder value
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
    validateEmail(); // Validate email whenever it changes
  }, [email]);

  const handleNext = async () => {
    if (step === 1) {
      setStep(prevStep => Math.min(prevStep + 1, 3));
    } else if (step === 2) {
      if (!email || !password) {
        alert('Please enter a valid email and password');
        return;
      }
      await createUserWithEmailAndPassword(firebaseAuth, email, password)
        .then(async (userCred) => {
          const user = userCred.user;
          await sendEmailVerification(user);
          console.log('Success');
        });

      setStep(prevStep => Math.min(prevStep + 1, 3));
    }
  };


  const handleBack = () => {
    setStep(prevStep => Math.max(prevStep - 1, 1));
  };

  const validateEmail = () => {
    const re = /\S+@\S+\.\S+/;
    const isValid = re.test(email);
    setEmailValid(isValid);
    setEmailBoxColour(isValid ? 'green' : 'red');
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
            <h1 className="text-xl font-bold text-orange-600 ml-4">myPOL</h1>
          </div>
          <div className="space-y-4">
            <Step title="Your details" description="Provide full name and username" icon="user" isActive={step === 1} />
            <Step title="Verify your email" description="Enter your email and verification code" icon="mail" isActive={step === 2} />
            <Step title="Welcome to myPOL!" description="Get up and running in 3 minutes" icon="check" isActive={step === 3} />
          </div>
        </div>
        <div className="flex justify-between text-gray-600">
          <a className="hover:underline" href="/">Back to home</a>
          <a className="hover:underline" href="/login">Sign in</a>
        </div>
      </motion.div>

      <motion.div
        className="w-2/3 p-16 flex flex-col items-center justify-center bg-white"
        initial={{ x: 200 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <AnimatePresence mode="wait">
        {step === 1 && (
  <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <h2 className="text-3xl font-semibold text-gray-800 mb-6">Your Details</h2>
    <p className="text-gray-600 mb-10 text-base">Please provide your full name and a unique username to proceed.</p>

    {/* Full Name Input */}
    <input
      type="text"
      placeholder="Full Name"
      value={fullName}
      onChange={(e) => setFullName(e.target.value)}
      className="w-full mb-5 p-4 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
    />

    {/* Username Input */}
    <input
      type="text"
      placeholder="Username"
      value={value}
      onChange={(e) => selectValidity(e.target.value)}
      className={`w-full mb-5 p-4 border-2 rounded-lg shadow-sm focus:outline-none transition-all duration-300 ease-in-out ${usernameValid ? 'border-green-500' : 'border-red-500'}`}
    />

    {/* Username Validation Messages */}
    {value && !usernameValid && (
      <div className="mt-4 p-5 bg-white border-2 border-gray-300 rounded-lg shadow-md">
        <p className="text-red-600 font-semibold mb-3">Username already taken. Suggestions:</p>
        <ul className="space-y-2">
          {Array.isArray(suggestedUsernames) && suggestedUsernames.map((username, index) => (
            <li key={index}>
              <button
                onClick={() => selectValidity(username)}
                className="w-full p-3 text-left text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
              >
                {username}
              </button>
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Warning if spaces are in username */}
    {/\s/.test(value) && (
      <p className="text-red-600 mt-2">Username should not contain spaces.</p>
    )}

    {/* Full Name Warning */}
    {fullName.trim() === '' && (
      <p className="text-red-600 mt-2">Full Name is required to proceed.</p>
    )}

    <div className="flex justify-between w-full mt-10">
      <button
        className="py-3 px-8 text-white bg-orange-600 rounded-lg shadow-md hover:bg-orange-700 transition duration-300 ease-in-out focus:outline-none"
        onClick={handleBack}
      >
        Back
      </button>
      <button
        className="py-3 px-8 text-white bg-orange-600 rounded-lg shadow-md hover:bg-orange-700 transition duration-300 ease-in-out focus:outline-none"
        onClick={handleNext}
        disabled={!usernameValid || fullName.trim() === ''}
      >
        Next
      </button>
    </div>
  </motion.div>
)}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Verify your email</h2>
            <p className="text-gray-600 mb-8">Enter your email address and the verification code sent to you.</p>
            
            {/* Email Input */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full mb-4 p-2 border ${emailValid ? 'border-green-500' : 'border-red-500'} rounded`}
            />
            
            {/* Password Input */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
            
            {/* Password Strength Message */}
            {password.length > 0 && (
              <p className={`text-sm mt-2 ${
                passwordStrength === 'Weak' ? 'text-red-600' :
                passwordStrength === 'Medium' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                Password Strength: {passwordStrength}
              </p>
            )}
            
            {/* Verify Button */}
            <button
              className={`py-2 px-4 rounded-lg shadow-md transition duration-300 ${emailValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
              onClick={handleNext}
              disabled={!emailValid}
            >
              Verify
            </button>
          </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to myPOL!</h2>
              <p className="text-gray-600 mb-8">Get up and running in 3 minutes.</p>
              <button
        className="w-full py-3 text-white bg-orange-600 rounded-lg shadow-md hover:bg-orange-700 transition duration-300 transform hover:scale-105"
        onClick={handleSignUp}
      >
                Get started
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
    className={`flex items-start p-4 border-l-4 ${isActive ? 'border-orange-600 bg-white' : 'border-gray-200'} rounded-md shadow-sm transform transition-transform duration-500 ease-in-out ${isActive ? 'scale-105' : 'scale-100'}`}
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
Register.getLayout = (page) => page; // Just return the page itself without a layout

export default Register;





