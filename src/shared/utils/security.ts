class SecurityUtils {
  static PASSWORD_REQUIREMENTS = {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || "8"),
    requireUpperCase:
      (process.env.PASSWORD_REQUIRE_UPPERCASE || "true") === "true",
    requireLowerCase:
      (process.env.PASSWORD_REQUIRE_LOWERCASE || "true") === "true",
    requireNumbers: (process.env.PASSWORD_REQUIRE_NUMBERS || "true") === "true",
    requireSymbols: (process.env.PASSWORD_REQUIRE_SYMBOLS || "true") === "true",
  };

  static validatePassword(password: string): {
    success: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const requirements = this.PASSWORD_REQUIREMENTS;

    if (!password) {
      return {
        success: false,
        errors: ["Password is required"],
      };
    }
    if (password.length < requirements.minLength) {
      errors.push(
        `Password must be at least ${requirements.minLength} characters long`,
      );
    }

    if (requirements.requireUpperCase && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (requirements.requireLowerCase && !/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (requirements.requireNumbers && !/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (requirements.requireSymbols && !/[^A-Za-z0-9]/.test(password)) {
      errors.push("Password must contain at least one symbol");
    }

    //Common weak passswords
    const weakPasswords: string[] = [
      "password",
      "123456",
      "qwerty",
      "abc123",
      "admin",
      "letmein",
      "password123",
      "admin123",
      "welcome",
    ];

    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push("Password is too common an d easily guessable");
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }
}

export default SecurityUtils;
