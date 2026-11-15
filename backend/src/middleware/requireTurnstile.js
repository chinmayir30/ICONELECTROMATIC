import {
  TurnstileVerificationError,
  verifyTurnstileToken,
} from "../services/turnstileVerification.js";

const TOKEN_HEADER = "X-Turnstile-Token";
const MAX_TOKEN_LENGTH = 2048;

export function createRequireTurnstile({
  action,
  verifier = verifyTurnstileToken,
  verificationOptions = {},
} = {}) {
  if (typeof action !== "string" || !action) {
    throw new TypeError("A Turnstile action is required.");
  }

  return function requireTurnstile(req, res, next) {
    const token = req.get(TOKEN_HEADER);

    if (token === undefined || token === "") {
      const error = new TurnstileVerificationError("TURNSTILE_REQUIRED");
      return res.status(error.status).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }

    if (
      token.length > MAX_TOKEN_LENGTH ||
      token.trim() !== token ||
      /[\u0000-\u0020\u007f]/.test(token)
    ) {
      const error = new TurnstileVerificationError("TURNSTILE_INVALID");
      return res.status(error.status).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }

    Promise.resolve()
      .then(() =>
        verifier({
          ...verificationOptions,
          token,
          action,
        })
      )
      .then(() => next())
      .catch((error) => {
        if (!(error instanceof TurnstileVerificationError)) {
          return next(error);
        }

        return res.status(error.status).json({
          success: false,
          code: error.code,
          message: error.message,
        });
      });
  };
}
