import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useImmerReducer } from "use-immer";
import { signIn } from "next-auth/react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import ErrorNotification from "./ErrorNotification";

export default function CreateAccountForm() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [checked, setChecked] = useState(false);
  const [checkedErrorMessage, setCheckedErrorMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Set intial state
  const initialState = {
    username: {
      values: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
    },
    firstName: {
      values: "",
      hasErrors: false,
      message: "",
    },
    lastName: {
      values: "",
      hasErrors: false,
      message: "",
    },
    email: {
      values: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
    },
    password: {
      values: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
    },
    confirmPassword: {
      values: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
    },
    agreeToTerms: {
      values: "",
      hasErrors: false,
      message: "",
    },
    submitForm: {
      checkCount: 0,
    },
  };

  // Create immer-reducer function to handle all validation cases and error messages
  function ourReducer(draft, action) {
    switch (action.type) {
      case "usernameImmediately":
        draft.username.hasErrors = false;
        draft.username.value = action.value;
        draft.username.value = action.value;
        if (!draft.username.value || draft.username.value.length > 50) {
          draft.username.hasErrors = true;
          draft.username.message = "Username cannot exceed 50 characters.";
        }
        return;
      case "usernameAfterDelay":
        if (!draft.username.value || draft.username.value.length < 5) {
          draft.username.hasErrors = true;
          draft.username.message =
            "Username must contain more than 5 characters.";
        }
        if (/\s/.test(draft.username.value)) {
          draft.username.hasErrors = true;
          draft.username.message = "Username cannot contain spaces.";
        }
        if (!draft.username.hasErrors && !action.noRequest) {
          draft.username.checkCount++;
        }
        return;
      case "usernameUniqueResults":
        if (action.value === false) {
          draft.username.hasErrors = true;
          draft.username.isUnique = false;
          draft.username.message = "That username is already taken";
        } else {
          draft.username.isUnique = true;
        }
        return;
      case "firstNameImmediately":
        draft.firstName.hasErrors = false;
        draft.firstName.value = action.value;
        if (!draft.firstName.value) {
          draft.firstName.hasErrors = true;
          draft.firstName.message = "First name is required.";
        }
        return;
      case "lastNameImmediately":
        draft.lastName.hasErrors = false;
        draft.lastName.value = action.value;
        if (!draft.lastName.value) {
          draft.lastName.hasErrors = true;
          draft.lastName.message = "Last name is required.";
        }
        return;
      case "emailImmediately":
        draft.email.hasErrors = false;
        draft.email.value = action.value;
        return;
      case "emailAfterDelay":
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true;
          draft.email.message = "You must provide a valid email address.";
        }
        if (!draft.email.hasErrors && !action.noRequest) {
          draft.email.checkCount++;
        }
        return;
      case "emailUniqueResults":
        if (action.value === false) {
          draft.email.hasErrors = true;
          draft.email.isUnique = false;
          draft.email.message = "That email is already taken";
        } else {
          draft.email.isUnique = true;
        }
        return;
      case "passwordImmediately":
        draft.password.hasErrors = false;
        draft.password.value = action.value;
        if (!draft.password.value || draft.password.value.length > 50) {
          draft.password.hasErrors = true;
          draft.password.message = "Password cannot exceed 50 characters.";
        }
        return;
      case "passwordAfterDelay":
        if (!draft.password.value || draft.password.value.length < 10) {
          draft.password.hasErrors = true;
          draft.password.message =
            "Password must contain more than 10 characters.";
        }
        return;
      case "confirmPasswordImmediately":
        draft.confirmPassword.hasErrors = false;
        draft.confirmPassword.value = action.value;
        return;
      case "confirmPasswordAfterDelay":
        if (
          !draft.confirmPassword.value ||
          draft.confirmPassword.value !== draft.password.value
        ) {
          draft.confirmPassword.hasErrors = true;
          draft.confirmPassword.message = "Must match above password.";
        }
        return;
      case "submitForm":
        draft.submitForm.checkCount++;
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(
        () => dispatch({ type: "usernameAfterDelay" }),
        800
      );
      return () => clearTimeout(delay);
    }
  }, [state.username.value]);

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(
        () => dispatch({ type: "emailAfterDelay" }),
        800
      );
      return () => clearTimeout(delay);
    }
  }, [state.email.value]);

  useEffect(() => {
    if (state.confirmPassword.value) {
      const delay = setTimeout(
        () => dispatch({ type: "confirmPasswordAfterDelay" }),
        800
      );
      return () => clearTimeout(delay);
    }
  }, [state.confirmPassword.value]);

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(
        () => dispatch({ type: "passwordAfterDelay" }),
        800
      );
      return () => clearTimeout(delay);
    }
  }, [state.password.value]);

  useEffect(() => {
    if (state.confirmPassword.value) {
      const delay = setTimeout(
        () => dispatch({ type: "confirmPasswordAfterDelay" }),
        800
      );
      return () => clearTimeout(delay);
    }
  }, [state.confirmPassword.value]);

  
  // Check username is unique in database
  useEffect(() => {
    if (state.username.checkCount && !loading) {
      async function fetchUsernameResults() {
        try {
          const response = await fetch(
            `/api/auth/checkUsername`,

            {
              method: "POST",
              body: JSON.stringify({ username: state.username.value }),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          if (!response.ok) {
            console.log("Something went wrong!");
          }
          dispatch({ type: "usernameUniqueResults", value: data });
        } catch (err) {
          console.log(err || "There is a problem with the request!");
        }
      }
      fetchUsernameResults();
    }
  }, [state.username.checkCount]);

  // Check if email already exists in the database
  useEffect(() => {
    if (state.email.checkCount && !loading) {
      async function fetchEmailResults() {
        try {
          const response = await fetch(
            `/api/auth/checkEmail`,

            {
              method: "POST",
              body: JSON.stringify({ email: state.email.value }),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          if (!response.ok) {
            console.log("Something went wrong!");
          }
          dispatch({ type: "emailUniqueResults", value: data });
        } catch (error) {
          console.log("There is a problem with the request!");
        }
      }
      fetchEmailResults();
    }
  }, [state.email.checkCount]);

  useEffect(() => {
    if (state.submitForm.checkCount) {
      setLoading(true);
      async function fetchResults() {
        try {
          const response = await fetch(`/api/auth/createAccount`, {
            method: "POST",
            body: JSON.stringify({
              username: state.username.value.toLowerCase().trim(),
              firstName: state.firstName.value.trim(),
              lastName: state.lastName.value.trim(),
              email: state.email.value.trim(),
              password: state.password.value.trim(),
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          if (!response.ok)
            throw Error(
              data.message || "Something went wrong! Please contact Support"
            );
          
          const result = await signIn("credentials", {
            redirect: false,
            email: state.email.value,
            password: state.password.value,
          });
          router.push("/register/select-plan");
          setLoading(false);
        } catch (err) {
          setLoading(false);
          console.log(
            err || "There was a problem or the request was cancelled."
          );
        }
      }
      fetchResults();
    }
  }, [state.submitForm.checkCount]);

  function handleSubmit(e) {
    e.preventDefault();
    setCheckedErrorMessage("");
    if (!checked) {
      setCheckedErrorMessage("Please agree to our Terms.");
    }
    dispatch({ type: "usernameImmediately", value: state.username.value });
    dispatch({
      type: "usernameAfterDelay",
      value: state.username.value,
    });
    dispatch({ type: "firstNameImmediately", value: state.firstName.value });
    dispatch({ type: "lastNameImmediately", value: state.lastName.value });
    dispatch({ type: "emailImmediately", value: state.email.value });
    dispatch({
      type: "emailAfterDelay",
      value: state.email.value,
    });
    dispatch({ type: "passwordImmediately", value: state.password.value });
    dispatch({ type: "passwordAfterDelay", value: state.password.value });
    dispatch({
      type: "confirmPasswordImmediately",
      value: state.confirmPassword.value,
    });
    dispatch({
      type: "confirmPasswordAfterDelay",
      value: state.confirmPassword.value,
    });
    dispatch({ type: "submitForm" });
  }

  const handleTerms = () => {
    setCheckedErrorMessage("");
    setChecked(!checked);
  };

  return (
    <>
      <div className="bg-white dark:bg-black px-4 flex flex-col justify-center rounded-md py-16 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-xs">
          <p className="mt-2 uppercase text-sm text-gray-600 dark:text-gray-400 max-w">
            Step 1 of 3&nbsp;
          </p>

          <h2 className="uppercase mt-2 mb-6 text-2xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-4"
          >
            <div>
              <label htmlFor="email" className="sr-only">
                Username
              </label>
              <span className="text-sm text-red-500">
                {state.username.hasErrors && `${state.username.message}`}
              </span>
              <Input
                onChange={(e) =>
                  dispatch({
                    type: "usernameImmediately",
                    value: e.target.value,
                  })
                }
                type="text"
                placeholder="Username"
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                First name
              </label>
              <span className="text-sm text-red-500">
                {state.firstName.hasErrors && `${state.firstName.message}`}
              </span>
              <Input
                onChange={(e) =>
                  dispatch({
                    type: "firstNameImmediately",
                    value: e.target.value,
                  })
                }
                type="text"
                placeholder="First name"
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Last name
              </label>
              <span className="text-sm text-red-500">
                {state.lastName.hasErrors && `${state.lastName.message}`}
              </span>
              <Input
                onChange={(e) =>
                  dispatch({
                    type: "lastNameImmediately",
                    value: e.target.value,
                  })
                }
                type="text"
                placeholder="Last name"
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <span className="text-sm text-red-500">
                {state.email.hasErrors && `${state.email.message}`}
              </span>
              <div className="mt-1">
                <Input
                  onChange={(e) =>
                    dispatch({
                      type: "emailImmediately",
                      value: e.target.value,
                    })
                  }
                  placeholder="Email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Password
              </label>
              <span className="text-sm text-red-500">
                {state.password.hasErrors && `${state.password.message}`}
              </span>
              <div className="mt-1">
                <Input
                  onChange={(e) =>
                    dispatch({
                      type: "passwordImmediately",
                      value: e.target.value,
                    })
                  }
                  type="password"
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Confirm password
              </label>
              <div className="mt-2 text-sm text-red-500">
                {state.confirmPassword.hasErrors &&
                  `${state.confirmPassword.message}`}
              </div>
              <div className="mt-1">
                <Input
                  onChange={(e) =>
                    dispatch({
                      type: "confirmPasswordImmediately",
                      value: e.target.value,
                    })
                  }
                  type="password"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <div>
              <div className="mt-2 text-sm text-red-500">
                {checkedErrorMessage && `${checkedErrorMessage}`}
              </div>
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    onChange={
                      handleTerms
                    }
                    value={checked}
                    aria-describedby="agree to terms"
                    type="checkbox"
                    className="bg-white dark:bg-black focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 dark:border-gray-700 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="comments"
                    className="text-xs font-medium text-gray-400 dark:text-gray-500"
                  >
                    Agree to our{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                    ,{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      T&Cs
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms
                    </a>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Button
                width="w-full"
                loading={loading}
                 disabled={
                   !draft.firstName.hasErrors &&
                   !draft.email.hasErrors &&
                   draft.email.isUnique &&
                   !draft.password.hasErrors &&
                   !draft.confirmPassword.hasErrors
                 }
              >
                Continue
              </Button>
              {errorMessage && (
                <div className="py-4">
                  <ErrorNotification errorMessage={errorMessage} />
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
